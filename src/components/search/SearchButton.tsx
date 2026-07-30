"use client";

import React from "react";
import { Search } from "lucide-react";

interface SearchButtonProps {
  onClick: () => void;
}

export function SearchButton({ onClick }: SearchButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black font-bold hover:bg-yellow-400 transition-colors active:translate-x-0.5 active:translate-y-0.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
    >
      <Search className="w-4 h-4" />
      <span className="hidden sm:inline">Search</span>
    </button>
  );
}