import { getUserByEmail } from "@/lib/db-raw";
import { createPasswordResetToken } from "@/lib/db-raw";
import { sendPasswordResetEmail } from "@/lib/email/resend";
import { Card, Button } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | TradersTape Admin",
};

export default async function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-black uppercase text-center mb-8">
          Forgot Password
        </h1>
        <Card>
          <form
            action={async (formData) => {
              "use server";
              const email = formData.get("email") as string;
              console.log("[FORGOT PASSWORD] Request received for:", email);
              
              const user = await getUserByEmail(email);
              console.log("[FORGOT PASSWORD] User found:", !!user);
              
              if (user) {
                const token = await createPasswordResetToken(user.id);
                const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/reset-password?token=${token}`;
                console.log("[FORGOT PASSWORD] Sending email to:", user.email);
                
                await sendPasswordResetEmail(
                  { RESEND_API_KEY: process.env.RESEND_API_KEY as string },
                  user.email,
                  resetUrl,
                );
                console.log("[FORGOT PASSWORD] Email sent successfully");
              }
              // If user not found, still show the same generic message
              // (this prevents user enumeration attacks)
            }}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-black uppercase mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink placeholder:text-ink/40"
                placeholder="you@example.com"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full">
              Send Reset Link
            </Button>
          </form>
          {/* Always show the same generic message to prevent user enumeration */}
          <p className="text-center mt-4 text-ink/60">
            If an account exists with that email, a reset link has been sent
          </p>
        </Card>
      </div>
    </div>
  );
}