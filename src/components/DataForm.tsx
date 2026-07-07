import { Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { defaultTargetDate, externalDataPayloadSchema, type ExternalDataEntry, type ExternalDataPayload } from "../lib/types";

type DataFormProps = {
  onSave: (payload: ExternalDataPayload) => Promise<void>;
};

const emptyEntry: ExternalDataEntry = {
  platform: "wechat",
  channelName: "微信私域",
  published: false,
  publishedAt: "",
  publishedUrl: "",
  views: 0,
  clicks: 0,
  messages: 0,
  leads: 0,
  orders: 0,
  revenue: 0,
  evidence: "",
  notes: "",
};

export default function DataForm({ onSave }: DataFormProps) {
  const [targetDate, setTargetDate] = useState(defaultTargetDate);
  const [entries, setEntries] = useState<ExternalDataEntry[]>([emptyEntry]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setError("");
    const parsed = externalDataPayloadSchema.safeParse({ targetDate, entries });
    if (!parsed.success) {
      setError(parsed.error.issues.map((issue) => issue.message).join("；"));
      return;
    }
    setSaving(true);
    try {
      await onSave(parsed.data);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4 rounded-md border border-line bg-white p-4">
        <label className="text-sm font-medium text-slate-700">
          目标日期
          <input className="focus-ring mt-2 w-full rounded-md border border-line px-3 py-2" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
        </label>
        <div className="col-span-2 rounded-md bg-amber-50 p-3 text-sm leading-6 text-amber-950">
          只能填写真实发布和真实观察数据。允许指标为 0，不允许自动生成 publishedUrl，不允许用模拟数据通过 EBOS。
        </div>
      </div>
      {entries.map((entry, index) => (
        <div key={index} className="rounded-md border border-line bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-ink">渠道记录 {index + 1}</h3>
            <button
              type="button"
              onClick={() => setEntries(entries.filter((_, entryIndex) => entryIndex !== index))}
              disabled={entries.length === 1}
              className="focus-ring inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
              删除
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="platform" value={entry.platform} onChange={(value) => update(index, "platform", value)} />
            <Field label="channelName" value={entry.channelName} onChange={(value) => update(index, "channelName", value)} />
            <label className="flex items-center gap-3 rounded-md border border-line px-3 py-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={entry.published} onChange={(event) => update(index, "published", event.target.checked)} />
              published
            </label>
            <Field label="publishedAt" value={entry.publishedAt} onChange={(value) => update(index, "publishedAt", value)} />
            <Field label="publishedUrl" value={entry.publishedUrl} onChange={(value) => update(index, "publishedUrl", value)} />
            <NumberField label="views" value={entry.views} onChange={(value) => update(index, "views", value)} />
            <NumberField label="clicks" value={entry.clicks} onChange={(value) => update(index, "clicks", value)} />
            <NumberField label="messages" value={entry.messages} onChange={(value) => update(index, "messages", value)} />
            <NumberField label="leads" value={entry.leads} onChange={(value) => update(index, "leads", value)} />
            <NumberField label="orders" value={entry.orders} onChange={(value) => update(index, "orders", value)} />
            <NumberField label="revenue" value={entry.revenue} onChange={(value) => update(index, "revenue", value)} />
            <Field label="evidence" value={entry.evidence} onChange={(value) => update(index, "evidence", value)} />
            <label className="col-span-3 text-sm font-medium text-slate-700">
              notes
              <textarea className="focus-ring mt-2 min-h-24 w-full rounded-md border border-line px-3 py-2" value={entry.notes} onChange={(event) => update(index, "notes", event.target.value)} />
            </label>
          </div>
        </div>
      ))}
      {error ? <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</div> : null}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setEntries([...entries, { ...emptyEntry }])}
          className="focus-ring inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Plus className="h-4 w-4" />
          添加渠道
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="focus-ring inline-flex items-center gap-2 rounded-md bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "保存中" : "保存真实数据"}
        </button>
      </div>
    </div>
  );

  function update<K extends keyof ExternalDataEntry>(index: number, key: K, value: ExternalDataEntry[K]) {
    setEntries(entries.map((entry, entryIndex) => (entryIndex === index ? { ...entry, [key]: value } : entry)));
  }
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      <input className="focus-ring mt-2 w-full rounded-md border border-line px-3 py-2" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="text-sm font-medium text-slate-700">
      {label}
      <input className="focus-ring mt-2 w-full rounded-md border border-line px-3 py-2" type="number" min={0} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}
