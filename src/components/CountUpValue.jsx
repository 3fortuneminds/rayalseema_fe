import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

export default function CountUpValue({ value, prefix = "", decimals = 0 }) {
  const reduceMotion = useReducedMotion();
  const numericValue = Number(value) || 0;
  const spring = useSpring(0, { stiffness: 90, damping: 20, mass: 0.6 });
  const display = useTransform(spring, (v) =>
    `${prefix}${v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`,
  );

  useEffect(() => {
    spring.set(numericValue);
  }, [numericValue, spring]);

  if (reduceMotion) {
    return (
      <span>
        {prefix}
        {numericValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      </span>
    );
  }

  return <motion.span>{display}</motion.span>;
}
