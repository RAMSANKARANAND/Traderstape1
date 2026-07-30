export function SearchSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div 
          key={i} 
          className="p-4 border-2 border-black bg-white animate-pulse"
        >
          <div className="flex justify-between mb-3">
            <div className="h-5 w-16 bg-gray-200 border-2 border-black" />
            <div className="h-5 w-20 bg-gray-200" />
          </div>
          <div className="h-6 w-3/4 bg-gray-200 mb-2" />
          <div className="h-4 w-1/4 bg-gray-200 mb-3" />
          <div className="h-4 w-full bg-gray-200 mb-2" />
          <div className="h-4 w-2/3 bg-gray-200" />
        </div>
      ))}
    </div>
  );
}