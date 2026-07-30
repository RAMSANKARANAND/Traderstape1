import { SearchResultCard } from "./SearchResultCard";
import { SearchEmpty } from "./SearchEmpty";
import { SearchSkeleton } from "./SearchSkeleton";

interface SearchResultsProps {
  results: any[];
  isLoading: boolean;
  query: string;
}

export function SearchResults({ results, isLoading, query }: SearchResultsProps) {
  if (isLoading) {
    return <SearchSkeleton />;
  }

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-gray-500 font-medium">Type something to search across news, tape views, and briefs...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return <SearchEmpty />;
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <SearchResultCard key={result.id} result={result} />
      ))}
    </div>
  );
}