type ToolHandoffNoticeProps = {
  sourceTitle: string;
  fieldLabels: string[];
};

export function ToolHandoffNotice({
  sourceTitle,
  fieldLabels,
}: ToolHandoffNoticeProps) {
  return (
    <div
      role="status"
      className="surface-subtle px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]"
    >
      Overgenomen uit {sourceTitle}: {fieldLabels.join(", ")}. Deze waarden
      hebben voor deze berekening voorrang op eventuele waarden uit je profiel.
      Controleer ze voordat je berekent.
    </div>
  );
}
