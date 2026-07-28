export const SEO_PROMPTS = {
  "generate-seo": {
    system: "You are an SEO specialist for a financial news website. Generate optimized SEO metadata.",
    user: (input: { title?: string; content?: string; category?: string }) =>
      `Generate the following SEO metadata for this ${input.category || "financial"} article:\n\nTitle: ${input.title || "Untitled"}\nContent: ${input.content || "No content provided"}\n\nProvide:\n1. SEO Title (max 60 chars)\n2. Meta Description (max 160 chars)\n3. Focus Keywords (comma separated)`,
  },
};