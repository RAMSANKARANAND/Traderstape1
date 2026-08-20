import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserByEmail, createUser } from "@/lib/db-raw";
import { Card, SectionTitle, Button } from "@/components/ui";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-guard";

export const metadata: Metadata = {
  title: "New User | TradersTape Admin",
};

export default async function NewUserPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const { error } = await searchParams;
  
  // Page-level admin guard - only admins can access this page
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") redirect("/admin");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionTitle className="mb-8">New User</SectionTitle>
      
      {error === "email_taken" && (
        <p className="mb-4 text-sm text-red-600 text-center">
          Email is already taken. Please choose a different email.
        </p>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <form
              action={async (formData: FormData) => {
                "use server";
                await requireRole(["ADMIN"]);
                const session = await getSessionUser();
                if (!session) redirect("/admin/login");

                const name = formData.get("name") as string;
                const email = formData.get("email") as string;
                const password = formData.get("password") as string;
                const role = formData.get("role") as "ADMIN" | "EDITOR" | "CONTRIBUTOR";
                const isActive = formData.get("isActive") === "on";

                // Check if email already exists
                const existingUser = await getUserByEmail(email);
                if (existingUser) {
                  redirect(`/admin/users/new?error=email_taken`);
                }

                await createUser({
                  name,
                  email,
                  password,
                  role,
                  isActive,
                });

                redirect("/admin/users");
              }}
              className="space-y-6"
            >
              <div>
                <label htmlFor="name" className="block text-sm font-black uppercase mb-2">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-black uppercase mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="e.g. john@example.com"
                  className="w-full px-4 px-3 font-bold brutal-border bg-bg text-ink"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-black uppercase mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-black uppercase mb-2">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  className="w-full px-4 py-3 font-bold brutal-border bg-bg text-ink"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="EDITOR">Editor</option>
                  <option value="CONTRIBUTOR">Contributor</option>
                </select>
              </div>

              <div>
                <label htmlFor="isActive" className="block text-sm font-black uppercase mb-2">
                  Active
                </label>
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 brutal-border"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" variant="primary">
                  Create User
                </Button>
                <Link href="/admin/users">
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          {/* Optional: placeholder for future user preview or tips */}
          <div className="space-y-4">
            <h3 className="font-black uppercase mb-4">User Creation Tips</h3>
            <p className="text-sm text-ink/60">
              Users will receive an email invitation to set up their password if
              the email system is configured. Otherwise, you'll need to communicate
              the password securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}