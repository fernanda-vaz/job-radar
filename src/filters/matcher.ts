import type { JobFilters, MatchableJob } from "./schema.js";

const aliasGroups = [
  ["frontend developer", "front-end developer", "desenvolvedor frontend", "desenvolvedor front-end", "desenvolvedor web"],
  ["backend developer", "back-end developer", "desenvolvedor backend", "desenvolvedor back-end"],
  ["fullstack developer", "full-stack developer", "desenvolvedor full stack", "desenvolvedor full-stack"],
  ["software developer", "software engineer", "desenvolvedor de software", "engenheiro de software"],
  ["react developer", "desenvolvedor react"],
  ["javascript", "js"],
  ["typescript", "ts"],
  ["node.js", "nodejs", "node"],
  ["senior", "sênior"],
];

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function containsTerm(text: string, term: string): boolean {
  const target = normalize(term);
  if (!target) return false;
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, "i").test(normalize(text));
}

function equivalentTerms(term: string): string[] {
  const normalized = normalize(term);
  return aliasGroups.find((group) => group.some((alias) => normalize(alias) === normalized)) ?? [term];
}

function matchesAny(values: string[], candidates: string[]): boolean {
  return candidates.length === 0 || candidates.some((candidate) => equivalentTerms(candidate).some((alias) => values.some((value) => containsTerm(value, alias))));
}

function matchesExperience(job: MatchableJob, filters: JobFilters): boolean {
  if (filters.minYears === null && filters.maxYears === null) return true;
  if (job.minYears === null || job.maxYears === null) return false;
  const min = filters.minYears ?? 0;
  const max = filters.maxYears ?? 50;
  return job.minYears <= max && job.maxYears >= min;
}

export function matchesJob(job: MatchableJob, filters: JobFilters): boolean {
  if (filters.remoteOnly && !job.remote) return false;
  if (!matchesAny([job.title], filters.titles)) return false;
  if (!matchesAny(job.technologies, filters.technologies)) return false;
  if (!matchesAny(job.eligibleLocations, filters.locations)) return false;
  if (!matchesExperience(job, filters)) return false;
  const fullText = `${job.title} ${job.description}`;
  return !filters.excluded.some((term) => equivalentTerms(term).some((alias) => containsTerm(fullText, alias)));
}
