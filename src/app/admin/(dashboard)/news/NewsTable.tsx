"use client";

import { useState, useTransition } from "react";
import { bulkDeleteNews, toggleNewsPublish } from "./actions";
import { Badge } from "@/components/ui/Badge";

type NewsCategory = "GEOPOLITICS" | "FOREX" | "CRYPTO" | "STOCKS" | "RESEARCH";

interface NewsPost {
  id: string;
  title: string;
  slug: string;
  category: NewsCategory;
  author: { name: string };
  isPublished: boolean;
  publishedAt: string | null;
}

interface NewsTableProps {
  posts: NewsPost[];
  userRole: "ADMIN" | "EDITOR" | "CONTRIBUTOR";
}

export default function NewsTable({ posts, userRole }: NewsTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const allSelected = posts.length > 0 && selected.size === posts.length;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(posts.map((p) => p.id)));
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
      await bulkDeleteNews(Array.from(selected));
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
              <th className="py-3 px-4 font-black uppercase text-sm">Author</th>
              <th className="py-3 px-4 font-black uppercase text-sm">Status</th>
              <th className="py-3 px-4 font-black uppercase text-sm">Published At</th>
              <th className="py-3 px-4 font-black uppercase text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-ink/20 table-row-hover">
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={selected.has(post.id)}
                    onChange={() => toggleOne(post.id)}
                    className="h-4 w-4 accent-accent-coral cursor-pointer checkbox-smooth"
                  />
                </td>
                <td className="py-3 px-4 font-black">{post.title}</td>
                <td className="py-3 px-4 font-bold text-sm">{post.category}</td>
                <td className="py-3 px-4 font-bold text-sm">{post.author.name}</td>
                <td className="py-3 px-4">
                  <Badge variant={post.isPublished ? "up" : "flat"}>
                    {post.isPublished ? "Published" : "Draft"}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-xs font-bold">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-IN") : "—"}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <a
                      href={`/admin/news/${post.id}/edit`}
                      className="text-xs font-black uppercase bg-accent-yellow text-ink px-2 py-1 brutal-border border-2 border-ink"
                    >
                      Edit
                    </a>
                    <button
                      type="button"
                      onClick={async () => {
                        startTransition(async () => {
                          await toggleNewsPublish(post.id);
                        });
                      }}
                      className="text-xs font-black uppercase bg-accent-teal text-white px-2 py-1 brutal-border border-2 border-ink"
                    >
                      {post.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    {!post.isPublished && (
                      <a
                        href={`/news/${post.slug}?preview=1`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-black uppercase bg-accent-yellow text-ink px-2 py-1 brutal-border border-2 border-ink"
                      >
                        Preview
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        startTransition(async () => {
                          await bulkDeleteNews([post.id]);
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
        {posts.length === 0 && (
          <p className="mt-4 text-sm font-bold">No news posts found.</p>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 animate-fade-in">
          <div className="brutal-card p-6 max-w-md w-full mx-4 animate-scale-in">
            <h3 className="text-lg font-black uppercase mb-2">Confirm Delete</h3>
            <p className="text-sm font-bold text-ink mb-6">
              Are you sure you want to delete {selected.size} post{selected.size !== 1 ? "s" : ""}? This cannot be undone.
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