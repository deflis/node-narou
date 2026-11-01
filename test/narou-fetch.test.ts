import { describe, it, expect, vi, afterEach, beforeAll, afterAll } from 'vitest';
import NarouNovelFetch from '../src/narou-fetch';
import { setupServer } from 'msw/node';
import { http } from 'msw/http';
import { responseGzipOrJson } from './mock';

// テスト用データ
const mockData = [{ test: 'data' }];

// MSWサーバーをセットアップ
const server = setupServer();

describe('NarouNovelFetch', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    vi.resetAllMocks();
    server.resetHandlers();
  });
  afterAll(() => server.close());

  it('should use unzipp for gzipped data', async () => {
    // MSWでエンドポイントをモック
    server.use(
      http.get('https://api.example.com', ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('gzip')).toBe('5');
        return responseGzipOrJson(mockData, url);
      })
    );

    const narouFetch = new NarouNovelFetch();

    // @ts-expect-error - Accessing protected method for testing
    const result = await narouFetch.execute({ gzip: 5 }, 'https://api.example.com');

    // 解凍されたデータが元のデータと一致することを確認
    expect(result).toEqual(mockData);
  });

  it('should return json directly when gzip is 0', async () => {
    // MSWでエンドポイントをモック
    server.use(
      http.get('https://api.example.com', ({ request }) => {
        const url = new URL(request.url);
        // gzipパラメータがないことを確認
        expect(url.searchParams.has('gzip')).toBe(false);
        return responseGzipOrJson(mockData, url);
      })
    );

    const narouFetch = new NarouNovelFetch();

    // @ts-expect-error - Accessing protected method for testing
    const result = await narouFetch.execute({ gzip: 0 }, 'https://api.example.com');

    expect(result).toEqual(mockData);
  });

  it('should delete gzip parameter when set to 0', async () => {
    // URLパラメータをキャプチャするモック
    const requestSpy = vi.fn();

    server.use(
      http.get('https://api.example.com', ({ request }) => {
        const url = new URL(request.url);
        // gzipパラメータがないことを確認
        expect(url.searchParams.has('gzip')).toBe(false);
        requestSpy();
        return responseGzipOrJson(mockData, url);
      })
    );

    const narouFetch = new NarouNovelFetch();

    // @ts-expect-error - Accessing protected method for testing
    await narouFetch.execute({ gzip: 0 }, 'https://api.example.com');

    // リクエストが呼ばれたことを確認
    expect(requestSpy).toHaveBeenCalled();
  });

  it('should use custom fetch function when provided', async () => {
    // カスタムフェッチ関数をモック
    const customFetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockData)
    });

    const narouFetch = new NarouNovelFetch(customFetchMock);

    // @ts-expect-error - Accessing protected method for testing
    const result = await narouFetch.execute({ gzip: 0 }, 'https://api.example.com');

    // カスタムフェッチ関数が呼ばれたことを確認
    expect(customFetchMock).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  it.each([403, 404, 429, 500])('should reject HTTP %i before reading the body', async (status) => {
    for (const gzip of [0, 5] as const) {
      const response = Response.json(mockData, { status });
      const jsonSpy = vi.spyOn(response, 'json');
      const bufferSpy = vi.spyOn(response, 'arrayBuffer');
      const narouFetch = new NarouNovelFetch(vi.fn().mockResolvedValue(response));

      await expect(narouFetch.executeRanking({ rtype: '20260101-d', gzip }))
        .rejects.toThrow(`HTTP ${status}:`);
      expect(jsonSpy).not.toHaveBeenCalled();
      expect(bufferSpy).not.toHaveBeenCalled();
      expect(response.bodyUsed).toBe(false);
    }
  });

  it.each([0, 5] as const)('should still reject plain API errors returned with HTTP 200 (gzip=%i)', async (gzip) => {
    const response = new Response('Error: Invalid date.', { status: 200 });
    const narouFetch = new NarouNovelFetch(vi.fn().mockResolvedValue(response));
    const result = narouFetch.executeRanking({ rtype: '20260101-d', gzip });

    if (gzip === 0) {
      await expect(result).rejects.toBeInstanceOf(SyntaxError);
    } else {
      await expect(result).rejects.toBe('Error: Invalid date.');
    }
  });

  it('should set gzip to 5 when undefined', async () => {
    // URLパラメータをキャプチャするモック
    const requestSpy = vi.fn();

    server.use(
      http.get('https://api.example.com', ({ request }) => {
        const url = new URL(request.url);
        // gzipパラメータが5であることを確認
        expect(url.searchParams.get('gzip')).toBe('5');
        requestSpy();
        return responseGzipOrJson(mockData, url);
      })
    );

    const narouFetch = new NarouNovelFetch();

    // @ts-expect-error - Accessing protected method for testing
    await narouFetch.execute({}, 'https://api.example.com');

    // リクエストが呼ばれたことを確認
    expect(requestSpy).toHaveBeenCalled();
  });

  it('should append all parameters to URL', async () => {
    // URLパラメータをキャプチャするモック
    const requestSpy = vi.fn();

    server.use(
      http.get('https://api.example.com', ({ request }) => {
        const url = new URL(request.url);
        // URLパラメータをチェック
        expect(url.searchParams.get('word')).toBe('test');
        expect(url.searchParams.get('order')).toBe('new');
        expect(url.searchParams.get('out')).toBe('json');
        requestSpy();
        return responseGzipOrJson(mockData, url);
      })
    );

    const narouFetch = new NarouNovelFetch();

    // @ts-expect-error - Accessing protected method for testing
    await narouFetch.execute({ word: 'test', order: 'new' }, 'https://api.example.com');

    // リクエストが呼ばれたことを確認
    expect(requestSpy).toHaveBeenCalled();
  });

  it('should make proper fetch request to API endpoint', async () => {
    // URLパラメータをキャプチャするモック
    const requestSpy = vi.fn();

    server.use(
      http.get('https://api.example.com', ({ request }) => {
        const url = new URL(request.url);
        // URLパラメータをチェック
        expect(url.searchParams.get('out')).toBe('json');
        expect(url.searchParams.get('gzip')).toBe('5');
        requestSpy();
        return responseGzipOrJson(mockData, url);
      })
    );

    const narouFetch = new NarouNovelFetch();

    // @ts-expect-error - Accessing protected method for testing
    await narouFetch.execute({}, 'https://api.example.com');

    // リクエストが呼ばれたことを確認
    expect(requestSpy).toHaveBeenCalled();
  });

  it('should pass fetchOptions to fetch', async () => {
    // MSWでエンドポイントをモック
    server.use(
      http.get('https://api.example.com', ({ request }) => {
        expect(request.headers.get('user-agent')).toBe('node-narou');
        return responseGzipOrJson(mockData, new URL(request.url));
      })
    );

    const narouFetch = new NarouNovelFetch();

    // @ts-expect-error - Accessing protected method for testing
    await narouFetch.execute(
      { gzip: 0 },
      'https://api.example.com',
      { fetchOptions: { headers: { 'user-agent': 'node-narou' } } }
    );
  });
});
