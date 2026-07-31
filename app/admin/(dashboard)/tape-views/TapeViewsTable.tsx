"use client";

import { useState, useTransition } from "react";
import { bulkDeleteTapeViews, toggleTapeViewPublish } from "./actions";
import { Badge } from "@/components/ui/Badge";

type TapeViewCategory = "NSE" | "FOREX" | "CRYPTO" | "COMMODITIES" | "GLOBAL_MARKETS" | "WEEKLY_OUTLOOK" | "SPECIAL_REPORT";

interface TapeView {
  id: string;
  title: string;
  category: TapeViewCategory;
  instrument: string;
  bias: "BULLISH" | "BEARISH" | "NEUTRAL";
  author: { name: string };
  isPublished: boolean;
  publishedAt: string | null;
}

interface TapeViewsTableProps {
  tapeViews: TapeView[];
  userRole: "ADMIN" | "EDITOR" | "CONTRIBUTOR";
}

export default function TapeViewsTable({ tapeViews, userRole }: TapeViewsTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const allSelected = tapeViews.length > 0 && selected.size === tapeViews.length;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(tapeViews.map((t) => t.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleBulkDelete() {
    setShowConfirm(true);
  }

  async function confirmBulkDelete() {
    setShowConfirm(false);
    startTransition(async () => {
      await bulkDeleteTapeViews(Array.from(selected));
      setSelected(new Set());
    });
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-black">{selected.size} selected</span>
          <button
            type="button"
            onClick={handleBulkDelete}
            className="text-xs font-black uppercase bg-accent-coral text-white px-3 py-1.5 brutal-border border-2 border-ink hover:opacity-90"
          >
            Delete Selected
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-3 border-ink">
              <th className="py-3 px-4 w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = selected.size > 0 && !allSelected;
                  }}
                  onChange={toggleAll}
                  className="h-4 w-4 accent-accent-coral cursor-pointer checkbox-smooth"
                />
              </th>
              <th className="py-3 px-4 font-black uppercase text-sm">Title</th>
              <th className="py-3 px-4 font-black uppercase text-sm">Category</th>
              <th className="py-3 px-4 font-black uppercase text-sm">Instrument</th>
              <th className="py-3 px-4 font-black uppercase text-sm">Bias</th>
              <th className="py-3 px-4 font-black uppercase text-sm">Author</th>
              <th className="py-3 px-4 font-black uppercase text-sm">Status</th>
              <th className="py-3 px-4 font-black uppercase text-sm">Published At</th>
              <th className="py-3 px-4 font-black uppercase text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tapeViews.map((tapeView) => (
              <tr key={tapeView.id} className="border-b border-ink/20 table-row-hover">
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selected.has(tapeView.id)}
                    onChange={() => toggleOne(tapeView.id)}
                    className="h-4 w-4 accent-accent-coral cursor-pointer checkbox-smooth"
                  />
                </td>
                <td className="py-3 px-4 font-black">{tapeView.title}</td>
                <td className="py-3 px-4 font-bold text-sm">{tapeView.category}</td>
                <td className="py-3 px-4 font-bold text-sm">{tapeView.instrument}</td>
                <td className="py-3 px-4 font-bold text-sm">
                  <span className={
                    tapeView.bias === "BULLISH" ? "text-accent-teal" :
                    tapeView.bias === "BEARISH" ? "text-accent-coral" : "text-accent-yellow"
                  }>
                    {tapeView.bias}
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-sm">{tapeView.author.name}</td>
                <td className="py-3 px-4">
                  <Badge variant={tapeView.isPublished ? "up" : "flat"}>
                    {tapeView.isPublished ? "Published" : "Draft"}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-xs font-bold">
                  {tapeView.publishedAt ? new Date(tapeView.publishedAt).toLocaleDateString("en-IN") : "—"}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <a
                      href={`/admin/tape-views/${tapeView.id}/edit`}
                      className="text-xs font-black uppercase bg-accent-yellow text-ink px-2 py-1 brutal-border border-2 border-ink"
                    >
                      Edit
                    </a>
                    <button
                      type="button"
                      onClick={async () => {
                        startTransition(async () => {
                          await toggleTapeViewPublish(tapeView.id);
                        });
                      }}
                      className="text-xs font-black uppercase bg-accent-teal text-white px-2 py-1 brutal-border border-2 border-ink"
                    >
                      {tapeView.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        startTransition(async () => {
                          await bulkDeleteTapeViews([tapeView.id]);
                        });
                      }}
                      className="text-xs font-black uppercase bg-accent-coral text-white px-2 py-1 brutal-border border-2 border-ink"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tapeViews.length === 0 && (
          <p className="mt-4 text-sm font-bold">No tape view articles found.</p>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 animate-fade-in">
          <div className="brutal-card p-6 max-w-md w-full mx-4 animate-scale-in">
            <h3 className="text-lg font-black uppercase mb-2">Confirm Delete</h3>
            <p className="text-sm font-bold text-ink mb-6">
              Are you sure you want to delete {selected.size} tape view{selected.size !== 1 ? "s" : ""}? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="text-xs font-black uppercase bg-accent-yellow text-ink px-3 py-1.5 brutal-border border-2 border-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBulkDelete}
                className="text-xs font-black uppercase bg-accent-coral text-white px-3 py-1.5 brutal-border border-2 border-ink"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
