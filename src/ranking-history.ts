import { RankingType } from "./ranking";
import * as moment from "moment";

const dateFormat = "yyyyMMdd";

export interface RankingHistoryRawResult {
  rtype: string;
  pt: number;
  rank: number;
}

export interface RankingHistoryResult {
  type: RankingType;
  date: Date;
  pt: number;
  rank: number;
}

export function formatRankingHistory(rankin: RankingHistoryRawResult): RankingHistoryResult {
  const { rtype, pt, rank } = rankin;
  const [_date, _type] = rtype.split("-");
  const date = moment(_date, dateFormat).toDate();
  const type = _type as RankingType;

  return { type, date, pt, rank };
}
