import { assertEquals } from "jsr:@std/assert";
import { normalizeCookingMethodSlug } from "../lib/normalize-cooking-method.ts";

Deno.test("normalizeCookingMethodSlug", () => {
  // Valid ones
  assertEquals(normalizeCookingMethodSlug("boiling"), "boiling");
  assertEquals(normalizeCookingMethodSlug("frying"), "frying");
  assertEquals(normalizeCookingMethodSlug("baking"), "baking");

  // Synonyms
  assertEquals(normalizeCookingMethodSlug("steamed"), "boiling");
  assertEquals(normalizeCookingMethodSlug("simmered"), "boiling");
  assertEquals(normalizeCookingMethodSlug("poached"), "boiling");
  assertEquals(normalizeCookingMethodSlug("cooking"), "boiling");
  assertEquals(normalizeCookingMethodSlug("cooked"), "boiling");

  assertEquals(normalizeCookingMethodSlug("raw"), "none");
  assertEquals(normalizeCookingMethodSlug("surowy"), "none");
  assertEquals(normalizeCookingMethodSlug("bez obróbki"), "none");
  assertEquals(normalizeCookingMethodSlug("none"), "none");

  assertEquals(normalizeCookingMethodSlug("generic"), "boiling");

  assertEquals(normalizeCookingMethodSlug("fried"), "frying");
  assertEquals(normalizeCookingMethodSlug("sauteed"), "frying");
  assertEquals(normalizeCookingMethodSlug("pan-fried"), "frying");
  assertEquals(normalizeCookingMethodSlug("pan-frying"), "frying");

  assertEquals(normalizeCookingMethodSlug("roasted"), "baking");
  assertEquals(normalizeCookingMethodSlug("grilled"), "baking");
  assertEquals(normalizeCookingMethodSlug("baked"), "baking");
  assertEquals(normalizeCookingMethodSlug("roasting"), "baking");
  assertEquals(normalizeCookingMethodSlug("grilling"), "baking");

  // Fallback
  assertEquals(normalizeCookingMethodSlug("unknown"), "boiling");
  assertEquals(normalizeCookingMethodSlug(""), "boiling");
  assertEquals(normalizeCookingMethodSlug(null), "boiling");
  assertEquals(normalizeCookingMethodSlug(undefined), "boiling");
});
