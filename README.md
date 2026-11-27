# Nña & Tylor’s wedding RSVP

The invitation uses January 27, 2027 as the wedding date. The RSVP deadline is January 7, 2027, inclusive in Asia/Manila. Set the wedding date in `app/wedding.ts` once the couple confirms it. The deadline is calculated 20 days earlier. Change the motif under `:root` in `app/globals.css`.

## Run locally

```sh
npm ci
npm run dev
```

Open http://localhost:3000.

When the sheet is already readable by link, `npm run dev` can look up guests without credentials. This preview lets you try the attendance choices with saving disabled. Use the setup below for a private sheet or to save responses.

## Connect the guest list

1. [Create a Google Cloud service account and JSON key](https://developers.google.com/workspace/guides/create-credentials). Enable the Google Sheets API in the same project.
2. Share the guest spreadsheet with the service account email as an **Editor**. The sheet can be kept private.
3. Create `.env.local` and set these server-side values from the service account JSON.

```dotenv
GOOGLE_SERVICE_ACCOUNT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n…\n-----END PRIVATE KEY-----\n"
```

The supplied workbook and its `Sheet1` tab are the defaults. To use a test workbook or change tabs, set `GOOGLE_SHEETS_ID` or `GOOGLE_SHEETS_TAB`. Put the invitee’s full name in column A and reserve column B for responses. Row 1 is the header. The site saves `Yes` or `No` in column B. Use unique names as they appear on the invitations. Guests can submit an updated response by searching again before the deadline. Anyone with the link who knows the full name of a guest can submit a response for that guest.

## Share with guests

Deploy to a host with a Next.js server runtime and add the same environment variables there. The RSVP API requires server execution. Verify a lookup and a saved response with a test workbook before sending the public site URL to guests.
