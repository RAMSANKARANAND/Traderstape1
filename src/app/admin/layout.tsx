import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  // Second layer of protection — re-check session inside Server Component
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Admin Header */}
      <header className="bg-ink text-bg brutal-border-b border-b-3 border-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-lg font-black uppercase tracking-tight">
              TradersTape Admin
            </Link>
            <nav className="hidden sm:flex items-center gap-4">
              <Link
                href="/admin/levels"
                className="text-sm font-black uppercase hover:text-accent-yellow transition-colors"
              >
                Levels
              </Link>
              <Link
                href="/admin/news"
                className="text-sm font-black uppercase hover:text-accent-yellow transition-colors"
              >
                News
              </Link>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin/users"
                  className="text-sm font-black uppercase hover:text-accent-yellow transition-colors"
                >
                  Users
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase opacity-70">
              {user.name} ({user.role})
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button
                type="submit"
                className="text-xs font-black uppercase bg-accent-coral text-white px-3 py-1.5 brutal-border border-2 border-ink hover:opacity-90 transition-opacity"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="sm:hidden px-4 pb-3 flex gap-3">
          <Link
            href="/admin/levels"
            className="text-xs font-black uppercase hover:text-accent-yellow transition-colors"
          >
            Levels
          </Link>
          <Link
            href="/admin/news"
            className="text-xs font-black uppercase hover:text-accent-yellow transition-colors"
          >
            News
          </Link>
          {user.role === "ADMIN" && (
            <Link
              href="/admin/users"
              className="text-xs font-black uppercase hover:text-accent-yellow transition-colors"
            >
              Users
            </Link>
          )}
          <Link
            href="/"
            className="text-xs font-black uppercase hover:text-accent-yellow transition-colors ml-auto"
          >
            View Site
          </Link>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}