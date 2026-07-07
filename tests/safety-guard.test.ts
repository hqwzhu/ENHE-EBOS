import { describe, expect, it } from "vitest";
import { createCommandPlan, sanitizeOutput, validateCommand } from "../electron/safety-guard";
import type { CommandPlan } from "../electron/safety-guard";

describe("Safety Guard", () => {
  it("blocks prisma migrate", () => {
    expect(validateCommand(customCommand("npx prisma migrate deploy")).allowed).toBe(false);
  });

  it("blocks seed", () => {
    expect(validateCommand(customCommand("npx prisma db seed")).allowed).toBe(false);
  });

  it("blocks backfill apply", () => {
    expect(validateCommand(customCommand("npx tsx scripts/backfill-ebos-external-channel-data.ts --date 2026-07-03 --apply")).allowed).toBe(false);
  });

  it("blocks docker nginx and deploy", () => {
    expect(validateCommand(customCommand("docker compose up -d")).allowed).toBe(false);
    expect(validateCommand(customCommand("nginx -s reload")).allowed).toBe(false);
    expect(validateCommand(customCommand("npm run deploy")).allowed).toBe(false);
  });

  it("blocks git add dot", () => {
    expect(validateCommand(customCommand("git add .")).allowed).toBe(false);
  });

  it("blocks database write keywords", () => {
    for (const command of ["INSERT INTO users VALUES (1)", "UPDATE users SET name='x'", "DELETE FROM users", "CREATE TABLE x(id int)", "ALTER TABLE x ADD y int", "DROP TABLE x", "TRUNCATE TABLE x"]) {
      expect(validateCommand(customCommand(command)).allowed).toBe(false);
    }
  });

  it("allows EBOS test lint typecheck and build", () => {
    expect(validateCommand(createCommandPlan("ebos-test", "2026-07-03")).allowed).toBe(true);
    expect(validateCommand(createCommandPlan("lint", "2026-07-03")).allowed).toBe(true);
    expect(validateCommand(createCommandPlan("typecheck", "2026-07-03")).allowed).toBe(true);
    expect(validateCommand(createCommandPlan("build", "2026-07-03")).allowed).toBe(true);
  });

  it("allows external check, backfill dry-run, and weekly dry-run", () => {
    expect(validateCommand(createCommandPlan("external-check", "2026-07-03")).allowed).toBe(true);
    expect(validateCommand(createCommandPlan("backfill-dry-run", "2026-07-03")).allowed).toBe(true);
    expect(validateCommand(createCommandPlan("weekly-dry-run", "2026-07-03")).allowed).toBe(true);
  });

  it("redacts DATABASE_URL from output", () => {
    expect(sanitizeOutput("DATABASE_URL=postgresql://user:pass@host/db")).not.toContain("user:pass");
  });
});

function customCommand(command: string): CommandPlan {
  return {
    id: "external-check",
    command,
    executable: command.split(" ")[0] ?? "",
    args: command.split(" ").slice(1),
  };
}
