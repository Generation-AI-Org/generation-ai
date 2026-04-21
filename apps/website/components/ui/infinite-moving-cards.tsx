"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

/**
 * Infinite Moving Cards — Brand-rebranded for Generation AI.
 * Source: https://ui.aceternity.com/components/infinite-moving-cards
 * Changes: zinc/neutral/gray swapped for brand tokens
 *   (bg-bg-card, border-border, text-text, text-text-muted).
 * Animation driven by @keyframes scroll defined in apps/website/app/globals.css.
 */
export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    quote: string;
    name: string;
    title: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const scroller = scrollerRef.current;
    if (!container || !scroller) return;

    // Duplicate items for the infinite-scroll illusion. Track clones so
    // StrictMode double-mount (React 19 dev) cleans up instead of stacking.
    // Clones get aria-hidden="true" so screenreaders don't re-announce.
    const originals = Array.from(scroller.children);
    const clones = originals.map((item) => {
      const clone = item.cloneNode(true) as HTMLElement;
      clone.setAttribute("aria-hidden", "true");
      scroller.appendChild(clone);
      return clone;
    });

    container.style.setProperty(
      "--animation-direction",
      direction === "left" ? "forwards" : "reverse",
    );
    const duration =
      speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s";
    container.style.setProperty("--scroll-duration", duration);

    setStart(true);

    return () => {
      clones.forEach((c) => c.remove());
      setStart(false);
    };
  }, [direction, speed, items]);
  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className,
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {items.map((item) => (
          <li
            className="relative w-[350px] max-w-full shrink-0 rounded-2xl border border-border bg-bg-card px-8 py-6 md:w-[450px]"
            key={item.name}
          >
            <blockquote>
              <div
                aria-hidden="true"
                className="user-select-none pointer-events-none absolute -top-0.5 -left-0.5 -z-1 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
              ></div>
              <span className="relative z-20 text-sm leading-[1.6] font-normal text-text">
                {item.quote}
              </span>
              <div className="relative z-20 mt-6 flex flex-row items-center">
                <span className="flex flex-col gap-1">
                  <span className="text-sm leading-[1.6] font-normal text-text-muted">
                    {item.name}
                  </span>
                  <span className="text-sm leading-[1.6] font-normal text-text-muted">
                    {item.title}
                  </span>
                </span>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};
