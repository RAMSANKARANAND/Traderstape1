import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, Badge, SectionTitle, Button } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Users | TradersTape Admin",
};

export default async function AdminUsersPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") redirect("/admin");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <SectionTitle className="mb-0">Users</SectionTitle>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-3 border-ink">
                <th className="py-3 px-4 font-black uppercase text-sm">Name</th>
                <th className="py-3 px-4 font-black uppercase text-sm">Email</th>
                <th className="py-3 px-4 font-black uppercase text-sm">Role</th>
                <th className="py-3 px-4 font-black uppercase text-sm">Active</th>
                <th className="py-3 px-4 font-black uppercase text-sm">Created</th>
                <th className="py-3 px-4 font-black uppercase text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-ink/20">
                  <td className="py-3 px-4 font-black">{u.name}</td>
                  <td className="py-3 px-4 font-bold text-sm">{u.email}</td>
                  <td className="py-3 px-4">
                    <Badge variant={u.role === "ADMIN" ? "up" : u.role === "EDITOR" ? "flat" : "default"}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {u.isActive ? (
                      <span className="text-accent-teal font-black">YES</span>
                    ) : (
                      <span className="text-accent-coral font-black">NO</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs font-bold">
                    {new Date(u.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <form
                        action={async () => {
                          "use server";
                          const session = await getSessionUser();
                          if (!session || session.role !== "ADMIN") return;
                          const { prisma: db } = await import("@/lib/prisma");
                          await db.user.update({
                            where: { id: u.id },
                            data: { isActive: !u.isActive },
                          });
                        }}
                      >
                        <button
                          type="submit"
                          className="text-xs font-black uppercase bg-accent-yellow text-ink px-2 py-1 brutal-border border-2 border-ink"
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}