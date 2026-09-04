import FaqAccordion from "../components/ui/FaqAccordion";
import SubpageHero from "../components/ui/SubpageHero";
import { asset } from "../data/site";

const faqs = [
  {
    question: "What curriculum is taught at MWS?",
    answer:
      "Exercitation mollit et fugiat ad velit vel sint do posuere a quis. Est qui luctus nulla ultrices, tincidunt magna veniam aute.",
  },
  {
    question: "When can we enroll our child?",
    answer:
      "Arcu fermentum voluptate aliqua sit curae in deserunt nostrud laborum. Eu odio officia faucibus, ex eiusmod labore non.",
  },
  {
    question: "Are there trials or transition support for new students?",
    answer:
      "Sunt augue primis consectetur id, orci ullamco tempor elit suscipit lorem praesent. Reprehenderit ante nisi sed adipiscing vitae curabitur laboris lacus.",
  },
  {
    question: "Is there a school bus or catering service?",
    answer:
      "Sunt eu odio nulla do laborum incididunt ex, consequat magna pretium a. Aliqua curabitur faucibus eleifend ullamco aute culpa minim.",
  },
];

export default function Admission() {
  return (
    <main>
      <SubpageHero
        title="Admissions"
        image={asset("_DSC4760.jpg")}
        imageAlt="MWS Enrollment and Inquiry"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Admissions" }]}
      />

      <section className="subpage-section">
        <div className="wrap">
          <div className="subpage-grid-2">
            <div className="subpage-body">
              <p className="subpage-intro">
                Officia excepteur ipsum in sunt feugiat est et tempor ullamco
                consequat enim. Dolor reprehenderit augue, suscipit id praesent
                nibh lacus.
              </p>

              <h2>How to Apply</h2>
              <p>
                Labore luctus occaecat cillum tincidunt laborum, quam gravida
                eleifend proident mollit orci voluptate. Cupidatat primis dolore
                odio vestibulum pretium fermentum quis.
              </p>

              <ul className="premium-list">
                {[
                  "Schedule a Tour & Inquiry",
                  "Registration & Assessment",
                  "Interview & Decision",
                  "Enrollment & Welcome",
                ].map((step, index) => (
                  <li className="premium-list-item" key={step}>
                    <div className="premium-list-title">
                      {index + 1}. {step}
                    </div>
                    <p>
                      Adipiscing lorem aliquip curae reprehenderit commodo ut
                      lacus gravida cillum. Culpa vel sunt ultrices, magna
                      incididunt labore eiusmod.
                    </p>
                  </li>
                ))}
              </ul>

              <h2>Admissions Process</h2>
              <p>
                Our admissions team guides each family through a clear process,
                from the first inquiry to the final enrollment confirmation.
              </p>

              <div className="premium-table-wrapper">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Step</th>
                      <th>Process</th>
                      <th>What to Prepare</th>
                      <th>Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["1", "Inquiry & School Tour", "Parent contact details and preferred grade level", "Tour schedule confirmed by the admissions team"],
                      ["2", "Application Submission", "Completed form, student documents, and previous school records", "Application file reviewed for completeness"],
                      ["3", "Assessment & Interview", "Student attendance and parent meeting availability", "Placement recommendation shared with parents"],
                      ["4", "Enrollment Confirmation", "Signed enrollment agreement and administration documents", "Student seat secured"],
                    ].map(([step, process, prepare, outcome]) => (
                      <tr key={step}>
                        <td>
                          <strong>{step}</strong>
                        </td>
                        <td>{process}</td>
                        <td>{prepare}</td>
                        <td>{outcome}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p style={{ color: "var(--charcoal-muted)", fontSize: 14, fontStyle: "italic" }}>
                * Our admissions office will contact families directly if
                additional documents or follow-up meetings are required.
              </p>
            </div>

            <div>
              <form
                className="premium-form"
                action="#"
                onSubmit={(event) => {
                  event.preventDefault();
                  window.alert(
                    "Thank you! Your tour inquiry has been submitted. Our team will contact you shortly.",
                  );
                }}
              >
                <h3 className="form-title">Book a Tour / Inquiry</h3>

                <div className="form-group">
                  <label htmlFor="parentName">Parent's Full Name</label>
                  <input
                    type="text"
                    id="parentName"
                    className="form-control"
                    placeholder="e.g. Sarah Connor"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contactEmail">Email Address</label>
                  <input
                    type="email"
                    id="contactEmail"
                    className="form-control"
                    placeholder="e.g. sarah@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contactPhone">Phone Number (WhatsApp)</label>
                  <input
                    type="tel"
                    id="contactPhone"
                    className="form-control"
                    placeholder="e.g. +62 812-3456-7890"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="childLevel">Grade of Interest</label>
                  <select id="childLevel" className="form-control" required defaultValue="">
                    <option value="" disabled>
                      Select level...
                    </option>
                    <option value="kindergarten">Kindergarten (Age 2 - 6)</option>
                    <option value="elementary">Elementary (Age 6 - 12)</option>
                    <option value="junior-high">Junior High (Age 12 - 15)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="tourDate">Preferred Tour Date</label>
                  <input type="date" id="tourDate" className="form-control" required />
                </div>

                <div className="form-group">
                  <label htmlFor="inquiryMessage">Questions / Special Notes</label>
                  <textarea
                    id="inquiryMessage"
                    className="form-control"
                    placeholder="Any specific questions regarding enrollment or schedule?"
                  />
                </div>

                <button type="submit" className="btn-submit">
                  Submit Inquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section
        className="subpage-section"
        style={{
          background: "var(--white)",
          borderTop: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <div className="wrap" style={{ maxWidth: 800 }}>
          <h2 style={{ marginBottom: 40, textAlign: "center" }}>
            Frequently Asked Questions
          </h2>
          <FaqAccordion items={faqs} />
        </div>
      </section>
    </main>
  );
}
