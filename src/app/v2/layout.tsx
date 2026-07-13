import "@/styles/v2-organisch.css";
import type { ReactNode } from "react";
import { V2Header } from "@/components/v2/V2Header";
import { V2Footer } from "@/components/v2/V2Footer";

export const metadata = {
  title: "Project Site v2 (New Design)",
  description: "Nieuwe designversie van de Project Site",
};

export default function V2Layout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="v2-root min-h-screen flex flex-col">
      <V2Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <V2Footer />
    </div>
  );
}
