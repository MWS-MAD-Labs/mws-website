import SubpageHero from "../components/ui/SubpageHero";
import { asset } from "../data/site";

const mapSrc =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.7314275134707!2d106.7262070747513!3d-6.300282493688862!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69fa70d8a57eb7%3A0x6b10705a6ef6c3b6!2sMillennia%20World%20School!5e0!3m2!1sen!2sid!4v1715569420000!5m2!1sen!2sid";

export default function Contact() {
  return (
    <main>
      <SubpageHero
        title="Contact Us"
        image={asset("DSC05350.jpg")}
        imageAlt="MWS Main Office"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Contact" }]}
      />

      <section className="subpage-section">
        <div className="wrap">
          <div className="subpage-grid-2">
            <div>
              <form
                className="premium-form"
                action="#"
                onSubmit={(event) => {
                  event.preventDefault();
                  window.alert(
                    "Message sent successfully! Our administrative office will get back to you within 24 hours.",
                  );
                }}
              >
                <h2
                  style={{
                    fontSize: "clamp(24px, 3vw, 32px)",
                    marginBottom: 24,
                    marginTop: 0,
                  }}
                >
                  Send us a message
                </h2>

                <div className="form-group">
                  <label htmlFor="senderName">Your Name</label>
                  <input
                    type="text"
                    id="senderName"
                    className="form-control"
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="senderEmail">Email Address</label>
                  <input
                    type="email"
                    id="senderEmail"
                    className="form-control"
                    placeholder="e.g. john@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="messageSubject">Subject</label>
                  <input
                    type="text"
                    id="messageSubject"
                    className="form-control"
                    placeholder="e.g. Inquiry regarding extracurricular activities"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contactCategory">Category</label>
                  <select
                    id="contactCategory"
                    className="form-control"
                    required
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select department...
                    </option>
                    <option value="general">General Administration</option>
                    <option value="admissions">Admissions & Tours</option>
                    <option value="finance">Finance Office</option>
                    <option value="hr">Human Resources / Career</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="senderMessage">Your Message</label>
                  <textarea
                    id="senderMessage"
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
              <p className="subpage-intro">
                Sint velit deserunt non sit in irure primis nibh amet eiusmod.
                Luctus exercitation reprehenderit vel suscipit laboris aliquip.
              </p>
              <h3 style={{ color: "var(--burgundy)" }}>Campus Address</h3>
              <p style={{ marginBottom: 30 }}>
                <strong>Millennia World School</strong>
                <br />
                Jl. Merpati Raya No. 103, Sawah Lama, Ciputat,
                <br />
                Tangerang Selatan, Banten 15413, Indonesia
              </p>

              <h3 style={{ color: "var(--burgundy)" }}>Direct Contacts</h3>
              <p style={{ marginBottom: 30 }}>
                <strong>Administration & Admission:</strong>
                <br />
                Phone: +62 21-7463-3333
                <br />
                WhatsApp: +62 812-1111-2222
                <br />
                Email:{" "}
                <a
                  href="mailto:info@millennia21.id"
                  style={{ color: "var(--burgundy)", textDecoration: "underline" }}
                >
                  info@millennia21.id
                </a>
              </p>

              <h3 style={{ color: "var(--burgundy)" }}>Office Hours</h3>
              <ul className="premium-list" style={{ marginTop: 12 }}>
                <li className="premium-list-item">
                  <div className="premium-list-title">Monday - Friday</div>
                  <p style={{ fontSize: 14, margin: 0 }}>07:30 AM - 04:00 PM</p>
                </li>
                <li className="premium-list-item">
                  <div className="premium-list-title">Saturday</div>
                  <p style={{ fontSize: 14, margin: 0 }}>
                    08:00 AM - 12:00 PM (Admissions office only)
                  </p>
                </li>
                <li className="premium-list-item">
                  <div className="premium-list-title">Sunday & Public Holidays</div>
                  <p style={{ fontSize: 14, margin: 0 }}>Closed</p>
                </li>
              </ul>
            </div>
          </div>

          <h2 style={{ margin: "60px 0 20px", textAlign: "center" }}>
            Our Campus Location
          </h2>
          <div className="contact-map-wrapper">
            <iframe
              src={mapSrc}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Millennia World School location map"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
