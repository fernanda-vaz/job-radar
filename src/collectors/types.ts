export interface NormalizedJob {
  source: string;
  externalId: string;
  title: string;
  company: string;
  url: string;
  description: string;
  location: string | null;
  remote: boolean;
  technologies: string[];
  eligibleLocations: string[];
  minYears: number | null;
  maxYears: number | null;
  publishedAt: Date | null;
}
