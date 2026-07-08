import { useState } from "react";
import { Save, SearchCheck } from "lucide-react";
import { operatorApi } from "../lib/api";
import type { OperatorSettings, PathValidationResult } from "../lib/types";

type SettingsProps = {
  settings: OperatorSettings;
  onSettingsSaved: (settings: OperatorSettings) => void;
};

export default function Settings({ settings, onSettingsSaved }: SettingsProps) {
  const [draft, setDraft] = useState(settings);
  const [validation, setValidation] = useState<PathValidationResult | null>(null);
  const [message, setMessage] = useState("");

  async function validate() {
    setValidation(await operatorApi.validateProjectPath(draft.ebosProjectPath));
  }

  async function save() {
    const saved = await operatorApi.saveSettings(draft);
    onSettingsSaved(saved);
    setMessage("设置已保存。应用不会保存密钥、数据库连接、令牌或浏览器凭证。");
  }

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-line bg-white p-5">
        <h3 className="text-lg font-semibold text-ink">设置</h3>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <label className="text-sm font-medium text-slate-700">
            项目路径
            <input className="focus-ring mt-2 w-full rounded-md border border-line px-3 py-2" value={draft.ebosProjectPath} onChange={(event) => setDraft({ ...draft, ebosProjectPath: event.target.value })} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            默认日期
            <input className="focus-ring mt-2 w-full rounded-md border border-line px-3 py-2" value={draft.defaultDate} onChange={(event) => setDraft({ ...draft, defaultDate: event.target.value })} />
          </label>
        </div>
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={validate} className="focus-ring inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <SearchCheck className="h-4 w-4" />
            检查路径
          </button>
          <button type="button" onClick={save} className="focus-ring inline-flex items-center gap-2 rounded-md bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
            <Save className="h-4 w-4" />
            保存设置
          </button>
        </div>
      </section>
      {validation ? (
        <section className="rounded-md border border-line bg-white p-5">
          <h3 className="font-semibold text-ink">路径检查</h3>
          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            {validation.messages.map((item) => (
              <div key={item} className="rounded-md bg-panel px-3 py-2 text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {message ? <div className="rounded-md border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">{message}</div> : null}
      <section className="rounded-md border border-line bg-white p-5">
        <h3 className="font-semibold text-ink">下一步建议</h3>
        <p className="mt-2 text-sm text-slate-600">路径检查全部通过后，回到首页总览刷新状态。不要在设置中保存任何密钥或数据库连接信息。</p>
      </section>
    </div>
  );
}
