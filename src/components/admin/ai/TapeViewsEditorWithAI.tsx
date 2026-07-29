"use client";

import React from "react";
import { AiAssistantPanel } from "./AiAssistantPanel";

export function TapeViewsEditorWithAI() {
  const getTitle = (): string => {
    const input = document.querySelector<HTMLInputElement>('input[name="title"]');
    return input?.value ?? "";
  };

  const getCategory = (): string => {
    const select = document.querySelector('select[name="category"]') as HTMLSelectElement | null;
    return select?.value ?? "";
  };

  const getContent = (): string => {
    const textarea = document.querySelector<HTMLTextAreaElement>('textarea[name="body"]');
    return textarea?.value ?? "";
  };

  const handleInsertContent = (field: string, value: string) => {
    let selector: string | null = null;
    if (field === "body") selector = 'textarea[name="body"]';
    else if (field === "todayView") selector = 'textarea[name="todayView"]';
    else if (field === "seoTitle") selector = 'input[name="seoTitle"]';
    else if (field === "seoDescription") selector = 'textarea[name="seoDescription"]';

    if (!selector) return;

    const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
    if (el) {
      el.value = value;
    }
  };

  const handleInsertTags = (tags: string[]) => {
    console.log("Generated tags:", tags);
  };

  return (
    <AiAssistantPanel
      title={getTitle()}
      category={getCategory()}
      content={getContent()}
      onInsertContent={handleInsertContent}
      onInsertTags={handleInsertTags}
    />
  );
}