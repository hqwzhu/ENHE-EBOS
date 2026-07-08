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
      setSavedPath(`${result.path}，共 ${result.entries} 条记录`);
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
          保存路径固定为原项目的外部发布输入文件。保存前会校验数据格式，不会伪造发布链接，不会自动生成浏览量、咨询数或订单数。
        </p>
      </section>
      {savedPath ? <div className="rounded-md border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">已保存：{savedPath}</div> : null}
      {error ? <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</div> : null}
      <DataForm onSave={handleSave} />
      <section className="rounded-md border border-line bg-white p-5">
        <h3 className="font-semibold text-ink">下一步建议</h3>
        <p className="mt-2 text-sm text-slate-600">
          保存真实数据后，到命令运行页执行“检查外部发布结果”，再执行“数据回填演练”。除非系统判断允许且你明确批准，否则不要执行真实回填。
        </p>
      </section>
    </div>
  );
}
