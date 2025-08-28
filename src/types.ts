export interface Company {
  name: string;
  score: number;
}

export interface SearchResults {
  exactMatches: string[];
  nearExactMatches: string[];
  partialMatches: string[];
}

export type MatchStatus = 'exact' | 'nearExact' | 'partial' | 'none';

export interface BadgeConfig {
  color: string;
  text: string;
}

export interface CompanyInfo {
  currentCompany: string | null;
  exactMatches: string[];
  nearExactMatches: string[];
  partialMatches: string[];
}
