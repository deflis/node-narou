import type { PickedNarouSearchResult } from "./narou-search-results.js";
import type { SearchResultFieldNames } from "./params.js";
import type { DefaultSearchResultFields } from "./search-builder.js";

/**
 * ランキングAPIの結果
 * @see https://dev.syosetu.com/man/rankapi/#output
 */
export interface NarouRankingResult {
  /** Nコード */
  ncode: string;
  /** 順位 */
  rank: number;
  /** ポイント */
  pt: number;
}

/**
 * ランキングと小説情報をマージした結果
 */
export type RankingResult<
  T extends SearchResultFieldNames = DefaultSearchResultFields
> = Partial<PickedNarouSearchResult<T>> & NarouRankingResult;
