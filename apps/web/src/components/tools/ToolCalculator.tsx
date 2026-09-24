"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { pushEvent } from "@/lib/analytics";
import {
  costOfVacancy, costOfRecruitment, salaryBenchmark, miningTeamPlan, isToolError,
  type ToolSlug, type Lang,
} from "@/lib/tools";

const inputCls = "rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm";

const DISCIPLINES_FR = [
  ["geologie-exploration", "Géologie & Exploration"],
  ["exploitation-operations", "Exploitation & Opérations"],
  ["finance-miniere", "Finance minière"],
  ["leadership-executive-search", "Leadership / Executive Search"],
] as const;
const DISCIPLINES_EN = [
  ["geologie-exploration", "Geology & Exploration"],
  ["exploitation-operations", "Operations & Mining"],
  ["finance-miniere", "Mining finance"],
  ["leadership-executive-search", "Leadership / Executive Search"],
] as const;
const COUNTRIES_FR = [["SN", "Sénégal"], ["GN", "Guinée"], ["CI", "Côte d'Ivoire"], ["ML", "Mali"], ["MR", "Mauritanie"], ["BF", "Burkina Faso"], ["GH", "Ghana"]] as const;
const COUNTRIES_EN = [["SN", "Senegal"], ["GN", "Guinea"], ["CI", "Ivory Coast"], ["ML", "Mali"], ["MR", "Mauritania"], ["BF", "Burkina Faso"], ["GH", "Ghana"]] as const;
const PHASES_FR = [["exploration", "Exploration"], ["feasibility", "Faisabilité"], ["construction", "Construction"], ["production", "Production"]] as const;
const PHASES_EN = [["exploration", "Exploration"], ["feasibility", "Feasibility"], ["construction", "Construction"], ["production", "Production"]] as const;

const COPY = {
  fr: {
    monthlySalary: "Salaire mensuel (€)", vacancyDays: "Durée de vacance (jours)",
    annualSalary: "Salaire annuel (€)", years: "Années d'expérience",
    internal: "Interne", agency: "Agence", mixed: "Mixte",
    calc: "Calculer",
    vacancy: (total: string, daily: string) => <>{" "}<strong>{total}</strong> de coût estimé ({daily}/jour). </>,
    recruit: (total: string, pct: number) => <>{" "}<strong>{total}</strong> ({pct} % du salaire annuel). </>,
    bench: (min: string, max: string, med: string) => <>Fourchette indicative : <strong>{min} – {max}</strong> (médiane {med}). </>,
    teamIntro: (n: number) => `Équipe indicative (${n} personnes) :`,
  },
  en: {
    monthlySalary: "Monthly salary (€)", vacancyDays: "Vacancy duration (days)",
    annualSalary: "Annual salary (€)", years: "Years of experience",
    internal: "In-house", agency: "Agency", mixed: "Mixed",
    calc: "Calculate",
    vacancy: (total: string, daily: string) => <>{" "}<strong>{total}</strong> estimated cost ({daily}/day). </>,
    recruit: (total: string, pct: number) => <>{" "}<strong>{total}</strong> ({pct}% of annual salary). </>,
    bench: (min: string, max: string, med: string) => <>Indicative range: <strong>{min} – {max}</strong> (median {med}). </>,
    teamIntro: (n: number) => `Indicative team (${n} people):`,
  },
} as const;

export function ToolCalculator({ tool, lang = "fr" }: { tool: ToolSlug; lang?: Lang }) {
  const [result, setResult] = useState<React.ReactNode>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const t = COPY[lang];
  const money = (n: number) => new Intl.NumberFormat(lang === "en" ? "en-GB" : "fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  const disciplines = lang === "en" ? DISCIPLINES_EN : DISCIPLINES_FR;
  const countries = lang === "en" ? COUNTRIES_EN : COUNTRIES_FR;
  const phases = lang === "en" ? PHASES_EN : PHASES_FR;

  function show(node: React.ReactNode) { setErrors([]); setResult(node); pushEvent("use_tool", { tool }); }
  function fail(errs: string[]) { setResult(null); setErrors(errs); }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const num = (k: string) => Number(f.get(k));

    if (tool === "cout-vacance") {
      const r = costOfVacancy({ monthlySalary: num("monthlySalary"), vacancyDays: num("vacancyDays") }, lang);
      if (isToolError(r)) return fail(r.errors);
      return show(<p>{t.vacancy(money(r.total), money(r.dailyValue))}<span className="text-muted">{r.methodology}</span></p>);
    }
    if (tool === "cout-recrutement") {
      const r = costOfRecruitment({ annualSalary: num("annualSalary"), channel: f.get("channel") as never }, lang);
      if (isToolError(r)) return fail(r.errors);
      return show(<p>{t.recruit(money(r.total), Math.round(r.rate * 100))}<span className="text-muted">{r.methodology}</span></p>);
    }
    if (tool === "benchmark-salaire") {
      const r = salaryBenchmark({ discipline: String(f.get("discipline")), country: String(f.get("country")), yearsExperience: num("yearsExperience") }, lang);
      if (isToolError(r)) return fail(r.errors);
      return show(<p>{t.bench(money(r.min), money(r.max), money(r.median))}<span className="text-muted">{r.methodology}</span></p>);
    }
    // mining-team-planner
    const r = miningTeamPlan({ phase: f.get("phase") as never }, lang);
    if (isToolError(r)) return fail(r.errors);
    return show(
      <div>
        <p className="mb-2">{t.teamIntro(r.total)}</p>
        <ul className="list-disc pl-5">{r.roles.map((role) => <li key={role.specialty}>{role.count} × {role.specialty}</li>)}</ul>
        <p className="mt-2 text-muted">{r.methodology}</p>
      </div>,
    );
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="grid gap-3 sm:max-w-md">
        {tool === "cout-vacance" && (<>
          <input name="monthlySalary" type="number" min="1" required placeholder={t.monthlySalary} className={inputCls} />
          <input name="vacancyDays" type="number" min="1" required placeholder={t.vacancyDays} className={inputCls} />
        </>)}
        {tool === "cout-recrutement" && (<>
          <input name="annualSalary" type="number" min="1" required placeholder={t.annualSalary} className={inputCls} />
          <select name="channel" className={inputCls}><option value="interne">{t.internal}</option><option value="agence">{t.agency}</option><option value="mixte">{t.mixed}</option></select>
        </>)}
        {tool === "benchmark-salaire" && (<>
          <select name="discipline" className={inputCls}>{disciplines.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <select name="country" className={inputCls}>{countries.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <input name="yearsExperience" type="number" min="0" required placeholder={t.years} className={inputCls} />
        </>)}
        {tool === "mining-team-planner" && (
          <select name="phase" className={inputCls}>{phases.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        )}
        <Button type="submit">{t.calc}</Button>
      </form>
      {errors.length > 0 && <p role="alert" className="mt-4 text-sm text-brand">{errors.join(" · ")}</p>}
      {result && <div className="mt-4 rounded-[var(--radius)] border border-border bg-surface p-4 text-sm">{result}</div>}
    </div>
  );
}
