import { useState } from "react";
import DataForm from "../components/DataForm";
import SafetyBanner from "../components/SafetyBanner";
import { operatorApi } from "../lib/api";
import type { ExternalDataPayload, OperatorSettings } from "../lib/types";

type ExternalDataProps = {
  settings: OperatorSettings;
};

export default function ExternalData({ settings }: ExternalDataProps) {
  const [savedPath, setSavedPath] = useState("");
  const [error, setError] = useState("");

  async function handleSave(payload: ExternalDataPayload) {
    setError("");
    setSavedPath("");
    try {
      const result = await operatorApi.saveExternalData(settings.ebosProjectPath, payload);
      setSavedPath(`${result.path} (${result.entries} 条记录)`);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <div className="space-y-5">
      <SafetyBanner />
      <section className="rounded-md border border-line bg-white p-5">
        <h3 className="text-lg font-semibold text-ink">外部真实数据录入</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          保存路径固定为原 EBOS 项目的 `reports/ebos/external-publishing/inputs/operator-user-real-data-input.json`。保存前会校验 schema，不会覆盖原始输入文件。
        </p>
      </section>
      {savedPath ? <div className="rounded-md border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">已保存：{savedPath}</div> : null}
      {error ? <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</div> : null}
      <DataForm onSave={handleSave} />
      <section className="rounded-md border border-line bg-white p-5">
        <h3 className="font-semibold text-ink">下一步建议</h3>
        <p className="mt-2 text-sm text-slate-600">保存真实数据后，到命令运行页执行“检查外部发布结果”，再执行 backfill dry-run。不要请求 backfill apply，除非 EBOS 判断 canBackfill=true 且你明确批准。</p>
      </section>
    </div>
  );
}
