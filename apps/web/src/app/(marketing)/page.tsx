import { JudgeDemoSection } from "@/components/marketing/JudgeDemoSection";
import { LandingFinalCta } from "@/components/marketing/LandingFinalCta";
import { LandingHero } from "@/components/marketing/LandingHero";
import { ProductFlow } from "@/components/marketing/ProductFlow";
import { WhatAegisStops } from "@/components/marketing/WhatAegisStops";

export default function LandingPage() {
  return (
    <>
      <LandingHero />
      <ProductFlow />
      <WhatAegisStops />
      <JudgeDemoSection />
      <LandingFinalCta />
    </>
  );
}
