import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, Button } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | TradersTape",
};

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-black uppercase text-center mb-8">
          Admin Login
        </h1>
        <Card>
          <form
            action={async (formData) => {
              "use server";
              await signIn("credentials", {
                email: formData.get("email") as string,
                password: formData.get("password") as string,
                redirectTo: "/admin",
              });
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
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-black uppercase mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink placeholder:text-ink/40"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full">
              Sign In
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}