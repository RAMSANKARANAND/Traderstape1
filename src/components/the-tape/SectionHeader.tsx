import React from "react";

interface SectionHeaderProps {
  title: string;
  description?: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="mb-2 text-heading font-black uppercase tracking-tighter" style={{ color: 'var(--color-text)' }}>
        {title}
      </h2>
      {description && (
        <p className="text-sm font-bold text-text-secondary">
          {description}
        </p>
      )}
    </div>
  );
}