import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RuntimeMonitoringBootstrap } from "@/components/RuntimeMonitoringBootstrap";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-ui",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono-ui",
});

export const metadata: Metadata = {
  title: "Financiële rekentools",
  description:
    "Eerlijke financiële rekentools voor meer grip, regie en inzicht in je keuzes.",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="nl">
      <body className={`${geist.variable} ${geistMono.variable}`}>
        <RuntimeMonitoringBootstrap />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--deep)] focus:px-4 focus:py-2 focus:text-white"
        >
          Ga direct naar de inhoud
        </a>
        {children}
      </body>
    </html>
  );
}
