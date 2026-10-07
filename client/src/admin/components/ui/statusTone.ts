export type StatusTone = 'error' | 'info' | 'success' | 'warning';

/** Guesses how a CMS message should look from its wording. */
export function inferStatusTone(message: unknown): StatusTone {
  const text =
    typeof message === 'string' || typeof message === 'number' ? String(message).toLowerCase() : '';

  if (
    /\b(failed|failure|could not|cannot|can't|error|invalid|required|not found|unauthorized|forbidden|not allowed|not valid|needs)\b/.test(
      text,
    )
  ) {
    return 'error';
  }

  if (
    /\b(saved|updated|created|deleted|attached|detached|reordered|uploaded|sent|resent|revoked|reactivated|deactivated|published|reset|removed|added)\b/.test(
      text,
    )
  ) {
    return 'success';
  }

  if (/\b(before|already|only active|no active|no .* available)\b/.test(text)) {
    return 'warning';
  }

  return 'info';
}
