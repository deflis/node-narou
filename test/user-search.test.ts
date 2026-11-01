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
  UserFields,
  UserOrder,
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
    http.get("https://api.syosetu.com/userapi/api/", ({ request }) => {
      const url = new URL(request.url);
      const params = url.searchParams;
      const response = [{ allcount: 1 }, { userid: 1234, name: "テストユーザー" }];

      const values = watchParams.map((param) => params.get(param));
      mockFn(...values, params.size);

      return responseGzipOrJson(response, url);
    })
  );
};

const setupHeaderHandler = (mockFn: (...args: unknown[]) => void) => {
  server.use(
    http.get("https://api.syosetu.com/userapi/api/", ({ request }) => {
      const url = new URL(request.url);
      const response = [{ allcount: 1 }, { userid: 1234, name: "テストユーザー" }];

      mockFn(request.headers.get("x-test"));

      return responseGzipOrJson(response, url);
    })
  );
};

describe("UserSearchBuilder", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe("gzip", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);
      const result = await NarouAPI.searchUser().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test("if gzip = 0", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["out"]);

      const result = await NarouAPI.searchUser().gzip(0).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("json", 1);
    });

    test.each([1, 2, 3, 4, 5] as const)("if gzip = %i", async (gzip) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.searchUser().gzip(gzip).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(gzip.toString(), "json", 2);
    });
  });

  describe("execute options", () => {
    test("fetchOptionsがリクエストに渡される", async () => {
      const mockFn = vi.fn();
      setupHeaderHandler(mockFn);

      const result = await NarouAPI.searchUser().execute({
        fetchOptions: { headers: { "x-test": "hello" } },
      });

      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("hello");
    });
  });

  describe("limit", () => {
    test.each(apiEntries)("$name: 戻り値を受け取らずに再指定できる", async ({ api }) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["lim"]);
      const builder = api.searchUser("", new NarouNovelFetch());
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

      const result = await NarouAPI.searchUser().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each([1, 10, 100, 500] as const)("if limit = %i", async (limit) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["lim", "gzip", "out"]);

      const result = await NarouAPI.searchUser().limit(limit).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(limit.toString(), "5", "json", 3);
    });
  });

  describe("start", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.searchUser().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each([1, 10, 100, 500] as const)("if start = %i", async (start) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["st", "gzip", "out"]);

      const result = await NarouAPI.searchUser().start(start).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(start.toString(), "5", "json", 3);
    });
  });

  describe("page", () => {
    test.each(apiEntries)("$name: 再指定は開始位置と件数を上書きし、既定の20件に戻す", async ({ api }) => {
      const queries: URLSearchParams[] = [];
      server.use(
        http.get("https://api.syosetu.com/userapi/api/", ({ request }) => {
          const url = new URL(request.url);
          queries.push(url.searchParams);
          return responseGzipOrJson([{ allcount: 100 }], url);
        })
      );

      const builder = api.searchUser("", new NarouNovelFetch());
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

        const result = await NarouAPI.searchUser().page(page).execute();
        expect(result.start).toBe(page * 20);
        expect(result.page).toBe(page);
        expect(result.allcount).toBe(1);
        expect(result.length).toBe(1);
        expect(result.values).toHaveLength(1);
        expect(result.values[0].userid).toBe(1234);
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

        const result = await NarouAPI.searchUser().page(page, count).execute();
        expect(result.start).toBe(page * count);
        expect(result.page).toBe(page);
        expect(result.allcount).toBe(1);
        expect(result.length).toBe(1);
        expect(result.values).toHaveLength(1);
        expect(result.values[0].userid).toBe(1234);
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

      const result = await NarouAPI.searchUser().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    describe.each(Object.values(UserOrder))("if order = %s", (order) => {
      test(order, async () => {
        const mockFn = vi.fn();
        setupMockHandler(mockFn, ["order", "gzip", "out"]);

        const result = await NarouAPI.searchUser().order(order).execute();
        expect(result.allcount).toBe(1);
        expect(result.length).toBe(1);
        expect(result.values).toHaveLength(1);
        expect(result.values[0].userid).toBe(1234);
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith(order, "5", "json", 3);
      });
    });
  });

  describe("word", () => {
    test.each(apiEntries)("$name: 戻り値を受け取らずに再指定できる", async ({ api }) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["word"]);
      const builder = api.searchUser("初期条件", new NarouNovelFetch());
      builder.word("変更後");

      const result = await builder.execute();
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("変更後", 3);
      expect(result.allcount).toBe(1);
    });

    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.searchUser().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each(["test", "テストユーザー", "1234", "あいう"])("if word = %s", async (word) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["word", "gzip", "out"]);

      const result = await NarouAPI.searchUser().word(word).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(word, "5", "json", 3);
    });
  });

  describe("notWord", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.searchUser().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each(["test", "テストユーザー", "1234", "あいう"])("if notWord = %s", async (word) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["notword", "gzip", "out"]);

      const result = await NarouAPI.searchUser().notWord(word).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(word, "5", "json", 3);
    });
  });

  describe("userId", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.searchUser().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each([1234, 5678, 9012])("if userId = %i", async (userId) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["userid", "gzip", "out"]);

      const result = await NarouAPI.searchUser().userId(userId).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(userId.toString(), "5", "json", 3);
    });
  });

  describe("name1st", () => {
    test.each([null, "", "あ"])(
      "ユーザーのname1st=%sを保持する",
      async (name1st) => {
        server.use(
          http.get("https://api.syosetu.com/userapi/api/", ({ request }) =>
            responseGzipOrJson([{ allcount: 1 }, { name1st }], new URL(request.url))
          )
        );
        const result = await NarouAPI.searchUser()
          .gzip(0)
          .fields(UserFields.name1st)
          .execute();
        expect(result.values).toEqual([{ name1st }]);
      }
    );

    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.searchUser().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each(["あ", "い", "う", "え", "お"])("if name1st = %s", async (name1st) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["name1st", "gzip", "out"]);

      const result = await NarouAPI.searchUser().name1st(name1st).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(name1st, "5", "json", 3);
    });
  });

  describe("minNovel", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.searchUser().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each([1, 10, 100])("if minNovel = %i", async (minNovel) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["minnovel", "gzip", "out"]);

      const result = await NarouAPI.searchUser().minNovel(minNovel).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(minNovel.toString(), "5", "json", 3);
    });
  });

  describe("maxNovel", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.searchUser().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each([10, 100, 1000])("if maxNovel = %i", async (maxNovel) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["maxnovel", "gzip", "out"]);

      const result = await NarouAPI.searchUser().maxNovel(maxNovel).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(maxNovel.toString(), "5", "json", 3);
    });
  });

  describe("minReview", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.searchUser().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each([1, 10, 100])("if minReview = %i", async (minReview) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["minreview", "gzip", "out"]);

      const result = await NarouAPI.searchUser().minReview(minReview).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(minReview.toString(), "5", "json", 3);
    });
  });

  describe("maxReview", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.searchUser().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each([10, 100, 1000])("if maxReview = %i", async (maxReview) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["maxreview", "gzip", "out"]);

      const result = await NarouAPI.searchUser().maxReview(maxReview).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(maxReview.toString(), "5", "json", 3);
    });
  });

  describe("fields", () => {
    test.each(apiEntries)("$name: 別の参照からの項目再指定を保持する", async ({ api }) => {
      const queries: URLSearchParams[] = [];
      server.use(
        http.get("https://api.syosetu.com/userapi/api/", ({ request }) => {
          const url = new URL(request.url);
          queries.push(url.searchParams);
          return responseGzipOrJson(
            [{ allcount: 1 }, { userid: 1234 }],
            url
          );
        })
      );

      const builder = api.searchUser("", new NarouNovelFetch());
      const first = builder.fields(UserFields.name);
      expect(first).toBe(builder);
      expect(builder.fields(UserFields.userid)).toBe(builder);

      // 取得項目の再指定後は、以前の参照から実行しても最後の設定を使用する。
      const result = await first.execute();
      expect(result.values).toEqual([{ userid: 1234 }]);
      expect(queries).toHaveLength(1);
      expect(queries[0].get("of")).toBe(UserFields.userid);
      expect(queries[0].get("opt")).toBe(null);
    });

    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["gzip", "out"]);

      const result = await NarouAPI.searchUser().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test.each(Object.values(UserFields))("if fields = %s", async (field) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["of", "gzip", "out"]);

      const result = await NarouAPI.searchUser().fields(field).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(field, "5", "json", 3);
    });

    test("if fields = `userid-name`", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["of", "gzip", "out"]);

      const result = await NarouAPI.searchUser()
        .fields([UserFields.userid, UserFields.name])
        .execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].userid).toBe(1234);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(`${UserFields.userid}-${UserFields.name}`, "5", "json", 3);
    });
  });
});
