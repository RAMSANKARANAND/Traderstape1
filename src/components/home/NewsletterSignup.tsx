"use client";

import { Card } from "@/components/ui";

export default function NewsletterSignup() {
  return (
    <Card accent="mint" className="text-center">
      <h2 className="text-2xl md:text-3xl font-black uppercase mb-3">Stay On The Tape</h2>
      <p className="text-sm md:text-base font-bold opacity-80 max-w-xl mx-auto mb-6">
        Get curated market intelligence and breaking news delivered to your inbox.
        Educational content only — never financial advice.
      </p>
      <form 
        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" 
        onSubmit={(e) => {
          e.preventDefault();
          // Placeholder for actual subscription logic
        }}
      >
        <input
          type="email"
          required
          placeholder="you@example.com"
          className="flex-1 px-4 py-3 brutal-border bg-bg font-bold text-sm focus:outline-none focus:shadow-[3px_3px_0_#111] transition-shadow"
        />
        <button
          type="submit"
          className="bg-ink text-bg brutal-border brutal-shadow px-6 py-3 font-black uppercase text-sm tracking-wide hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_#111] transition-all duration-100"
        >
          Subscribe
        </button>
      </form>
      <p className="text-[10px] md:text-xs font-bold opacity-50 mt-4 uppercase">
        Placeholder — backend coming soon
      </p>
    </Card>
  );
}