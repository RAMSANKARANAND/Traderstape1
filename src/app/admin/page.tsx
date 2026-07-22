import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, SectionTitle } from "@/components/ui";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | TradersTape",
};

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const [levelCount, newsCount, userCount] = await Promise.all([
    prisma.marketLevel.count(),
    prisma.newsPost.count(),
    prisma.user.count(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionTitle className="mb-8">Dashboard</SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Link href="/admin/levels">
          <Card accent="teal" className="hover:translate-x-1 hover:translate-y-1 transition-transform">
            <p className="text-4xl font-black">{levelCount}</p>
            <p className="font-black uppercase mt-2">Market Levels</p>
          </Card>
        </Link>
        <Link href="/admin/news">
          <Card accent="blue" className="hover:translate-x-1 hover:translate-y-1 transition-transform">
            <p className="text-4xl font-black">{newsCount}</p>
            <p className="font-black uppercase mt-2">News Posts</p>
          </Card>
        </Link>
        {user.role === "ADMIN" && (
          <Link href="/admin/users">
            <Card accent="pink" className="hover:translate-x-1 hover:translate-y-1 transition-transform">
              <p className="text-4xl font-black">{userCount}</p>
              <p className="font-black uppercase mt-2">Users</p>
            </Card>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-black uppercase mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/levels/new"
              className="block w-full text-center bg-accent-yellow text-ink font-black uppercase py-3 brutal-border hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
            >
              + Add Market Level
            </Link>
            <Link
              href="/admin/news/new"
              className="block w-full text-center bg-accent-yellow text-ink font-black uppercase py-3 brutal-border hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
            >
              + Add News Post
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="font-black uppercase mb-4">Your Role</h2>
          <p className="font-bold">
            You are logged in as <strong className="uppercase">{user.name}</strong> with role{" "}
            <strong className="uppercase text-accent-coral">{user.role}</strong>.
          </p>
          <ul className="mt-4 space-y-2 text-sm font-bold">
            <li>• {user.role === "CONTRIBUTOR" ? "Create and edit your own drafts" : "Create, edit, and publish content"}</li>
            <li>• {user.role === "ADMIN" ? "Manage users and roles" : "Cannot manage users"}</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}