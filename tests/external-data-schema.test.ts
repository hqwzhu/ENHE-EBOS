import { describe, expect, it } from "vitest";
import { externalDataPayloadSchema } from "../src/lib/types";

describe("external data schema", () => {
  it("does not allow published=true without real publishedUrl", () => {
    const result = externalDataPayloadSchema.safeParse({
      targetDate: "2026-07-03",
      entries: [
        {
          platform: "wechat",
          channelName: "微信",
          published: true,
          publishedUrl: "",
          views: 0,
          clicks: 0,
          messages: 0,
          leads: 0,
          orders: 0,
          revenue: 0,
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("keeps published=false without generating publishedUrl", () => {
    const result = externalDataPayloadSchema.parse({
      targetDate: "2026-07-03",
      entries: [
        {
          platform: "manual_outreach",
          channelName: "人工私聊",
          published: false,
          views: 0,
          clicks: 0,
          messages: 0,
          leads: 0,
          orders: 0,
          revenue: 0,
        },
      ],
    });
    expect(result.entries[0]?.published).toBe(false);
    expect(result.entries[0]?.publishedUrl).toBe("");
  });
});
