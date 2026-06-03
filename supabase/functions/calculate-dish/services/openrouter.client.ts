import { parseLlmDishResponse } from "../lib/parse-llm-dish-response.ts";
import { CookingMethodResolverService } from "./cooking-method-resolver.service.ts";
import type { LlmIngredient } from "../types.ts";
import { DISH_PARSE_SYSTEM_PROMPT } from "../prompts/dish-parse-v3.ts";

export class OpenRouterClient {
  private apiKey = Deno.env.get("OPENROUTER_API_KEY") ?? "";
  private model = Deno.env.get("OPENROUTER_MODEL") ?? "openai/gpt-4o-mini";
  private cookingMethodResolver = new CookingMethodResolverService();

  async parseDishDescription(description: string): Promise<LlmIngredient[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://cookscale.app",
          "X-Title": "CookScale",
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0,
          messages: [
            { role: "system", content: DISH_PARSE_SYSTEM_PROMPT },
            { role: "user", content: `<dish_description>\n${description}\n</dish_description>` },
          ],
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error("OpenRouter API error:", await response.text());
        throw new Error("ai_service_error");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        console.error("OpenRouter empty response");
        throw new Error("ai_service_error");
      }

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(content);
      } catch {
        console.error("OpenRouter invalid JSON:", content.substring(0, 100));
        throw new Error("ai_service_error");
      }

      const parsedDish = parseLlmDishResponse(parsedJson);

      if (!parsedDish) {
        console.error("OpenRouter schema validation failed: unable to parse dish response");
        throw new Error("ai_service_error");
      }

      const resolvedIngredients = this.cookingMethodResolver.resolve(parsedDish);

      return resolvedIngredients.map((item) => ({
        ...item,
        display_name: item.display_name ?? item.name_pl ?? item.name,
      }));
    } catch (error) {
      if (error instanceof Error && error.message === "ai_service_error") {
        throw error;
      }
      console.error("OpenRouter unexpected error:", error);
      throw new Error("ai_service_error");
    }
  }
}
