import { describe, expect, it } from "vitest";
import { matchesJob } from "./matcher.js";
import type { JobFilters, MatchableJob } from "./schema.js";

const job: MatchableJob = {
  title: "Frontend Developer", description: "Build responsive interfaces with React.",
  technologies: ["React", "TypeScript"], remote: true, eligibleLocations: ["Brazil", "LATAM"], minYears: 1, maxYears: 3,
};
const filters: JobFilters = {
  titles: ["Frontend"], technologies: ["React"], locations: ["Brazil"], excluded: ["Senior", "Staff"],
  remoteOnly: true, minYears: 1, maxYears: 2,
};

describe("JobRadar matching", () => {
  it("accepts compatible jobs", () => expect(matchesJob(job, filters)).toBe(true));
  it("rejects non-remote jobs", () => expect(matchesJob({ ...job, remote: false }, filters)).toBe(false));
  it("rejects unrelated technologies", () => expect(matchesJob({ ...job, technologies: ["Python"] }, filters)).toBe(false));
  it("rejects excluded terms", () => expect(matchesJob({ ...job, title: "Senior Frontend Developer" }, filters)).toBe(false));
  it("rejects incompatible locations", () => expect(matchesJob({ ...job, eligibleLocations: ["USA"] }, filters)).toBe(false));
  it("rejects unknown experience when filtered", () => expect(matchesJob({ ...job, minYears: null, maxYears: null }, filters)).toBe(false));
  it("accepts overlapping ranges", () => expect(matchesJob({ ...job, minYears: 2, maxYears: 4 }, filters)).toBe(true));
  it("rejects incompatible ranges", () => expect(matchesJob({ ...job, minYears: 5, maxYears: 8 }, filters)).toBe(false));
  it("does not match ReactNative as React", () => expect(matchesJob({ ...job, technologies: ["ReactNative"] }, filters)).toBe(false));
  it("matches Portuguese title filters against English titles", () => expect(matchesJob(job, { ...filters, titles: ["desenvolvedor frontend"] })).toBe(true));
  it("matches technology aliases", () => expect(matchesJob({ ...job, technologies: ["JavaScript"] }, { ...filters, technologies: ["js"] })).toBe(true));
});
