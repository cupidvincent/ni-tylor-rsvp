import { rsvpIsClosed } from "../../wedding";
import { readInvitees, saveReply } from "./sheets";

function respond(data: { error: string } | { name: string; preview?: true } | { saved: true }, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function normalizeName(name: string) {
  return name.normalize("NFKC").trim().replace(/\s+/gu, " ").toLowerCase();
}

export async function POST(request: Request) {
  if (rsvpIsClosed()) {
    return respond({ error: "Online RSVPs have closed." }, 410);
  }

  const data = await request.json().catch(() => null);
  const name = typeof data?.name === "string" ? normalizeName(data.name) : "";
  const reply: unknown = data?.reply;
  if (!name || name.length > 160 || (reply !== undefined && reply !== "yes" && reply !== "no")) {
    return respond({ error: "Please enter your full name and choose a valid response." }, 400);
  }

  try {
    const invitees = await readInvitees();
    const matches = invitees.filter((invitee) => normalizeName(invitee.name) === name);
    if (!matches.length) {
      return respond({ error: "We couldn’t find that name. Check the spelling on your invitation and try again." }, 404);
    }
    if (matches.length > 1) {
      return respond({ error: "There’s more than one invitation under that name. Please contact the couple to RSVP." }, 409);
    }

    const [guest] = matches;
    if (reply === undefined) {
      return respond(guest.row === null ? { name: guest.name, preview: true } : { name: guest.name });
    }
    if (guest.row === null) {
      return respond({ error: "Local preview is read-only. Connect Google Sheets to save an RSVP." }, 403);
    }

    if (rsvpIsClosed()) {
      return respond({ error: "Online RSVPs have closed." }, 410);
    }
    await saveReply(guest.row, reply);
    return respond({ saved: true });
  } catch (error) {
    console.error("RSVP sheet request failed:", error instanceof Error ? error.message : "Unknown error");
    return respond({ error: "The guest list is temporarily unavailable. Please try again in a moment." }, 503);
  }
}
