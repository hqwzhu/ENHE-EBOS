export function formatBooleanZh(value: boolean) {
  return value ? "是" : "否";
}

export function translateStatus(value: string) {
  const normalized = value.trim();
  const map: Record<string, string> = {
    verified: "已验证",
    passed: "已通过",
    failed: "未通过",
    waiting_real_data: "等待真实渠道数据",
    approved_not_executed: "已批准但未执行",
    awaiting_approval: "等待确认",
    unknown: "未知",
    none: "无",
    manual_check_required: "需要人工核对",
    quarantined: "已隔离待审计",
    complete: "已完成",
    partial: "部分完成",
    available: "可用",
    unavailable: "不可用",
  };

  return map[normalized] ?? normalized;
}

export function translateDashboardLabel(label: string) {
  const map: Record<string, string> = {
    operationsReady: "运营准备状态",
    deploymentStatus: "部署状态",
    postLaunchCheckStatus: "上线检查",
    externalPublishingStatus: "外部发布状态",
    hasRealSignals: "真实信号",
    canBackfill: "允许回填",
    safeToRunMigration: "允许迁移",
    lastQualityGate: "质量检查",
    lastCommitHash: "最近提交",
    remainingBlockers: "阻塞项",
    nonBlockingRisks: "待关注风险",
  };

  return map[label] ?? label;
}

export function translateRiskLevel(level: string) {
  const map: Record<string, string> = {
    low: "低",
    medium: "中",
    high: "高",
    critical: "严重",
  };

  return map[level] ?? level;
}

export function summarizeRiskText(value: string) {
  const replacements: Array<[RegExp, string]> = [
    [/External publishing remains waiting_real_data until real channel URLs and metrics are provided\./gi, "外部发布仍在等待真实渠道链接和真实数据。"],
    [/Production\/staging readonly schema verification remains manual_check_required until an authorized human executes the SELECT-only query pack\./gi, "生产和预发数据库结构仍需要授权人员按只读查询包进行人工核对。"],
    [/Package, Prisma migration, seed, admin\/API\/core, payment\/order\/revenue\/auth, and unknown\/risky dirty files remain quarantined for later dedicated review\./gi, "依赖、数据库迁移、种子数据、后台、接口、核心业务和未知风险文件仍处于隔离状态，需要单独审计。"],
    [/The weekly operating cycle dry-run path was handled by static audit because the script did not expose a proven dry-run branch\./gi, "每周运营命令仍按静态审计处理，原因是脚本没有提供已验证的演练分支。"],
    [/Package files remain quarantined\./gi, "依赖文件仍处于隔离状态。"],
    [/Migration files require manual checks\./gi, "数据库迁移文件需要人工核对。"],
    [/Seed files must not run in production\./gi, "种子数据文件不得在生产环境运行。"],
    [/Admin\/API\/core files need dedicated review\./gi, "后台、接口和核心业务文件需要单独审计。"],
    [/Unknown risky files remain separated\./gi, "未知风险文件仍需保持隔离。"],
    [/Keep quarantined and review separately\./gi, "继续隔离，并单独审计。"],
    [/Collect real channel data and run check plus backfill dry-run only\./gi, "收集真实渠道数据后，只运行检查和回填演练。"],
    [/Use the manual schema check kit\. Do not run migration from this app\./gi, "使用人工结构核对包，不要在本应用中运行迁移。"],
  ];

  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
}
