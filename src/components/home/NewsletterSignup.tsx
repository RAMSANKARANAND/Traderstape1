"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json() as { error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setStatus("success");
      setMessage("You're on the list! We'll notify you when we launch.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  };

  return (
    <div className="p-5 md:p-6 text-center bg-[var(--color-surface)] border border-[var(--color-surface)] rounded-lg">
      <h2 className="text-2xl md:text-3xl font-black uppercase mb-3" style={{ color: 'var(--color-text)' }}>Stay On The Tape</h2>
      <p className="text-sm md:text-base font-bold opacity-80 max-w-xl mx-auto mb-6" style={{ color: 'var(--color-text)' }}>
        Get curated market intelligence and breaking news delivered to your inbox.
        Educational content only — never financial advice.
      </p>
      <form 
        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" 
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 px-4 py-3 border border-[var(--color-surface)] bg-white font-bold text-sm focus:outline-none focus:border-[var(--color-accent-500)] transition-colors"
          disabled={status === "loading" || status === "success"}
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="btn-hero-cyan px-6 py-3 font-black uppercase text-sm tracking-wide hover:bg-accent-600 hover:text-white transition-colors duration-150"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {status !== "idle" && (
        <p className="text-[10px] md:text-xs font-bold opacity-50 mt-4 uppercase"
           style={{ color: status === "error" ? 'var(--color-text)' : 'var(--color-text)' }}>
          {message}
        </p>
      )}
    </div>
  );
}