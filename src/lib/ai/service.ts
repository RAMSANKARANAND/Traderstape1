import type { AiRequest, AiResponse } from "./types";
import { getAiProvider } from "./provider";

export async function generateAiContent(req: AiRequest): Promise<AiResponse> {
  const provider = getAiProvider();

  try {
    const response = await provider.generate(req);
    return response;
  } catch (error) {
    console.error("AI service error:", error);
    return {
      success: false,
      mode: provider.name as "mock" | "openai",
      message: error instanceof Error ? error.message : "Unknown AI service error",
    };
  }
}