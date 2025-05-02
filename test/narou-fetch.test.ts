import { describe, it, expect, vi, afterEach, beforeAll, afterAll } from 'vitest';
import NarouNovelFetch from '../src/narou-fetch';
import { setupServer } from 'msw/node';
import { http } from 'msw';
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
      json: vi.fn().mockResolvedValue(mockData)
    });

    const narouFetch = new NarouNovelFetch(customFetchMock);

    // @ts-expect-error - Accessing protected method for testing
    const result = await narouFetch.execute({ gzip: 0 }, 'https://api.example.com');

    // カスタムフェッチ関数が呼ばれたことを確認
    expect(customFetchMock).toHaveBeenCalled();
    expect(result).toEqual(mockData);
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
});