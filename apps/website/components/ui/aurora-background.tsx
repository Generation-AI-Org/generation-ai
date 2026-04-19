"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

/**
 * Aurora Background — Brand-rebranded for Generation AI.
 *
 * Source: https://ui.aceternity.com/components/aurora-background
 * Changes vs. upstream:
 *   - Color palette rewritten from blue-400/indigo-300/violet-200 to
 *     brand-blue / brand-neon for dark default (90% Raycast-vibe)
 *     and brand-pink / brand-red for light mode.
 *   - Uses CSS custom properties from packages/config/tailwind/base.css
 *     (--brand-neon-*, --brand-blue-*, --brand-pink-*, --brand-red-*)
 *     so the component follows theme switches via .light class on <html>.
 */
export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "transition-bg relative flex h-[100vh] flex-col items-center justify-center bg-bg text-text",
          className,
        )}
        {...props}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={
            {
              // Brand-rebranded Aurora gradient
              // Dark mode: brand-blue + brand-neon swirl
              // Light mode: brand-pink + brand-red swirl (mapped via :is(.light …) CSS vars below)
              "--aurora":
                "repeating-linear-gradient(100deg,var(--brand-aurora-1)_10%,var(--brand-aurora-2)_15%,var(--brand-aurora-3)_20%,var(--brand-aurora-4)_25%,var(--brand-aurora-5)_30%)",
              "--dark-gradient":
                "repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)",
              "--white-gradient":
                "repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)",
              "--black": "#000",
              "--white": "#fff",
              "--transparent": "transparent",
            } as React.CSSProperties
          }
        >
          <div
            // Aurora layer — uses brand-rebranded CSS vars defined in globals.css
            // (theme-aware: dark default + .light override)
            className={cn(
              `after:animate-aurora pointer-events-none absolute -inset-[10px] [background-image:var(--white-gradient),var(--aurora)] [background-size:300%,_200%] [background-position:50%_50%,50%_50%] opacity-50 blur-[10px] invert filter will-change-transform after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_100%] after:[background-attachment:fixed] after:mix-blend-difference after:content-[""] dark:[background-image:var(--dark-gradient),var(--aurora)] dark:invert-0 after:dark:[background-image:var(--dark-gradient),var(--aurora)]`,

              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`,
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};
