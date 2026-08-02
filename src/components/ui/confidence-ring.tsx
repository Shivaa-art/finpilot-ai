import { cn } from "@/lib/utils";

interface ConfidenceRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
}

/**
 * The confidence score is FinPilot's core trust signal, so it gets its own
 * dedicated visual rather than being buried as a number in a table.
 */
export function ConfidenceRing({
  value,
  size = 88,
  strokeWidth = 8,
  className,
}: ConfidenceRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const tone =
    value >= 80 ? "var(--color-success)" : value >= 60 ? "var(--color-primary)" : "var(--color-warning)";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold text-dark leading-none">{value}%</span>
        <span className="text-[10px] uppercase tracking-wide text-muted mt-0.5">confidence</span>
      </div>
    </div>
  );
}
