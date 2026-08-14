"use client";

import { useTransition, useCallback } from "react";
import { togglePublish, deleteBrief } from "./actions";
import { useToast } from "@/components/Toast";

interface BriefActionsProps {
  id: string;
  isPublished: boolean;
  slug: string;
}

export default function BriefActions({ id, isPublished, slug }: BriefActionsProps) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const handleTogglePublish = useCallback(() => {
    startTransition(async () => {
      const result = await togglePublish(id);
      if (!result.success) {
        showToast(result.error || "Failed to update publish status", "error");
      }
    });
  }, [id, showToast]);

  const handleDelete = useCallback(() => {
    if (!confirm("Are you sure you want to delete this morning brief? This cannot be undone.")) {
      return;
    }
    startTransition(async () => {
      const result = await deleteBrief(id);
      if (!result.success) {
        showToast(result.error || "Failed to delete morning brief", "error");
      }
    });
  }, [id, showToast]);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleTogglePublish}
        disabled={isPending}
        className="text-[11px] font-black uppercase underline hover:text-accent-coral disabled:opacity-50"
      >
        {isPending ? "Saving..." : isPublished ? "Unpublish" : "Publish"}
      </button>
      {isPublished && (
        <a
          href={`/morning-brief/${slug}`}
          className="text-[11px] font-black uppercase underline hover:text-accent-coral"
        >
          Preview
        </a>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="text-[11px] font-black uppercase underline text-bear hover:opacity-80 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}