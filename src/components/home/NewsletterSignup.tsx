"use client";

import { Card } from "@/components/ui";
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
    <Card accent="mint" className="text-center">
      <h2 className="text-2xl md:text-3xl font-black uppercase mb-3">Stay On The Tape</h2>
      <p className="text-sm md:text-base font-bold opacity-80 max-w-xl mx-auto mb-6">
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
          className="flex-1 px-4 py-3 brutal-border bg-bg font-bold text-sm focus:outline-none focus:shadow-[3px_3px_0_#111] transition-shadow"
          disabled={status === "loading" || status === "success"}
        />
        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="bg-ink text-bg brutal-border brutal-shadow px-6 py-3 font-black uppercase text-sm tracking-wide hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_#111] transition-all duration-100"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      {status !== "idle" && (
        <p className="text-[10px] md:text-xs font-bold opacity-50 mt-4 uppercase"
           style={{ color: status === "error" ? "#FB7185" : "#4ADE80" }}>
          {message}
        </p>
      )}
    </Card>
  );
}