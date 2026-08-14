import { getSessionUser } from "./session";

export async function requireRole(roles: string[]) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");
  if (!roles.includes(user.role)) throw new Error("Forbidden");
  return user;
}