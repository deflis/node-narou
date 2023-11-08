import parse from "date-fns/parse";
import { RankingType } from "./params";

const dateFormat = "yyyyMMdd";

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

export function formatRankingHistory(
  rankin: RankingHistoryRawResult
): RankingHistoryResult {
  const { rtype, pt, rank } = rankin;
  const [_date, _type] = rtype.split("-");
  const date = parse(_date, dateFormat, new Date());
  const type = _type as RankingType;

  return { type, date, pt, rank };
}
