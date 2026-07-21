type FieldErrorProps = {
  id?: string;
  message?: string;
};

export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className="rounded-md bg-[var(--neg-soft)] px-2.5 py-1.5 text-[13px] font-medium leading-snug text-[oklch(35%_0.13_28)]"
    >
      {message}
    </p>
  );
}
