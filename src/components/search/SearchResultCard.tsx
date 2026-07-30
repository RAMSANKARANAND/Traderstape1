import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  category: string;
  publishedAt: string | null;
  excerpt: string;
  type: "NEWS" | "TAPE VIEW" | "MORNING BRIEF";
}

export function SearchResultCard({ result }: { result: SearchResult }) {
  const getPath = () => {
    switch (result.type) {
      case "NEWS": return `/news/${result.slug}`;
      case "TAPE VIEW": return `/tape-views/${result.slug}`;
      case "MORNING BRIEF": return `/morning-brief/${result.slug}`;
      default: return `/`;
    }
  };

  return (
    <Link 
      href={getPath()} 
      className="block p-4 border-2 border-black bg-white hover:bg-yellow-50 transition-colors group"
    >
      <div className="flex items-start justify-between mb-2">
        <Badge className="rounded-none border-2 border-black px-2 py-0.5 text-xs font-bold">
          {result.type}
        </Badge>
        <span className="text-xs text-gray-500 font-medium">
          {result.publishedAt 
            ? new Date(result.publishedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) 
            : "N/A"}
        </span>
      </div>
      <h3 className="text-lg font-bold leading-tight mb-1 group-hover:underline">
        {result.title}
      </h3>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
          {result.category}
        </span>
      </div>
      <p className="text-sm text-gray-600 line-clamp-2">
        {result.excerpt}
      </p>
    </Link>
  );
}