"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  costOfVacancy, costOfRecruitment, salaryBenchmark, miningTeamPlan, isToolError, type ToolSlug,
} from "@/lib/tools";

const inputCls = "rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm";
const money = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const DISCIPLINES = [
  ["geologie-exploration", "Géologie & Exploration"],
  ["exploitation-operations", "Exploitation & Opérations"],
  ["finance-miniere", "Finance minière"],
  ["leadership-executive-search", "Leadership / Executive Search"],
] as const;
const COUNTRIES = [["SN", "Sénégal"], ["GN", "Guinée"], ["CI", "Côte d'Ivoire"], ["ML", "Mali"], ["MR", "Mauritanie"], ["BF", "Burkina Faso"], ["GH", "Ghana"]] as const;
const PHASES = [["exploration", "Exploration"], ["feasibility", "Faisabilité"], ["construction", "Construction"], ["production", "Production"]] as const;

export function ToolCalculator({ tool }: { tool: ToolSlug }) {
  const [result, setResult] = useState<React.ReactNode>(null);
  const [errors, setErrors] = useState<string[]>([]);

  function show(node: React.ReactNode) { setErrors([]); setResult(node); }
  function fail(errs: string[]) { setResult(null); setErrors(errs); }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const num = (k: string) => Number(f.get(k));

    if (tool === "cout-vacance") {
      const r = costOfVacancy({ monthlySalary: num("monthlySalary"), vacancyDays: num("vacancyDays") });
      if (isToolError(r)) return fail(r.errors);
      return show(<p><strong>{money(r.total)}</strong> de coût estimé ({money(r.dailyValue)}/jour). <span className="text-muted">{r.methodology}</span></p>);
    }
    if (tool === "cout-recrutement") {
      const r = costOfRecruitment({ annualSalary: num("annualSalary"), channel: f.get("channel") as never });
      if (isToolError(r)) return fail(r.errors);
      return show(<p><strong>{money(r.total)}</strong> ({Math.round(r.rate * 100)} % du salaire annuel). <span className="text-muted">{r.methodology}</span></p>);
    }
    if (tool === "benchmark-salaire") {
      const r = salaryBenchmark({ discipline: String(f.get("discipline")), country: String(f.get("country")), yearsExperience: num("yearsExperience") });
      if (isToolError(r)) return fail(r.errors);
      return show(<p>Fourchette indicative : <strong>{money(r.min)} – {money(r.max)}</strong> (médiane {money(r.median)}). <span className="text-muted">{r.methodology}</span></p>);
    }
    // mining-team-planner
    const r = miningTeamPlan({ phase: f.get("phase") as never });
    if (isToolError(r)) return fail(r.errors);
    return show(
      <div>
        <p className="mb-2">Équipe indicative ({r.total} personnes) :</p>
        <ul className="list-disc pl-5">{r.roles.map((role) => <li key={role.specialty}>{role.count} × {role.specialty}</li>)}</ul>
        <p className="mt-2 text-muted">{r.methodology}</p>
      </div>,
    );
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="grid gap-3 sm:max-w-md">
        {tool === "cout-vacance" && (<>
          <input name="monthlySalary" type="number" min="1" required placeholder="Salaire mensuel (€)" className={inputCls} />
          <input name="vacancyDays" type="number" min="1" required placeholder="Durée de vacance (jours)" className={inputCls} />
        </>)}
        {tool === "cout-recrutement" && (<>
          <input name="annualSalary" type="number" min="1" required placeholder="Salaire annuel (€)" className={inputCls} />
          <select name="channel" className={inputCls}><option value="interne">Interne</option><option value="agence">Agence</option><option value="mixte">Mixte</option></select>
        </>)}
        {tool === "benchmark-salaire" && (<>
          <select name="discipline" className={inputCls}>{DISCIPLINES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <select name="country" className={inputCls}>{COUNTRIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <input name="yearsExperience" type="number" min="0" required placeholder="Années d'expérience" className={inputCls} />
        </>)}
        {tool === "mining-team-planner" && (
          <select name="phase" className={inputCls}>{PHASES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        )}
        <Button type="submit">Calculer</Button>
      </form>
      {errors.length > 0 && <p role="alert" className="mt-4 text-sm text-brand">{errors.join(" · ")}</p>}
      {result && <div className="mt-4 rounded-[var(--radius)] border border-border bg-surface p-4 text-sm">{result}</div>}
    </div>
  );
}
