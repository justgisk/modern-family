import { CSSProperties, useState } from "react";

type Props = {
  src: string;
  label: string; // shown on the placeholder so you know what to make
  tint?: string;
  className?: string;
  style?: CSSProperties; // positioning for the real image
  phStyle?: CSSProperties; // positioning for the placeholder (defaults to `style`)
  fit?: "cover" | "contain";
};

// Renders the real image if the file exists, otherwise a labeled placeholder.
export function Art({ src, label, tint = "#d9c9ab", className = "", style, phStyle, fit = "cover" }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`ph ${className}`}
        style={{ ...(phStyle ?? style), ["--tint" as any]: tint }}
        aria-label={label}
      >
        <span>{label}</span>
      </div>
    );
  }
  return (
    <img
      className={className}
      src={src}
      alt=""
      draggable={false}
      decoding="async"
      style={{ ...style, objectFit: fit }}
      onError={() => {
        console.warn(`[Art] missing asset: ${src}`);
        setFailed(true);
      }}
    />
  );
}
