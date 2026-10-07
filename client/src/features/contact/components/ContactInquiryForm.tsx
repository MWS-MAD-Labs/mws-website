import { useState, type FormEvent } from 'react';

import { contactPageApi } from '@/api/contactPageApi';
import type { ContactPageContent } from '@/features/contact/contactPageData';
import { ApiError } from '@/lib/api';

type ContactInquiryFormProps = {
  form: ContactPageContent['form'];
  /** The CMS preview renders the form without sending anything. */
  preview?: boolean;
};

type FormValues = {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
};

const EMPTY_VALUES: FormValues = {
  name: '',
  email: '',
  subject: '',
  category: '',
  message: '',
};

function submitErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 429) {
    return 'You have sent several messages in a short time. Please wait a minute and try again.';
  }

  if (error instanceof ApiError && error.status === 400) {
    return 'Some fields are not valid. Please check your name, email, subject, and message.';
  }

  return 'Your message could not be sent. Please check your connection and try again.';
}

export default function ContactInquiryForm({ form, preview = false }: ContactInquiryFormProps) {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const idPrefix = preview ? 'previewContact' : 'contact';

  function updateValue(key: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (preview || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      await contactPageApi.submitInquiry({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        category: values.category,
        message: values.message.trim(),
        source: 'contact-page',
      });
      setValues(EMPTY_VALUES);
      setIsSent(true);
    } catch (submitError) {
      setError(submitErrorMessage(submitError));
    } finally {
      setIsSending(false);
    }
  }

  if (isSent) {
    return (
      <div className="premium-form" role="status">
        <p className="text-base leading-7 text-[var(--charcoal)]">{form.successMessage}</p>
        <button
          type="button"
          className="mt-6 text-sm font-medium text-[var(--burgundy)] underline underline-offset-4"
          onClick={() => setIsSent(false)}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="premium-form" onSubmit={submit}>
      <div className="grid gap-x-6 sm:grid-cols-2">
        <div className="form-group">
          <label htmlFor={`${idPrefix}Name`}>Your Name</label>
          <input
            id={`${idPrefix}Name`}
            className="form-control"
            type="text"
            autoComplete="name"
            maxLength={255}
            placeholder="e.g. Asror Alva"
            required
            value={values.name}
            onChange={(event) => updateValue('name', event.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor={`${idPrefix}Email`}>Email Address</label>
          <input
            id={`${idPrefix}Email`}
            className="form-control"
            type="email"
            autoComplete="email"
            maxLength={255}
            placeholder="e.g. asror@youremail.com"
            required
            value={values.email}
            onChange={(event) => updateValue('email', event.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor={`${idPrefix}Subject`}>Subject</label>
        <input
          id={`${idPrefix}Subject`}
          className="form-control"
          type="text"
          maxLength={255}
          placeholder="e.g. Question about admissions"
          required
          value={values.subject}
          onChange={(event) => updateValue('subject', event.target.value)}
        />
      </div>

      {/* {form.categories.length ? (
        <div className="form-group">
          <label htmlFor={`${idPrefix}Category`}>Category</label>
          <select
            id={`${idPrefix}Category`}
            className="form-control"
            required
            value={values.category}
            onChange={(event) => updateValue('category', event.target.value)}
          >
            <option value="" disabled>
              Select department...
            </option>
            {form.categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      ) : null} */}

      <div className="form-group">
        <label htmlFor={`${idPrefix}Message`}>Your Message</label>
        <textarea
          id={`${idPrefix}Message`}
          className="form-control"
          maxLength={5000}
          placeholder="Please write your message in detail here..."
          required
          rows={6}
          value={values.message}
          onChange={(event) => updateValue('message', event.target.value)}
        />
      </div>

      {error ? (
        <p role="alert" className="mb-4 text-sm leading-6 text-[var(--burgundy)]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn-submit disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSending || preview}
      >
        {isSending ? 'Sending...' : 'Send Message'}
      </button>

      {preview ? (
        <p className="mt-3 text-xs text-[var(--charcoal-muted)]">
          Sending is disabled in the CMS preview.
        </p>
      ) : null}
    </form>
  );
}
