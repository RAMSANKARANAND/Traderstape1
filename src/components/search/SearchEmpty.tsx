import { Search } from "lucide-react";

export function SearchEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-gray-100 p-4 border-2 border-black mb-4">
        <Search className="w-8 h-8 text-black" />
      </div>
      <h3 className="text-lg font-bold mb-1">No results found</h3>
      <p className="text-sm text-gray-600">Try adjusting your search terms or filters.</p>
    </div>
  );
}