import { AlertTriangle, ShieldCheck } from "lucide-react";
import type { RiskSummary } from "../lib/types";
import { cx, formatBoolean } from "../lib/format";
import { summarizeRiskText, translateRiskLevel, translateStatus } from "../lib/display";

type RiskCardProps = {
  risk: RiskSummary;
};

const tone = {
  low: "border-teal-200 bg-teal-50",
  medium: "border-amber-200 bg-amber-50",
  high: "border-orange-200 bg-orange-50",
  critical: "border-red-200 bg-red-50",
};

export default function RiskCard({ risk }: RiskCardProps) {
  const critical = risk.riskLevel === "critical" || risk.riskLevel === "high";
  return (
    <article className={cx("rounded-md border p-4", tone[risk.riskLevel])}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-ink">{summarizeRiskText(risk.title)}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">{summarizeRiskText(risk.reason)}</p>
        </div>
        {critical ? <AlertTriangle className="h-5 w-5 text-red-700" /> : <ShieldCheck className="h-5 w-5 text-teal-700" />}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <Badge label="风险等级" value={translateRiskLevel(risk.riskLevel)} />
        <Badge label="状态" value={translateStatus(risk.status)} />
        <Badge label="现在可运行" value={formatBoolean(risk.canRunNow)} />
        <Badge label="现在可提交" value={formatBoolean(risk.canCommitNow)} />
        <Badge label="需要用户确认" value={formatBoolean(risk.requiresUserConfirmation)} />
      </div>
      <div className="mt-4 rounded-md bg-white/70 p-3 text-sm text-slate-800">
        <span className="font-semibold">下一步：</span>
        {summarizeRiskText(risk.nextAction)}
      </div>
    </article>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white/70 px-3 py-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="mt-1 font-semibold text-slate-800">{value}</div>
    </div>
  );
}
