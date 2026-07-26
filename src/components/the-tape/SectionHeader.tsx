import React from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({ title, description, className = "" }: SectionHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <h2 className="section-title">{title}</h2>
      {description && (
        <p className="mt-3 text-sm font-bold opacity-70 max-w-2xl">{description}</p>
      )}
    </div>
  );
}