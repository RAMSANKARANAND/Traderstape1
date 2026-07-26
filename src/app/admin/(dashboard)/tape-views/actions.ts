"use server";

import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getDbAsync } from "@/lib/prisma";

export async function toggleTapeViewPublish(id: string) {
  const session = await getSessionUser();
  if (!session) {
    redirect("/admin/login");
  }

  if (!id || typeof id !== "string" || id.trim().length === 0) {
    return { success: false, error: "Invalid tape view ID." };
  }

  try {
    const db = await getDbAsync();
    const tapeView = await db.tapeView.findUnique({
      where: { id: id.trim() },
      select: { isPublished: true },
    });

    if (!tapeView) {
      return { success: false, error: "Tape view not found." };
    }

    const updated = await db.tapeView.update({
      where: { id: id.trim() },
      data: {
        isPublished: !tapeView.isPublished,
        publishedAt: !tapeView.isPublished ? new Date() : null,
      },
    });

    return {
      success: true,
      isPublished: updated.isPublished,
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
    const db = await getDbAsync();
    const result = await db.tapeView.deleteMany({
      where: {
        id: {
          in: validIds,
        },
      },
    });

    return {
      success: true,
      deletedCount: result.count,
    };
  } catch (error) {
    console.error("Bulk delete failed:", error);
    return {
      success: false,
      error: "Failed to delete tape views. Please try again.",
    };
  }
}