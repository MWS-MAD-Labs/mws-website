import { z } from "zod";
import { ResponseError } from "../../error/response-error";
import { getPrisma } from "../../lib/prisma";
import { AcademicCalendarService } from "../academic/academic-calendar-service";
import {
  ContactPageService,
  defaultContactPageContent,
  type ContactPageContent,
} from "../contact/contact-page-service";

/*
 * Stage 1 chatbot: answers from CMS data only, with no AI. It matches the
 * question against active FAQs and a few built-in topics (contact, office
 * hours, calendar, tours, admissions, fees). Anything it cannot answer is
 * handed to the admissions team. Stage 2 will send unmatched questions to an
 * LLM with the same knowledge.
 */

export type ChatLanguage = "en" | "id";

export type ChatAction = { label: string; href: string };

export type ChatReply = {
  language: ChatLanguage;
  source: "faq" | "topic" | "fallback";
  reply: string;
  actions: ChatAction[];
  suggestions: string[];
};

type Faq = { id: string; question: string; answer: string };

type ContactInfo = {
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  officeHours: { title: string; text: string }[];
};

type CalendarEvent = {
  title: string;
  startDate: string | null;
  endDate: string | null;
  eventTime: string | null;
};

type Knowledge = { faqs: Faq[]; contact: ContactInfo; events: CalendarEvent[] };

export const chatMessageSchema = z.object({
  message: z.string().trim().min(1).max(500),
});

// ---------------------------------------------------------------- language

const INDONESIAN_WORDS = new Set([
  "apa",
  "apakah",
  "bagaimana",
  "gimana",
  "berapa",
  "kapan",
  "dimana",
  "di",
  "mana",
  "siapa",
  "kenapa",
  "mengapa",
  "yang",
  "dan",
  "atau",
  "untuk",
  "saya",
  "aku",
  "anak",
  "anaknya",
  "bisa",
  "boleh",
  "ada",
  "tidak",
  "nggak",
  "gak",
  "ga",
  "dengan",
  "ini",
  "itu",
  "sekolah",
  "biaya",
  "daftar",
  "pendaftaran",
  "jadwal",
  "alamat",
  "umur",
  "usia",
  "kak",
  "halo",
  "terima",
  "kasih",
  "mau",
  "ingin",
  "tolong",
  "dong",
  "ya",
  "jam",
  "buka",
  "berapa",
  "masuk",
  "kelas",
]);

export function detectLanguage(text: string): ChatLanguage {
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  const hits = words.filter((word) => INDONESIAN_WORDS.has(word)).length;
  return hits > 0 && hits / words.length >= 0.2 ? "id" : "en";
}

// ---------------------------------------------------------------- matching

const STOP_WORDS = new Set([
  // English
  "a",
  "an",
  "the",
  "is",
  "are",
  "am",
  "was",
  "were",
  "be",
  "do",
  "does",
  "did",
  "i",
  "my",
  "me",
  "we",
  "our",
  "you",
  "your",
  "it",
  "its",
  "of",
  "to",
  "in",
  "on",
  "at",
  "for",
  "and",
  "or",
  "with",
  "what",
  "how",
  "where",
  "who",
  "which",
  "can",
  "could",
  "there",
  "any",
  "about",
  "this",
  "that",
  "have",
  "has",
  "please",
  "hi",
  "hello",
  "mws",
  "school",
  "millennia",
  "world",
  // Indonesian
  "apa",
  "apakah",
  "bagaimana",
  "gimana",
  "dimana",
  "di",
  "mana",
  "siapa",
  "yang",
  "dan",
  "atau",
  "untuk",
  "saya",
  "aku",
  "kami",
  "bisa",
  "boleh",
  "ada",
  "ini",
  "itu",
  "dengan",
  "ke",
  "dari",
  "kak",
  "halo",
  "mau",
  "ingin",
  "tolong",
  "dong",
  "ya",
  "sekolah",
  "nya",
  "berapa",
  "saja",
  "aja",
  "sih",
  "kah",
  "tahun",
  "need",
  "want",
  "like",
  "would",
  "get",
  "find",
]);

