"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook that animates a number from 0 to target with ease-out curve.
 * @param target - The target number to count up to
 * @param duration - Animation duration in ms (default 800)
 * @returns The current animated integer value
 */
export function useCountUp(target: number, duration = 800): number {
  const [current, setCurrent] = useState(0);
  const prevTargetRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const animate = useCallback(
    (startTime: number) => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      setCurrent(value);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(() => animate(startTime));
      }
    },
    [target, duration]
  );

  useEffect(() => {
    // Only animate when target actually changes
    if (prevTargetRef.current === target) return;
    prevTargetRef.current = target;

    if (target === 0) {
      setCurrent(0);
      return;
    }

    const startTime = Date.now();
    rafRef.current = requestAnimationFrame(() => animate(startTime));

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [target, animate]);

  return current;
}

// ── Formatting helpers ─────────────────────────────────────────────

function formatAsCurrency(value: number): string {
  return (value / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatAsPercentage(value: number): string {
  return value.toFixed(1);
}

function formatAsNumber(value: number): string {
  return value.toLocaleString("en-US");
}

// ── AnimatedNumber Component ───────────────────────────────────────

export type AnimatedNumberProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
  format?: "currency" | "percentage" | "number";
};

export function AnimatedNumber({
  value,
  prefix,
  suffix,
  className,
  style,
  format = "number",
}: AnimatedNumberProps) {
  const animated = useCountUp(value);

  let display: string;
  let defaultPrefix = prefix ?? "";
  let defaultSuffix = suffix ?? "";

  switch (format) {
    case "currency":
      display = formatAsCurrency(animated);
      if (!prefix) defaultPrefix = "$";
      break;
    case "percentage":
      display = formatAsPercentage(animated);
      if (!suffix) defaultSuffix = "%";
      break;
    case "number":
    default:
      display = formatAsNumber(animated);
      break;
  }

  return (
    <span className={className} style={style}>
      {defaultPrefix}
      {display}
      {defaultSuffix}
    </span>
  );
}
