import { Flame } from "lucide-react";

export default function BrandMark({ size = 22 }) {
  return (
    <span className="brand-mark" style={{ "--brand-mark-size": `${size}px` }}>
      <Flame className="brand-mark-flame" strokeWidth={2} fill="var(--accent)" />
      <svg className="brand-mark-dome" viewBox="0 0 24 15" fill="none">
        <path d="M4 11c0-5 3.6-9 8-9s8 4 8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="2" y="11" width="20" height="2.5" rx="1.25" fill="currentColor" />
      </svg>
    </span>
  );
}
