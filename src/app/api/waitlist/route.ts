import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getKvNamespace, checkRateLimit } from "@/lib/rate-limit";
import { generateId } from "@/lib/db-raw";

interface WaitlistRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP using KV
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const kv = await getKvNamespace();
    if (kv) {
      const rateLimit = await checkRateLimit(kv, ip, "waitlist", 5, 60);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Try again later." },
          { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
        );
      }
    }

    const body = (await request.json()) as WaitlistRequest;
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    const db = env.traderstape;

    try {
      const id = generateId();
      await db
        .prepare("INSERT INTO WaitlistEmail (id, email) VALUES (?, ?)")
        .bind(id, email.toLowerCase())
        .run();

      return NextResponse.json({ success: true });
    } catch (err: unknown) {
      const d1Error = err as { message?: string; code?: string };
      if (d1Error.code === "SQLITE_CONSTRAINT_UNIQUE" || d1Error.message?.includes("UNIQUE")) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 409 }
        );
      }
      throw err;
    }
  } catch (err) {
    console.error("Waitlist signup error:", err);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}