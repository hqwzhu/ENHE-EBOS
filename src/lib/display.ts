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
    quarantine_do_not_commit_now: "保持隔离，暂不提交",
    dedicated_review_required: "需要单独审计",
    triaged: "已分流待处理",
    blocked: "已阻塞",
    waiting: "等待处理",
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

export function translateReportCategory(type: string) {
  const map: Record<string, string> = {
    final: "最终运营报告",
    deployment: "部署与上线报告",
    "external-publishing": "外部渠道报告",
    automation: "自动化报告",
    "prisma-audit": "数据库审计",
    "package-audit": "依赖审计",
    "seed-audit": "种子数据审计",
    "core-audit": "核心代码审计",
    "unknown-audit": "未知风险审计",
    weekly: "每周运营报告",
    monthly: "月度复盘报告",
    "autonomous-runs": "自动运行记录",
    decision: "决策报告",
    evidence: "证据报告",
    revenue: "收入证据报告",
    validation: "验证报告",
    competitor: "竞品证据报告",
    market: "市场证据报告",
    product: "产品证据报告",
    geo: "AI 搜索证据报告",
    seo: "搜索优化证据报告",
    "data-sources": "数据源报告",
    health: "网站健康报告",
    other: "其它报告",
  };

  return map[type] ?? type;
}

export function translateSummaryKey(key: string) {
  const map: Record<string, string> = {
    reportType: "报告类型",
    targetDate: "目标日期",
    operationsReady: "运营准备状态",
    deploymentStatus: "部署状态",
    externalPublishingStatus: "外部发布状态",
    safeToRunMigration: "允许数据库迁移",
    qualityGatePassed: "质量检查通过",
    canBackfill: "允许真实回填",
    hasRealSignals: "已有真实信号",
    status: "状态",
    riskLevel: "风险等级",
    commitHash: "提交版本",
  };

  return map[key] ?? key;
}

export function formatDisplayValue(value: unknown) {
  if (typeof value === "boolean") return formatBooleanZh(value);
  if (typeof value === "string") return translateStatus(value);
  if (value === null || value === undefined || value === "") return "未记录";
  return String(value);
}

export function summarizeRiskText(value: string) {
  const replacements: Array<[RegExp, string]> = [
    [/Package quarantine/gi, "依赖文件隔离审计"],
    [/Prisma migration quarantine/gi, "数据库迁移隔离审计"],
    [/Seed quarantine/gi, "种子数据隔离审计"],
    [/Admin\/API\/Core review/gi, "后台、接口和核心代码审计"],
    [/Unknown\/risky files/gi, "未知风险文件审计"],
    [/Production\/staging schema manual check/gi, "生产和预发结构人工核对"],
    [/External real data waiting/gi, "等待外部真实数据"],
    [/External publishing remains waiting_real_data until real channel URLs and metrics are provided\./gi, "外部发布仍在等待真实渠道链接和真实数据。"],
    [/Production\/staging readonly schema verification remains manual_check_required until an authorized human executes the SELECT-only query pack\./gi, "生产和预发数据库结构仍需要授权人员按只读查询包进行人工核对。"],
    [/Package, Prisma migration, seed, admin\/API\/core, payment\/order\/revenue\/auth, and unknown\/risky dirty files remain quarantined for later dedicated review\./gi, "依赖、数据库迁移、种子数据、后台、接口、核心业务和未知风险文件仍处于隔离状态，需要单独审计。"],
    [/The weekly operating cycle dry-run path was handled by static audit because the script did not expose a proven dry-run branch\./gi, "每周运营命令仍按静态审计处理，原因是脚本没有提供已验证的演练分支。"],
    [/Package files remain quarantined\./gi, "依赖文件仍处于隔离状态。"],
    [/Migration files require manual checks\./gi, "数据库迁移文件需要人工核对。"],
    [/Seed files must not run in production\./gi, "种子数据文件不得在生产环境运行。"],
    [/Admin\/API\/core files need dedicated review\./gi, "后台、接口和核心业务文件需要单独审计。"],
    [/Unknown risky files remain separated\./gi, "未知风险文件仍需保持隔离。"],
    [/Production\/staging readonly schema state has not been verified by an authorized human\./gi, "生产和预发数据库结构尚未由授权人员完成只读核对。"],
    [/Real external channel URL and metrics are required before backfill apply can be considered\./gi, "必须先录入真实渠道链接和真实数据，之后才能考虑真实回填。"],
    [/Keep quarantined and review separately\./gi, "继续隔离，并单独审计。"],
    [/Collect real channel data and run check plus backfill dry-run only\./gi, "收集真实渠道数据后，只运行检查和回填演练。"],
    [/Use the manual schema check kit\. Do not run migration from this app\./gi, "使用人工结构核对包，不要在本应用中运行迁移。"],
    [/Manually execute the production\/staging readonly schema check with authorized secret-safe access\./gi, "由授权人员执行生产和预发环境的只读结构核对，核对过程中不得暴露密钥。"],
    [/Choose 1-3 external channels and publish or outreach with real content\./gi, "选择 1 到 3 个外部渠道，用真实内容发布或触达用户。"],
    [/Backfill real publishedUrl and basic metrics only after real observations exist\./gi, "只有拿到真实发布链接和真实数据后，才填写外部渠道结果。"],
    [/Run npx tsx scripts\/check-ebos-external-publish-results\.ts --date 2026-07-03 after real data is filled\./gi, "真实数据填好后，运行外部发布结果检查。"],
    [/Run npx tsx scripts\/backfill-ebos-external-channel-data\.ts --date 2026-07-03 as dry-run only\./gi, "只运行外部数据回填演练，不执行真实回填。"],
    [/Keep no backfill apply until hasRealSignals=true, canBackfill=true, and explicit approval\./gi, "在真实信号和回填条件都满足，并且得到明确确认前，不执行真实回填。"],
    [/Keep no backfill apply until .+ explicit approval\./gi, "在真实信号和回填条件都满足，并且得到明确确认前，不执行真实回填。"],
    [/Keep EBOS weekly operating cycle every Friday or on demand\./gi, "每周五或按需执行一次经营巡检。"],
    [/Run the EBOS weekly operating cycle every Friday or on demand\./gi, "每周五或按需执行一次经营巡检。"],
    [/Do not run migration or seed unless a separate approval step provides backup evidence, rollback plan, and dedicated confirmation phrase\./gi, "没有单独审批、备份证据、回滚方案和专用确认句时，不运行数据库迁移或种子数据。"],
    [/Do not execute migration or seed unless a separate approval step provides backup evidence, rollback plan, and the dedicated confirmation phrase\./gi, "没有单独审批、备份证据、回滚方案和专用确认句时，不运行数据库迁移或种子数据。"],
    [/quarantine_do_not_commit_now/gi, "保持隔离，暂不提交"],
    [/dedicated_review_required/gi, "需要单独审计"],
    [/triaged/gi, "已分流待处理"],
    [/publishedUrl/gi, "真实发布链接"],
    [/hasRealSignals=true/gi, "已有真实信号"],
    [/canBackfill=true/gi, "允许真实回填"],
  ];

  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
}
