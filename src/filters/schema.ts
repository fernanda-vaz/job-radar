import { z } from "zod";

const terms = z.array(z.string().trim().min(1).max(80)).max(30);

export const filterSchema = z.object({
  titles: terms.default([]),
  technologies: terms.default([]),
  locations: terms.default([]),
  excluded: terms.default([]),
  remoteOnly: z.boolean().default(true),
  minYears: z.number().int().min(0).max(50).nullable(),
  maxYears: z.number().int().min(0).max(50).nullable(),
}).refine((value) => value.minYears === null || value.maxYears === null || value.minYears <= value.maxYears, {
  message: "Faixa de experiência inválida",
  path: ["maxYears"],
});

export type JobFilters = z.infer<typeof filterSchema>;

export type MatchableJob = {
  title: string;
  description: string;
  technologies: string[];
  remote: boolean;
  eligibleLocations: string[];
  minYears: number | null;
  maxYears: number | null;
};
