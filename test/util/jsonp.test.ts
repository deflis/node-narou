import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { jsonp } from "../../src/util/jsonp";

describe("jsonp", () => {
  let callbacks: Record<string, (data: unknown) => void>;
  let script: {
    setAttribute: ReturnType<typeof vi.fn>;
    parentNode: typeof parent | null;
    onerror: (() => void) | null;
    onload: (() => void) | null;
  };
  let parent: {
    insertBefore: ReturnType<typeof vi.fn>;
    removeChild: ReturnType<typeof vi.fn>;
  };
  let documentMock: {
    createElement: ReturnType<typeof vi.fn>;
    getElementsByTagName: ReturnType<typeof vi.fn>;
    head: typeof parent;
  };
  let requestUrl: URL;

  const callbackName = (param = "callback") =>
    requestUrl.searchParams.get(param)!;

  beforeEach(() => {
    vi.useFakeTimers();
    callbacks = {};
    parent = {
      insertBefore: vi.fn((element: typeof script) => {
        element.parentNode = parent;
      }),
      removeChild: vi.fn((element: typeof script) => {
        element.parentNode = null;
      }),
    };
    script = {
      setAttribute: vi.fn((_name: string, value: string) => {
        requestUrl = new URL(value);
      }),
      parentNode: null,
      onerror: null,
      onload: null,
    };
    documentMock = {
      createElement: vi.fn(() => script),
      getElementsByTagName: vi.fn(() => ({
        item: () => ({ parentNode: parent }),
      })),
      head: parent,
    };
    vi.stubGlobal("window", callbacks);
    vi.stubGlobal("document", documentMock);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const expectCleanedUp = () => {
    expect(Object.keys(callbacks)).toEqual([]);
    expect(script.parentNode).toBeNull();
    expect(script.onload).toBeNull();
    expect(script.onerror).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  };

  test("returns data and releases all resources on success", async () => {
    const promise = jsonp(
      "https://example.com/api?word=test&callback=old#fragment"
    );
    expect(documentMock.createElement).toHaveBeenCalledWith("script");
    expect(requestUrl.searchParams.get("word")).toBe("test");
    expect(requestUrl.searchParams.getAll("callback")).toEqual([
      callbackName(),
    ]);
    expect(requestUrl.hash).toBe("#fragment");
    expect(callbackName()).toMatch(/^__jp\d+$/);
    expect(parent.insertBefore).toHaveBeenCalledWith(script, expect.anything());
    callbacks[callbackName()]({ result: "success" });
    await expect(promise).resolves.toEqual({ result: "success" });
    expect(parent.removeChild).toHaveBeenCalledWith(script);
    expectCleanedUp();
  });

  test("applies custom options", async () => {
    const promise = jsonp("https://example.com", {
      prefix: "custom",
      param: "cb",
      timeout: 5000,
    });
    expect(callbackName("cb")).toMatch(/^custom\d+$/);
    vi.advanceTimersByTime(4999);
    callbacks[callbackName("cb")]({ ok: true });
    await expect(promise).resolves.toEqual({ ok: true });
    expectCleanedUp();
  });

  test("uses document.head when no scripts exist", async () => {
    documentMock.getElementsByTagName.mockReturnValue({ item: () => null });
    const promise = jsonp("https://example.com");
    expect(parent.insertBefore).toHaveBeenCalledWith(script, null);
    callbacks[callbackName()](null);
    await expect(promise).resolves.toBeNull();
    expectCleanedUp();
  });

  test("rejects load failures immediately, even with timeout disabled", async () => {
    const promise = jsonp("https://example.com", { timeout: 0 });
    script.onerror!();
    await expect(promise).rejects.toThrow("JSONP script failed to load");
    expectCleanedUp();
  });

  test("rejects scripts that load without calling the callback", async () => {
    const promise = jsonp("https://example.com", { timeout: 0 });
    script.onload!();
    await expect(promise).rejects.toThrow("JSONP callback was not called");
    expectCleanedUp();
  });

  test("times out and removes the temporary callback after the grace period", async () => {
    const promise = jsonp("https://example.com", { timeout: 1000 });
    const name = callbackName();
    vi.advanceTimersByTime(1000);
    await expect(promise).rejects.toThrow("Timeout");
    expect(script.parentNode).toBeNull();
    expect(typeof callbacks[name]).toBe("function");
    vi.advanceTimersByTime(15000);
    expectCleanedUp();
  });

  test("discards a late response and immediately releases the temporary callback", async () => {
    const promise = jsonp("https://example.com", { timeout: 1000 });
    const name = callbackName();
    vi.advanceTimersByTime(1000);
    await expect(promise).rejects.toThrow("Timeout");
    expect(() => callbacks[name]({ late: true })).not.toThrow();
    expectCleanedUp();
  });

  test("does not schedule a timeout when disabled", async () => {
    const promise = jsonp("https://example.com", { timeout: 0 });
    expect(vi.getTimerCount()).toBe(0);
    callbacks[callbackName()](123);
    await expect(promise).resolves.toBe(123);
    expectCleanedUp();
  });

  test("rejects invalid URLs without registering callbacks or timers", async () => {
    await expect(jsonp("invalid-url")).rejects.toThrow();
    expect(documentMock.createElement).not.toHaveBeenCalled();
    expectCleanedUp();
  });

  test("releases resources when setting the script URL fails", async () => {
    script.setAttribute.mockImplementation(() => {
      throw new Error("blocked src");
    });
    await expect(jsonp("https://example.com")).rejects.toThrow("blocked src");
    expectCleanedUp();
  });

  test("releases resources when script creation fails", async () => {
    documentMock.createElement.mockImplementation(() => {
      throw new Error("creation failed");
    });
    await expect(jsonp("https://example.com")).rejects.toThrow(
      "creation failed"
    );
    expectCleanedUp();
  });

  test("releases resources when DOM insertion throws after attaching the script", async () => {
    parent.insertBefore.mockImplementation(() => {
      script.parentNode = parent;
      throw new Error("insertion failed");
    });
    await expect(jsonp("https://example.com")).rejects.toThrow(
      "insertion failed"
    );
    expectCleanedUp();
  });

  test("ignores events and callbacks retained after settlement", async () => {
    const promise = jsonp("https://example.com");
    const callback = callbacks[callbackName()];
    const onerror = script.onerror!;
    const onload = script.onload!;
    callback("first");
    callback("second");
    onerror();
    onload();
    await expect(promise).resolves.toBe("first");
    expect(parent.removeChild).toHaveBeenCalledTimes(1);
    expectCleanedUp();
  });

  test("skips occupied callback names without overwriting existing properties", async () => {
    const first = jsonp("https://example.com");
    const previousName = callbackName();
    callbacks[previousName](null);
    await first;

    const nextCount = Number(previousName.slice(4)) + 1;
    const occupiedName = `__jp${nextCount}`;
    const undefinedName = `__jp${nextCount + 1}`;
    const existing = vi.fn();
    callbacks[occupiedName] = existing;
    Object.defineProperty(callbacks, undefinedName, {
      value: undefined,
      configurable: true,
    });

    const second = jsonp("https://example.com");
    expect(callbackName()).not.toBe(occupiedName);
    expect(callbackName()).not.toBe(undefinedName);
    callbacks[callbackName()](null);
    await second;

    expect(callbacks[occupiedName]).toBe(existing);
    expect(Object.getOwnPropertyDescriptor(callbacks, undefinedName)).toBeDefined();
    expect(callbacks[undefinedName]).toBeUndefined();
    delete callbacks[occupiedName];
    delete callbacks[undefinedName];
    expectCleanedUp();
  });

  test("keeps concurrent requests independent", async () => {
    const first = jsonp("https://example.com");
    const firstScript = script;
    const firstName = callbackName();
    script = { ...script, parentNode: null };
    const second = jsonp("https://example.com");
    const secondName = callbackName();
    expect(secondName).not.toBe(firstName);
    callbacks[secondName]("second");
    expect(typeof callbacks[firstName]).toBe("function");
    expect(vi.getTimerCount()).toBe(1);
    callbacks[firstName]("first");
    await expect(Promise.all([first, second])).resolves.toEqual([
      "first",
      "second",
    ]);
    expect(firstScript.parentNode).toBeNull();
    expect(firstScript.onload).toBeNull();
    expectCleanedUp();
  });
});
