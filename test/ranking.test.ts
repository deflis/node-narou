import {
  describe,
  test,
  expect,
  beforeAll,
  afterEach,
  afterAll,
  vi,
} from "vitest";
import { Fields, NarouRankingResult, ranking, RankingType } from "../src";
import { setupServer } from "msw/node";
import { http } from "msw";
import { addDays, format, parseISO } from "date-fns";
import { responseGzipOrJson } from "./mock";

const server = setupServer();

const setupHeaderHandler = (mockFn: (...args: unknown[]) => void) => {
  server.use(
    http.get("https://api.syosetu.com/rank/rankget/", ({ request }) => {
      const url = new URL(request.url);
      mockFn(request.headers.get("x-test"));
      const response: NarouRankingResult[] = [
        { ncode: "N0001AA", rank: 1, pt: 1000 },
      ];
      return responseGzipOrJson(response, url);
    })
  );
};

describe("RankingBuilder", () => {
  beforeAll(() => {
    vi.useFakeTimers({
      now: new Date("2021-01-01T00:00:00Z"),
      shouldAdvanceTime: true,
    });
    server.listen();
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => {
    vi.useRealTimers();
    server.close();
  });

  describe("type = default", () => {
    test("date = default", async () => {
      const mockFn = vi.fn();
      const yesterday = addDays(Date.now(), -1);

      server.use(
        http.get("https://api.syosetu.com/rank/rankget/", ({ request }) => {
          const url = new URL(request.url);
          mockFn(url.searchParams.get("rtype"), url.searchParams.size);
          const response: NarouRankingResult[] = Array.from(
            { length: 300 },
            (_, i) => ({
              ncode: `N${i.toString().padStart(4, "0")}AA`,
              rank: i + 1,
              pt: 1000 - i,
            })
          );
          return responseGzipOrJson(response, url);
        })
      );

      const result = await ranking().execute();
      expect(result).toHaveLength(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        `${format(yesterday, "yyyyMMdd")}-d`,
        3 // rtype, out, gzip
      );
      expect(result[0].ncode).toBe("N0000AA");
      expect(result[0].rank).toBe(1);
      expect(result[0].pt).toBe(1000);
    });

    test.each([
      [parseISO("2021-01-01"), "20210101-d"],
      [parseISO("2021-12-31"), "20211231-d"],
      [parseISO("2022-01-01"), "20220101-d"],
    ])("date = %p", async (date, expected) => {
      const mockFn = vi.fn();

      server.use(
        http.get("https://api.syosetu.com/rank/rankget/", ({ request }) => {
          const url = new URL(request.url);
          mockFn(url.searchParams.get("rtype"), url.searchParams.size);
          const response: NarouRankingResult[] = Array.from(
            { length: 300 },
            (_, i) => ({
              ncode: `N${i.toString().padStart(4, "0")}AA`,
              rank: i + 1,
              pt: 1000 - i,
            })
          );
          return responseGzipOrJson(response, url);
        })
      );

      const result = await ranking().date(date).execute();
      expect(result).toHaveLength(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        expected,
        3 // rtype, out, gzip
      );
      expect(result[0].ncode).toBe("N0000AA");
      expect(result[0].rank).toBe(1);
      expect(result[0].pt).toBe(1000);
    });
  });

  describe("type = daily", async () => {
    test("date = default", async () => {
      const mockFn = vi.fn();
      const yesterday = addDays(Date.now(), -1);

      server.use(
        http.get("https://api.syosetu.com/rank/rankget/", ({ request }) => {
          const url = new URL(request.url);
          mockFn(url.searchParams.get("rtype"), url.searchParams.size);
          const response: NarouRankingResult[] = Array.from(
            { length: 300 },
            (_, i) => ({
              ncode: `N${i.toString().padStart(4, "0")}AA`,
              rank: i + 1,
              pt: 1000 - i,
            })
          );
          return responseGzipOrJson(response, url);
        })
      );

      const result = await ranking().type(RankingType.Daily).execute();
      expect(result).toHaveLength(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        `${format(yesterday, "yyyyMMdd")}-d`,
        3 // rtype, out, gzip
      );
      expect(result[0].ncode).toBe("N0000AA");
      expect(result[0].rank).toBe(1);
      expect(result[0].pt).toBe(1000);
    });

    test.each([
      [parseISO("2021-01-01"), "20210101-d"],
      [parseISO("2021-12-31"), "20211231-d"],
      [parseISO("2022-01-01"), "20220101-d"],
    ])("date = %p", async (date, expected) => {
      const mockFn = vi.fn();

      server.use(
        http.get("https://api.syosetu.com/rank/rankget/", ({ request }) => {
          const url = new URL(request.url);
          mockFn(url.searchParams.get("rtype"), url.searchParams.size);
          const response: NarouRankingResult[] = Array.from(
            { length: 300 },
            (_, i) => ({
              ncode: `N${i.toString().padStart(4, "0")}AA`,
              rank: i + 1,
              pt: 1000 - i,
            })
          );
          return responseGzipOrJson(response, url);
        })
      );

      const result = await ranking()
        .type(RankingType.Daily)
        .date(date)
        .execute();
      expect(result).toHaveLength(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        expected,
        3 // rtype, out, gzip
      );
      expect(result[0].ncode).toBe("N0000AA");
      expect(result[0].rank).toBe(1);
      expect(result[0].pt).toBe(1000);
    });
  });

  describe("type = weekly", async () => {
    test.skip("date = default", async () => {
      // XXX: 日付の検証がなく自動で正しい日付を指定できないためスキップ
    });

    test.each([
      // 火曜日を指定すると、その週のランキングが取得できる
      [parseISO("2021-01-05"), "20210105-w"],
      [parseISO("2021-12-28"), "20211228-w"],
      [parseISO("2022-01-04"), "20220104-w"],
    ])("date = %p", async (date, expected) => {
      const mockFn = vi.fn();

      server.use(
        http.get("https://api.syosetu.com/rank/rankget/", ({ request }) => {
          const url = new URL(request.url);
          mockFn(url.searchParams.get("rtype"), url.searchParams.size);
          const response: NarouRankingResult[] = Array.from(
            { length: 300 },
            (_, i) => ({
              ncode: `N${i.toString().padStart(4, "0")}AA`,
              rank: i + 1,
              pt: 1000 - i,
            })
          );
          return responseGzipOrJson(response, url);
        })
      );

      const result = await ranking()
        .type(RankingType.Weekly)
        .date(date)
        .execute();
      expect(result).toHaveLength(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        expected,
        3 // rtype, out, gzip
      );
      expect(result[0].ncode).toBe("N0000AA");
      expect(result[0].rank).toBe(1);
      expect(result[0].pt).toBe(1000);
    });
  });

  describe("type = monthly", async () => {
    test.skip("date = default", async () => {
      // XXX: 日付の検証がなく自動で正しい日付を指定できないためスキップ
    });

    test.each([
      // 1日を指定すると、その月のランキングが取得できる
      [parseISO("2021-01-01"), "20210101-m"],
      [parseISO("2022-01-01"), "20220101-m"],
    ])("date = %p", async (date, expected) => {
      const mockFn = vi.fn();

      server.use(
        http.get("https://api.syosetu.com/rank/rankget/", ({ request }) => {
          const url = new URL(request.url);
          mockFn(url.searchParams.get("rtype"), url.searchParams.size);
          const response: NarouRankingResult[] = Array.from(
            { length: 300 },
            (_, i) => ({
              ncode: `N${i.toString().padStart(4, "0")}AA`,
              rank: i + 1,
              pt: 1000 - i,
            })
          );
          return responseGzipOrJson(response, url);
        })
      );

      const result = await ranking()
        .type(RankingType.Monthly)
        .date(date)
        .execute();
      expect(result).toHaveLength(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        expected,
        3 // rtype, out, gzip
      );
      expect(result[0].ncode).toBe("N0000AA");
      expect(result[0].rank).toBe(1);
      expect(result[0].pt).toBe(1000);
    });
  });

  describe("type = quarterly", async () => {
    test.skip("date = default", async () => {
      // XXX: 日付の検証がなく自動で正しい日付を指定できないためスキップ
    });

    test.each([
      // 1日を指定すると、その四半期のランキングが取得できる
      [parseISO("2021-01-01"), "20210101-q"],
      [parseISO("2022-01-01"), "20220101-q"],
    ])("date = %p", async (date, expected) => {
      const mockFn = vi.fn();

      server.use(
        http.get("https://api.syosetu.com/rank/rankget/", ({ request }) => {
          const url = new URL(request.url);
          mockFn(url.searchParams.get("rtype"), url.searchParams.size);
          const response: NarouRankingResult[] = Array.from(
            { length: 300 },
            (_, i) => ({
              ncode: `N${i.toString().padStart(4, "0")}AA`,
              rank: i + 1,
              pt: 1000 - i,
            })
          );
          return responseGzipOrJson(response, url);
        })
      );

      const result = await ranking()
        .type(RankingType.Quarterly)
        .date(date)
        .execute();
      expect(result).toHaveLength(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        expected,
        3 // rtype, out, gzip
      );
      expect(result[0].ncode).toBe("N0000AA");
      expect(result[0].rank).toBe(1);
      expect(result[0].pt).toBe(1000);
    });
  });

  describe("executeWithFields", async () => {
    test("fields = default", async () => {
      const mockFn = vi.fn();
      const mockFn2 = vi.fn();
      const yesterday = addDays(Date.now(), -1);

      server.use(
        http.get("https://api.syosetu.com/rank/rankget/", ({ request }) => {
          const url = new URL(request.url);
          mockFn(url.searchParams.get("rtype"), url.searchParams.size);
          const response: NarouRankingResult[] = Array.from(
            { length: 300 },
            (_, i) => ({
              ncode: `N${i.toString().padStart(4, "0")}AA`,
              rank: i + 1,
              pt: 1000 - i,
            })
          );
          return responseGzipOrJson(response, url);
        }),
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          mockFn2(
            url.searchParams.get("ncode"),
            url.searchParams.get("of"),
            url.searchParams.size
          );
          const response = [
            { allcount: 1 },
            {
              ncode: "N0000AA",
              title: "タイトル",
              writer: "作者",
              story: "あらすじ",
              biggenre: 1,
              genre: 101,
              keyword: ["キーワード"],
              general_firstup: "2021-01-01 00:00:00",
              general_lastup: "2021-01-01 00:00:00",
              novel_type: 1,
              end: 0,
              general_all_no: 100,
              length: 100,
              time: 100,
              isstop: 0,
              isr15: 0,
              isbl: 0,
              isgl: 0,
              iszankoku: 0,
              istensei: 0,
              istenni: 0,
              global_point: 100,
              fav_novel_cnt: 100,
              review_cnt: 100,
              all_point: 100,
              all_hyoka_cnt: 100,
              sasie_cnt: 100,
              kaiwaritu: 100,
              novelupdated_at: "2021-01-01 00:00:00",
              updated_at: "2021-01-01 00:00:00",
            },
          ];
          return responseGzipOrJson(response, url);
        })
      );

      const result = await ranking().executeWithFields();
      expect(result).toHaveLength(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        `${format(yesterday, "yyyyMMdd")}-d`,
        3 // rtype, out, gzip
      );

      expect(mockFn2).toHaveBeenCalledTimes(1);
      expect(mockFn2).toHaveBeenCalledWith(
        Array.from(
          { length: 300 },
          (_, i) => `N${i.toString().padStart(4, "0")}AA`
        ).join("-"),
        "",
        5 // ncode, gzip, out, of, lim
      );
      expect(result[0].ncode).toBe("N0000AA");
      expect(result[0].rank).toBe(1);
      expect(result[0].pt).toBe(1000);
      expect(result[0].title).toBe("タイトル");
      expect(result[0].writer).toBe("作者");
      expect(result[0].story).toBe("あらすじ");
      expect(result[0].biggenre).toBe(1);
      expect(result[0].genre).toBe(101);
      expect(result[0].keyword).toEqual(["キーワード"]);
      expect(result[0].general_firstup).toBe("2021-01-01 00:00:00");
      expect(result[0].general_lastup).toBe("2021-01-01 00:00:00");
      expect(result[0].novel_type).toBe(1);
      expect(result[0].end).toBe(0);
      expect(result[0].general_all_no).toBe(100);
      expect(result[0].length).toBe(100);
      expect(result[0].time).toBe(100);
      expect(result[0].isstop).toBe(0);
      expect(result[0].isr15).toBe(0);
      expect(result[0].isbl).toBe(0);
      expect(result[0].isgl).toBe(0);
      expect(result[0].iszankoku).toBe(0);
      expect(result[0].istensei).toBe(0);
      expect(result[0].istenni).toBe(0);
      expect(result[0].global_point).toBe(100);
      expect(result[0].fav_novel_cnt).toBe(100);
      expect(result[0].review_cnt).toBe(100);
      expect(result[0].all_point).toBe(100);
      expect(result[0].all_hyoka_cnt).toBe(100);
      expect(result[0].sasie_cnt).toBe(100);
      expect(result[0].kaiwaritu).toBe(100);
      expect(result[0].novelupdated_at).toBe("2021-01-01 00:00:00");
      expect(result[0].updated_at).toBe("2021-01-01 00:00:00");
    });

    test("fields = [Fields.title]", async () => {
      const mockFn = vi.fn();
      const mockFn2 = vi.fn();
      const yesterday = addDays(Date.now(), -1);

      server.use(
        http.get("https://api.syosetu.com/rank/rankget/", ({ request }) => {
          const url = new URL(request.url);
          mockFn(url.searchParams.get("rtype"), url.searchParams.size);
          const response: NarouRankingResult[] = Array.from(
            { length: 300 },
            (_, i) => ({
              ncode: `N${i.toString().padStart(4, "0")}AA`,
              rank: i + 1,
              pt: 1000 - i,
            })
          );
          return responseGzipOrJson(response, url);
        }),
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          mockFn2(
            url.searchParams.get("ncode"),
            url.searchParams.get("of"),
            url.searchParams.size
          );
          const response = [
            { allcount: 1 },
            {
              ncode: "N0000AA",
              title: "タイトル",
            },
          ];
          return responseGzipOrJson(response, url);
        })
      );

      const result = await ranking().executeWithFields([Fields.title]);
      expect(result).toHaveLength(300);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(
        `${format(yesterday, "yyyyMMdd")}-d`,
        3 // rtype, out, gzip
      );

      expect(mockFn2).toHaveBeenCalledTimes(1);
      expect(mockFn2).toHaveBeenCalledWith(
        Array.from(
          { length: 300 },
          (_, i) => `N${i.toString().padStart(4, "0")}AA`
        ).join("-"),
        "t-n",
        5 // ncode, gzip, out, of, lim
      );

      expect(result[0].ncode).toBe("N0000AA");
      expect(result[0].title).toBe("タイトル");
    });
  });

  describe("execute options", () => {
    test("fetchOptionsがリクエストに渡される", async () => {
      const mockFn = vi.fn();
      setupHeaderHandler(mockFn);

      const result = await ranking().execute({
        fetchOptions: { headers: { "x-test": "hello" } },
      });

      expect(result).toHaveLength(1);
      expect(result[0].ncode).toBe("N0001AA");
      expect(result[0].rank).toBe(1);
      expect(result[0].pt).toBe(1000);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("hello");
    });
  });

  describe("executeWithFields options", async () => {
    test("fetchOptionsがリクエストに渡される", async () => {
      const mockRankingHeader = vi.fn();
      const mockNovelRequest = vi.fn();

      server.use(
        http.get("https://api.syosetu.com/rank/rankget/", ({ request }) => {
          const url = new URL(request.url);
          mockRankingHeader(request.headers.get("x-test"));
          const response: NarouRankingResult[] = [
            { ncode: "N0001AA", rank: 1, pt: 1000 },
          ];
          return responseGzipOrJson(response, url);
        }),
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          mockRankingHeader(request.headers.get("x-test"));
          mockNovelRequest(
            request.headers.get("x-test"),
            url.searchParams.get("of"),
            url.searchParams.size
          );
          const response = [
            { allcount: 1 },
            { ncode: "N0001AA", title: "タイトル" },
          ];
          return responseGzipOrJson(response, url);
        })
      );

      const result = await ranking().executeWithFields(undefined, undefined, {
        fetchOptions: { headers: { "x-test": "hello" } },
      });

      expect(result).toHaveLength(1);
      expect(result[0].ncode).toBe("N0001AA");
      expect(result[0].title).toBe("タイトル");
      expect(mockRankingHeader).toHaveBeenCalledTimes(2);
      expect(mockRankingHeader).toHaveBeenNthCalledWith(1, "hello");
      expect(mockRankingHeader).toHaveBeenNthCalledWith(2, "hello");
      expect(mockNovelRequest).toHaveBeenCalledTimes(1);
      expect(mockNovelRequest).toHaveBeenCalledWith(
        "hello",
        "",
        5 // ncode, gzip, out, of, lim
      );
    });
  });
});
