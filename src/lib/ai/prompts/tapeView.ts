export const TAPE_VIEW_PROMPTS = {
  "generate-tape-view": {
    system: "You are a senior market analyst for TradersTape. Generate a professional market analysis with key levels, sentiment, and actionable insights.",
    user: (input: { title?: string; content?: string }) =>
      `Generate a detailed market analysis${input.title ? ` titled "${input.title}"` : ""}.${input.content ? ` Context: ${input.content}` : ""} Include:\n1. Market overview\n2. Key support and resistance levels\n3. Market sentiment\n4. Key levels to watch\n5. Risk factors`,
  },
};