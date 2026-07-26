"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "traderstape-welcome-accepted";

export default function WelcomeDisclaimerModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  const close = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible, close]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={close}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Modal */}
      <div
        className="relative bg-white w-full max-w-[650px] p-8 sm:p-10 animate-modal-in"
        style={{
          border: "3px solid #0A0A0A",
          borderRadius: "4px",
          boxShadow: "5px 5px 0 #0A0A0A",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mb-1">
          WELCOME TO TRADERSTAPE
        </h2>
        <p className="text-base sm:text-lg font-bold text-gray-600 mb-6">
          Learn Global Markets. Trade Smarter.
        </p>

        {/* Body */}
        <div className="space-y-3 text-sm sm:text-base font-medium text-gray-800 mb-8 leading-relaxed">
          <p>
            Traderstape is an educational platform created to help you understand financial markets.
          </p>
          <p>
            We do not provide investment advice, trading signals, portfolio management or financial recommendations.
          </p>
          <p>
            All articles, market analysis and educational content are published for learning and research purposes only.
          </p>
          <p>
            Always perform your own research and consult a licensed financial advisor before making investment decisions.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={close}
            className="flex-1 px-6 py-3 font-black uppercase text-sm tracking-wide"
            style={{
              backgroundColor: "#E8B04B",
              color: "#0A0A0A",
              border: "3px solid #0A0A0A",
              borderRadius: "4px",
              boxShadow: "3px 3px 0 #0A0A0A",
            }}
          >
            I Understand
          </button>
          <a
            href="/about"
            onClick={close}
            className="flex-1 px-6 py-3 font-black uppercase text-sm tracking-wide text-center"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#0A0A0A",
              border: "3px solid #0A0A0A",
              borderRadius: "4px",
              boxShadow: "3px 3px 0 #0A0A0A",
            }}
          >
            Learn More
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 250ms ease-out;
        }
        .animate-modal-in {
          animation: modalIn 300ms ease-out;
        }
      `}</style>
    </div>
  );
}