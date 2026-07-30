"use server";

import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { toggleMorningBriefPublish, deleteMorningBrief } from "@/lib/db-raw";

export async function togglePublish(formData: FormData) {
  const session = await getSessionUser();
  if (!session) {
    redirect("/admin/login");
  }

  const id = formData.get("id") as string;
  if (!id || typeof id !== "string" || id.trim().length === 0) {
    return;
  }

  try {
    await toggleMorningBriefPublish(id.trim());
    revalidatePath("/admin/morning-brief");
  } catch (error) {
    console.error("Toggle publish failed:", error);
  }
}

export async function deleteBrief(formData: FormData) {
  const session = await getSessionUser();
  if (!session) {
    redirect("/admin/login");
  }

  const id = formData.get("id") as string;
  if (!id || typeof id !== "string" || id.trim().length === 0) {
    return;
  }

  try {
    await deleteMorningBrief(id.trim());
    revalidatePath("/admin/morning-brief");
  } catch (error) {
    console.error("Delete failed:", error);
  }
}