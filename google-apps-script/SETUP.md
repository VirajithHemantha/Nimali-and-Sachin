# RSVP & Wishes → Google Sheets

Spreadsheet: https://docs.google.com/spreadsheets/d/1OCVF2DUT0Ha2YDOlVMy2QfG5xS9Yc8VhM2gt5mr53dg/edit

1. Open the spreadsheet → **Extensions → Apps Script**.
2. Delete the default code and paste everything from `code.ts` (same as `google-apps-script/code.gs`).
3. Save, choose the `setup` function in the toolbar and click **Run** once (approve permissions).
   This creates the **RSVP** and **Wishes** sheets with formatted headers.
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the Web App URL (ends in `/exec`).
6. In Vercel → Project → Settings → Environment Variables add:
   `VITE_GOOGLE_SCRIPT_URL = <your /exec URL>` and redeploy.
   (Or paste it into `GOOGLE_SCRIPT_URL` in `src/config.ts`.)

| Sheet  | Columns |
| ------ | ------- |
| RSVP   | Timestamp · Guest Name · Attendance · No. of Guests · Notes · Invitation Link |
| Wishes | Timestamp · Guest Name · Wish / Message · Invitation Link |

Wishes are stored only in the sheet — they are not shown on the invitation.
If you edit the script later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.
