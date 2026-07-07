import { describe, expect, it } from "vitest";
import { createCommandPlan, validateCommand } from "../electron/safety-guard";
import { isValidEbosProject } from "../electron/command-runner";

describe("command runner planning", () => {
  it("creates an allowed external publish check command", () => {
    const plan = createCommandPlan("external-check", "2026-07-03");
    expect(plan.command).toBe("npx tsx scripts/check-ebos-external-publish-results.ts --date 2026-07-03");
    expect(validateCommand(plan).allowed).toBe(true);
  });

  it("creates an allowed dry-run backfill command without apply", () => {
    const plan = createCommandPlan("backfill-dry-run", "2026-07-03");
    expect(plan.command).not.toContain("--apply");
    expect(validateCommand(plan).allowed).toBe(true);
  });

  it("recognizes invalid EBOS project paths", async () => {
    await expect(isValidEbosProject("C:\\path\\that\\does\\not\\exist")).resolves.toBe(false);
  });
});
