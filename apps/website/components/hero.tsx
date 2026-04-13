'use client'

import { SignalGrid } from "@/components/ui/signal-grid";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 text-center overflow-hidden">
      {/* Signal Grid - connections propagate outward */}
      <div className="absolute inset-0 bg-bg">
        <SignalGrid
          gridSpacing={30}
          dotSize={1.5}
          dotOpacity={0.35}
        />
        {/* Fade overlay - less visible in center where text is */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 45%, var(--bg) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <span className="text-sm text-accent font-medium">Kostenlos für alle Studierenden</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-text mb-6 tracking-tight">
          Die KI-Community
          <span className="block mt-2 text-accent drop-shadow-[0_0_30px_var(--accent-glow)]">
            für Studierende
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          Lerne, vernetze dich und werde Teil der ersten kostenlosen KI-Community im DACH-Raum.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="#signup"
            className="group relative px-8 py-4 bg-accent text-text-on-accent rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_var(--accent-glow)]"
          >
            <span className="relative z-10">Kostenlos beitreten</span>
          </a>
          <a
            href="#features"
            className="px-8 py-4 border border-border text-text rounded-full font-medium text-lg transition-all duration-300 hover:bg-bg-elevated hover:border-text-muted"
          >
            Mehr erfahren
          </a>
        </div>

        {/* Social Proof */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full bg-bg-elevated border-2 border-bg flex items-center justify-center text-text-muted text-xs font-medium"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
            <div className="w-10 h-10 rounded-full bg-accent/20 border-2 border-bg flex items-center justify-center text-accent text-xs font-bold">
              +99
            </div>
          </div>
          <p className="text-text-muted text-sm">
            Bereits <span className="text-text font-medium">100+</span> Studierende dabei
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
