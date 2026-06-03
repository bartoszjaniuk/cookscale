import { roundCalculateDishResponse, roundMatchedIngredient } from "../lib/round-macros.ts";
import type { CalculateDishCommand, CalculateDishResponse, DishWarning, MatchedIngredient } from "../types.ts";
import { AuthorizationService } from "./authorization.service.ts";
import { RateLimitService } from "./rate-limit.service.ts";
import { OpenRouterClient } from "./openrouter.client.ts";
import { ProductMatcherService } from "./product-matcher.service.ts";
import { MacroCalculatorService } from "./macro-calculator.service.ts";
import { CalculationRepository } from "../repositories/calculation.repository.ts";

export class CalculateDishService {
  private authService = new AuthorizationService();
  private rateLimitService = new RateLimitService();
  private openRouterClient = new OpenRouterClient();
  private productMatcherService = new ProductMatcherService();
  private macroCalculatorService = new MacroCalculatorService();
  private calculationRepository = new CalculationRepository();

  async process(command: CalculateDishCommand, authHeader: string | null): Promise<CalculateDishResponse> {
    const { description, ipHash, language } = command;

    // 1. Auth context
    const authContext = await this.authService.getAuthContext(authHeader, language);
    const locale = authContext.preferredLanguage;

    // 2. Lazy cleanup
    await this.rateLimitService.cleanupOldLogs();

    // 3. Rate limit check (24h)
    const rateLimit = await this.rateLimitService.checkRateLimit(ipHash);
    if (!rateLimit.allowed) {
      const error: any = new Error("rate_limit_exceeded");
      error.reset_at = rateLimit.resetAt;
      throw error;
    }

    // 4. Authorization gate
    await this.authService.checkAccess(authContext, ipHash);

    // 5. LLM Call
    const llmIngredients = await this.openRouterClient.parseDishDescription(description);

    // 6. Match products and calculate macros
    const items: MatchedIngredient[] = [];
    const warnings: DishWarning[] = [];

    for (const ingredient of llmIngredients) {
      const matchResult = await this.productMatcherService.matchIngredient(ingredient, locale);
      
      if (matchResult.match) {
        items.push(roundMatchedIngredient(matchResult.match));
      }
      if (matchResult.warning) {
        warnings.push(matchResult.warning);
      }
    }

    // 7. Aggregate totals
    const { total_weight_g, total, per_100g } = this.macroCalculatorService.aggregate(items);

    let response = roundCalculateDishResponse({
      calculation_id: null,
      total_weight_g,
      total,
      per_100g,
      items,
      warnings: warnings.length > 0 ? warnings : null,
    });

    if (authContext.userId) {
      // 8. Update trial_ai_used_at if first free trial
      if (!authContext.isPremium && authContext.trialAiUsedAt === null) {
        await this.calculationRepository.markTrialUsed(authContext.userId);
      }
    }

    // 9. Log AI usage success
    await this.calculationRepository.logAiUsage(ipHash, authContext.userId, true);

    return response;
  }
}
