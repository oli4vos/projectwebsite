import type { Metadata } from "next";
import { V2Dashboard } from "@/components/v2/V2Dashboard";
import { V2Footer } from "@/components/v2/V2Footer";
import { V2Header } from "@/components/v2/V2Header";
import { appRegistry } from "@/lib/app-registry";

export const metadata: Metadata = {
  title: "Tools | GRIP v2",
  description: "Overzicht van alle publieke tools in de GRIP v2-stijl.",
};

export default function V2AppsPage() {
  return (
    <>
      <V2Header />
      <V2Dashboard apps={appRegistry} />
      <V2Footer />
    </>
  );
}
