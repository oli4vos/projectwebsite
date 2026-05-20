import type { ReactNode } from "react";

type CalculatorShellProps = {
  children?: ReactNode;
  intro?: ReactNode;
  startActions?: ReactNode;
  inputs?: ReactNode;
  submitAction?: ReactNode;
  result?: ReactNode;
  details?: ReactNode;
  disclaimer?: ReactNode;
};

export function CalculatorShell({
  children,
  intro,
  startActions,
  inputs,
  submitAction,
  result,
  details,
  disclaimer,
}: CalculatorShellProps) {
  if (children) {
    return (
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] [&>*]:min-w-0">
        {children}
      </div>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] [&>*]:min-w-0">
      <section className="order-2 min-w-0 rounded-[1.5rem] border hair bg-white p-6 shadow-paper lg:order-1">
        {intro}
        {startActions ? <div className="mt-4">{startActions}</div> : null}
        {inputs ? <div className="mt-6">{inputs}</div> : null}
        {submitAction ? <div className="mt-4">{submitAction}</div> : null}
      </section>
      <section className="order-1 min-w-0 space-y-5 lg:order-2">
        {result}
        {details}
        {disclaimer}
      </section>
    </div>
  );
}
