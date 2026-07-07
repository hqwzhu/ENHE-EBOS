import { CheckCircle2, CircleAlert, CircleHelp, XCircle } from "lucide-react";
import { cx } from "../lib/format";

type StatusCardProps = {
  label: string;
  value: string;
  tone?: "good" | "warn" | "danger" | "neutral";
  hint?: string;
};

const toneClasses = {
  good: "border-teal-200 bg-teal-50 text-teal-900",
  warn: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-red-200 bg-red-50 text-red-900",
  neutral: "border-line bg-white text-ink",
};

const toneIcons = {
  good: CheckCircle2,
  warn: CircleAlert,
  danger: XCircle,
  neutral: CircleHelp,
};

export default function StatusCard({ label, value, tone = "neutral", hint }: StatusCardProps) {
  const Icon = toneIcons[tone];
  return (
    <article className={cx("rounded-md border p-4 shadow-sm", toneClasses[tone])}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium opacity-80">{label}</p>
        <Icon className="h-5 w-5 shrink-0" />
      </div>
      <p className="mt-3 text-xl font-semibold">{value}</p>
      {hint ? <p className="mt-2 text-sm leading-5 opacity-75">{hint}</p> : null}
    </article>
  );
}
