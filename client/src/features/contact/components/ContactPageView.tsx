import DOMPurify from 'dompurify';

import type { ContactPageContent } from '@/features/contact/contactPageData';

type ContactPageViewProps = {
  content: ContactPageContent;
  preview?: boolean;
};

export default function ContactPageView({ content, preview = false }: ContactPageViewProps) {
  return (
    <main className={preview ? 'bg-white' : undefined}>
      <section className="subpage-section pt-16 md:pt-24">
        <div className="wrap">
          <div className="grid items-center gap-8 md:gap-12 lg:grid-cols-[0.9fr_1.1fr ] lg:gap-16">
            <div className="overflow-hidden">
              <img
                src={content.hero.image}
                alt={content.hero.imageAlt}
                className="block h-[280px] w-full object-cover sm:h-[360px] lg:h-[460px]"
              />
            </div>

            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--charcoal)] sm:text-4xl md:text-5xl">
                {content.hero.title}
              </h1>

              <div
                className="mt-6 text-base leading-7 text-[var(--charcoal-muted)] sm:text-lg sm:leading-8"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(content.intro || ''),
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="pb-14 md:pb-20">
        <div className="wrap">
          <div className="border-t border-[rgba(36,23,24,0.14)]">
            <div className="border-b border-[rgba(36,23,24,0.14)] py-6">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--charcoal)] sm:text-3xl">
                {content.directContacts.title}
              </h2>
            </div>

            <div className="grid divide-y divide-[rgba(36,23,24,0.12)] md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="py-7 md:py-9 md:pr-10">
                <h3 className="text-xl font-semibold text-[var(--charcoal)]">
                  {content.directContacts.heading}
                </h3>

                <div className="mt-5 space-y-3 text-sm leading-7 text-[var(--charcoal-muted)]">
                  <p>
                    Phone:{' '}
                    <a
                      href={`tel:${content.directContacts.phone.replace(/[^\d+]/g, '')}`}
                      className="text-[var(--charcoal)] underline decoration-[rgba(126,21,24,0.25)] underline-offset-4 hover:text-[var(--burgundy)]"
                    >
                      {content.directContacts.phone}
                    </a>
                  </p>

                  <p>
                    WhatsApp:{' '}
                    <a
                      href={`https://wa.me/${content.directContacts.whatsapp.replace(/\D/g, '')}`}
                      className="text-[var(--charcoal)] underline decoration-[rgba(126,21,24,0.25)] underline-offset-4 hover:text-[var(--burgundy)]"
                    >
                      {content.directContacts.whatsapp}
                    </a>
                  </p>

                  <p>
                    Email:{' '}
                    <a
                      href={`mailto:${content.directContacts.email}`}
                      className="break-words text-[var(--charcoal)] underline decoration-[rgba(126,21,24,0.25)] underline-offset-4 hover:text-[var(--burgundy)]"
                    >
                      {content.directContacts.email}
                    </a>
                  </p>
                </div>
              </div>

              <div className="py-7 md:py-9 md:pl-10">
                <h3 className="text-xl font-semibold text-[var(--charcoal)]">
                  {content.address.title}
                </h3>

                <div className="mt-5 text-sm leading-7 text-[var(--charcoal-muted)]">
                  <strong className="font-semibold text-[var(--charcoal)]">
                    {content.address.name}
                  </strong>

                  {content.address.lines.map((line, index) => (
                    <span key={`${line}-${index}`} className="block">
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Opening Hours */}
      <section className="border-y border-[rgba(36,23,24,0.1)] bg-[#faf8f5] py-14 sm:py-16 md:py-20">
        <div className="wrap">
          <div className="grid gap-8 md:grid-cols-[0.7fr_1.3fr] md:gap-12 lg:gap-20">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--charcoal)] sm:text-3xl">
                {content.officeHours.title}
              </h2>
            </div>

            <div className="border-t border-[rgba(36,23,24,0.14)]">
              {content.officeHours.items.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="grid gap-2 border-b border-[rgba(36,23,24,0.12)] py-5 sm:grid-cols-[180px_1fr] sm:gap-8"
                >
                  <p className="font-semibold text-[var(--charcoal)]">{item.title}</p>

                  <p className="text-sm leading-6 text-[var(--charcoal-muted)]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="subpage-section">
        <div className="wrap">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--charcoal)] sm:text-3xl">
              {content.map.title}
            </h2>
          </div>

          <div className="contact-map-wrapper w-full overflow-hidden">
            <iframe
              src={content.map.src}
              className="block h-[320px] w-full border-0 sm:h-[400px] md:h-[500px]"
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
