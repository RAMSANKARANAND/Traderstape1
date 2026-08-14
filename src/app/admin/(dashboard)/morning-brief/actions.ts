"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { toggleMorningBriefPublish, deleteMorningBrief } from "@/lib/db-raw";
import { requireRole } from "@/lib/auth-guard";

export async function togglePublish(id: string) {
  await requireRole(["ADMIN", "EDITOR"]);

  if (!id || typeof id !== "string" || id.trim().length === 0) {
    return { success: false, error: "Invalid morning brief ID." };
  }

  try {
    const result = await toggleMorningBriefPublish(id.trim());

    if (!result) {
      return { success: false, error: "Morning brief not found." };
    }

    revalidatePath("/admin/morning-brief");
    return {
      success: true,
      isPublished: result.isPublished,
    };
  } catch (error) {
    console.error("Toggle publish failed:", error);
    return {
      success: false,
      error: "Failed to update morning brief. Please try again.",
    };
  }
}

export async function deleteBrief(id: string) {
  await requireRole(["ADMIN", "EDITOR"]);

  if (!id || typeof id !== "string" || id.trim().length === 0) {
    return { success: false, error: "Invalid morning brief ID." };
  }

  try {
    await deleteMorningBrief(id.trim());
    revalidatePath("/admin/morning-brief");
    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete failed:", error);
    return {
      success: false,
      error: "Failed to delete morning brief. Please try again.",
    };
  }
}