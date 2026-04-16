interface ImagePlaceholderProps {
  label?: string;
  aspectRatio?: string;
  className?: string;
}

export default function ImagePlaceholder({
  label = "ここに画像",
  aspectRatio = "4/3",
  className = "",
}: ImagePlaceholderProps) {
  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#B8CDE0] bg-[#EEF2F7] text-[#94A3B8] select-none ${className}`}
      style={{ aspectRatio }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
      </svg>
      {label ? <span className="text-center text-sm font-medium">{label}</span> : null}
    </div>
  );
}
