import NarouNovel from "./narou";
import NarouNovelFetch from "./narou-fetch";
import NarouNovelJsonp from "./narou-jsonp";
import RankingBuilder from "./ranking";
import { formatRankingHistory, RankingHistoryResult } from "./ranking-history";
import SearchBuilder from "./search-builder";
import SearchBuilderR18 from "./search-builder-r18";

export * from "./index.common";
export { NarouNovelFetch, NarouNovelJsonp };

const narouNovelFetch = new NarouNovelFetch();

/**
 * 検索
 * @param {string} [word] - 検索ワード
 * @returns {SearchBuilder}
 */
export function search(
  word = "",
  api: NarouNovel = narouNovelFetch
): SearchBuilder {
  const builder = new SearchBuilder({}, api);
  if (word != "") builder.word(word);
  return builder;
}

/**
 * 検索
 * @param {string} [word] - 検索ワード
 * @returns {SearchBuilder}
 */
export function searchR18(
  word = "",
  api: NarouNovel = narouNovelFetch
): SearchBuilderR18 {
  const builder = new SearchBuilderR18({}, api);
  if (word != "") builder.word(word);
  return builder;
}

export function ranking(api: NarouNovel = narouNovelFetch): RankingBuilder {
  const builder = new RankingBuilder({}, api);
  return builder;
}

export async function rankingHistory(
  ncode: string,
  api: NarouNovel = narouNovelFetch
): Promise<RankingHistoryResult[]> {
  const result = await api.executeRankingHistory({ ncode });
  if (Array.isArray(result)) {
    return result.map(formatRankingHistory);
  } else {
    throw new Error(result);
  }
}

export default {
  search,
  ranking,
  searchR18,
  rankingHistory,
};
