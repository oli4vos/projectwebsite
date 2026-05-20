import { ToolDisclosure } from "@/components/ToolDisclosure";

type DisclosureSectionProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export function DisclosureSection({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: DisclosureSectionProps) {
  return (
    <ToolDisclosure title={title} subtitle={subtitle} defaultOpen={defaultOpen}>
      <div className="space-y-3">{children}</div>
    </ToolDisclosure>
  );
}
