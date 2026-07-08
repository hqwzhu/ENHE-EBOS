# ENHE EBOS Operator Desktop

ENHE EBOS Operator Desktop is a local Windows desktop console for ENHE Business OS operations.

It is designed for weekly EBOS operating work: reading EBOS reports, checking risk status, recording real external channel data, running allowlisted local EBOS commands, and keeping migration, seed, deployment, and backfill apply actions outside the desktop app.

Brand assets are stored in `public/brand/` and used for the app window icon, favicon, packaged Windows app icon, and in-app navigation branding.

## Project Introduction

ENHE EBOS Operator Desktop provides a safer local operating layer for the ENHE AI tools site. It helps an operator inspect EBOS status without opening the full codebase every time.

Core pages:

- Dashboard: current EBOS status, blockers, risks, and key operational signals.
- External Data: record only real external channel publishing data.
- Commands: run only allowlisted EBOS checks and dry-run commands.
- Reports: browse EBOS JSON and Markdown reports.
- Risk Center: review quarantined or high-risk batches before action.
- Schema Check: manually record production/staging schema comparison evidence.
- Weekly Ops: review weekly operating actions and dry-run status.
- Settings: configure the local EBOS project path without storing secrets.

Safety boundaries:

- No Prisma migration execution from the app.
- No seed execution from the app.
- No deployment, Docker, Nginx, or server command execution from the app.
- No `backfill --apply` execution from the app.
- No secret storage in app settings.

## Installation

Prerequisites:

- Windows 10 or later.
- Node.js and npm installed.
- Git installed.

Clone and install:

```bash
git clone https://github.com/hqwzhu/ENHE-EBOS.git
cd ENHE-EBOS
npm install
```

Start the desktop app in development mode:

```bash
npm run electron:dev
```

Build the production app:

```bash
npm run build
```

Package the Windows desktop app:

```bash
npm run package:win
```

The unpacked executable is generated at:

```text
release/win-unpacked/ENHE EBOS Operator.exe
```

## Usage

1. Open `ENHE EBOS Operator.exe` or run `npm run electron:dev`.
2. Go to Settings and confirm the EBOS project path.
3. Use Dashboard to inspect deployment status, external publishing status, and blockers.
4. Use External Data only after real external channel publishing has happened.
5. Use Commands for allowlisted checks such as EBOS tests, lint, typecheck, build, and dry-run operating commands.
6. Use Reports and Risk Center to review generated EBOS evidence before committing or taking action.

## Development

```bash
npm install
npm run electron:dev
```

## Quality

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

## Windows Package

```bash
npm run package:win
```

## Developer

- Developer: ENHE
- Website: [https://www.enhe-tech.com.cn](https://www.enhe-tech.com.cn)

