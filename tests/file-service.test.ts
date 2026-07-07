import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { getSchemaKit, listReports, saveExternalData } from "../electron/file-service";
import { saveSettings } from "../electron/settings-service";

describe("file service", () => {
  it("reads EBOS reports from reports/ebos", async () => {
    const project = await createProjectFixture();
    await mkdir(join(project, "reports", "ebos", "final"), { recursive: true });
    await writeFile(join(project, "reports", "ebos", "final", "sample.json"), JSON.stringify({ reportType: "sample" }));
    const reports = await listReports(project, "final", "");
    expect(reports).toHaveLength(1);
    expect(reports[0]?.summary.reportType).toBe("sample");
  });

  it("saves external data to operator input path", async () => {
    const project = await createProjectFixture();
    const result = await saveExternalData(project, {
      targetDate: "2026-07-03",
      entries: [
        {
          platform: "wechat",
          channelName: "微信",
          published: false,
          publishedAt: "",
          publishedUrl: "",
          views: 0,
          clicks: 0,
          messages: 0,
          leads: 0,
          orders: 0,
          revenue: 0,
          evidence: "",
          notes: "",
        },
      ],
    });
    expect(result.path).toContain("operator-user-real-data-input.json");
    expect(result.entries).toBe(1);
  });

  it("schema kit reports select-only SQL", async () => {
    const project = await createProjectFixture();
    const dir = join(project, "reports", "ebos", "deployment", "prisma-audit");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "2026-07-03-production-staging-manual-schema-check-kit.md"), "# kit");
    await writeFile(join(dir, "2026-07-03-production-staging-schema-readonly-query-pack.sql"), "SELECT 1;\nSELECT 2;");
    const kit = await getSchemaKit(project);
    expect(kit.selectOnly).toBe(true);
  });

  it("schema kit flags write SQL as not select-only", async () => {
    const project = await createProjectFixture();
    const dir = join(project, "reports", "ebos", "deployment", "prisma-audit");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "2026-07-03-production-staging-manual-schema-check-kit.md"), "# kit");
    await writeFile(join(dir, "2026-07-03-production-staging-schema-readonly-query-pack.sql"), "SELECT 1;\nUPDATE users SET name = 'x';");
    const kit = await getSchemaKit(project);
    expect(kit.selectOnly).toBe(false);
  });

  it("settings refuses secret-like values", async () => {
    const appRoot = await mkdtemp(join(tmpdir(), "ebos-settings-"));
    await expect(
      saveSettings(appRoot, {
        ebosProjectPath: "C:\\tmp\\DATABASE_URL=postgres://secret",
        defaultDate: "2026-07-03",
      }),
    ).rejects.toThrow(/must not contain secrets/i);
  });
});

async function createProjectFixture() {
  const project = await mkdtemp(join(tmpdir(), "ebos-operator-"));
  await writeFile(join(project, "package.json"), "{}");
  await mkdir(join(project, "reports", "ebos"), { recursive: true });
  return project;
}