// Indonesian (and informal) words mapped to the English words used in the CMS.
const SYNONYMS: Record<string, string[]> = {
  biaya: ["fee", "tuition", "cost"],
  harga: ["fee", "tuition", "cost"],
  spp: ["tuition", "fee"],
  bayar: ["payment", "fee"],
  pembayaran: ["payment", "fee"],
  daftar: ["admission", "apply", "enroll", "registration"],
  pendaftaran: ["admission", "apply", "enroll", "registration"],
  mendaftar: ["admission", "apply", "enroll"],
  enrol: ["enroll"],
  enrolment: ["enroll", "admission"],
  enrollment: ["enroll", "admission"],
  registration: ["admission", "apply"],
  anak: ["child", "children", "kid"],
  masuk: ["join", "enroll", "admission", "entrance"],
  gabung: ["join"],
  umur: ["age"],
  usia: ["age"],
  old: ["age"],
  jadwal: ["calendar", "schedule"],
  kalender: ["calendar"],
  libur: ["holiday", "calendar"],
  liburan: ["holiday", "calendar"],
  acara: ["event", "calendar"],
  kegiatan: ["activity", "event"],
  alamat: ["address", "location"],
  lokasi: ["location", "address"],
  telepon: ["phone", "contact"],
  telp: ["phone", "contact"],
  nomor: ["phone", "contact"],
  hubungi: ["contact"],
  kontak: ["contact"],
  wa: ["whatsapp"],
  kurikulum: ["curriculum"],
  tk: ["kindergarten"],
  paud: ["kindergarten"],
  preschool: ["kindergarten"],
  sd: ["elementary", "primary"],
  primary: ["elementary"],
  smp: ["junior", "high"],
  sma: ["high"],
  seragam: ["uniform"],
  beasiswa: ["scholarship"],
  jemputan: ["transport", "bus"],
  antar: ["transport"],
  makan: ["lunch", "meal", "food"],
  kantin: ["canteen", "food"],
  ekskul: ["extracurricular"],
  ekstrakurikuler: ["extracurricular"],
  guru: ["teacher"],
  kunjungan: ["tour", "visit"],
  tur: ["tour"],
  survei: ["tour", "visit"],
  lihat: ["visit"],
  kapan: ["when", "period", "date"],
  dibuka: ["open", "period"],
  dibutuhkan: ["required", "requirement"],
  diperlukan: ["required", "requirement"],
  butuh: ["required"],
  perlu: ["required"],
  needed: ["required"],
  test: ["assessment", "exam"],
  tes: ["test", "assessment", "exam"],
  ujian: ["exam", "assessment"],
  seleksi: ["assessment"],
  exam: ["assessment"],
  syarat: ["requirement", "document"],
  persyaratan: ["requirement", "document"],
  dokumen: ["document"],
  jam: ["hours", "time"],
  buka: ["open", "hours"],
  tutup: ["closed", "hours"],
};

/** Lowercase words, without the Indonesian "-nya" suffix ("kurikulumnya" → "kurikulum"). */
function words(text: string) {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).map((word) =>
    word.length > 5 && word.endsWith("nya") ? word.slice(0, -3) : word,
  );
}

function stem(word: string) {
  // Light English stemming so "fees"/"fee" and "classes"/"class" match.
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 3 && word.endsWith("es") && /(ss|sh|ch|x)es$/.test(word))
    return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss"))
    return word.slice(0, -1);
  return word;
}

export function tokenize(text: string, expand = false) {
  const tokens = new Set<string>();
  for (const word of words(text)) {
    // Synonyms apply even to stop words, so "where" still means location.
    if (expand) SYNONYMS[word]?.forEach((synonym) => tokens.add(stem(synonym)));
    if (!STOP_WORDS.has(word)) tokens.add(stem(word));
  }
  return tokens;
}

type Scored = { faq: Faq; score: number };

/** One group per meaningful word of the question: the word plus its synonyms. */
function queryGroups(text: string) {
  const groups: Set<string>[] = [];
  for (const word of words(text)) {
    const group = new Set<string>();
    SYNONYMS[word]?.forEach((synonym) => group.add(stem(synonym)));
    if (!STOP_WORDS.has(word)) group.add(stem(word));
    if (group.size) groups.push(group);
  }
  return groups;
}

