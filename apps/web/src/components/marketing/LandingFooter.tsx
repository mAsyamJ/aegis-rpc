import Link from "next/link";
import { Shield } from "lucide-react";

import { landingCopy } from "@/content/landing-copy";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/80 bg-background py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 md:grid-cols-5">
        <div className="col-span-2">
          <div className="mb-4 flex items-center gap-2 font-medium">
            <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-gradient-to-tr from-aegis to-aegis-glow">
              <Shield className="h-2.5 w-2.5 text-aegis-foreground" />
            </div>
            Aegis RPC
          </div>
          <p className="max-w-xs text-xs text-muted-foreground">
            {landingCopy.footer.tagline}
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-semibold text-foreground">Product</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {landingCopy.footer.product.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-semibold text-foreground">Resources</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {landingCopy.footer.resources.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-7xl px-6 text-[10px] text-muted-foreground">
        © {year} Aegis RPC
      </p>
    </footer>
  );
}
