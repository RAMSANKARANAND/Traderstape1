import { auth } from "./auth";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "CONTRIBUTOR";
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  const u = session.user as any;
  return {
    id: u.id,
    name: u.name || "",
    email: u.email || "",
    role: u.role || "CONTRIBUTOR",
  };
}