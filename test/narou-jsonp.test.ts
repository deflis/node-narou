import { describe, it, expect, vi, beforeEach } from 'vitest';
import NarouNovelJsonp from '../src/narou-jsonp';
import * as jsonpModule from '../src/util/jsonp';
import { Order } from '../src';

describe('NarouNovelJsonp', () => {
  let narouJsonp: NarouNovelJsonp;
  const mockJsonp = vi.fn();

  beforeEach(() => {
    narouJsonp = new NarouNovelJsonp();
    vi.spyOn(jsonpModule, 'jsonp').mockImplementation(mockJsonp);
    mockJsonp.mockReset();
  });

  it('should set out parameter to jsonp', async () => {
    mockJsonp.mockResolvedValue({ result: 'success' });
    const params = { word: 'test' };
    const endpoint = 'https://api.syosetu.com/novelapi/api/';

    await (narouJsonp as NarouNovelJsonp & { execute: typeof NarouNovelJsonp.prototype['execute'] }).execute(params, endpoint);

    expect(mockJsonp).toHaveBeenCalledWith(expect.stringContaining('out=jsonp'));
  });

  it('should set gzip parameter to 0', async () => {
    mockJsonp.mockResolvedValue({ result: 'success' });
    const params = { word: 'test' };
    const endpoint = 'https://api.syosetu.com/novelapi/api/';

    await (narouJsonp as NarouNovelJsonp & { execute: typeof NarouNovelJsonp.prototype['execute'] }).execute(params, endpoint);

    expect(mockJsonp).toHaveBeenCalledWith(expect.stringContaining('gzip=0'));
  });

  it('should append all parameters to the URL', async () => {
    mockJsonp.mockResolvedValue({ result: 'success' });
    const params = { word: 'test', order: Order.DailyPoint, limit: 20 };
    const endpoint = 'https://api.syosetu.com/novelapi/api/';

    await (narouJsonp as NarouNovelJsonp & { execute: typeof NarouNovelJsonp.prototype['execute'] }).execute(params, endpoint);

    const url = mockJsonp.mock.calls[0][0];
    expect(url).toContain('word=test');
    expect(url).toContain(`order=${Order.DailyPoint}`);
    expect(url).toContain('limit=20');
  });

  it('should ignore undefined parameters', async () => {
    mockJsonp.mockResolvedValue({ result: 'success' });
    const params = { word: 'test', order: undefined };
    const endpoint = 'https://api.syosetu.com/novelapi/api/';

    await (narouJsonp as NarouNovelJsonp & { execute: typeof NarouNovelJsonp.prototype['execute'] }).execute(params, endpoint);

    const url = mockJsonp.mock.calls[0][0];
    expect(url).toContain('word=test');
    expect(url).not.toContain('order=');
  });

  it('should return the result from jsonp', async () => {
    const mockResult = { result: 'success', data: [{ id: 1 }] };
    mockJsonp.mockResolvedValue(mockResult);
    const params = { word: 'test' };
    const endpoint = 'https://api.syosetu.com/novelapi/api/';

    const result = await (narouJsonp as NarouNovelJsonp & { execute: typeof NarouNovelJsonp.prototype['execute'] }).execute(params, endpoint);


    expect(result).toEqual(mockResult);
  });
});