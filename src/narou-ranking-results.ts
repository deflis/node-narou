import { PickedNarouSearchResult } from "./narou-search-results";
import { SearchResultFieldNames } from "./params";
import { DefaultSearchResultFields } from "./search-builder";

export interface NarouRankingResult {
  ncode: string;
  rank: number;
  pt: number;
}

export type RankingResult<
  T extends SearchResultFieldNames = DefaultSearchResultFields
> = Partial<PickedNarouSearchResult<T>> & NarouRankingResult;
