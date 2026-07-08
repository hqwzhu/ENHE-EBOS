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
        <p className="mt-2 text-sm text-slate-600">这里只展示风险、原因和下一步建议，不提供数据库迁移、种子数据、部署或真实回填按钮。</p>
      </section>
      <div className="grid grid-cols-2 gap-4">
        {risks.map((risk) => (
          <RiskCard key={risk.title} risk={risk} />
        ))}
      </div>
      <section className="rounded-md border border-line bg-white p-5">
        <h3 className="font-semibold text-ink">下一步建议</h3>
        <p className="mt-2 text-sm text-slate-600">优先完成数据库只读核对和真实外部数据采集；依赖、数据库、种子数据、后台、接口、核心业务必须单独审计。</p>
      </section>
    </div>
  );
}
