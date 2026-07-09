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
        <p className="mt-2 text-sm leading-6 text-slate-600">
          这里把技术风险翻译成运营语言。你只需要看“为什么有风险”和“下一步怎么做”，不需要理解数据库、接口或迁移细节。
        </p>
      </section>
      <section className="rounded-md border border-teal-200 bg-teal-50 p-5 text-teal-950">
        <h3 className="font-semibold">推荐处理顺序</h3>
        <ol className="mt-3 grid grid-cols-1 gap-2 text-sm leading-6">
          <li>1. 先补真实外部渠道数据，解决“等待真实数据”的提示。</li>
          <li>2. 只读核对生产和预发结构，不在本应用里运行迁移。</li>
          <li>3. 依赖、数据库、种子数据、后台和接口改动保持隔离，后续单独审计。</li>
        </ol>
      </section>
      <div className="grid grid-cols-2 gap-4">
        {risks.map((risk) => (
          <RiskCard key={risk.title} risk={risk} />
        ))}
        {risks.length === 0 ? (
          <div className="col-span-2 rounded-md border border-dashed border-line bg-white p-5 text-sm text-slate-500">
            当前没有读取到风险项。请先确认设置页项目路径正确。
          </div>
        ) : null}
      </div>
      <section className="rounded-md border border-line bg-white p-5">
        <h3 className="font-semibold text-ink">下一步建议</h3>
        <p className="mt-2 text-sm text-slate-600">新手不要处理高风险代码和数据库项。先完成真实数据采集，再把需要人工审计的项交给开发人员。</p>
      </section>
    </div>
  );
}
