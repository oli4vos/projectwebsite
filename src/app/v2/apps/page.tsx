import { appRegistry } from "@/lib/app-registry";
import { V2AppDashboard } from "@/components/v2/V2AppDashboard";

export const metadata = {
  title: "Alle tools | GRIP v2",
  description: "Alle financiële tools voor studenten met een studieschuld",
};

export default function V2AppsPage() {
  return (
    <div className="v2-section">
      <V2AppDashboard apps={appRegistry} />
    </div>
  );
}
