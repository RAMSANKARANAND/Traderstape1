import { getPasswordResetToken, markPasswordResetTokenUsed, updateUserPassword } from "@/lib/db-raw";
import { compare, hash } from "bcryptjs";
import { Card, Button } from "@/components/ui";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | TradersTape Admin",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="p-6">
            <h1 className="text-2xl font-black uppercase text-center mb-6">
              Invalid Request
            </h1>
            <p className="text-center text-ink/60">
              Missing reset token. Please check your email and try again.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Validate token
  const tokenData = await getPasswordResetToken(token);
  if (!tokenData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="p-6">
            <h1 className="text-2xl font-black uppercase text-center mb-6">
              Invalid or Expired Token
            </h1>
            <p className="text-center text-ink/60">
              Invalid reset token. Please check your email and try again.
            </p>
            <div className="mt-6 text-center">
              <a
                href="/admin/forgot-password"
                className="text-sm font-black underline hover:text-ink/80"
              >
                Go back to forgot password
              </a>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (tokenData.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="p-6">
            <h1 className="text-2xl font-black uppercase text-center mb-6">
              Invalid or Expired Token
            </h1>
            <p className="text-center text-ink/60">
              This reset link has expired. Please request a new one.
            </p>
            <div className="mt-6 text-center">
              <a
                href="/admin/forgot-password"
                className="text-sm font-black underline hover:text-ink/80"
              >
                Go back to forgot password
              </a>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (tokenData.usedAt !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="p-6">
            <h1 className="text-2xl font-black uppercase text-center mb-6">
              Invalid or Expired Token
            </h1>
            <p className="text-center text-ink/60">
              This reset link has already been used.
            </p>
            <div className="mt-6 text-center">
              <a
                href="/admin/forgot-password"
                className="text-sm font-black underline hover:text-ink/80"
              >
                Go back to forgot password
              </a>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Token is valid, show reset form
  const userId = tokenData.userId; // This is definitely a string

  async function handleSubmit(formData: FormData) {
    "use server";
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      redirect(`/admin/reset-password?token=${token}&error=password_mismatch`);
    }

    // Hash the new password
    const hashedPassword = await hash(password, 10);

    // Update user's password
    await updateUserPassword(userId, hashedPassword);

    // Mark token as used
    await markPasswordResetTokenUsed(token!);

    // Redirect to login with success message
    redirect("/admin/login?reset=success");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="p-6">
          <h1 className="text-2xl font-black uppercase text-center mb-6">
            Reset Password
          </h1>
          {error === "password_mismatch" && (
            <p className="mb-4 text-sm text-red-600 text-center">
              Passwords do not match. Please try again.
            </p>
          )}
          <form
            action={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-black uppercase mb-2"
              >
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink placeholder:text-ink/40"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-black uppercase mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink placeholder:text-ink/40"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full">
              Reset Password
            </Button>
            <p className="text-center mt-4 text-sm text-ink/60">
              Remember your password?{" "}
              <a href="/admin/login" className="underline text-ink/60 hover:text-ink">
                Sign in
              </a>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}