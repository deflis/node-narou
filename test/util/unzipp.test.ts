import { describe, it, expect } from 'vitest';
import { unzipp } from '../../src/util/unzipp';
import { gzip } from 'zlib';
import { promisify } from 'util';

// 非同期gzip関数の作成
const gzipAsync = promisify(gzip);

describe('unzipp', () => {
  it('正常なJSONデータを解凍して解析できること', async () => {
    // テスト用のJSONデータ
    const testData = { key: 'value', test: 123 };
    const jsonString = JSON.stringify(testData);

    // 実際にgzipで圧縮
    const compressedData = await gzipAsync(Buffer.from(jsonString)) as unknown as ArrayBuffer;

    // unzipp関数でデータを解凍・解析
    const result = await unzipp(compressedData);

    // 結果を検証
    expect(result).toEqual(testData);
  });

  it('JSON解析に失敗した場合は解凍されたデータをスローすること', async () => {
    // 有効なJSONではないデータ
    const invalidJson = 'This is not a valid JSON';

    // 実際にgzipで圧縮
    const compressedData = await gzipAsync(Buffer.from(invalidJson)) as unknown as ArrayBuffer;

    // unzipp関数の呼び出し（エラーが発生することを期待）
    await expect(unzipp(compressedData)).rejects.toBe(invalidJson);
  });

  it('解凍できないデータの場合は元のデータの文字列表現をスローすること', async () => {
    // 圧縮されていないデータ（解凍しようとするとエラーになる）
    const notCompressed = new TextEncoder().encode('Not compressed data') as unknown as ArrayBuffer;

    // unzipp関数の呼び出し（エラーが発生することを期待）
    await expect(unzipp(notCompressed)).rejects.toMatch(/Not compressed data/);
  });
});