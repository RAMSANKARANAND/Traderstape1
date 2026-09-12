import React from "react";

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function SectionTitle({ children, className = "", style }: SectionTitleProps) {
  return (
    <h2 className={`section-title ${className}`} style={style}>
      {children}
    </h2>
  );
}