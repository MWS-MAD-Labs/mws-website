import DOMPurify from 'dompurify';

import ContactInquiryForm from '@/features/contact/components/ContactInquiryForm';
import type { ContactPageContent } from '@/features/contact/contactPageData';
import { publicAssetUrl } from '@/lib/api';

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
                src={publicAssetUrl(content.hero.image)}
                alt={content.hero.imageAlt}
                className="block h-[280px] w-full object-cover sm:h-[360px] lg:h-[460px]"
              />
            </div>

            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--charcoal)] sm:text-4xl md:text-5xl">
                {content.hero.title}
              </h1>

              <div
                className="public-rich-text mt-6 text-base leading-7 text-[var(--charcoal-muted)] sm:text-lg sm:leading-8"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(content.intro || ''),
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="contact-form" className="pb-14 md:pb-20">
        <div className="wrap">
          <div className="mx-auto max-w-3xl border-t border-[rgba(36,23,24,0.14)] pt-10 md:pt-14">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--charcoal)] sm:text-3xl">
              {content.form.title}
            </h2>

            <div className="mt-6 min-w-0">
              <ContactInquiryForm form={content.form} preview={preview} />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information & Office Hours */}
      <section className="border-y border-[rgba(36,23,24,0.1)] bg-[#faf8f5] py-14 sm:py-16 md:py-20">
        <div className="wrap">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--charcoal)] sm:text-3xl">
            {content.directContacts.title}
          </h2>

          <div className="mt-8 grid divide-y divide-[rgba(36,23,24,0.12)] border-t border-[rgba(36,23,24,0.14)] md:grid-cols-3 md:divide-x md:divide-y-0">
            <div className="min-w-0 py-7 md:py-9 md:pr-8 lg:pr-10">
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

            <div className="min-w-0 py-7 md:px-8 md:py-9 lg:px-10">
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

            <div className="min-w-0 py-7 md:py-9 md:pl-8 lg:pl-10">
              <h3 className="text-xl font-semibold text-[var(--charcoal)]">
                {content.officeHours.title}
              </h3>

              <dl className="mt-5 space-y-3 text-sm leading-6">
                {content.officeHours.items.map((item, index) => (
                  <div key={`${item.title}-${index}`}>
                    <dt className="font-semibold text-[var(--charcoal)]">{item.title}</dt>
                    <dd className="text-[var(--charcoal-muted)]">{item.text}</dd>
                  </div>
                ))}
              </dl>
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
