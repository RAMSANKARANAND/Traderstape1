import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface WaitlistRequest {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
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
      await db
        .prepare("INSERT INTO WaitlistEmail (email) VALUES (?)")
        .bind(email.toLowerCase())
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