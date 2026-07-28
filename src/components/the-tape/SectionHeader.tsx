import React from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-8 animate-fade-in-up">
      <div className="inline-block bg-ink text-white px-4 py-2 font-black uppercase tracking-tighter text-xl brutal-border mb-3">
        {title}
      </div>
      {description && (
        <p className="text-text-secondary font-medium max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}