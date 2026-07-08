import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import SafetyBanner from "../components/SafetyBanner";
import { operatorApi } from "../lib/api";
import { defaultTargetDate, type OperatorSettings, type SchemaCheckResult, type SchemaKit } from "../lib/types";

type SchemaCheckProps = {
  settings: OperatorSettings;
};

const initialResult: SchemaCheckResult = {
  targetDate: defaultTargetDate,
  productionAlreadyApplied: false,
  productionPartiallyApplied: false,
  productionMissing: false,
  stagingAlreadyApplied: false,
  stagingPartiallyApplied: false,
  stagingMissing: false,
  evidenceNotes: "",
};

export default function SchemaCheck({ settings }: SchemaCheckProps) {
  const [kit, setKit] = useState<SchemaKit | null>(null);
  const [result, setResult] = useState<SchemaCheckResult>(initialResult);
  const [savedPath, setSavedPath] = useState("");

  useEffect(() => {
    operatorApi.getSchemaKit(settings.ebosProjectPath).then(setKit);
  }, [settings.ebosProjectPath]);

  async function save() {
    const saved = await operatorApi.saveSchemaCheckResult(settings.ebosProjectPath, result);
    setSavedPath(saved.path);
  }

  return (
    <div className="space-y-5">
      <SafetyBanner />
      <section className="rounded-md border border-line bg-white p-5">
        <h3 className="text-lg font-semibold text-ink">生产和预发结构人工核对</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          本页不连接数据库，不要求输入数据库密钥，不运行查询语句。这里只展示只读查询包，并记录人工核对结果。即使发现缺失，也不会提供迁移按钮。
        </p>
      </section>
      {kit ? (
        <div className="grid grid-cols-2 gap-5">
          <section className="rounded-md border border-line bg-white">
            <div className="border-b border-line px-4 py-3 text-sm font-semibold text-ink">人工核对说明</div>
            <pre className="max-h-[520px] overflow-auto p-4 text-xs leading-5 text-slate-800">{kit.markdown || "未找到人工核对说明"}</pre>
          </section>
          <section className="rounded-md border border-line bg-white">
            <div className="flex items-center justify-between border-b border-line px-4 py-3 text-sm font-semibold text-ink">
              <span>只读查询包</span>
              <span className={kit.selectOnly ? "text-teal-700" : "text-red-700"}>{kit.selectOnly ? "仅包含查询" : "包含非查询语句"}</span>
            </div>
            <pre className="max-h-[520px] overflow-auto p-4 text-xs leading-5 text-slate-800">{kit.sql || "未找到查询包"}</pre>
          </section>
        </div>
      ) : null}
      <section className="rounded-md border border-line bg-white p-5">
        <h3 className="font-semibold text-ink">人工核对结果</h3>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {checkboxes.map((item) => (
            <label key={item.key} className="flex items-center gap-3 rounded-md border border-line px-3 py-2 text-sm text-slate-700">
              <input type="checkbox" checked={Boolean(result[item.key])} onChange={(event) => setResult({ ...result, [item.key]: event.target.checked })} />
              {item.label}
            </label>
          ))}
          <label className="col-span-3 text-sm font-medium text-slate-700">
            证据说明
            <textarea className="focus-ring mt-2 min-h-24 w-full rounded-md border border-line px-3 py-2" value={result.evidenceNotes} onChange={(event) => setResult({ ...result, evidenceNotes: event.target.value })} />
          </label>
        </div>
        <button type="button" onClick={save} className="focus-ring mt-4 inline-flex items-center gap-2 rounded-md bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
          <Save className="h-4 w-4" />
          保存人工核对结果
        </button>
        {savedPath ? <p className="mt-3 text-sm text-teal-700">已保存：{savedPath}</p> : null}
      </section>
      <section className="rounded-md border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
        后续如果需要进入数据库迁移发布模式，仍需要备份证据、回滚方案和专用确认句。本应用不会直接执行迁移。
      </section>
    </div>
  );
}

type SchemaBooleanKey =
  | "productionAlreadyApplied"
  | "productionPartiallyApplied"
  | "productionMissing"
  | "stagingAlreadyApplied"
  | "stagingPartiallyApplied"
  | "stagingMissing";

const checkboxes: Array<{ key: SchemaBooleanKey; label: string }> = [
  { key: "productionAlreadyApplied", label: "生产环境已存在" },
  { key: "productionPartiallyApplied", label: "生产环境部分存在" },
  { key: "productionMissing", label: "生产环境缺失" },
  { key: "stagingAlreadyApplied", label: "预发环境已存在" },
  { key: "stagingPartiallyApplied", label: "预发环境部分存在" },
  { key: "stagingMissing", label: "预发环境缺失" },
];
