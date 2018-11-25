import { NarouSearchResult } from "./narou-search-results";

export interface NarouRankingResult {
  ncode: string;
  rank: number;
  pt: number;
}

export interface RankingResult extends NarouSearchResult, NarouRankingResult {}
