import { HeroSection } from "./homepage/components/hero-section";
import { SolutionsSection } from "./homepage/components/solutions-section";
import { AiPoweredSection } from "./homepage/components/ai-powered-section";
import { CtaSection } from "./homepage/components/cta-section";

export const HomePage = () => {
  return (
    <main className="flex-1 w-full overflow-x-hidden">
      <HeroSection />
      <SolutionsSection />
      <AiPoweredSection />
      <CtaSection />
    </main>
  );
};
