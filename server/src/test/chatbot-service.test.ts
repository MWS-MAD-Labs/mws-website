import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { Hono } from "hono";
import { ResponseError } from "../error/response-error";
import * as prismaModule from "../lib/prisma";
import { publicChatbotRoute } from "../routes/api/chatbot-route";
import { AcademicCalendarService } from "../services/academic/academic-calendar-service";
import {
  answer,
  detectLanguage,
  detectTopic,
  resetChatbotStateForTest,
} from "../services/chatbot/chatbot-service";
import {
  ContactPageService,
  defaultContactPageContent,
} from "../services/contact/contact-page-service";

afterEach(() => {
  mock.restore();
  resetChatbotStateForTest();
});

const faqs = [
  {
    id: "1",
    question: "What age can my child join Kindergarten?",
    answer: "Kindergarten accepts children aged 2 to 6.",
  },
  {
    id: "2",
    question: "Do you provide school bus transport?",
    answer: "Yes, we offer a school bus service for selected areas.",
  },
  {
    id: "3",
    question: "Which curriculum does MWS use?",
    answer:
      "We combine the Cambridge curriculum with the Indonesian national curriculum.",
  },
];

const knowledge = {
  faqs,
  contact: {
    address: "Jl. Merpati Raya No. 103, Ciputat",
    phone: "+62 821-1150-7100",
    whatsapp: "+62 821-1150-7100",
    email: "info@millennia21.id",
    officeHours: [{ title: "Monday - Friday", text: "07:30 AM - 04:00 PM" }],
  },
  events: [
    {
      title: "Mid-term break",
      startDate: "2026-11-10",
      endDate: "2026-11-14",
      eventTime: null,
    },
  ],
};

describe("detectLanguage", () => {
  it("detects Indonesian and English questions", () => {
    expect(detectLanguage("Berapa biaya sekolah untuk TK?")).toBe("id");
    expect(detectLanguage("anak saya umur 4 bisa masuk?")).toBe("id");
    expect(detectLanguage("What are the school fees?")).toBe("en");
  });
});

describe("detectTopic", () => {
  it("maps Indonesian and English words to topics", () => {
    expect(detectTopic("alamat sekolahnya dimana?")).toBe("contact");
    expect(detectTopic("Where is the school?")).toBe("contact");
    expect(detectTopic("berapa biaya spp")).toBe("fees");
    expect(detectTopic("I want to book a tour")).toBe("tour");
    expect(detectTopic("halo")).toBe("greeting");
    expect(detectTopic("kurikulumnya pakai apa?")).toBe("programs");
  });

  it("does not treat a long question that starts with hello as a greeting", () => {
    expect(detectTopic("hello, how do I apply for admission next year?")).toBe(
      "admission",
    );
  });
});

describe("answer", () => {
  it("answers from a matching FAQ, also when asked in Indonesian", () => {
    const english = answer(
      "What age can my child join kindergarten?",
      knowledge,
    );
    expect(english.source).toBe("faq");
    expect(english.reply).toContain("aged 2 to 6");

    const indonesian = answer("umur berapa anak bisa masuk TK?", knowledge);
    expect(indonesian.source).toBe("faq");
    expect(indonesian.language).toBe("id");
    expect(indonesian.reply).toContain("aged 2 to 6");
  });

  it("answers contact questions from CMS contact data in the asker's language", () => {
    const reply = answer("alamat sekolahnya dimana ya?", knowledge);
    expect(reply.source).toBe("topic");
    expect(reply.reply).toStartWith("Alamat kami");
    expect(reply.reply).toContain("Jl. Merpati Raya");
    expect(reply.actions.map((action) => action.href)).toContain(
      "https://wa.me/6282111507100",
    );
  });

  it("matches FAQs through Indonesian synonyms and question words", () => {
    const local = {
      ...knowledge,
      faqs: [
        ...faqs,
        {
          id: "4",
          question: "Is there an entrance assessment?",
          answer: "Yes, a short assessment.",
        },
        {
          id: "5",
          question: "When is the admission period?",
          answer: "Admissions are open all year.",
        },
        {
          id: "6",
          question: "What documents are required for admission?",
          answer: "Birth certificate and report cards.",
        },
      ],
    };
    expect(answer("ada tes masuk?", local).reply).toContain("short assessment");
    expect(answer("kapan pendaftaran dibuka?", local).reply).toContain(
      "open all year",
    );
    expect(answer("dokumen apa saja yang dibutuhkan?", local).reply).toContain(
      "Birth certificate",
    );
  });

  it("does not answer an address question with an unrelated FAQ", () => {
    const local = {
      ...knowledge,
      faqs: [
        ...faqs,
        {
          id: "7",
          question: "Where can I find information about fees?",
          answer: "Ask admissions.",
        },
      ],
    };
    expect(answer("alamat sekolahnya dimana?", local).reply).toContain(
      "Jl. Merpati Raya",
    );
  });

  it("never quotes fees and points to the admissions team", () => {
    const reply = answer("How much are the tuition fees?", knowledge);
    expect(reply.source).toBe("topic");
    expect(reply.reply).not.toMatch(/\d/);
    expect(reply.actions.length).toBeGreaterThan(0);
  });

  it("lists upcoming calendar events", () => {
    const reply = answer("when is the next holiday?", knowledge);
    expect(reply.reply).toContain("Mid-term break");
  });

  it("falls back to the admissions team with suggested questions", () => {
    const reply = answer("Can I bring my pet giraffe?", knowledge);
    expect(reply.source).toBe("fallback");
    expect(reply.suggestions.length).toBeGreaterThan(0);
    expect(reply.actions.some((action) => action.href === "/contact")).toBe(
      true,
    );
  });
});

