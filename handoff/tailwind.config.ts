// tailwind.config.ts — fragment om in je eigen tailwind config op te nemen.
// Merge `theme.extend.colors` en `theme.extend.fontFamily` met je bestaande config.

import type { Config } from "tailwindcss";

const config: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        paper:   "#F5F1EA",
        "paper-soft": "#EFEAE0",
        ink:     "#14181F",
        "ink-2": "#2A2F3A",
        muted:   "#6E7180",
        soft:    "#A6A8B2",
        hair:    "#E6E1D5",
        deep:    "#0F141C",
        // Accent paletten als CSS-variabelen (zie tokens.css) — gebruik via
        // bg-[var(--accent)] / text-[oklch(...)] in JSX wanneer je tinten nodig hebt.
      },
      fontFamily: {
        sans:  ['Geist', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono:  ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
};

export default config;
