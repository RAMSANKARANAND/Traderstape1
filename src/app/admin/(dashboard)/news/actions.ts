"use server";

import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { toggleNewsPublish as toggleNewsPublishDb, bulkDeleteNews as bulkDeleteNewsDb } from "@/lib/db-raw";

export async function toggleNewsPublish(id: string) {
  const session = await getSessionUser();
  if (!session) {
    redirect("/admin/login");
  }

  if (!id || typeof id !== "string" || id.trim().length === 0) {
    return { success: false, error: "Invalid post ID." };
  }

  try {
    const result = await toggleNewsPublishDb(id.trim());

    if (!result) {
      return { success: false, error: "Post not found." };
    }

    return {
      success: true,
      isPublished: result.isPublished,
    };
  } catch (error) {
    console.error("Toggle publish failed:", error);
    return {
      success: false,
      error: "Failed to update post. Please try again.",
    };
  }
}

export async function bulkDeleteNews(ids: string[]) {
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
    const deletedCount = await bulkDeleteNewsDb(validIds);

    return {
      success: true,
      deletedCount,
    };
  } catch (error) {
    console.error("Bulk delete failed:", error);
    return {
      success: false,
      error: "Failed to delete news articles. Please try again.",
    };
  }
}