describe("fallback without FAQs", () => {
  it("does not mention suggested questions when there are none", () => {
    const reply = answer("can I bring my pet giraffe", {
      ...knowledge,
      faqs: [],
    });
    expect(reply.suggestions).toEqual([]);
    expect(reply.reply).not.toContain("below");
  });
});

describe("POST /chatbot/messages", () => {
  function buildApp() {
    const app = new Hono();
    app.route("/chatbot", publicChatbotRoute);
    app.onError((error, c) =>
      error instanceof ResponseError
        ? c.json({ errors: error.message }, error.status as 400)
        : c.json({ errors: "Internal server error" }, 500),
    );
    return app;
  }

  function mockSources() {
    spyOn(prismaModule, "getPrisma").mockReturnValue({
      faq: { findMany: mock(async () => faqs) },
    } as never);
    spyOn(ContactPageService, "getPublic").mockResolvedValue({
      content: defaultContactPageContent,
    } as never);
    spyOn(AcademicCalendarService, "listPublic").mockResolvedValue([]);
  }

  function send(app: Hono, body: unknown, ip = "203.0.113.1") {
    return app.request("/chatbot/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "cf-connecting-ip": ip },
      body: JSON.stringify(body),
    });
  }

  it("returns a reply", async () => {
    mockSources();
    const response = await send(buildApp(), {
      message: "Which curriculum do you use?",
    });
    expect(response.status).toBe(200);
    const json = (await response.json()) as {
      data: { source: string; reply: string };
    };
    expect(json.data.source).toBe("faq");
    expect(json.data.reply).toContain("Cambridge");
  });

  it("rejects empty and overly long messages", async () => {
    mockSources();
    const app = buildApp();
    expect((await send(app, { message: "   " })).status).toBe(400);
    expect((await send(app, { message: "a".repeat(501) })).status).toBe(400);
  });

  it("rate limits a single visitor", async () => {
    mockSources();
    const app = buildApp();
    let last = 200;
    for (let i = 0; i < 21; i += 1) {
      last = (await send(app, { message: "hello" }, "198.51.100.7")).status;
    }
    expect(last).toBe(429);
    expect((await send(app, { message: "hello" }, "198.51.100.8")).status).toBe(
      200,
    );
  });

  it("still answers when the FAQ table is unavailable", async () => {
    spyOn(prismaModule, "getPrisma").mockReturnValue({
      faq: { findMany: mock(async () => Promise.reject(new Error("db down"))) },
    } as never);
    spyOn(ContactPageService, "getPublic").mockResolvedValue({
      content: defaultContactPageContent,
    } as never);
    spyOn(AcademicCalendarService, "listPublic").mockResolvedValue([]);

    const response = await send(buildApp(), {
      message: "what is your phone number?",
    });
    expect(response.status).toBe(200);
    const json = (await response.json()) as { data: { reply: string } };
    expect(json.data.reply).toContain(
      defaultContactPageContent.directContacts.phone,
    );
  });
});
