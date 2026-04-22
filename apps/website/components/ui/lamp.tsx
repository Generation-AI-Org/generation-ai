"use client";
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Lamp Effect — Brand-rebranded for Generation AI.
 * Source: https://ui.aceternity.com/components/lamp-effect
 * Changes:
 *   - Import rewritten from "framer-motion" to "motion/react" (OQ-3).
 *   - cyan-400 / cyan-500 swapped for brand tokens via CSS custom properties
 *     (--neon-9 in dark, --red-9 in light; --brand-blue-5/60 blur dark,
 *     --brand-pink-5/60 blur light — theme switch via .light class).
 *   - slate-950 (bg) kept as is (neutral Raycast-vibe dark background).
 */
export default function LampDemo() {
  return (
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-8 bg-gradient-to-br from-text to-text-muted py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
      >
        Build lamps <br /> the right way
      </motion.h1>
    </LampContainer>
  );
}

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  // Mobile-Values werden per Motion animiert (initial/whileInView). Die
  // Original-Aceternity-Variante hatte nur feste `rem`-Werte — diese sprengten
  // 375px-Viewports und verursachten horizontales Scrolling + abgeschnittene
  // Lamp-Kegel. Breakpoint 640px matcht Tailwind `sm:`.
  const coneInitial = { opacity: 0.5, width: "8rem" };
  const coneAnimate = { opacity: 1, width: "min(26rem, 85vw)" };
  const lineInitial = { width: "12rem" };
  const lineAnimate = { width: "min(40rem, 90vw)" };
  const glowInitial = { width: "6rem" };
  const glowAnimate = { width: "min(14rem, 55vw)" };

  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg w-full rounded-md z-0",
        className
      )}
    >
      <div className="relative flex w-full flex-1 scale-y-110 sm:scale-y-125 items-center justify-center isolate z-0 ">
        <motion.div
          initial={coneInitial}
          whileInView={coneAnimate}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto right-1/2 h-36 sm:h-44 overflow-visible bg-gradient-conic from-brand-neon-9 via-transparent to-transparent text-text [--conic-position:from_70deg_at_center_top]"
        >
          <div className="absolute w-[100%] left-0 bg-bg h-32 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute w-40 h-[100%] left-0 bg-bg bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>
        <motion.div
          initial={coneInitial}
          whileInView={coneAnimate}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto left-1/2 h-36 sm:h-44 bg-gradient-conic from-transparent via-transparent to-brand-neon-9 text-text [--conic-position:from_290deg_at_center_top]"
        >
          <div className="absolute w-40 h-[100%] right-0 bg-bg bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute w-[100%] right-0 bg-bg h-32 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-bg blur-2xl"></div>
        <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md"></div>
        <div className="absolute inset-auto z-50 h-20 sm:h-28 w-[85vw] max-w-[24rem] -translate-y-1/2 rounded-full bg-brand-blue-5/60 opacity-40 blur-3xl"></div>
        <motion.div
          initial={glowInitial}
          whileInView={glowAnimate}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-30 h-20 sm:h-28 -translate-y-[4rem] sm:-translate-y-[5rem] rounded-full bg-brand-neon-8 opacity-70 blur-2xl"
        ></motion.div>
        <motion.div
          initial={lineInitial}
          whileInView={lineAnimate}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-50 h-0.5 -translate-y-[5.5rem] sm:-translate-y-[7rem] bg-brand-neon-8"
        ></motion.div>

        <div className="absolute inset-auto z-40 h-36 sm:h-44 w-full -translate-y-[10rem] sm:-translate-y-[12.5rem] bg-bg"></div>
      </div>

      <div className="relative z-50 flex -translate-y-40 sm:-translate-y-52 flex-col items-center px-5">
        {children}
      </div>
    </div>
  );
};
