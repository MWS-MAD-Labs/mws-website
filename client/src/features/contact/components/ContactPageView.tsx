import type { FormEvent } from "react";
import SubpageHero from "@/components/ui/SubpageHero";
import type { ContactPageContent } from "@/features/contact/contactPageData";

type ContactPageViewProps = {
  content: ContactPageContent;
  preview?: boolean;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
};

export default function ContactPageView({
  content,
  onSubmit,
  preview = false,
}: ContactPageViewProps) {
  return (
    <main className={preview ? "bg-white" : undefined}>
      <SubpageHero
        title={content.hero.title}
        image={content.hero.image}
        imageAlt={content.hero.imageAlt}
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Contact" }]}
      />

      <section className="subpage-section">
        <div className="wrap">
          <div className="subpage-grid-2">
            <div>
              <form className="premium-form" action="#" onSubmit={onSubmit}>
                <h2
                  style={{
                    fontSize: "clamp(24px, 3vw, 32px)",
                    marginBottom: 24,
                    marginTop: 0,
                  }}
                >
                  {content.form.title}
                </h2>

                <div className="form-group">
                  <label htmlFor={preview ? "previewSenderName" : "senderName"}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    id={preview ? "previewSenderName" : "senderName"}
                    className="form-control"
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor={preview ? "previewSenderEmail" : "senderEmail"}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id={preview ? "previewSenderEmail" : "senderEmail"}
                    className="form-control"
                    placeholder="e.g. john@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label
                    htmlFor={preview ? "previewMessageSubject" : "messageSubject"}
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id={preview ? "previewMessageSubject" : "messageSubject"}
                    className="form-control"
                    placeholder="e.g. Inquiry regarding extracurricular activities"
                    required
                  />
                </div>
                <div className="form-group">
                  <label
                    htmlFor={preview ? "previewContactCategory" : "contactCategory"}
                  >
                    Category
                  </label>
                  <select
                    id={preview ? "previewContactCategory" : "contactCategory"}
                    className="form-control"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select department...
                    </option>
                    {content.form.categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label
                    htmlFor={preview ? "previewSenderMessage" : "senderMessage"}
                  >
                    Your Message
                  </label>
                  <textarea
                    id={preview ? "previewSenderMessage" : "senderMessage"}
                    className="form-control"
                    placeholder="Please type your message in detail here..."
                    required
                  />
                </div>
                <button type="submit" className="btn-submit">
                  Send Message
                </button>
              </form>
            </div>

            <div className="subpage-body" style={{ paddingLeft: 20 }}>
              <p className="subpage-intro">{content.intro}</p>
              <h3 style={{ color: "var(--burgundy)" }}>
                {content.address.title}
              </h3>
              <p style={{ marginBottom: 30 }}>
                <strong>{content.address.name}</strong>
                <br />
                {content.address.lines.map((line, index) => (
                  <span key={`${line}-${index}`}>
                    {line}
                    {index < content.address.lines.length - 1 && <br />}
                  </span>
                ))}
              </p>

              <h3 style={{ color: "var(--burgundy)" }}>
                {content.directContacts.title}
              </h3>
              <p style={{ marginBottom: 30 }}>
                <strong>{content.directContacts.heading}</strong>
                <br />
                Phone: {content.directContacts.phone}
                <br />
                WhatsApp: {content.directContacts.whatsapp}
                <br />
                Email:{" "}
                <a
                  href={`mailto:${content.directContacts.email}`}
                  style={{ color: "var(--burgundy)", textDecoration: "underline" }}
                >
                  {content.directContacts.email}
                </a>
              </p>

              <h3 style={{ color: "var(--burgundy)" }}>
                {content.officeHours.title}
              </h3>
              <ul className="premium-list" style={{ marginTop: 12 }}>
                {content.officeHours.items.map((item, index) => (
                  <li key={`${item.title}-${index}`} className="premium-list-item">
                    <div className="premium-list-title">{item.title}</div>
                    <p style={{ fontSize: 14, margin: 0 }}>{item.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <h2 style={{ margin: "60px 0 20px", textAlign: "center" }}>
            {content.map.title}
          </h2>
          <div className="contact-map-wrapper">
            <iframe
              src={content.map.src}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={content.map.titleAttr}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
