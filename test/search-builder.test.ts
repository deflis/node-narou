import {
  beforeAll,
  afterAll,
  afterEach,
  describe,
  test,
  expect,
  vi,
} from "vitest";
import { setupServer } from "msw/node";
import { responseGzipOrJson } from "./mock";
import NarouAPI, {
  BigGenre,
  BooleanNumber,
  BuntaiParam,
  Fields,
  Genre,
  NovelTypeParam,
  OptionalFields,
  Order,
  StopParam,
} from "../src";
import { http } from "msw/http";
import NarouBrowserAPI from "../src/index.browser.js";
import NarouNovelFetch from "../src/narou-fetch.js";

const server = setupServer();

// ブラウザ入口でもfetch実装を注入し、外部通信なしで互換性を確認する。
const apiEntries = [
  { name: "Node", api: NarouAPI },
  { name: "browser", api: NarouBrowserAPI },
];

const setupMockHandler = (
  mockFn: (...args: unknown[]) => void,
  watchParams: string[] = ["out"]
) => {
  server.use(
    http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
      const url = new URL(request.url);
      const params = url.searchParams;
      const response = [{ allcount: 1 }, { ncode: "N1234AB" }];

      const values = watchParams.map(param => params.get(param));
      mockFn(...values, params.size);

      return responseGzipOrJson(response, url);
    })
  );
};

const setupHeaderHandler = (mockFn: (...args: unknown[]) => void) => {
  server.use(
    http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
      const url = new URL(request.url);
      const response = [{ allcount: 1 }, { ncode: "N1234AB" }];

      mockFn(request.headers.get("x-test"));

      return responseGzipOrJson(response, url);
    })
  );
};

