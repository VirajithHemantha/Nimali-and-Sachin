import { GOOGLE_SCRIPT_URL } from '../config';

/**
 * Sends a row to the Google Apps Script web app.
 *
 * Apps Script runs doPost() first and only then answers with a 302 redirect to
 * script.googleusercontent.com. Some browsers / privacy settings / multi-account
 * Google sessions block that second hop, which made fetch() throw even though the
 * row was already saved. We therefore do NOT follow the redirect, and fall back to
 * navigator.sendBeacon if the request still fails.
 */
export async function submitToSheet(sheet: 'RSVP' | 'Wishes', data: Record<string, string>) {
  if (!GOOGLE_SCRIPT_URL) {
    throw new Error('Google Script URL is not configured.');
  }

  const body = new URLSearchParams({ sheet, ...data, submittedFrom: window.location.href });

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      redirect: 'manual',
      keepalive: true,
      body, // browser sets application/x-www-form-urlencoded automatically
    });
    return;
  } catch (err) {
    console.warn('fetch to Google Script failed, retrying with sendBeacon', err);
  }

  if (navigator.sendBeacon && navigator.sendBeacon(GOOGLE_SCRIPT_URL, body)) {
    return;
  }

  throw new Error('Could not reach Google Sheets.');
}