export function rankFaqs(question: string, faqs: Faq[]): Scored[] {
  const groups = queryGroups(question);
  if (!groups.length) return [];

  const docs = faqs.map((faq) => ({
    faq,
    q: tokenize(faq.question, true),
    a: tokenize(faq.answer, true),
  }));

  // Rare words count more than words that appear in every FAQ.
  const tokenWeight = (token: string) => {
    const df = docs.filter(
      (doc) => doc.q.has(token) || doc.a.has(token),
    ).length;
    return Math.log(1 + (docs.length + 1) / (df + 1));
  };
  const weights = groups.map((group) =>
    Math.max(...[...group].map(tokenWeight)),
  );
  const total = weights.reduce((sum, weight) => sum + weight, 0);

  return docs
    .map(({ faq, q, a }) => {
      let matched = 0;
      groups.forEach((group, index) => {
        const tokens = [...group];
        if (tokens.some((token) => q.has(token))) matched += weights[index]!;
        else if (tokens.some((token) => a.has(token)))
          matched += weights[index]! * 0.35;
      });
      return { faq, score: total ? matched / total : 0 };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);
}

// ---------------------------------------------------------------- topics

type TopicId =
  | "greeting"
  | "thanks"
  | "contact"
  | "hours"
  | "calendar"
  | "tour"
  | "fees"
  | "programs"
  | "admission";

const TOPIC_KEYWORDS: Record<TopicId, string[]> = {
  greeting: [
    "hi",
    "hello",
    "halo",
    "hai",
    "pagi",
    "siang",
    "sore",
    "malam",
    "assalamualaikum",
  ],
  thanks: ["thank", "thanks", "terima", "makasih", "thx"],
  contact: [
    "contact",
    "phone",
    "whatsapp",
    "email",
    "address",
    "location",
    "map",
    "direction",
  ],
  hours: ["hours", "open", "closed", "office"],
  calendar: ["calendar", "schedule", "holiday", "event", "term", "semester"],
  tour: ["tour", "visit", "campus"],
  fees: ["fee", "tuition", "cost", "payment", "price"],
  programs: [
    "curriculum",
    "program",
    "kindergarten",
    "elementary",
    "junior",
    "level",
    "grade",
    "cambridge",
  ],
  admission: [
    "admission",
    "apply",
    "enroll",
    "registration",
    "requirement",
    "document",
  ],
};

// Greetings and thanks only win when the message is basically just that.
const SOCIAL_TOPICS: TopicId[] = ["greeting", "thanks"];

export function detectTopic(text: string): TopicId | null {
  const raw = words(text);
  // One group per word (the word plus its synonyms), so a word counts once.
  const groups = raw.map(
    (word) => new Set([stem(word), ...(SYNONYMS[word] ?? []).map(stem)]),
  );
  const hitsFor = (topic: TopicId) =>
    groups.filter((group) =>
      TOPIC_KEYWORDS[topic].some((keyword) => group.has(stem(keyword))),
    ).length;

  for (const topic of SOCIAL_TOPICS) {
    if (hitsFor(topic) && raw.length <= 4) return topic;
  }

  let best: { topic: TopicId; hits: number } | null = null;
  for (const topic of Object.keys(TOPIC_KEYWORDS) as TopicId[]) {
    if (SOCIAL_TOPICS.includes(topic)) continue;
    const hits = hitsFor(topic);
    if (hits && (!best || hits > best.hits)) best = { topic, hits };
  }
  if (best) return best.topic;

  // "Where is the school?" with no other topic word means the address.
  return raw.some((word) =>
    ["where", "dimana", "mana", "lokasi"].includes(word),
  )
    ? "contact"
    : null;
}

// ---------------------------------------------------------------- replies

const LINKS = {
  admission: "/admission",
  faq: "/admission/faq",
  tour: "/book-a-tour",
  contact: "/contact",
  calendar: "/school-calendar",
};

function t(language: ChatLanguage, en: string, id: string) {
  return language === "id" ? id : en;
}

function whatsappHref(number: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}`;
}

function contactActions(
  language: ChatLanguage,
  contact: ContactInfo,
): ChatAction[] {
  const actions: ChatAction[] = [];
  if (contact.whatsapp) {
    actions.push({
      label: t(language, "Chat on WhatsApp", "Chat via WhatsApp"),
      href: whatsappHref(contact.whatsapp),
    });
  }
  actions.push({
    label: t(language, "Contact page", "Halaman kontak"),
    href: LINKS.contact,
  });
  return actions;
}

function formatDate(value: string | null, language: ChatLanguage) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString(language === "id" ? "id-ID" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function topicReply(
  topic: TopicId,
  language: ChatLanguage,
  knowledge: Knowledge,
): ChatReply {
  const { contact } = knowledge;
  const base = {
    language,
    source: "topic" as const,
    suggestions: [] as string[],
  };

  switch (topic) {
    case "greeting":
      return {
        ...base,
        reply: t(
          language,
          "Hello! I can help with admissions, school tours, programs, the school calendar and contact details. What would you like to know?",
          "Halo! Saya bisa bantu soal pendaftaran, kunjungan sekolah, program, kalender sekolah, dan kontak. Ada yang ingin ditanyakan?",
        ),
        actions: [],
        suggestions: [],
      };
    case "thanks":
      return {
        ...base,
        reply: t(
          language,
          "You're welcome! Let me know if there is anything else.",
          "Sama-sama! Kabari saja kalau ada pertanyaan lain.",
        ),
        actions: [],
      };
    case "contact":
      return {
        ...base,
        reply: t(
          language,
          `You can find us at ${contact.address}. Phone: ${contact.phone}. Email: ${contact.email}.`,
          `Alamat kami: ${contact.address}. Telepon: ${contact.phone}. Email: ${contact.email}.`,
        ),
        actions: contactActions(language, contact),
      };
    case "hours": {
      const hours = contact.officeHours
        .map((item) => `${item.title}: ${item.text}`)
        .join("; ");
      return {
        ...base,
        reply: t(
          language,
          `Our office hours are ${hours}.`,
          `Jam operasional kantor kami: ${hours}.`,
        ),
        actions: contactActions(language, contact),
      };
    }
    case "calendar": {
      const upcoming = knowledge.events.slice(0, 3).map((event) => {
        const start = formatDate(event.startDate, language);
        const end =
          event.endDate && event.endDate !== event.startDate
            ? ` – ${formatDate(event.endDate, language)}`
            : "";
        return `${event.title} (${start}${end})`;
      });
      return {
        ...base,
        reply: upcoming.length
          ? t(
              language,
              `Coming up: ${upcoming.join("; ")}.`,
              `Agenda terdekat: ${upcoming.join("; ")}.`,
            )
          : t(
              language,
              "There are no upcoming events listed right now.",
              "Belum ada agenda terdekat yang tercatat saat ini.",
            ),
        actions: [
          {
            label: t(language, "Full calendar", "Kalender lengkap"),
            href: LINKS.calendar,
          },
        ],
      };
    }
    case "tour":
      return {
        ...base,
        reply: t(
          language,
          "We'd love to show you around! You can book a school tour online and our admissions team will confirm the time with you.",
          "Kami senang sekali kalau Anda berkunjung! Anda bisa booking kunjungan sekolah secara online, lalu tim admisi akan mengonfirmasi jadwalnya.",
        ),
        actions: [
          {
            label: t(language, "Book a tour", "Booking kunjungan"),
            href: LINKS.tour,
          },
          {
            label: t(language, "Virtual tour", "Tur virtual"),
            href: "/virtual-tour",
          },
        ],
      };
    case "fees":
      // Never quote amounts: fees change and must come from the admissions team.
      return {
        ...base,
        reply: t(
          language,
          "Fees depend on the level and the academic year, so our admissions team will share the current fee details with you directly.",
          "Biaya tergantung jenjang dan tahun ajaran, jadi rincian biaya terbaru akan disampaikan langsung oleh tim admisi kami.",
        ),
        actions: [
          ...contactActions(language, contact),
          {
            label: t(language, "Admission page", "Halaman admisi"),
            href: LINKS.admission,
          },
        ],
      };
    case "programs":
      return {
        ...base,
        reply: t(
          language,
          "MWS offers Kindergarten, Elementary and High School programs. You can read about each level and our curriculum on the Academic pages.",
          "MWS memiliki program Kindergarten, Elementary, dan High School. Info tiap jenjang dan kurikulum kami ada di halaman Academic.",
        ),
        actions: [
          {
            label: t(language, "Academic programs", "Program akademik"),
            href: "/academic",
          },
          { label: t(language, "Curriculum", "Kurikulum"), href: "/kurikulum" },
        ],
      };
    case "admission":
      return {
        ...base,
        reply: t(
          language,
          "You can see the admission steps on our Admission page. Booking a school tour is a good first step, and our team will guide you through the rest.",
          "Langkah-langkah pendaftaran ada di halaman Admisi. Booking kunjungan sekolah adalah langkah awal yang baik, dan tim kami akan memandu proses selanjutnya.",
        ),
        actions: [
          {
            label: t(language, "Admission page", "Halaman admisi"),
            href: LINKS.admission,
          },
          {
            label: t(language, "Book a tour", "Booking kunjungan"),
            href: LINKS.tour,
          },
        ],
      };
  }
}

function fallbackReply(
  language: ChatLanguage,
  contact: ContactInfo,
  suggestions: string[],
): ChatReply {
  return {
    language,
    source: "fallback",
    reply: suggestions.length
      ? t(
          language,
          "I'm not sure about that yet. Our admissions team can answer it directly, or you can try one of the questions below.",
          "Saya belum punya jawaban untuk itu. Tim admisi kami bisa menjawabnya langsung, atau coba salah satu pertanyaan di bawah.",
        )
      : t(
          language,
          "I'm not sure about that yet. Our admissions team can answer it directly.",
          "Saya belum punya jawaban untuk itu. Tim admisi kami bisa menjawabnya langsung.",
        ),
    actions: contactActions(language, contact),
    suggestions,
  };
}

// ---------------------------------------------------------------- knowledge

const KNOWLEDGE_TTL_MS = 60 * 1000;
let cachedKnowledge: { value: Knowledge; expiresAt: number } | null = null;

function contactFrom(content: ContactPageContent): ContactInfo {
  return {
    address: content.address.lines
      .join(" ")
      .replace(/\s+/g, " ")
      .replace(/,\s*$/, "")
      .trim(),
    phone: content.directContacts.phone,
    whatsapp: content.directContacts.whatsapp,
    email: content.directContacts.email,
    officeHours: content.officeHours.items,
  };
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function loadKnowledge(): Promise<Knowledge> {
  const now = Date.now();
  if (cachedKnowledge && cachedKnowledge.expiresAt > now)
    return cachedKnowledge.value;

  const today = new Date();
  const inTwoMonths = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);

  // Each source falls back on its own so one failing table doesn't break chat.
  const [faqs, contactContent, events] = await Promise.all([
    getPrisma()
      .faq.findMany({
        where: { isActive: true },
        select: { id: true, question: true, answer: true },
        orderBy: [{ isAdmissionFaq: "desc" }, { admissionSortOrder: "asc" }],
      })
      .catch(() => [] as Faq[]),
    ContactPageService.getPublic()
      .then((page) => page.content)
      .catch(() => defaultContactPageContent),
    AcademicCalendarService.listPublic({
      from: isoDate(today),
      to: isoDate(inTwoMonths),
    })
      .then((items) => items ?? [])
      .catch(() => [] as CalendarEvent[]),
  ]);

  const value: Knowledge = {
    faqs,
    contact: contactFrom(contactContent),
    events,
  };
  cachedKnowledge = { value, expiresAt: now + KNOWLEDGE_TTL_MS };
  return value;
}

export function resetChatbotStateForTest() {
  cachedKnowledge = null;
  rateLimitBuckets.clear();
}

// ---------------------------------------------------------------- rate limit

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 20;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string) {
  const now = Date.now();
  if (rateLimitBuckets.size > 5000) {
    for (const [bucketKey, bucket] of rateLimitBuckets) {
      if (bucket.resetAt <= now) rateLimitBuckets.delete(bucketKey);
    }
  }

  const bucket = rateLimitBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  bucket.count += 1;
  if (bucket.count > RATE_LIMIT_MAX) {
    throw new ResponseError(429, "Too many messages. Please wait a moment.");
  }
}

// ---------------------------------------------------------------- entry

// A FAQ must cover at least this share of the question's (weighted) words.
const FAQ_MATCH_THRESHOLD = 0.5;
const FAQ_SUGGESTION_THRESHOLD = 0.2;

export function answer(message: string, knowledge: Knowledge): ChatReply {
  const language = detectLanguage(message);
  const ranked = rankFaqs(message, knowledge.faqs);
  const best = ranked[0];
  const topic = detectTopic(message);

  // Greetings/thanks first; otherwise a strong FAQ beats a generic topic answer.
  if (topic === "greeting" || topic === "thanks") {
    return topicReply(topic, language, knowledge);
  }

  if (best && best.score >= FAQ_MATCH_THRESHOLD) {
    return {
      language,
      source: "faq",
      reply: best.faq.answer.trim(),
      actions: [],
      suggestions: ranked
        .slice(1)
        .filter((item) => item.score >= FAQ_SUGGESTION_THRESHOLD)
        .slice(0, 2)
        .map((item) => item.faq.question),
    };
  }

  if (topic) return topicReply(topic, language, knowledge);

  const suggestions = (
    ranked.length ? ranked : knowledge.faqs.map((faq) => ({ faq, score: 0 }))
  )
    .slice(0, 3)
    .map((item) => item.faq.question);
  return fallbackReply(language, knowledge.contact, suggestions);
}

export class ChatbotService {
  static async reply(
    payload: unknown,
    meta: { ipAddress?: string | null } = {},
  ) {
    const parsed = chatMessageSchema.safeParse(payload);
    if (!parsed.success) {
      throw new ResponseError(400, "Message must be 1 to 500 characters.");
    }

    rateLimit(`chat:${meta.ipAddress ?? "unknown"}`);

    const knowledge = await loadKnowledge();
    return answer(parsed.data.message, knowledge);
  }

  /** Starter questions shown when the chat opens. */
  static async starters() {
    const knowledge = await loadKnowledge();
    return knowledge.faqs.slice(0, 3).map((faq) => faq.question);
  }
}
