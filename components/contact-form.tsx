"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Sending…");
    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send.");
      form.reset();
      setStatus("Message sent successfully. We’ll get back to you soon.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to send your message right now.");
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="contact-form-grid">
        <label>Name<input name="name" required placeholder="Your name" autoComplete="name" /></label>
        <label>Email<input name="email" type="email" required placeholder="you@example.com" autoComplete="email" /></label>
      </div>
      <label>Subject<input name="subject" required placeholder="How can we help?" /></label>
      <label>Message<textarea name="message" required placeholder="Write your message…" rows={7} /></label>
      <button className="button button-accent" type="submit" disabled={status === "Sending…"}>{status === "Sending…" ? "Sending…" : "Send message"}</button>
      {status && <p className="contact-status" role="status">{status}</p>}
    </form>
  );
}
