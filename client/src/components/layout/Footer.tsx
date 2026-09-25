import { Link } from "react-router-dom";
import { logoUrl } from "../../data/site";

export default function Footer() {
  const footerLinkClassName =
    "text-[14.5px] text-[rgba(248,247,243,0.75)] transition-colors duration-[250ms] hover:text-[var(--gold)]";

  return (
    <footer
      className="bg-[var(--deep-charcoal)] py-20 pb-10 text-[rgba(248,247,243,0.72)]"
      id="contact"
      data-footer
    >
      <div className="mx-auto w-[min(100%_-_96px,1240px)] max-[980px]:w-[min(100%_-_56px,1240px)] max-[680px]:w-[min(100%_-_40px,1240px)] max-[430px]:w-[min(100%_-_32px,1240px)]">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 border-b border-[rgba(248,247,243,0.12)] pb-[60px] max-[1180px]:grid-cols-2 max-[1180px]:gap-9 max-[680px]:grid-cols-1">
          <div className="max-w-[320px] font-[var(--f-head)] text-xl font-bold text-[var(--warm-white)]">
            <Link
              className="mb-[18px] inline-flex h-[72px] w-[72px] items-center justify-center bg-[rgba(248,247,243,0.92)]"
              to="/#hero"
              aria-label="Millennia World School home"
            >
              <img
                className="h-[54px] w-[54px] object-contain"
                src={logoUrl}
                alt="Millennia World School"
              />
            </Link>
            <p className="max-w-[280px] text-[14.5px] font-normal leading-[1.8] text-[rgba(248,247,243,0.55)]">
              Adipiscing sed voluptate, praesent posuere sunt primis
              reprehenderit ex consectetur est quis. Anim faucibus nulla veniam.
            </p>
          </div>

          <div className="flex flex-col items-start">
            <h2 className="mb-[18px] text-[13px] font-semibold uppercase tracking-[0.08em] text-[rgba(248,247,243,0.42)]">
              Explore
            </h2>
            <Link className={footerLinkClassName} to="/our-school">
              About us
            </Link>
            <Link className={`mt-3 ${footerLinkClassName}`} to="/academic">
              Academics
            </Link>
            <Link
              className={`mt-3 ${footerLinkClassName}`}
              to="/#campus-spotlight"
            >
              Campus environment
            </Link>
            <Link
              className={`mt-3 ${footerLinkClassName}`}
              to="/community-stories"
            >
              Community stories
            </Link>
          </div>

          <div className="flex flex-col items-start">
            <h2 className="mb-[18px] text-[13px] font-semibold uppercase tracking-[0.08em] text-[rgba(248,247,243,0.42)]">
              Programs
            </h2>
            <Link
              className={footerLinkClassName}
              to="/academic/kindergarten"
            >
              Kindergarten
            </Link>
            <Link
              className={`mt-3 ${footerLinkClassName}`}
              to="/academic/elementary"
            >
              Elementary
            </Link>
            <Link
              className={`mt-3 ${footerLinkClassName}`}
              to="/academic/high-school"
            >
              High School
            </Link>
            <Link className={`mt-3 ${footerLinkClassName}`} to="/kurikulum">
              Curriculum
            </Link>
          </div>

          <div className="flex flex-col items-start">
            <h2 className="mb-[18px] text-[13px] font-semibold uppercase tracking-[0.08em] text-[rgba(248,247,243,0.42)]">
              Contact
            </h2>
            <p className="mb-3.5 max-w-[280px] text-[14.5px] leading-[1.8] text-[rgba(248,247,243,0.55)]">
              Jl. Merpati Raya No. 103
              <br />
              Sawah Lama, Ciputat, Tangerang Selatan, Banten 15413
            </p>
            <a className={footerLinkClassName} href="mailto:info@millennia21.id">
              info@millennia21.id
            </a>
            <Link
              to="/book-a-tour"
              className="mt-[18px] border-b border-[var(--gold)] pb-[5px] text-[14.5px] text-[var(--warm-white)] transition-colors duration-[250ms] hover:text-[var(--gold)] max-[560px]:w-full max-[560px]:text-center"
            >
              Book a Tour
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 pt-8 text-[13px] text-[rgba(248,247,243,0.4)] max-[680px]:flex-col max-[680px]:items-start">
          <p className="m-0">
            &copy;{" "}
            <Link
              to="/admin"
              aria-label="Admin"
              className="inline-block cursor-pointer px-1 opacity-20 hover:opacity-60"
            >
              M
            </Link>
            illennia World School. All rights reserved.
          </p>
          <div>
            <Link
              className="text-[rgba(248,247,243,0.62)] transition-colors duration-[250ms] hover:text-[var(--gold)]"
              to="/#hero"
            >
              Back to top
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
