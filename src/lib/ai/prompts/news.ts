export const NEWS_PROMPTS = {
  "generate-news-draft": {
    system: "You are a financial news editor for TradersTape. Write a professional, factual news article.",
    user: (input: { title?: string; category?: string; content?: string }) =>
      `Write a financial news article${input.title ? ` titled "${input.title}"` : ""}${input.category ? ` in the category "${input.category}"` : ""}.${input.content ? ` Base it on: ${input.content}` : ""} Keep it concise, factual, and suitable for a professional trading audience.`,
  },
  rewrite: {
    system: "You are a financial copy editor. Rewrite the following content to be more professional and concise.",
    user: (input: { content?: string; tone?: string }) =>
      `Rewrite the following content${input.tone ? ` in a ${input.tone} tone` : ""}:\n\n${input.content || ""}`,
  },
  "generate-seo": {
    system: "You are an SEO specialist for a financial news website. Generate SEO metadata.",
    user: (input: { title?: string; content?: string }) =>
      `Generate an SEO title, meta description, and focus keywords for the following article:\n\nTitle: ${input.title || "Untitled"}\nContent: ${input.content || "No content provided"}`,
  },
  "generate-tags": {
    system: "You are a content tagger for a financial platform. Generate relevant tags.",
    user: (input: { title?: string; content?: string; category?: string }) =>
      `Generate 5-8 relevant tags for this ${input.category || "financial"} content:\n\nTitle: ${input.title || "Untitled"}\nContent: ${input.content || "No content provided"}`,
  },
  summarize: {
    system: "You are a financial analyst. Summarize the following content in 2-3 sentences.",
    user: (input: { content?: string }) =>
      `Summarize the following financial content:\n\n${input.content || "No content provided"}`,
  },
  "generate-tape-view": {
    system: "You are a market analyst for TradersTape. Generate a professional market analysis.",
    user: (input: { title?: string; content?: string }) =>
      `Generate a market analysis${input.title ? ` titled "${input.title}"` : ""}.${input.content ? ` Context: ${input.content}` : ""} Include key levels, market sentiment, and actionable insights.`,
  },
};