import { describe, it, expect } from "vitest";
import { buildRobots, buildSitemap, SITE } from "@/lib/seo";

describe("robots", () => {
  it("staging : tout bloqué (jamais indexé)", () => {
    const r = buildRobots({ staging: true });
    expect(Array.isArray(r.rules) ? r.rules[0].disallow : r.rules.disallow).toBe("/");
    expect(r.sitemap).toBeUndefined();
  });
  it("production : indexable sauf admin/API/actions, sitemaps déclarés", () => {
    const r = buildRobots({ staging: false });
    const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    expect(rule.allow).toBe("/");
    const disallow = rule.disallow as string[];
    expect(disallow).toContain("/admin/");
    expect(disallow).toContain("/api/"); // couvre les CV servis via /api/cvs → jamais indexables
    expect(disallow).toContain("/submit-lead/");
    expect(r.sitemap).toContain(`${SITE}/sitemap.xml`);
    expect(r.sitemap).toContain(`${SITE}/sitemap-jobs.xml`);
  });
});

describe("sitemap", () => {
  it("URLs absolues, slash final conservé", () => {
    const s = buildSitemap([{ path: "/" }, { path: "/mines/" }]);
    expect(s.map((e) => e.url)).toEqual([`${SITE}/`, `${SITE}/mines/`]);
  });
  it("déduplique et convertit lastmod en Date", () => {
    const s = buildSitemap([{ path: "/a/", lastmod: "2026-09-01" }, { path: "/a/" }]);
    expect(s.length).toBe(1);
    expect(s[0].lastModified).toBeInstanceOf(Date);
  });
});
