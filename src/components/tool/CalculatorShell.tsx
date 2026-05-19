import type { ReactNode } from "react";

type CalculatorShellProps = {
  children: ReactNode;
};

export function CalculatorShell({ children }: CalculatorShellProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      {children}
    </div>
  );
}
