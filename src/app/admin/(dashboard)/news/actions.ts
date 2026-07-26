"use server";

import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { getDbAsync } from "@/lib/prisma";

export async function toggleNewsPublish(id: string) {
  const session = await getSessionUser();
  if (!session) {
    redirect("/admin/login");
  }

  if (!id || typeof id !== "string" || id.trim().length === 0) {
    return { success: false, error: "Invalid post ID." };
  }

  try {
    const db = await getDbAsync();
    const post = await db.newsPost.findUnique({
      where: { id: id.trim() },
      select: { isPublished: true },
    });

    if (!post) {
      return { success: false, error: "Post not found." };
    }

    const updated = await db.newsPost.update({
      where: { id: id.trim() },
      data: {
        isPublished: !post.isPublished,
        publishedAt: !post.isPublished ? new Date() : null,
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
    const db = await getDbAsync();
    const result = await db.newsPost.deleteMany({
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
      error: "Failed to delete news articles. Please try again.",
    };
  }
}