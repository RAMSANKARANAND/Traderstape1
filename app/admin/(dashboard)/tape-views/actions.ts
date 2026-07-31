"use server";

import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { toggleTapeViewPublish as toggleTapeViewPublishDb, bulkDeleteTapeViews as bulkDeleteTapeViewsDb } from "@/lib/db-raw";

export async function toggleTapeViewPublish(id: string) {
  const session = await getSessionUser();
  if (!session) {
    redirect("/admin/login");
  }

  if (!id || typeof id !== "string" || id.trim().length === 0) {
    return { success: false, error: "Invalid tape view ID." };
  }

  try {
    const result = await toggleTapeViewPublishDb(id.trim());

    if (!result) {
      return { success: false, error: "Tape view not found." };
    }

    return {
      success: true,
      isPublished: result.isPublished,
    };
  } catch (error) {
    console.error("Toggle publish failed:", error);
    return {
      success: false,
      error: "Failed to update tape view. Please try again.",
    };
  }
}

export async function bulkDeleteTapeViews(ids: string[]) {
  const session = await getSessionUser();
  if (!session) {
    redirect("/admin/login");
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return { success: false, error: "No valid IDs provided." };
  }

  const validIds = ids.filter((id) => typeof id === "string" && id.trim().length > 0);
  if (validIds.length === 0) {
    return { success: false, error: "No valid IDs provided." };
  }

  try {
    const deletedCount = await bulkDeleteTapeViewsDb(validIds);

    return {
      success: true,
      deletedCount,
    };
  } catch (error) {
    console.error("Bulk delete failed:", error);
    return {
      success: false,
      error: "Failed to delete tape views. Please try again.",
    };
  }
}
