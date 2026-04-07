"use client";

type Props = {
  loading: boolean;
  onClick: () => void;
  "aria-label"?: string;
};

export function SuggestSparkleButton({
  loading,
  onClick,
  "aria-label": ariaLabel = "Sugerir con IA",
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      aria-label={ariaLabel}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-[#7C3AED] transition hover:border-[#7C3AED] hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-100"
    >
      {loading ? (
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#7C3AED] border-t-transparent"
          aria-hidden
        />
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"
            fill="currentColor"
          />
          <path
            d="M19 12L19.5 14.5L22 15L19.5 15.5L19 18L18.5 15.5L16 15L18.5 14.5L19 12Z"
            fill="currentColor"
          />
          <path
            d="M5 12L5.5 14.5L8 15L5.5 15.5L5 18L4.5 15.5L2 15L4.5 14.5L5 12Z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}
