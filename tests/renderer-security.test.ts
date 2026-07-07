import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("renderer security", () => {
  it("renderer code does not import fs or child_process directly", () => {
    const files = [
      "src/App.tsx",
      "src/lib/api.ts",
      "src/pages/Dashboard.tsx",
      "src/pages/CommandRunner.tsx",
      "src/pages/Reports.tsx",
      "src/pages/SchemaCheck.tsx",
      "src/pages/Settings.tsx",
    ];
    for (const file of files) {
      const source = readFileSync(join(process.cwd(), file), "utf8");
      expect(source).not.toMatch(/from ["']node:fs["']/);
      expect(source).not.toMatch(/from ["']fs["']/);
      expect(source).not.toMatch(/from ["']node:child_process["']/);
      expect(source).not.toMatch(/from ["']child_process["']/);
    }
  });
});
