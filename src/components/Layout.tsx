import type { ComponentType } from "react";
import type { ReactNode } from "react";
import type { AppPage } from "../App";
import type { OperatorSettings } from "../lib/types";
import { cx } from "../lib/format";

type NavItem = {
  id: AppPage;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

type LayoutProps = {
  navItems: readonly NavItem[];
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
  pageTitle: string;
  settings: OperatorSettings;
  children: ReactNode;
};

export default function Layout({ navItems, activePage, onNavigate, pageTitle, settings, children }: LayoutProps) {
  return (
    <div className="flex min-h-[100dvh]">
      <aside className="w-72 border-r border-line bg-white/90 px-4 py-5">
        <div className="mb-6 rounded-md border border-line bg-white px-4 py-4 shadow-soft-panel">
          <div className="rounded-md bg-white p-2">
            <img
              src="/brand/enhe_horizontal_black_transparent_white_bg.png"
              alt="ENHE"
              className="h-10 w-auto object-contain"
            />
          </div>
          <h1 className="mt-4 text-xl font-semibold leading-tight text-ink">EBOS Operator</h1>
          <p className="mt-2 text-xs leading-5 text-slate-500">本地桌面运营控制台</p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={cx(
                  "focus-ring flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition",
                  activePage === item.id
                    ? "bg-action text-white shadow-soft-panel"
                    : "text-slate-700 hover:bg-slate-100 hover:text-ink",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-line bg-white/80 px-8 py-5">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="text-sm text-slate-500">当前页面</p>
              <h2 className="mt-1 text-2xl font-semibold text-ink">{pageTitle}</h2>
            </div>
            <div className="max-w-2xl truncate rounded-md border border-line bg-panel px-4 py-3 text-right text-xs text-slate-600">
              <div className="font-semibold text-slate-800">EBOS 项目路径</div>
              <div className="mt-1 truncate">{settings.ebosProjectPath}</div>
            </div>
          </div>
        </header>
        <section className="min-h-0 flex-1 overflow-auto px-8 py-6">{children}</section>
      </main>
    </div>
  );
}
