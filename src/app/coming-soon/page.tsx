"use client";

import { useEffect, useRef, useState } from "react";

export default function ComingSoonPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const CANVAS_WIDTH = typeof window !== "undefined" ? window.innerWidth : 1920;
  const CANVAS_HEIGHT = typeof window !== "undefined" ? window.innerHeight : 1080;

  const symbols = ["$", "₹", "€", "£", "¥", "₿", "₿"];
  const particles: Array<{
    x: number;
    y: number;
    size: number;
    speed: number;
    symbol: string;
    opacity: number;
    rotation: number;
    rotationSpeed: number;
  }> = [];

  const initParticles = () => {
    particles.length = 0;
    const count = Math.min(80, Math.floor((CANVAS_WIDTH * CANVAS_HEIGHT) / 30000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT - CANVAS_HEIGHT,
        size: 16 + Math.random() * 32,
        speed: 0.5 + Math.random() * 1.5,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        opacity: 0.15 + Math.random() * 0.35,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      });
    }
  };

  const drawParticles = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, "rgba(240, 187, 64, 0.9)");
    gradient.addColorStop(0.5, "rgba(240, 187, 64, 0.7)");
    gradient.addColorStop(1, "rgba(240, 187, 64, 0.4)");

    particles.forEach((p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.font = `${p.size}px "JetBrains Mono", monospace`;
      ctx.fillStyle = gradient;
      ctx.globalAlpha = p.opacity;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.symbol, 0, 0);
      ctx.restore();
    });
  };

  const updateParticles = () => {
    particles.forEach((p) => {
      p.y += p.speed;
      p.rotation += p.rotationSpeed;
      if (p.y > CANVAS_HEIGHT + 50) {
        p.y = -50;
        p.x = Math.random() * CANVAS_WIDTH;
        p.speed = 0.5 + Math.random() * 1.5;
        p.opacity = 0.15 + Math.random() * 0.35;
      }
    });
  };

  const animate = () => {
    updateParticles();
    drawParticles();
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    initParticles();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

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
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden" style={{ backgroundColor: "#0a0a08" }}>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-0 pointer-events-none opacity-5" style={{
        backgroundImage: `
          linear-gradient(rgba(240, 187, 64, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(240, 187, 64, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md text-center space-y-8">
          <span className="inline-block transform -rotate-2 bg-[#f0bb40] text-black border-2 border-black shadow-[4px_4px_0_#000] px-4 py-2 font-black text-sm uppercase tracking-wider">
            LAUNCHING SOON
          </span>

          <h1 className="font-black text-white bg-black border-3 border-[#4fd88a] shadow-[6px_6px_0_#4fd88a] px-6 py-4 text-4xl md:text-6xl uppercase tracking-tight leading-tight">
            TRADERSTAPE
          </h1>

          <p className="bg-black border-3 border-white text-white px-6 py-4 text-lg font-bold leading-relaxed">
            The tape is loading. Bulls, sharpen up.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading" || status === "success"}
                className="w-full bg-white text-black border-3 border-black shadow-[4px_4px_0_#000] px-5 py-4 text-lg font-bold placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:ring-offset-0 transition-shadow"
                aria-describedby={status === "error" ? "email-error" : status === "success" ? "email-success" : undefined}
              />
              {(status === "error" || status === "success") && (
                <p
                  id={status === "error" ? "email-error" : "email-success"}
                  className="text-sm font-bold text-left"
                  style={{ color: status === "error" ? "#FB7185" : "#4ADE80" }}
                >
                  {message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="w-full bg-[#f0bb40] text-black border-3 border-black shadow-[4px_4px_0_#000] px-6 py-4 font-black text-lg uppercase tracking-wider transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#000] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "SUBSCRIBING..." : status === "success" ? "SUBSCRIBED!" : "NOTIFY ME"}
            </button>
          </form>

          <footer className="pt-8">
            <div className="inline-flex items-center gap-3 bg-[#f0bb40] text-black border-2 border-black shadow-[4px_4px_0_#000] px-4 py-2">
              <svg
                className="w-5 h-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className="font-black text-sm uppercase tracking-wider">BUILT WITH AI ASSISTANCE</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}