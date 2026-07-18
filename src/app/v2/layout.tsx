import type { ReactNode } from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Space_Grotesk, Source_Serif_4 } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--v2-font-body",
});

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  variable: "--v2-font-display",
});

const v2TokensCss = readFileSync(join(process.cwd(), "src/styles/v2/v2-tokens.css"), "utf8");
const v2ComponentsCss = readFileSync(
  join(process.cwd(), "src/styles/v2/v2-components.css"),
  "utf8",
);

type V2LayoutProps = {
  children: ReactNode;
};

export default function V2Layout({ children }: V2LayoutProps) {
  return (
    <div className={`${spaceGrotesk.variable} ${sourceSerif4.variable} v2-root min-h-dvh`}>
      <style dangerouslySetInnerHTML={{ __html: `${v2TokensCss}\n${v2ComponentsCss}` }} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--v2-ink)] focus:px-4 focus:py-2 focus:text-[var(--v2-paper)]"
      >
        Ga direct naar de inhoud
      </a>
      {children}
    </div>
  );
}
