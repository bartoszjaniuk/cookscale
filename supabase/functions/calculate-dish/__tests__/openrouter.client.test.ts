import { assertEquals } from "jsr:@std/assert";
import { OpenRouterClient } from "../services/openrouter.client.ts";

Deno.test("OpenRouterClient - parses dish description correctly and formats request", async () => {
  const originalFetch = globalThis.fetch;
  let fetchCallCount = 0;
  let requestBody: any;

  globalThis.fetch = async (input, init) => {
    fetchCallCount++;
    const initAny = init as any;
    if (initAny && initAny.body) {
      requestBody = JSON.parse(initAny.body as string);
    }
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                dish_context: {
                  default_cooking_method: "baking",
                },
                ingredients: [
                  {
                    name: "potato",
                    weight_g: 100,
                  },
                  {
                    name: "chicken",
                    cooking_method: "pan-fried",
                    weight_g: 200,
                  },
                ],
              }),
            },
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  };

  try {
    const client = new OpenRouterClient();
    const result = await client.parseDishDescription("dummy description");

    assertEquals(fetchCallCount, 1);
    assertEquals(requestBody.temperature, 0);
    assertEquals(requestBody.messages[1].content, "<dish_description>\ndummy description\n</dish_description>");

    assertEquals(result.length, 2);
    assertEquals(result[0].name, "potato");
    assertEquals(result[0].cooking_method, "baking"); // from context
    assertEquals(result[1].name, "chicken");
    assertEquals(result[1].cooking_method, "frying"); // override and normalize
  } finally {
    globalThis.fetch = originalFetch;
  }
});