describe("SearchBuilder", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe("抽出・除外条件の併存", () => {
    test.each([
      ["isBL", "isbl", "notbl"],
      ["isGL", "isgl", "notgl"],
      ["isZankoku", "iszankoku", "notzankoku"],
      ["isTensei", "istensei", "nottensei"],
      ["isTenni", "istenni", "nottenni"],
    ] as const)(
      "%sの両条件を呼び出し順に関係なく保持する",
      async (method, include, exclude) => {
        const queries: URLSearchParams[] = [];
        server.use(
          http.get(`https://api.syosetu.com/novelapi/api/`, ({ request }) => {
            queries.push(new URL(request.url).searchParams);
            return responseGzipOrJson([{ allcount: 0 }], new URL(request.url));
          })
        );
        for (const first of [true, false]) {
          const result = await NarouAPI.search()
            .gzip(0)
            [method](first)
            [method](!first)
            .execute();
          expect(result.allcount).toBe(0);
          expect(result.values).toEqual([]);
        }
        expect(queries).toHaveLength(2);
        for (const query of queries) {
          expect(query.get(include)).toBe("1");
          expect(query.get(exclude)).toBe("1");
        }
      }
    );
  });

  describe("gzip", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);
      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test("if gzip = 0", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["out"]);

      const result = await NarouAPI.search().gzip(0).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("json", 1);
    });

    test.each([1, 2, 3, 4, 5] as const)("if gzip = %i", async (gzip) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().gzip(gzip).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(gzip.toString(), "json", 2);
    });
  });

  describe("limit", () => {
    test.each(apiEntries)("$name: 戻り値を受け取らずに再指定できる", async ({ api }) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["lim"]);
      const builder = api.search("", new NarouNovelFetch());
      builder.limit(3);
      builder.limit(10);

      const result = await builder.execute();
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("10", 3);
      expect(result.limit).toBe(10);
    });

    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each([1, 10, 100, 500] as const)("if limit = %i", async (limit) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["lim", "gzip", "out"]);

      const result = await NarouAPI.search().limit(limit).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(limit.toString(), "5", "json", 3);
    });
  });

  describe("execute options", () => {
    test("fetchOptionsがリクエストに渡される", async () => {
      const mockFn = vi.fn();
      setupHeaderHandler(mockFn);

      const result = await NarouAPI.search().execute({
        fetchOptions: { headers: { "x-test": "hello" } },
      });

      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("hello");
    });
  });

  describe("start", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each([1, 10, 100, 500] as const)("if start = %i", async (start) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["st", "gzip", "out"]);

      const result = await NarouAPI.search().start(start).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(start.toString(), "5", "json", 3);
    });
  });

  describe("page", () => {
    test.each(apiEntries)("$name: 再指定は開始位置と件数を上書きし、既定の20件に戻す", async ({ api }) => {
      const queries: URLSearchParams[] = [];
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          queries.push(url.searchParams);
          return responseGzipOrJson([{ allcount: 100 }], url);
        })
      );

      const builder = api.search("", new NarouNovelFetch());
      builder.start(7).limit(3);
      builder.page(2, 10);
      const custom = await builder.execute();
      expect(custom).toMatchObject({ start: 20, limit: 10, page: 2 });

      builder.page(1);
      const defaults = await builder.execute();
      expect(defaults).toMatchObject({ start: 20, limit: 20, page: 1 });

      builder.page(0);
      const first = await builder.execute();
      expect(first).toMatchObject({ start: 0, limit: 20, page: 0 });
      expect(
        queries.map((query) => [query.get("st"), query.get("lim")])
      ).toEqual([
        ["20", "10"],
        ["20", "20"],
        ["0", "20"],
      ]);
    });

    describe("default count", () => {
      test.each([0, 1, 2, 3, 4, 5] as const)("if page = %i", async (page) => {
        const mockFn = vi.fn();
        setupMockHandler(mockFn, ["lim", "st", "gzip", "out"]);

        const result = await NarouAPI.search().page(page).execute();
        expect(result.start).toBe(page * 20);
        expect(result.page).toBe(page);
        expect(result.allcount).toBe(1);
        expect(result.length).toBe(1);
        expect(result.values).toHaveLength(1);
        expect(result.values[0].ncode).toBe("N1234AB");
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(
          "20",
          (page * 20).toString(),
          "5",
          "json",
          4
        );
      });
    });

    describe.each([1, 10, 100, 500] as const)("if count = %i", (count) => {
      test.each([0, 1, 2, 3, 4, 5] as const)("if page = %i", async (page) => {
        const mockFn = vi.fn();
        setupMockHandler(mockFn, ["lim", "st", "gzip", "out"]);

        const result = await NarouAPI.search().page(page, count).execute();
        expect(result.start).toBe(page * count);
        expect(result.page).toBe(page);
        expect(result.allcount).toBe(1);
        expect(result.length).toBe(1);
        expect(result.values).toHaveLength(1);
        expect(result.values[0].ncode).toBe("N1234AB");
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(
          count.toString(),
          (page * count).toString(),
          "5",
          "json",
          4
        );
      });
    });
  });

  describe("order", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    describe.each(Object.values(Order))("if order = %s", (order) => {
      test(order, async () => {
        const mockFn = vi.fn();
        setupMockHandler(mockFn, ["order", "gzip", "out"]);

        const result = await NarouAPI.search().order(order).execute();
        expect(result.allcount).toBe(1);
        expect(result.length).toBe(1);
        expect(result.values).toHaveLength(1);
        expect(result.values[0].ncode).toBe("N1234AB");
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(order, "5", "json", 3);
      });
    });
  });

  describe("word", () => {
    test.each(apiEntries)("$name: 戻り値を受け取らずに再指定できる", async ({ api }) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["word"]);
      const builder = api.search("初期条件", new NarouNovelFetch());
      builder.word("変更後");

      const result = await builder.execute();
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("変更後", 3);
      expect(result.allcount).toBe(1);
    });

    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each(["test", "テスト", "1234", "あいう"])(
      "if word = %s",
      async (word) => {
        const mockFn = vi.fn();
        setupMockHandler(mockFn, ["word", "gzip", "out"]);

        const result = await NarouAPI.search().word(word).execute();
        expect(result.allcount).toBe(1);
        expect(result.length).toBe(1);
        expect(result.values).toHaveLength(1);
        expect(result.values[0].ncode).toBe("N1234AB");
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(word, "5", "json", 3);
      }
    );
  });

  describe("notWord", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each(["test", "テスト", "1234", "あいう"])(
      "if not word = %s",
      async (word) => {
        const mockFn = vi.fn();
        setupMockHandler(mockFn, ["notword", "gzip", "out"]);

        const result = await NarouAPI.search().notWord(word).execute();
        expect(result.allcount).toBe(1);
        expect(result.length).toBe(1);
        expect(result.values).toHaveLength(1);
        expect(result.values[0].ncode).toBe("N1234AB");
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(word, "5", "json", 3);
      }
    );
  });

  describe("byTitle", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test("if byTitle = true", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["title", "gzip", "out"]);

      const result = await NarouAPI.search().byTitle().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.True.toString(), "5", "json", 3);
    });

    test("if byTitle = false", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["title", "gzip", "out"]);

      const result = await NarouAPI.search().byTitle(false).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.False.toString(), "5", "json", 3);
    });
  });

  describe("byOutline", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test("if byOutline = true", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["ex", "gzip", "out"]);

      const result = await NarouAPI.search().byOutline().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.True.toString(), "5", "json", 3);
    });

    test("if byOutline = false", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["ex", "gzip", "out"]);

      const result = await NarouAPI.search().byOutline(false).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.False.toString(), "5", "json", 3);
    });
  });

  describe("byKeyword", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test("if byKeyword = true", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["keyword", "gzip", "out"]);

      const result = await NarouAPI.search().byKeyword().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.True.toString(), "5", "json", 3);
    });

    test("if byKeyword = false", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["keyword", "gzip", "out"]);

      const result = await NarouAPI.search().byKeyword(false).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.False.toString(), "5", "json", 3);
    });
  });

  describe("byAuthor", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test("if byAuthor = true", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["wname", "gzip", "out"]);

      const result = await NarouAPI.search().byAuthor().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.True.toString(), "5", "json", 3);
    });

    test("if byAuthor = false", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["wname", "gzip", "out"]);

      const result = await NarouAPI.search().byAuthor(false).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.False.toString(), "5", "json", 3);
    });
  });

  describe("isBL", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test("if isBL = true", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["isbl", "gzip", "out"]);

      const result = await NarouAPI.search().isBL().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        BooleanNumber.True.toString(),
        "5",
        "json",
        3
      );
    });

    test("if isBL = false", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["notbl", "gzip", "out"]);

      const result = await NarouAPI.search().isBL(false).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        BooleanNumber.True.toString(),
        "5",
        "json",
        3
      );
    });
  });

  describe("isGL", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test("if isGL = true", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["isgl", "gzip", "out"]);

      const result = await NarouAPI.search().isGL().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        BooleanNumber.True.toString(),
        "5",
        "json",
        3
      );
    });

    test("if isGL = false", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["notgl", "gzip", "out"]);

      const result = await NarouAPI.search().isGL(false).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        BooleanNumber.True.toString(),
        "5",
        "json",
        3
      );
    });
  });

  describe("isZankoku", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test("if isZankoku = true", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["iszankoku", "gzip", "out"]);

      const result = await NarouAPI.search().isZankoku().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        BooleanNumber.True.toString(),
        "5",
        "json",
        3
      );
    });

    test("if isZankoku = false", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["notzankoku", "gzip", "out"]);

      const result = await NarouAPI.search().isZankoku(false).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        BooleanNumber.True.toString(),
        "5",
        "json",
        3
      );
    });
  });

  describe("isTensei", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test("if isTensei = true", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["istensei", "gzip", "out"]);

      const result = await NarouAPI.search().isTensei().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        BooleanNumber.True.toString(),
        "5",
        "json",
        3
      );
    });

    test("if isTensei = false", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["nottensei", "gzip", "out"]);

      const result = await NarouAPI.search().isTensei(false).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        BooleanNumber.True.toString(),
        "5",
        "json",
        3
      );
    });
  });

  describe("isTenni", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test("if isTenni = true", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["istenni", "gzip", "out"]);

      const result = await NarouAPI.search().isTenni().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        BooleanNumber.True.toString(),
        "5",
        "json",
        3
      );
    });

    test("if isTenni = false", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["nottenni", "gzip", "out"]);

      const result = await NarouAPI.search().isTenni(false).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        BooleanNumber.True.toString(),
        "5",
        "json",
        3
      );
    });
  });

  describe("isTT", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test("if set isTT", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["istt", "gzip", "out"]);

      const result = await NarouAPI.search().isTT().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.True.toString(), "5", "json", 3);
    });
  });

  describe("length", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each([1, 10, 100])("if length = %i", async (length) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["length", "gzip", "out"]);

      const result = await NarouAPI.search().length(length).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(length.toString(), "5", "json", 3);
    });

    test.each([1000, 10000, 100000])("if length = `0-%i`", async (length) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["length", "gzip", "out"]);

      const result = await NarouAPI.search().length([0, length]).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(`0-${length}`, "5", "json", 3);
    });
  });

  describe("kaiwaritu", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each([1, 10, 100])("if kaiwaritu = %i", async (kaiwaritu) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["kaiwaritu", "gzip", "out"]);

      const result = await NarouAPI.search().kaiwaritu(kaiwaritu).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(kaiwaritu.toString(), "5", "json", 3);
    });

    test.each([
      [0, 10],
      [10, 20],
      [20, 30],
    ])("if kaiwaritu = `%i-%i`", async (min, max) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["kaiwaritu", "gzip", "out"]);

      const result = await NarouAPI.search().kaiwaritu(min, max).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(`${min}-${max}`, "5", "json", 3);
    });
  });

  describe("sasie", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each([1, 10, 100])("if sasie = %i", async (sasie) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["sasie", "gzip", "out"]);

      const result = await NarouAPI.search().sasie(sasie).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(sasie.toString(), "5", "json", 3);
    });

    test.each([
      [0, 10],
      [10, 20],
      [20, 30],
    ])("if sasie = `%i-%i`", async (min, max) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["sasie", "gzip", "out"]);

      const result = await NarouAPI.search().sasie([min, max]).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(`${min}-${max}`, "5", "json", 3);
    });
  });

  describe("time", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each([1, 10, 100])("if time = %i", async (time) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["time", "gzip", "out"]);

      const result = await NarouAPI.search().time(time).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(time.toString(), "5", "json", 3);
    });

    test.each([
      [0, 10],
      [10, 20],
      [20, 30],
    ])("if time = `%i-%i`", async (min, max) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["time", "gzip", "out"]);

      const result = await NarouAPI.search().time([min, max]).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(`${min}-${max}`, "5", "json", 3);
    });
  });

  describe("ncode", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBeGreaterThanOrEqual(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each(["N1234AB", "N5678CD", "N9012EF"])(
      "if ncode = %s",
      async (ncode) => {
        const mockFn = vi.fn();
        setupMockHandler(mockFn, ["ncode", "gzip", "out"]);

        const result = await NarouAPI.search().ncode(ncode).execute();
        expect(result.allcount).toBe(1);
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(ncode, "5", "json", 3);
      }
    );

    test("if ncode = `N1234AB`, `N5678CD`, `N9012EF`", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["ncode", "gzip", "out"]);

      const result = await NarouAPI.search()
        .ncode(["N1234AB", "N5678CD", "N9012EF"])
        .execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("N1234AB-N5678CD-N9012EF", "5", "json", 3);
    });
  });

  describe("type", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each(Object.values(NovelTypeParam))("if type = %s", async (type) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["type", "gzip", "out"]);

      const result = await NarouAPI.search().type(type).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(type, "5", "json", 3);
    });
  });

  describe("buntai", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each(Object.values(BuntaiParam))("if buntai = %i", async (buntai) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["buntai", "gzip", "out"]);

      const result = await NarouAPI.search().buntai(buntai).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(buntai.toString(), "5", "json", 3);
    });

    test("if buntai = `1-2-4-6`", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["buntai", "gzip", "out"]);

      const result = await NarouAPI.search()
        .buntai([
          BuntaiParam.NoJisageKaigyouOoi,
          BuntaiParam.NoJisageKaigyoHutsuu,
          BuntaiParam.JisageKaigyoOoi,
          BuntaiParam.JisageKaigyoHutsuu,
        ])
        .execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("1-2-4-6", "5", "json", 3);
    });
  });

  describe("isStop", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test("if isStop = true", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["stop", "gzip", "out"]);

      const result = await NarouAPI.search().isStop().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(StopParam.Stopping.toString(), "5", "json", 3);
    });

    test("if isStop = false", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["stop", "gzip", "out"]);

      const result = await NarouAPI.search().isStop(false).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(StopParam.NoStopping.toString(), "5", "json", 3);
    });
  });

  describe("isPickup", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test("if isPickup", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["ispickup", "gzip", "out"]);

      const result = await NarouAPI.search().isPickup().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.True.toString(), "5", "json", 3);
    });
  });

  describe("lastUpdate", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each([
      [1, 10],
      [10, 100],
      [100, 1000],
    ])("if lastUpdate = %i-%i", async (min, max) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["lastup", "gzip", "out"]);

      const result = await NarouAPI.search().lastUpdate(min, max).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(`${min}-${max}`, "5", "json", 3);
    });

    test.each([
      [new Date(2021, 1, 1), new Date(2021, 1, 10)],
      [new Date(2021, 1, 10), new Date(2021, 1, 20)],
      [new Date(2021, 1, 20), new Date(2021, 1, 30)],
    ])("if lastUpdate = %s-%s", async (min, max) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["lastup", "gzip", "out"]);

      const result = await NarouAPI.search().lastUpdate(min, max).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        `${Math.floor(min.getTime() / 1000)}-${Math.floor(max.getTime() / 1000)}`,
        "5",
        "json",
        3
      );
    });
  });

  describe("lastNovelUpdate", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each([
      [1, 10],
      [10, 100],
      [100, 1000],
    ])("if lastNovelUpdate = %i-%i", async (min, max) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["lastupdate", "gzip", "out"]);

      const result = await NarouAPI.search()
        .lastNovelUpdate(min, max)
        .execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(`${min}-${max}`, "5", "json", 3);
    });

    test.each([
      [new Date(2021, 1, 1), new Date(2021, 1, 10)],
      [new Date(2021, 1, 10), new Date(2021, 1, 20)],
      [new Date(2021, 1, 20), new Date(2021, 1, 30)],
    ])("if lastNovelUpdate = %s-%s", async (min, max) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["lastupdate", "gzip", "out"]);

      const result = await NarouAPI.search()
        .lastNovelUpdate(min, max)
        .execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        `${Math.floor(min.getTime() / 1000)}-${Math.floor(max.getTime() / 1000)}`,
        "5",
        "json",
        3
      );
    });
  });

  describe("bigGenre", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each(Object.values(BigGenre))("if bigGenre = %i", async (bigGenre) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["biggenre", "gzip", "out"]);

      const result = await NarouAPI.search().bigGenre(bigGenre).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(bigGenre.toString(), "5", "json", 3);
    });

    test("if bigGenre = `1-2-3`", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["biggenre", "gzip", "out"]);

      const result = await NarouAPI.search()
        .bigGenre([BigGenre.Renai, BigGenre.Fantasy, BigGenre.Bungei])
        .execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("1-2-3", "5", "json", 3);
    });
  });

  describe("notBigGenre", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each(Object.values(BigGenre))(
      "if notBigGenre = %i",
      async (notBigGenre) => {
        const mockFn = vi.fn();
        setupMockHandler(mockFn, ["notbiggenre", "gzip", "out"]);

        const result = await NarouAPI.search()
          .notBigGenre(notBigGenre)
          .execute();
        expect(result.allcount).toBe(1);
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(notBigGenre.toString(), "5", "json", 3);
      }
    );

    test("if notBigGenre = `1-2-3`", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["notbiggenre", "gzip", "out"]);

      const result = await NarouAPI.search()
        .notBigGenre([BigGenre.Renai, BigGenre.Fantasy, BigGenre.Bungei])
        .execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("1-2-3", "5", "json", 3);
    });
  });

  describe("genre", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each(Object.values(Genre))("if genre = %i", async (genre) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["genre", "gzip", "out"]);

      const result = await NarouAPI.search().genre(genre).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(genre.toString(), "5", "json", 3);
    });

    test("if genre = `201-202-9801`", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["genre", "gzip", "out"]);

      const result = await NarouAPI.search()
        .genre([Genre.FantasyHigh, Genre.FantasyLow, Genre.NonGenre])
        .execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("201-202-9801", "5", "json", 3);
    });
  });

  describe("notGenre", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each(Object.values(Genre))("if notGenre = %i", async (notGenre) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["notgenre", "gzip", "out"]);

      const result = await NarouAPI.search().notGenre(notGenre).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(notGenre.toString(), "5", "json", 3);
    });

    test("if notGenre = `201-202-9801`", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["notgenre", "gzip", "out"]);

      const result = await NarouAPI.search()
        .notGenre([Genre.FantasyHigh, Genre.FantasyLow, Genre.NonGenre])
        .execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("201-202-9801", "5", "json", 3);
    });
  });

  describe("userId", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each([1234, 5678, 9012])("if userId = %s", async (userId) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["userid", "gzip", "out"]);

      const result = await NarouAPI.search().userId(userId).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(userId.toString(), "5", "json", 3);
    });

    test("if userId = `1234-5678-9012`", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["userid", "gzip", "out"]);

      const result = await NarouAPI.search()
        .userId([1234, 5678, 9012])
        .execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("1234-5678-9012", "5", "json", 3);
    });
  });

  describe("isR15", () => {
    test("R15の抽出・除外条件を両方保持する", async () => {
      const queries: URLSearchParams[] = [];
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          queries.push(new URL(request.url).searchParams);
          return responseGzipOrJson([{ allcount: 0 }], new URL(request.url));
        })
      );
      for (const first of [true, false]) {
        await NarouAPI.search().gzip(0).isR15(first).isR15(!first).execute();
      }
      expect(queries).toHaveLength(2);
      for (const query of queries) {
        expect(query.get("isr15")).toBe("1");
        expect(query.get("notr15")).toBe("1");
      }
    });

    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test("if isR15 = true", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["isr15", "gzip", "out"]);

      const result = await NarouAPI.search().isR15().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.True.toString(), "5", "json", 3);
    });

    test("if isR15 = false", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["notr15", "gzip", "out"]);

      const result = await NarouAPI.search().isR15(false).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.True.toString(), "5", "json", 3);
    });
  });

  describe("fields", () => {
    test.each(apiEntries)("$name: 別の参照からの項目再指定を保持する", async ({ api }) => {
      const queries: URLSearchParams[] = [];
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          queries.push(url.searchParams);
          return responseGzipOrJson(
            [{ allcount: 1 }, { ncode: "N1234AB", weekly_unique: 100 }],
            url
          );
        })
      );

      const builder = api.search("", new NarouNovelFetch());
      builder.opt(OptionalFields.weekly_unique);
      const first = builder.fields(Fields.title);
      expect(first).toBe(builder);
      expect(builder.fields(Fields.ncode)).toBe(builder);

      // 取得項目の再指定後は、以前の参照から実行しても最後の設定を使用する。
      const result = await first.execute();
      expect(result.values).toEqual([{ ncode: "N1234AB", weekly_unique: 100 }]);
      expect(queries).toHaveLength(1);
      expect(queries[0].get("of")).toBe(Fields.ncode);
      expect(queries[0].get("opt")).toBe(OptionalFields.weekly_unique);
    });

    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each(Object.values(Fields))("if fields = %s", async (field) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["of", "gzip", "out"]);

      const result = await NarouAPI.search().fields(field).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(field, "5", "json", 3);
    });

    test("if fields = `ncode-genre`", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["of", "gzip", "out"]);

      const result = await NarouAPI.search()
        .fields([Fields.ncode, Fields.genre])
        .execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(`${Fields.ncode}-${Fields.genre}`, "5", "json", 3);
    });
  });

  describe("opt", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      await NarouAPI.search().execute();
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each([OptionalFields.weekly_unique])("if opt = %s", async (opt) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["opt", "gzip", "out"]);

      await NarouAPI.search().opt(opt).execute();
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(opt, "5", "json", 3);
    });
  });
});
