import { sign } from "node:crypto";

const tokenUrl = "https://oauth2.googleapis.com/token";
const scope = "https://www.googleapis.com/auth/spreadsheets";
let cachedToken: { value: string; expiresAt: number } | undefined;
let pendingToken: Promise<string> | undefined;

function sheetLocation() {
  return {
    id: process.env.GOOGLE_SHEETS_ID ?? "1ya0oxqexM7cD7kwDpCVJ3Z-xTwdrD2E86L0MbBLo0Cw",
    tab: process.env.GOOGLE_SHEETS_TAB ?? "Sheet1",
  };
}

async function requestAccessToken() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !privateKey) throw new Error("Google Sheets credentials are missing.");

  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const claims = encode({ iss: email, scope, aud: tokenUrl, iat: now, exp: now + 3600 });
  const message = `${encode({ alg: "RS256", typ: "JWT" })}.${claims}`;
  const signature = sign("RSA-SHA256", Buffer.from(message), privateKey.replace(/\\n/g, "\n"));
  const response = await fetch(tokenUrl, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${message}.${signature.toString("base64url")}`,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) throw new Error(`Google authorization returned HTTP ${response.status}.`);
  const token: { access_token: string; expires_in: number } = await response.json();
  cachedToken = { value: token.access_token, expiresAt: Date.now() + token.expires_in * 1000 };
  return cachedToken.value;
}

async function sheetsRequest(cells: string, value?: string) {
  const { id, tab } = sheetLocation();
  const range = encodeURIComponent(`'${tab.replace(/'/g, "''")}'!${cells}`);
  const write = value !== undefined;

  if (!cachedToken || cachedToken.expiresAt < Date.now() + 60_000) {
    pendingToken ??= requestAccessToken().finally(() => { pendingToken = undefined; });
    await pendingToken;
  }
  if (!cachedToken) throw new Error("Google Sheets access token is missing.");

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(id)}/values/${range}${write ? "?valueInputOption=RAW" : ""}`,
    {
      method: write ? "PUT" : "GET",
      headers: { Authorization: `Bearer ${cachedToken.value}`, "Content-Type": "application/json" },
      body: write ? JSON.stringify({ values: [[value]] }) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (response.status === 401) cachedToken = undefined;
  if (!response.ok) throw new Error(`Google Sheets returned HTTP ${response.status}.`);
  return response;
}

async function readPreviewInvitees() {
  const { id, tab } = sheetLocation();
  const url = new URL(`https://docs.google.com/spreadsheets/d/${encodeURIComponent(id)}/gviz/tq`);
  url.search = new URLSearchParams({
    sheet: tab,
    headers: "1",
    tq: "select A",
    tqx: "out:json;responseHandler:rsvpPreview",
  }).toString();

  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`Google Sheets preview returned HTTP ${response.status}.`);

  // Google's response wraps JSON in a named callback. Extract the payload as text.
  const match = (await response.text()).match(/^\s*(?:\/\*O_o\*\/\s*)?rsvpPreview\(([\s\S]*)\);\s*$/);
  if (!match) throw new Error("Google Sheets did not return a preview payload.");
  const result: { status: string; table?: { rows?: { c?: ({ v?: unknown } | null)[] }[] } } = JSON.parse(match[1]);
  if (result.status !== "ok" || !Array.isArray(result.table?.rows)) {
    throw new Error("Google Sheets did not return preview rows.");
  }
  return result.table.rows.flatMap(({ c }) => {
    const value = c?.[0]?.v;
    if (typeof value !== "string" || !value.trim()) return [];
    return [{ name: value.trim(), row: null }];
  });
}

export async function readInvitees(): Promise<{ name: string; row: number | null }[]> {
  if (process.env.NODE_ENV === "development" &&
      !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
    return readPreviewInvitees();
  }

  const response = await sheetsRequest("A2:A");
  const { values = [] }: { values?: unknown[][] } = await response.json();
  return values.flatMap(([value], index) => {
    if (typeof value !== "string" || !value.trim()) return [];
    return [{ name: value.trim(), row: index + 2 }];
  });
}

export async function saveReply(row: number, reply: "yes" | "no") {
  const response = await sheetsRequest(`B${row}`, reply === "yes" ? "Yes" : "No");
  const result: { updatedCells?: number } = await response.json();
  if (result.updatedCells !== 1) throw new Error("Google Sheets did not confirm the response.");
}
