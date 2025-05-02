import { describe, it, expect } from 'vitest';
import { formatRankingHistory } from '../src/ranking-history.js';
import { RankingType } from '../src/params.js';
import { parse } from 'date-fns';

describe('formatRankingHistory', () => {
  it('should format raw ranking history data correctly', () => {
    const input = {
      rtype: '20230101-d',
      pt: 100,
      rank: 5
    } as const;

    const result = formatRankingHistory(input);

    expect(result).toEqual({
      type: 'd' as RankingType,
      date: parse('20230101', 'yyyyMMdd', new Date()),
      pt: 100,
      rank: 5
    });
  });

  it('should handle different ranking types', () => {
    const input = {
      rtype: '20230215-w',
      pt: 500,
      rank: 1
    } as const;

    const result = formatRankingHistory(input);

    expect(result).toEqual({
      type: 'w' as RankingType,
      date: parse('20230215', 'yyyyMMdd', new Date()),
      pt: 500,
      rank: 1
    });
  });

  it('should handle different date formats correctly', () => {
    const input = {
      rtype: '20221231-m',
      pt: 250,
      rank: 10
    } as const;

    const result = formatRankingHistory(input);

    expect(result).toEqual({
      type: 'm' as RankingType,
      date: parse('20221231', 'yyyyMMdd', new Date()),
      pt: 250,
      rank: 10
    });
  });
  
  it('should handle quarter ranking type', () => {
    const input = {
      rtype: '20240331-q',
      pt: 1000,
      rank: 3
    } as const;

    const result = formatRankingHistory(input);

    expect(result).toEqual({
      type: 'q' as RankingType,
      date: parse('20240331', 'yyyyMMdd', new Date()),
      pt: 1000,
      rank: 3
    });
  });
});