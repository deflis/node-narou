import NarouNovelJsonp from "./narou-jsonp";
import NarouNovel from "./narou";
import SearchBuilder from "./search-builder";
import SearchBuilderR18 from "./search-builder-r18";
import RankingBuilder from "./ranking";
import { formatRankingHistory, RankingHistoryResult } from "./ranking-history";

export * from "./index.common";
export { NarouNovelJsonp };

const narouNovelJsonp = new NarouNovelJsonp();

/**
 * 検索
 * @param {string} [word] - 検索ワード
 * @returns {SearchBuilder}
 */
export function search(
  word = "",
  api: NarouNovel = narouNovelJsonp
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
  api: NarouNovel = narouNovelJsonp
): SearchBuilderR18 {
  const builder = new SearchBuilderR18({}, api);
  if (word != "") builder.word(word);
  return builder;
}

export function ranking(api: NarouNovel = narouNovelJsonp): RankingBuilder {
  const builder = new RankingBuilder({}, api);
  return builder;
}

export async function rankingHistory(
  ncode: string,
  api: NarouNovel = narouNovelJsonp
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
