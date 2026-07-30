"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { SearchInput } from "./SearchInput";
import { SearchResults } from "./SearchResults";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      return;
    }

    const fetchResults = async (searchQuery: string) => {
      if (!searchQuery || searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        setResults(data as any[]);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    // We don't call fetchResults here because SearchInput handles the debounce
    // and calls onQueryChange.
  }, [isOpen]);

  // This effect handles the actual API call when the debounced query changes
  useEffect(() => {
    if (isOpen && query) {
      const timer = setTimeout(async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        setResults(data as any[]);
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      }, 100); // Small buffer to avoid race conditions with SearchInput's debounce

      return () => clearTimeout(timer);
    } else if (!query) {
      setResults([]);
    }
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6 lg:px-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b-4 border-black">
          <SearchInput onQueryChange={setQuery} />
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-black" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 bg-gray-50">
          <SearchResults 
            results={results} 
            isLoading={isLoading} 
            query={query} 
          />
        </div>

        <div className="p-3 border-t-2 border-black bg-white text-right">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Press ESC to close
          </p>
        </div>
      </div>
    </div>
  );
}