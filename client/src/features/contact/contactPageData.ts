import { asset } from "@/data/site";

export type ContactPageContent = {
  hero: {
    title: string;
    image: string;
    imageAlt: string;
  };
  form: {
    title: string;
    successMessage: string;
    categories: Array<{
      value: string;
      label: string;
    }>;
  };
  intro: string;
  address: {
    title: string;
    name: string;
    lines: string[];
  };
  directContacts: {
    title: string;
    heading: string;
    phone: string;
    whatsapp: string;
    email: string;
  };
  officeHours: {
    title: string;
    items: Array<{
      title: string;
      text: string;
    }>;
  };
  map: {
    title: string;
    src: string;
    titleAttr: string;
  };
};

export type ContactPage = {
  id: string | null;
  slug: "contact";
  title: string;
  template: string;
  status: string;
  updatedAt: string | null;
  content: ContactPageContent;
  isDefault: boolean;
};

const mapSrc =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.7314275134707!2d106.7262070747513!3d-6.300282493688862!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69fa70d8a57eb7%3A0x6b10705a6ef6c3b6!2sMillennia%20World%20School!5e0!3m2!1sen!2sid!4v1715569420000!5m2!1sen!2sid";

export const defaultContactPageContent: ContactPageContent = {
  hero: {
    title: "Discover more what MWS has to offer!",
    image: asset("DSC05350.jpg"),
    imageAlt: "MWS Main Office",
  },
  form: {
    title: "Send us a message",
    successMessage:
      "Message sent successfully! Our administrative office will get back to you within 24 hours.",
    categories: [
      { value: "general", label: "General Administration" },
      { value: "admissions", label: "Admissions & Tours" },
      { value: "finance", label: "Finance Office" },
      { value: "hr", label: "Human Resources / Career" },
    ],
  },
  intro:
    "Sint velit deserunt non sit in irure primis nibh amet eiusmod. Luctus exercitation reprehenderit vel suscipit laboris aliquip.",
  address: {
    title: "Campus Address",
    name: "Millennia World School",
    lines: [
      "Jl. Merpati Raya No. 103, Sawah Lama, Ciputat,",
      "Tangerang Selatan, Banten 15413, Indonesia",
    ],
  },
  directContacts: {
    title: "Get in Touch",
    heading: "Administration & Admission:",
    phone: "+62 21-7463-3333",
    whatsapp: "+62 812-1111-2222",
    email: "info@millennia21.id",
  },
  officeHours: {
    title: "Office Hours",
    items: [
      { title: "Monday - Friday", text: "07:30 AM - 04:00 PM" },
      {
        title: "Saturday",
        text: "08:00 AM - 12:00 PM (Admissions office only)",
      },
      { title: "Sunday & Public Holidays", text: "Closed" },
    ],
  },
  map: {
    title: "Find Us",
    src: mapSrc,
    titleAttr: "Millennia World School location map",
  },
};

export function withContactPageFallback(
  content: ContactPageContent | null | undefined,
): ContactPageContent {
  if (!content) return defaultContactPageContent;

  return {
    hero: { ...defaultContactPageContent.hero, ...content.hero },
    form: {
      ...defaultContactPageContent.form,
      ...content.form,
      categories: content.form?.categories?.length
        ? content.form.categories
        : defaultContactPageContent.form.categories,
    },
    intro: content.intro || defaultContactPageContent.intro,
    address: {
      ...defaultContactPageContent.address,
      ...content.address,
      lines: content.address?.lines?.length
        ? content.address.lines
        : defaultContactPageContent.address.lines,
    },
    directContacts: {
      ...defaultContactPageContent.directContacts,
      ...content.directContacts,
    },
    officeHours: {
      ...defaultContactPageContent.officeHours,
      ...content.officeHours,
      items: content.officeHours?.items?.length
        ? content.officeHours.items
        : defaultContactPageContent.officeHours.items,
    },
    map: { ...defaultContactPageContent.map, ...content.map },
  };
}
