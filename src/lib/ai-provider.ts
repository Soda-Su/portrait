import { createOpenAI } from "@ai-sdk/openai";

export function getPortrayModel() {
  const provider = process.env.PORTRAY_AI_PROVIDER || "gateway";
  if (provider === "openai") {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Real AI mode requires OPENAI_API_KEY for the OpenAI provider");
    }
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openai(process.env.PORTRAY_OPENAI_MODEL || "gpt-5-mini");
  }
  if (!process.env.VERCEL_OIDC_TOKEN && !process.env.AI_GATEWAY_API_KEY) {
    throw new Error(
      "Real AI mode requires AI_GATEWAY_API_KEY, VERCEL_OIDC_TOKEN, or PORTRAY_AI_PROVIDER=openai with OPENAI_API_KEY",
    );
  }
  return process.env.PORTRAY_AI_MODEL || process.env.PORTRAIT_AI_MODEL || "openai/gpt-5-mini";
}
