import type { RankingType } from "./params.js";
import { parseDate } from "./util/date.js";

export interface RankingHistoryRawResult {
  rtype: `${string}-${RankingType}`;
  pt: number;
  rank: number;
}

export interface RankingHistoryResult {
  type: RankingType;
  date: Date;
  pt: number;
  rank: number;
}

/**
 * 生のランキング履歴エントリを構造化された形式にフォーマットします。
 * 
 * @param rankin - フォーマットする生のランキング履歴データ
 * @returns 日付とタイプが解析されたフォーマット済みランキング履歴
 * 
 * @example
 * const rawData = { rtype: "20230101-daily", pt: 500, rank: 10 };
 * const formattedData = formatRankingHistory(rawData);
 * // 返り値: { type: "daily", date: [Dateオブジェクト], pt: 500, rank: 10 }
 */
export function formatRankingHistory(
  rankin: RankingHistoryRawResult
): RankingHistoryResult {
  const { rtype, pt, rank } = rankin;
  const [_date, _type] = rtype.split("-");
  const date = parseDate(_date);
  const type = _type as RankingType;

  return { type, date, pt, rank };
}
