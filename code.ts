/**
 * Nimali & Sachin — Wedding RSVP + Wishes → Google Sheets
 * ------------------------------------------------------------------
 * Paste this whole file into Google Apps Script (Extensions → Apps Script),
 * then Deploy → New deployment → Web app
 *    Execute as:      Me
 *    Who has access:  Anyone
 * Copy the Web App URL into Vercel env var VITE_GOOGLE_SCRIPT_URL
 * (or into GOOGLE_SCRIPT_URL in src/config.ts).
 *
 * Sheets "RSVP" and "Wishes" are created automatically with headers
 * the first time (run `setup` once from the editor, or just submit a form).
 */

var SPREADSHEET_ID = '1OCVF2DUT0Ha2YDOlVMy2QfG5xS9Yc8VhM2gt5mr53dg';
var TIMEZONE = 'Asia/Colombo';

var SHEETS = {
  RSVP: {
    name: 'RSVP',
    headers: ['Timestamp', 'Guest Name', 'Attendance', 'No. of Guests', 'Notes', 'Invitation Link'],
    widths: [170, 220, 130, 110, 320, 320],
    toRow: function (p) {
      return [
        now_(),
        clean_(p.name),
        clean_(p.attendance) || 'Attending',
        Number(p.guests) || 0,
        clean_(p.notes || p.dietary),
        clean_(p.submittedFrom),
      ];
    },
  },
  WISHES: {
    name: 'Wishes',
    headers: ['Timestamp', 'Guest Name', 'Wish / Message', 'Invitation Link'],
    widths: [170, 220, 480, 320],
    toRow: function (p) {
      return [now_(), clean_(p.name), clean_(p.message), clean_(p.submittedFrom)];
    },
  },
};

/** Run once from the Apps Script editor to create both sheets with headers. */
function setup() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  getOrCreateSheet_(ss, SHEETS.RSVP);
  getOrCreateSheet_(ss, SHEETS.WISHES);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var p = parsePayload_(e);
    var key = String(p.sheet || '').toUpperCase();
    if (key === 'WISH') key = 'WISHES';
    var config = SHEETS[key];
    if (!config) return json_({ ok: false, error: 'Unknown sheet. Use "RSVP" or "Wishes".' });
    if (!clean_(p.name)) return json_({ ok: false, error: 'Name is required.' });

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = getOrCreateSheet_(ss, config);
    sheet.appendRow(config.toRow(p));
    return json_({ ok: true, row: sheet.getLastRow() });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, message: 'Nimali & Sachin wedding endpoint is running.' });
}

// ─── helpers ───────────────────────────────────────────────────────

function getOrCreateSheet_(ss, config) {
  var sheet = ss.getSheetByName(config.name);
  if (!sheet) sheet = ss.insertSheet(config.name);

  var width = config.headers.length;
  var current = sheet.getLastRow() > 0
    ? sheet.getRange(1, 1, 1, width).getValues()[0].join('|')
    : '';

  if (current !== config.headers.join('|')) {
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(config.headers);
    } else {
      sheet.getRange(1, 1, 1, width).setValues([config.headers]);
    }
    sheet.getRange(1, 1, 1, width)
      .setFontWeight('bold')
      .setFontColor('#ffffff')
      .setBackground('#722F37')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    for (var i = 0; i < config.widths.length; i++) sheet.setColumnWidth(i + 1, config.widths[i]);
    sheet.getRange(2, 1, sheet.getMaxRows() - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  }
  return sheet;
}

function parsePayload_(e) {
  var params = (e && e.parameter) || {};
  if (Object.keys(params).length > 0) return params;

  var body = e && e.postData && e.postData.contents ? e.postData.contents : '';
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch (_) {
    var out = {};
    body.split('&').forEach(function (pair) {
      if (!pair) return;
      var i = pair.indexOf('=');
      var k = decodeURIComponent((i >= 0 ? pair.slice(0, i) : pair).replace(/\+/g, ' '));
      var v = decodeURIComponent((i >= 0 ? pair.slice(i + 1) : '').replace(/\+/g, ' '));
      out[k] = v;
    });
    return out;
  }
}

function clean_(v) {
  var s = v == null ? '' : String(v).trim();
  // Prevent spreadsheet formula injection
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s.slice(0, 2000);
}

function now_() {
  return Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
