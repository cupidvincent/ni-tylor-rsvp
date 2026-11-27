"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "./icons";

type Reply = "yes" | "no";
type Result = { name?: string; preview?: true; error?: string };

function focusGuest(heading: HTMLHeadingElement | null) {
  heading?.focus();
}

export function RsvpForm({ initiallyClosed }: { initiallyClosed: boolean }) {
  const [query, setQuery] = useState("");
  const [guest, setGuest] = useState<{ name: string; preview?: true } | null>(null);
  const [reply, setReply] = useState<Reply | "">("");
  const [saved, setSaved] = useState<Reply | "">("");
  const [busy, setBusy] = useState(false);
  const [closed, setClosed] = useState(initiallyClosed);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || (guest && (!reply || guest.preview))) return;

    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guest ? { name: guest.name, reply } : { name: query }),
      });
      const data: Result = await response.json();

      if (response.status === 410) {
        setClosed(true);
        return;
      }
      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      if (guest) {
        setSaved(reply);
      } else if (data.name) {
        setGuest({ name: data.name, preview: data.preview });
      }
    } catch {
      setError("We couldn’t connect. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setGuest(null);
    setReply("");
    setSaved("");
    setError("");
  }

  return (
    <div className="rsvp-card">
      {closed ? (
        <p role="status">Online RSVPs have closed. Please contact the couple if you need to update your plans.</p>
      ) : saved ? (
        <div className="confirmation">
          <span className="confirm-icon"><Icon name="check" size={24} /></span>
          <h3>Thank you, {guest?.name}!</h3>
          <p role="status">{saved === "yes" ? "You’re on the list. We can’t wait to celebrate with you!" : "Your RSVP has been saved. We’ll miss you!"}</p>
          <button type="button" className="text-button" onClick={reset}>Search for a guest</button>
        </div>
      ) : (
        <form onSubmit={submit} aria-busy={busy}>
          {guest ? (
            <div className="guest-result">
              <h3 tabIndex={-1} ref={focusGuest}>Hello, {guest.name}!</h3>
              <fieldset disabled={busy}>
                <legend>Will you be joining us?</legend>
                <div className="reply-options">
                  <label><input type="radio" name="reply" value="yes" checked={reply === "yes"} onChange={() => setReply("yes")} required /> Joyfully accepts</label>
                  <label><input type="radio" name="reply" value="no" checked={reply === "no"} onChange={() => setReply("no")} required /> Regretfully declines</label>
                </div>
              </fieldset>
              {guest.preview && <p className="field-hint">Local preview only. Connect Google Sheets to save responses.</p>}
              <div className="response-actions">
                <button type="submit" className="button primary" disabled={busy || !reply || guest.preview}>{busy ? "Saving…" : "Save my RSVP"}</button>
                <button type="button" className="text-button" onClick={reset} disabled={busy}>Search again</button>
              </div>
            </div>
          ) : (
            <>
              <label className="name-label" htmlFor="guest-name">Find your invitation</label>
              <p className="field-hint" id="name-hint">Enter your full name as it appears on your invitation.</p>
              <div className="search-row">
                <div className="search-field">
                  <Icon name="search" size={19} />
                  <input id="guest-name" value={query} onChange={(event) => { setQuery(event.target.value); setError(""); }}
                    placeholder="Your full name" aria-describedby="name-hint" aria-invalid={Boolean(error)}
                    autoComplete="name" maxLength={160} required disabled={busy} />
                </div>
                <button type="submit" className="button primary" disabled={busy || !query.trim()}>{busy ? "Searching…" : "Find my name"}</button>
              </div>
            </>
          )}
          {error && <p className="form-error" role="alert">{error}</p>}
        </form>
      )}
    </div>
  );
}
