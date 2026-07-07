import { useEffect, useState } from "react";
import RiskCard from "../components/RiskCard";
import SafetyBanner from "../components/SafetyBanner";
import { operatorApi } from "../lib/api";
import type { OperatorSettings, RiskSummary } from "../lib/types";

type RiskCenterProps = {
  settings: OperatorSettings;
};

export default function RiskCenter({ settings }: RiskCenterProps) {
  const [risks, setRisks] = useState<RiskSummary[]>([]);

  useEffect(() => {
    operatorApi.getRisks(settings.ebosProjectPath).then(setRisks);
  }, [settings.ebosProjectPath]);

  return (
    <div className="space-y-5">
      <SafetyBanner />
      <section className="rounded-md border border-line bg-white p-5">
        <h3 className="text-lg font-semibold text-ink">风险中心</h3>
        <p className="mt-2 text-sm text-slate-600">这里只展示风险与下一步，不提供 migration、seed、deploy、backfill apply 等危险按钮。</p>
      </section>
      <div className="grid grid-cols-2 gap-4">
        {risks.map((risk) => (
          <RiskCard key={risk.title} risk={risk} />
        ))}
      </div>
      <section className="rounded-md border border-line bg-white p-5">
        <h3 className="font-semibold text-ink">下一步建议</h3>
        <p className="mt-2 text-sm text-slate-600">优先完成 production/staging 只读核对和真实外部数据采集；package、Prisma、seed、admin/API/core 必须单独审计。</p>
      </section>
    </div>
  );
}
