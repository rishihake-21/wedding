/**
 * Google Apps Script — RSVP Receiver (Phase 8).
 *
 * Deployment steps:
 * 1. Create a Google Sheet with a tab named "RSVPs" and header row:
 *    Timestamp | Name | Guests | Events | Message | Language
 * 2. Open Extensions → Apps Script, paste this script, and save.
 * 3. Click Deploy → New deployment → Web app:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web App URL into `content.rsvp.endpoint` in `src/content/content.ts`.
 *
 * Note: The frontend sends `Content-Type: text/plain;charset=utf-8` so the browser
 * skips CORS preflight and submits directly to `doPost(e)`.
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('RSVPs');
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('RSVPs');
      sheet.appendRow(['Timestamp', 'Name', 'Guests', 'Events', 'Message', 'Language']);
    }

    var body = JSON.parse(e.postData.contents || '{}');
    var name = String(body.name || '').trim().slice(0, 120);
    var guests = Math.min(10, Math.max(1, parseInt(body.guests, 10) || 1));
    var events = Array.isArray(body.events) ? body.events.join(', ').slice(0, 240) : '';
    var message = String(body.message || '').trim().slice(0, 500);
    var language = body.language === 'mr' ? 'mr' : 'en';

    if (!name) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'Name required' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    sheet.appendRow([new Date().toISOString(), name, guests, events, message, language]);

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
