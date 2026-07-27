import React from "react";
import { Card } from "../ui/Card";

interface TapeCardProps {
  children: React.ReactNode;
  className?: string;
}

export function TapeCard({ children, className = "" }: TapeCardProps) {
  return (
    <Card className={`transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0_#111] ${className}`}>
      {children}
    </Card>
  );
}