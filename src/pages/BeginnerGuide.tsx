import { ArrowRight, CheckCircle2, CircleDot, ShieldCheck } from "lucide-react";
import type { AppPage } from "../App";

type BeginnerGuideProps = {
  onNavigate: (page: AppPage) => void;
};

const quickSteps = [
  {
    title: "第一步：确认项目路径",
    detail: "进入设置页，检查本机项目路径是否正确。路径检查全部通过后再进行后续操作。",
    target: "settings" as AppPage,
    action: "打开设置",
  },
  {
    title: "第二步：查看首页状态",
    detail: "回到首页总览，确认部署状态、上线检查、质量检查是否正常。",
    target: "dashboard" as AppPage,
    action: "查看首页",
  },
  {
    title: "第三步：录入真实外部数据",
    detail: "只有真实发布、真实链接、真实浏览或咨询数据才允许录入。没有数据就填零。",
    target: "external-data" as AppPage,
    action: "录入数据",
  },
  {
    title: "第四步：运行安全命令",
    detail: "命令运行页只提供白名单命令。先运行外部发布检查，再运行回填演练。",
    target: "commands" as AppPage,
    action: "运行命令",
  },
  {
    title: "第五步：查看报告和风险",
    detail: "在报告中心查看生成结果，在风险中心确认哪些事项需要人工审计。",
    target: "reports" as AppPage,
    action: "查看报告",
  },
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
            <h3 className="text-xl font-semibold text-ink">新手快速上手</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              按下面顺序操作即可完成一次安全的经营巡检。所有危险动作都被移除或限制在演练模式，适合非技术人员日常使用。
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4">
        {quickSteps.map((step, index) => (
          <article key={step.title} className="rounded-md border border-line bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-panel text-sm font-semibold text-action">
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
                className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {step.action}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-md border border-amber-200 bg-amber-50 p-5 text-amber-950">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-5 w-5" />
          安全规则
        </div>
        <ul className="mt-3 grid grid-cols-1 gap-2 text-sm leading-6">
          {safetyRules.map((rule) => (
            <li key={rule} className="flex gap-2">
              <CircleDot className="mt-1 h-4 w-4 shrink-0" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
