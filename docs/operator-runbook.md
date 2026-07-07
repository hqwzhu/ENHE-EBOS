# ENHE EBOS Operator Runbook

## Start Development Mode

```bash
npm run electron:dev
```

## Run Quality Checks

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

## Build Windows App

```bash
npm run package:win
```

The unpacked Windows executable is generated at:

```text
release/win-unpacked/ENHE EBOS Operator.exe
```

## Safety Rules

- Do not run migration, seed, deploy, Docker, Nginx, or server commands from this app.
- Do not run backfill apply from this app.
- Do not input or save DATABASE_URL, tokens, cookies, passwords, or `.env` values.
- Use the external data page only for real observed publishing data.
- Use the schema check page only to record manual readonly check results.
