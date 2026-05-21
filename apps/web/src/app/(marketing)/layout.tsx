import { LandingFooter } from "@/components/marketing/LandingFooter";
import { LandingNav } from "@/components/marketing/LandingNav";
import { ParticleCanvas } from "@/components/marketing/ParticleCanvas";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <ParticleCanvas />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-[20%] left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-[100%] bg-aegis/10 opacity-20 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[10%] left-[20%] h-[400px] w-[400px] rounded-full bg-aegis/5 opacity-10 blur-[90px] mix-blend-screen" />
      </div>
      <div className="landing-grid-bg pointer-events-none fixed inset-0 -z-20" />
      <LandingNav />
      <div className="min-h-0 flex-1">{children}</div>
      <LandingFooter />
    </div>
  );
}
