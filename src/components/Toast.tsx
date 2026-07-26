"use client";

import { useEffect, useState, useCallback } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

const typeStyles: Record<string, string> = {
  success: "bg-accent-teal text-ink",
  error: "bg-accent-coral text-white",
  info: "bg-accent-yellow text-ink",
};

export function Toast({ message, type = "info", onClose, duration = 3000 }: ToastProps) {
  const [exiting, setExiting] = useState(false);

  const handleClose = useCallback(() => {
    setExiting(true);
    setTimeout(onClose, 250);
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(handleClose, duration);
    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-sm px-5 py-3 brutal-border border-2 border-ink font-black uppercase text-sm ${typeStyles[type]} ${exiting ? "animate-slide-out-right" : "animate-slide-in-right"}`}
    >
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button
          type="button"
          onClick={handleClose}
          className="ml-auto text-lg leading-none font-black opacity-70 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; id: number } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, closeToast };
}