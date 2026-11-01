import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { formatRankingHistory } from '../src/ranking-history.js';
import NarouAPI from '../src';
import { RankingType } from '../src/params.js';
import { setupServer } from 'msw/node';
import { http } from 'msw/http';
import { responseGzipOrJson } from './mock';

const server = setupServer();

describe('formatRankingHistory', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should format raw ranking history data correctly', () => {
    const input = {
      rtype: '20230101-d',
      pt: 100,
      rank: 5
    } as const;

    const result = formatRankingHistory(input);

    expect(result).toEqual({
      type: 'd' as RankingType,
      date: new Date(2023, 0, 1),
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
      date: new Date(2023, 1, 15),
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
      date: new Date(2022, 11, 31),
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
      date: new Date(2024, 2, 31),
      pt: 1000,
      rank: 3
    });
  });

  it('should pass execute options to ranking history request', async () => {
    const mockFn = vi.fn();

    server.use(
      http.get('https://api.syosetu.com/rank/rankin/', ({ request }) => {
        const url = new URL(request.url);
        mockFn(request.headers.get('x-test'));
        const response = [{ rtype: '20230101-d', pt: 100, rank: 5 }];
        return responseGzipOrJson(response, url);
      })
    );

    const result = await NarouAPI.rankingHistory('n0000a', {
      fetchOptions: { headers: { 'x-test': 'hello' } }
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      type: 'd' as RankingType,
      date: new Date(2023, 0, 1),
      pt: 100,
      rank: 5
    });
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('hello');
  });
});
