import React from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-8 animate-fade-in-up">
      <div className="section-title mb-3">
        {title}
      </div>
      {description && (
        <p className="text-ink/70 font-medium max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}