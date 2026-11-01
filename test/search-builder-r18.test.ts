import {
  beforeAll,
  afterAll,
  afterEach,
  describe,
  test,
  expect,
  expectTypeOf,
  vi,
} from "vitest";
import { setupServer } from "msw/node";
import { responseGzipOrJson } from "./mock";
import NarouAPI, {
  OptionalFields,
  R18Fields,
  R18Site,
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
  watchParams: string[] = ["out"],
  novel: { ncode?: string; title?: string }
) => {
  server.use(
    http.get("https://api.syosetu.com/novel18api/api/", ({ request }) => {
      const url = new URL(request.url);
      const params = url.searchParams;
      const response = [{ allcount: 1 }, novel];

      const values = watchParams.map(param => params.get(param));
      mockFn(...values, params.size);

      return responseGzipOrJson(response, url);
    })
  );
};

const setupHeaderHandler = (mockFn: (...args: unknown[]) => void) => {
  server.use(
    http.get("https://api.syosetu.com/novel18api/api/", ({ request }) => {
      const url = new URL(request.url);
      const response = [{ allcount: 1 }, { ncode: "N1234AB" }];

      mockFn(request.headers.get("x-test"));

      return responseGzipOrJson(response, url);
    })
  );
};

describe("SearchBuilderR18", () => {
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
          http.get(`https://api.syosetu.com/novel18api/api/`, ({ request }) => {
            queries.push(new URL(request.url).searchParams);
            return responseGzipOrJson([{ allcount: 0 }], new URL(request.url));
          })
        );
        for (const first of [true, false]) {
          const result = await NarouAPI.searchR18()
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

  describe("word", () => {
    test.each(apiEntries)("$name: 戻り値を受け取らずに再指定できる", async ({ api }) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["word"], { ncode: "N1234AB" });
      const builder = api.searchR18("初期条件", new NarouNovelFetch());
      builder.word("変更後");

      const result = await builder.execute();
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("変更後", 3);
      expect(result.allcount).toBe(1);
    });
  });

  describe("limit", () => {
    test.each(apiEntries)("$name: 戻り値を受け取らずに再指定できる", async ({ api }) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["lim"], { ncode: "N1234AB" });
      const builder = api.searchR18("", new NarouNovelFetch());
      builder.limit(3);
      builder.limit(10);

      const result = await builder.execute();
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("10", 3);
      expect(result.limit).toBe(10);
    });
  });

  describe("page", () => {
    test.each(apiEntries)("$name: 再指定は開始位置と件数を上書きし、既定の20件に戻す", async ({ api }) => {
      const queries: URLSearchParams[] = [];
      server.use(
        http.get("https://api.syosetu.com/novel18api/api/", ({ request }) => {
          const url = new URL(request.url);
          queries.push(url.searchParams);
          return responseGzipOrJson([{ allcount: 100 }], url);
        })
      );

      const builder = api.searchR18("", new NarouNovelFetch());
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

    test.each([0, 1, 2])("page=%iの従来の開始位置を維持する", async (page) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["st", "lim"], { ncode: "N1234AB" });
      const result = await NarouAPI.searchR18().page(page, 20).execute();
      expect(mockFn).toHaveBeenCalledWith(String(page * 20), "20", 4);
      expect(result.start).toBe(page * 20);
      expect(result.page).toBe(page);
    });
  });

  describe("execute", () => {
    test("execute should call executeNovel18", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["out"], { ncode: "N1234AB" });

      const result = await NarouAPI.searchR18().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("json", 2);
    });
  });

  describe("r18Site", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["nocgenre", "out"], { ncode: "N1234AB" });

      const result = await NarouAPI.searchR18().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(null, "json", 2);
    });

    test.each(Object.values(R18Site))("if r18Site = %i", async (site) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["nocgenre", "out"], { ncode: "N1234AB" });

      const result = await NarouAPI.searchR18().r18Site(site).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(site.toString(), "json", 3);
    });

    test("if r18Site = [1, 2, 3]", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["nocgenre", "out"], { ncode: "N1234AB" });

      const result = await NarouAPI.searchR18()
        .r18Site([R18Site.Nocturne, R18Site.MoonLight, R18Site.MoonLightBL])
        .execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("1-2-3", "json", 3);
    });
  });

  describe("execute options", () => {
    test("fetchOptionsがリクエストに渡される", async () => {
      const mockFn = vi.fn();
      setupHeaderHandler(mockFn);

      const result = await NarouAPI.searchR18().execute({
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

  describe("xid", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["xid", "out"], { ncode: "N1234AB" });

      const result = await NarouAPI.searchR18().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(null, "json", 2);
    });

    test.each([123, 456, 789])("if xid = %i", async (id) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["xid", "out"], { ncode: "N1234AB" });

      const result = await NarouAPI.searchR18().xid(id).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(id.toString(), "json", 3);
    });

    test("if xid = [123, 456, 789]", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["xid", "out"], { ncode: "N1234AB" });

      const result = await NarouAPI.searchR18().xid([123, 456, 789]).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("123-456-789", "json", 3);
    });
  });

  describe("fields", () => {
    test.each(apiEntries)("$name: 別の参照からの項目再指定を保持する", async ({ api }) => {
      const queries: URLSearchParams[] = [];
      server.use(
        http.get("https://api.syosetu.com/novel18api/api/", ({ request }) => {
          const url = new URL(request.url);
          queries.push(url.searchParams);
          return responseGzipOrJson(
            [{ allcount: 1 }, { ncode: "N1234AB", weekly_unique: 100 }],
            url
          );
        })
      );

      const builder = api.searchR18("", new NarouNovelFetch());
      builder.opt(OptionalFields.weekly_unique);
      const first = builder.fields(R18Fields.title);
      expect(first).toBe(builder);
      expect(builder.fields(R18Fields.ncode)).toBe(builder);

      // 取得項目の再指定後は、以前の参照から実行しても最後の設定を使用する。
      const result = await first.execute();
      expect(result.values).toEqual([{ ncode: "N1234AB", weekly_unique: 100 }]);
      expect(queries).toHaveLength(1);
      expect(queries[0].get("of")).toBe(R18Fields.ncode);
      expect(queries[0].get("opt")).toBe(OptionalFields.weekly_unique);
    });

    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["of", "out"], { ncode: "N1234AB" });

      const result = await NarouAPI.searchR18().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(null, "json", 2);
    });

    test("if fields = R18Fields.title", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["of", "out"], { title: "テスト作品" });

      const result = await NarouAPI.searchR18()
        .fields(R18Fields.title)
        .execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].title).toBe("テスト作品");
      expectTypeOf(result.values).toEqualTypeOf<readonly { title: string }[]>();
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("t", "json", 3);
    });

    test("if fields = [R18Fields.title, R18Fields.ncode]", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["of", "out"], { ncode: "N1234AB" });

      const result = await NarouAPI.searchR18()
        .fields([R18Fields.title, R18Fields.ncode])
        .execute();
      expectTypeOf(result.values).toEqualTypeOf<
        readonly { title: string; ncode: string }[]
      >();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("t-n", "json", 3);
    });

    test("readonly fields should narrow the result type", () => {
      const fields = [R18Fields.title, R18Fields.ncode] as const;
      const builder = NarouAPI.searchR18().fields(fields);

      expectTypeOf<Awaited<ReturnType<typeof builder.execute>>["values"]>()
        .toEqualTypeOf<readonly { title: string; ncode: string }[]>();
    });

    test("fields should preserve optional fields in either chain order", () => {
      const optFirst = NarouAPI.searchR18()
        .opt(OptionalFields.weekly_unique)
        .fields(R18Fields.title);
      const fieldsFirst = NarouAPI.searchR18()
        .fields(R18Fields.title)
        .opt(OptionalFields.weekly_unique);

      expectTypeOf<Awaited<ReturnType<typeof optFirst.execute>>["values"]>()
        .toEqualTypeOf<readonly { title: string; weekly_unique: number }[]>();
      expectTypeOf<Awaited<ReturnType<typeof fieldsFirst.execute>>["values"]>()
        .toEqualTypeOf<readonly { title: string; weekly_unique: number }[]>();
    });

    test("fields should replace previously selected fields", () => {
      const builder = NarouAPI.searchR18()
        .fields([R18Fields.title, R18Fields.ncode])
        .fields(R18Fields.title);

      expectTypeOf<Awaited<ReturnType<typeof builder.execute>>["values"]>()
        .toEqualTypeOf<readonly { title: string }[]>();
    });
  });

  describe("opt", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["opt", "out"], { ncode: "N1234AB" });

      const result = await NarouAPI.searchR18().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(null, "json", 2);
    });

    test("if opt = OptionalFields.weekly_unique", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["opt", "out"], { ncode: "N1234AB" });

      const result = await NarouAPI.searchR18()
        .opt(OptionalFields.weekly_unique)
        .execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("weekly", "json", 3);
    });
  });
});
