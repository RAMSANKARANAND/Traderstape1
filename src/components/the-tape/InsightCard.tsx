import React from "react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

interface InsightCardProps {
  title: string;
  content: string;
}

export function InsightCard({ title, content }: InsightCardProps) {
  return (
    <Card className="p-6 bg-accent-lavender/20 border-4 border-ink relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2">
        <Badge variant="default" className="bg-ink text-white">
          AI Powered
        </Badge>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-ink text-white flex items-center justify-center font-black text-xs">
          AI
        </div>
        <h3 className="font-black uppercase tracking-tighter text-xl">{title}</h3>
      </div>
      <p className="text-text-secondary font-medium leading-relaxed italic">
        "{content}"
      </p>
    </Card>
  );
}