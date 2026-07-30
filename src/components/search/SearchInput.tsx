"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  onQueryChange: (query: string) => void;
  placeholder?: string;
}

export function SearchInput({ onQueryChange, placeholder = "Search news, tape views, briefs..." }: SearchInputProps) {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onQueryChange(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, onQueryChange]);

  const handleClear = () => {
    setInputValue("");
    onQueryChange("");
  };

  return (
    <div className="relative w-full">
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <Search className="w-5 h-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-12 py-4 bg-white border-4 border-black text-lg font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all placeholder:text-gray-400"
        autoFocus
      />
      {inputValue && (
        <button 
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      )}
    </div>
  );
}