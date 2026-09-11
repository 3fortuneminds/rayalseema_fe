import { Star } from "lucide-react";
import { useState } from "react";

export default function StarRating({ value, onChange, size = 18 }) {
  const [hover, setHover] = useState(0);
  const interactive = Boolean(onChange);
  const display = hover || value;

  return (
    <div className={`star-rating${interactive ? " interactive" : ""}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={n <= display ? "currentColor" : "none"}
          className={n <= display ? "filled" : ""}
          onClick={interactive ? () => onChange(n) : undefined}
          onMouseEnter={interactive ? () => setHover(n) : undefined}
          onMouseLeave={interactive ? () => setHover(0) : undefined}
        />
      ))}
    </div>
  );
}
