import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { jsonp } from '../../src/util/jsonp';

// グローバルなモックの作成
interface MockWindow {
  [key: string]: unknown;
}
const mockWindow: MockWindow = {};
global.window = mockWindow as unknown as Window & typeof globalThis;
// Create a type for accessing window with dynamic string keys
declare global {
  interface Window {
    [key: string]: unknown;
  }
}

// グローバルなdocumentモックの作成
interface MockDocument {
  createElement: ReturnType<typeof vi.fn>;
  getElementsByTagName: ReturnType<typeof vi.fn>;
  head: object;
}

const mockDocument: MockDocument = {
  createElement: vi.fn(),
  getElementsByTagName: vi.fn(),
  head: {}
};
global.document = mockDocument as unknown as Document;

interface MockScript {
  setAttribute: ReturnType<typeof vi.fn>;
  parentNode: MockParentNode | null;
}

interface MockParentNode {
  insertBefore: ReturnType<typeof vi.fn>;
  removeChild: ReturnType<typeof vi.fn>;
}

interface MockHead {
  insertBefore: ReturnType<typeof vi.fn>;
}

describe('jsonp', () => {
  let mockScript: MockScript;
  let mockHead: MockHead;
  let mockParentNode: MockParentNode;
  let mockUrl: string;

  beforeEach(() => {
    // Reset DOM mocks
    mockScript = {
      setAttribute: vi.fn((name, value) => {
        if (name === 'src') {
          mockUrl = value;
        }
      }),
      parentNode: null,
    };

    mockParentNode = {
      insertBefore: vi.fn(),
      removeChild: vi.fn(),
    };

    mockHead = {
      insertBefore: vi.fn(),
    };

    // Mock document methods
    document.createElement = vi.fn().mockImplementation(() => mockScript);
    document.getElementsByTagName = vi.fn().mockImplementation(() => ({
      item: vi.fn().mockReturnValue({
        parentNode: mockParentNode
      })
    }));

    // Mock document.head
    Object.defineProperty(document, 'head', {
      value: mockHead,
      configurable: true
    });

    // Mock setTimeout
    vi.useFakeTimers();

    // Clear global object of any previous callback functions
    Object.keys(window).forEach(key => {
      if (key.startsWith('__jp') || key.startsWith('custom')) {
        delete window[key];
      }
    });

    mockUrl = '';
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('should create a script tag with the correct URL', async () => {
    const url = 'https://example.com/api';

    // Create a promise that will resolve when the JSONP callback is triggered
    const jsonpPromise = jsonp(url);

    // Check if the script was created
    expect(document.createElement).toHaveBeenCalledWith('script');

    // mockScriptにsetAttributeが呼ばれたことを確認
    expect(mockScript.setAttribute).toHaveBeenCalled();

    // mockUrlからコールバック名を抽出
    const match = mockUrl.match(/callback=(__jp\d+)/);
    expect(match).not.toBeNull();

    const callbackName = match![1];
    expect(callbackName).toMatch(/^__jp\d+$/);

    // コールバック関数が登録されているか確認
    expect(typeof window[callbackName]).toBe('function');

    // Simulate JSONP callback with mock data
    const mockData = { result: 'success' };
    (window[callbackName] as (data: unknown) => void)(mockData);

    // Check results
    const result = await jsonpPromise;
    expect(result).toEqual(mockData);
    expect(mockParentNode.insertBefore).toHaveBeenCalledWith(mockScript, expect.anything());
  });

  test('should apply custom options', async () => {
    const url = 'https://example.com/api';
    const options = {
      prefix: 'custom',
      param: 'cb',
      timeout: 5000
    };

    const jsonpPromise = jsonp(url, options);

    // mockScriptにsetAttributeが呼ばれたことを確認
    expect(mockScript.setAttribute).toHaveBeenCalled();

    // mockUrlからコールバック名を抽出 - カスタムパラメータ名を使用
    const match = mockUrl.match(new RegExp(`${options.param}=(${options.prefix}\\d+)`));
    expect(match).not.toBeNull();

    const callbackName = match![1];
    expect(callbackName).toMatch(new RegExp(`^${options.prefix}\\d+$`));

    // コールバック関数が登録されているか確認
    expect(typeof window[callbackName]).toBe('function');

    // Trigger callback
    const mockData = { custom: true };
    (window[callbackName] as (data: unknown) => void)(mockData);

    const result = await jsonpPromise;
    expect(result).toEqual(mockData);
  });

  test('should timeout and reject the promise', async () => {
    const url = 'https://example.com/api';
    const options = { timeout: 1000 };

    const promise = jsonp(url, options);

    // Advance timers to trigger timeout
    vi.advanceTimersByTime(1001);

    await expect(promise).rejects.toThrow('Timeout');
  });

  test('should use document.head if no script tags exist', async () => {
    document.getElementsByTagName = vi.fn().mockImplementation(() => ({
      item: vi.fn().mockReturnValue(null)
    }));

    const url = 'https://example.com/api';
    const jsonpPromise = jsonp(url);

    // mockScriptにsetAttributeが呼ばれたことを確認
    expect(mockScript.setAttribute).toHaveBeenCalled();

    // mockUrlからコールバック名を抽出
    const match = mockUrl.match(/callback=(__jp\d+)/);
    expect(match).not.toBeNull();

    const callbackName = match![1];

    // コールバック関数が登録されているか確認
    expect(typeof window[callbackName]).toBe('function');

    // Trigger callback
    (window[callbackName] as (data: unknown) => void)({ success: true });

    await jsonpPromise;
    expect(mockHead.insertBefore).toHaveBeenCalledWith(mockScript, null);
  });
});