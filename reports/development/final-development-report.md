# ENHE EBOS Operator Desktop Final Development Report

- projectPath: `C:\Users\HU\Documents\ENHE-EBOS-Operator`
- generatedAt: 2026-07-08T09:38:52+08:00
- developmentCompleted: true

## Technology Stack

Electron, React, Vite, TypeScript, Tailwind CSS, local UI components, Node.js child_process, fs/path, Zod, Vitest, electron-builder.

## Pages

1. Dashboard 首页
2. 外部真实数据录入页
3. EBOS 命令运行页
4. 报告中心
5. 风险中心
6. Production / Staging Schema 人工核对页
7. 每周运营页
8. 设置页

## Safety Guard

Implemented in `electron/safety-guard.ts`.

Allowed commands:

- `npm run test -- src/lib/ebos`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npx tsx scripts/check-ebos-external-publish-results.ts --date <date>`
- `npx tsx scripts/backfill-ebos-external-channel-data.ts --date <date>`
- `npx tsx scripts/run-ebos-weekly-operating-cycle.ts --date <date> --dry-run`

Forbidden commands and patterns:

- `prisma migrate`
- `prisma db push`
- `prisma db seed`
- `seed`
- `deploy`
- `docker`
- `nginx`
- `backfill --apply`
- `git add .`
- `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER`, `DROP`, `TRUNCATE`
- `DATABASE_URL`
- `.env`

## Paths

- EBOS project default path: `C:\Users\HU\Documents\New project 2`
- Settings path: `config/operator-settings.json`
- External data save path: `C:\Users\HU\Documents\New project 2\reports\ebos\external-publishing\inputs\operator-user-real-data-input.json`
- Reports center read path: `C:\Users\HU\Documents\New project 2\reports\ebos`
- Schema check result save path: `C:\Users\HU\Documents\New project 2\reports\ebos\deployment\prisma-audit\operator-production-staging-schema-check-result.json`

## Brand Assets

- Source logo package: `E:\AiProject\01.网站相关资料\LOGO\enhe_logo_final_exact_package`
- Local assets: `public/brand/enhe_main_logo_transparent.png`, `public/brand/enhe_horizontal_black_transparent_white_bg.png`, `public/brand/enhe_app_icon_1024.png`, `public/brand/enhe_app_icon.ico`
- Used for: app window icon, favicon, packaged Windows app icon, and in-app navigation branding.

## Forbidden Action Results

- migration executed: no
- seed executed: no
- deployment executed: no
- backfill apply executed: no
- secret read or printed: no

## Quality Results

- `npm run test`: passed, 5 files / 20 tests
- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm run build`: passed
- `npm run electron:build`: passed
- `npm run package:win`: passed

## Windows Package

Executable:

```text
C:\Users\HU\Documents\ENHE-EBOS-Operator\release\win-unpacked\ENHE EBOS Operator.exe
```

## Known Limitations

- The weekly operating cycle command is exposed only as dry-run.
- The app does not connect to production or staging databases.
- The app does not implement automatic external publishing.

## Next Recommendations

1. Launch the packaged executable and perform a manual UI walkthrough.
2. Keep ENHE brand assets in `public/brand/` synchronized with the official logo package.
3. Use the external data page after real channel publishing exists.
4. Keep migration, seed, deploy, and backfill apply decisions outside this desktop app.
