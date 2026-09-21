import { describe, it, expect } from "vitest";
import { costOfVacancy, costOfRecruitment, salaryBenchmark, miningTeamPlan, isToolError } from "@/lib/tools";

describe("costOfVacancy", () => {
  it("calcule le coût (facteur d'impact explicite)", () => {
    const r = costOfVacancy({ monthlySalary: 5200, vacancyDays: 30, impactFactor: 1 });
    expect(isToolError(r)).toBe(false);
    if (!isToolError(r)) {
      expect(r.dailyValue).toBe(240); // 5200*12/260
      expect(r.total).toBe(7200); // 240*30*1
    }
  });
  it("rejette un salaire nul", () => {
    expect(isToolError(costOfVacancy({ monthlySalary: 0, vacancyDays: 30 }))).toBe(true);
  });
});

describe("costOfRecruitment", () => {
  it("applique le taux du canal", () => {
    const r = costOfRecruitment({ annualSalary: 60000, channel: "agence" });
    if (!isToolError(r)) expect(r.total).toBe(12000);
    const r2 = costOfRecruitment({ annualSalary: 60000, channel: "interne" });
    if (!isToolError(r2)) expect(r2.total).toBe(9000);
  });
  it("rejette un canal invalide", () => {
    // @ts-expect-error test d'un canal hors énumération
    expect(isToolError(costOfRecruitment({ annualSalary: 60000, channel: "x" }))).toBe(true);
  });
});

describe("salaryBenchmark", () => {
  it("médiane = base × pays × ancienneté ; fourchette −15/+20 %", () => {
    const r = salaryBenchmark({ discipline: "geologie-exploration", country: "SN", yearsExperience: 0 });
    if (!isToolError(r)) {
      expect(r.median).toBe(55000);
      expect(r.min).toBe(46750);
      expect(r.max).toBe(66000);
    }
    const r10 = salaryBenchmark({ discipline: "geologie-exploration", country: "SN", yearsExperience: 10 });
    if (!isToolError(r10)) expect(r10.median).toBe(71500); // ×1.3
  });
  it("rejette discipline/pays inconnus", () => {
    expect(isToolError(salaryBenchmark({ discipline: "x", country: "SN", yearsExperience: 5 }))).toBe(true);
    expect(isToolError(salaryBenchmark({ discipline: "finance-miniere", country: "US", yearsExperience: 5 }))).toBe(true);
  });
});

describe("miningTeamPlan", () => {
  it("retourne une équipe indicative par phase", () => {
    const r = miningTeamPlan({ phase: "exploration" });
    if (!isToolError(r)) {
      expect(r.roles.length).toBe(3);
      expect(r.total).toBe(4);
      expect(r.roles[0].specialty).toBe("exploration-geologist");
    }
    const prod = miningTeamPlan({ phase: "production" });
    if (!isToolError(prod)) expect(prod.total).toBeGreaterThan(5);
  });
  it("rejette une phase invalide", () => {
    // @ts-expect-error phase hors énumération
    expect(isToolError(miningTeamPlan({ phase: "z" }))).toBe(true);
  });
});
