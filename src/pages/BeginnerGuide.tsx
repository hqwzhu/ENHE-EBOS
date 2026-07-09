import { ArrowRight, CheckCircle2, CircleDot, ShieldCheck } from "lucide-react";
import type { AppPage } from "../App";

type BeginnerGuideProps = {
  onNavigate: (page: AppPage) => void;
};

const benefits = [
  "把每周经营巡检集中到一个桌面入口，不用在项目文件夹里找报告。",
  "用中文告诉你网站当前是否正常、哪里有风险、下一步应该做什么。",
  "只允许运行安全检查和演练命令，避免误触数据库迁移、部署或真实回填。",
];

const quickSteps = [
  {
    title: "第一步：看本周结论",
    detail: "先打开首页总览，确认部署、上线检查、质量检查和外部数据状态。",
    target: "dashboard" as AppPage,
    action: "查看首页",
  },
  {
    title: "第二步：补真实数据",
    detail: "如果你已经在微信、小红书、闲鱼、淘宝或 Whop 发布过内容，就把真实链接和真实数据录入外部数据页。",
    target: "external-data" as AppPage,
    action: "录入数据",
  },
  {
    title: "第三步：看下一步动作",
    detail: "到报告中心或每周运营页查看中文摘要。只有需要排查时才展开原始技术明细。",
    target: "reports" as AppPage,
    action: "查看报告",
  },
];

const pageMap = [
  "首页总览：看当前经营状态和最重要提醒。",
  "外部数据：录入真实渠道链接、浏览、咨询、订单和收入。",
  "报告中心：查看中文摘要，必要时展开原始报告。",
  "风险中心：查看哪些事项需要人工审计，哪些不能直接操作。",
  "每周运营：按周查看行动清单并运行安全演练。",
];

const safetyRules = [
  "本应用不会运行数据库迁移。",
  "本应用不会运行种子数据。",
  "本应用不会执行部署、服务器、容器或反向代理命令。",
  "本应用不会执行真实回填，只允许演练。",
  "不要在设置页保存数据库连接、密码、令牌或任何密钥。",
];

export default function BeginnerGuide({ onNavigate }: BeginnerGuideProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-md border border-line bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-md bg-teal-50 p-3 text-action">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-ink">这个应用是做什么的</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              ENHE 经营系统操作台是给 ENHE AI 工具站使用的本地经营巡检工具。它把每周报告、外部渠道数据、风险隔离和安全检查整理成中文操作台，让你不用懂代码也能知道网站现在是否健康、下一步该做什么。
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-4">
        {benefits.map((benefit) => (
          <article key={benefit} className="rounded-md border border-line bg-white p-5">
            <div className="mb-3 inline-flex rounded-md bg-panel p-2 text-action">
              <CircleDot className="h-4 w-4" />
            </div>
            <p className="text-sm leading-6 text-slate-700">{benefit}</p>
          </article>
        ))}
      </section>

      <section className="rounded-md border border-line bg-white p-5">
        <h3 className="font-semibold text-ink">第一次使用只做三步</h3>
        <div className="mt-4 grid grid-cols-1 gap-4">
          {quickSteps.map((step, index) => (
            <article key={step.title} className="rounded-md border border-line bg-panel p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-sm font-semibold text-action">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-ink">{step.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{step.detail}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(step.target)}
                  className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-md bg-action px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  {step.action}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="rounded-md border border-line bg-white p-5">
          <h3 className="font-semibold text-ink">页面怎么用</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
            {pageMap.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-5 text-amber-950">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-5 w-5" />
            安全规则
          </div>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            {safetyRules.map((rule) => (
              <li key={rule} className="flex gap-2">
                <CircleDot className="mt-1 h-4 w-4 shrink-0" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
