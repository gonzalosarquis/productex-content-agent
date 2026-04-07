"use client";

type Props = {
  show: boolean;
  multiline?: boolean;
};

export function SuggestFieldInnerSpinner({ show, multiline }: Props) {
  if (!show) return null;
  return (
    <span
      className={`pointer-events-none absolute right-3 z-10 h-4 w-4 animate-spin rounded-full border-2 border-[#7C3AED] border-t-transparent ${
        multiline ? "top-3" : "top-1/2 -translate-y-1/2"
      }`}
      aria-hidden
    />
  );
}
