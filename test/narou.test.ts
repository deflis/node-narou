import NarouAPI, { Fields, R18Fields, RankingType, UserFields } from "../src";
import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { http } from "msw";
import { responseGzipOrJson } from "./mock";

const rankingEntries = Array.from({ length: 300 }, (_, index) => ({
  ncode: index === 0 ? "N5180FZ" : `N${(index + 1).toString().padStart(6, "0")}`,
  pt: index === 0 ? 3403 : 1000 - index,
  rank: index + 1,
}));

const rankingHistoryEntries = [
  { rtype: "20200426-d", pt: 308, rank: 169 },
  { rtype: "20200512-w", pt: 2496, rank: 159 },
  { rtype: "20200601-m", pt: 8882, rank: 197 },
  { rtype: "20200801-q", pt: 17562, rank: 282 },
];

const searchResponse = (url: URL) =>
  responseGzipOrJson(
    [
      { allcount: 10 },
      { ncode: "NTEST1", userid: 1 },
    ],
    url
  );

const ncodeSearchResponse = (ncodeParam: string, url: URL) => {
  const ncodes = ncodeParam.split("-");
  const results = ncodes.map((code) => ({
    ncode: code.toUpperCase(),
    userid: code.toUpperCase() === "N5180FZ" ? 636551 : 123456,
  }));
  return responseGzipOrJson([{ allcount: ncodes.length }, ...results], url);
};

const userSearchResponse = (url: URL) =>
  responseGzipOrJson(
    [
      { allcount: 5 },
      { userid: 1000 },
    ],
    url
  );

const rankingResponse = (url: URL) => responseGzipOrJson(rankingEntries, url);

const rankingHistoryResponse = (ncode: string, url: URL) => {
  if (ncode.toLowerCase() === "n0000a") {
    return responseGzipOrJson("Error: Novel not found.", url);
  }
  return responseGzipOrJson(rankingHistoryEntries, url);
};

const server = setupServer(
  http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
    const url = new URL(request.url);
    const ncodeParam = url.searchParams.get("ncode");
    if (ncodeParam) {
      return ncodeSearchResponse(ncodeParam, url);
    }
    return searchResponse(url);
  }),
  http.get("https://api.syosetu.com/novel18api/api/", ({ request }) => {
    const url = new URL(request.url);
    const ncodeParam = url.searchParams.get("ncode");
    if (ncodeParam) {
      return ncodeSearchResponse(ncodeParam, url);
    }
    return searchResponse(url);
  }),
  http.get("https://api.syosetu.com/userapi/api/", ({ request }) => {
    const url = new URL(request.url);
    return userSearchResponse(url);
  }),
  http.get("https://api.syosetu.com/rank/rankget/", ({ request }) => {
    const url = new URL(request.url);
    return rankingResponse(url);
  }),
  http.get("https://api.syosetu.com/rank/rankin/", ({ request }) => {
    const url = new URL(request.url);
    const ncode = url.searchParams.get("ncode") ?? "";
    return rankingHistoryResponse(ncode, url);
  })
);

// MEMO: このファイルのテストは外部APIを利用するため、結果が変わる可能性がある。
// そのため、結果が変わる可能性が少ないものを選択してテストを行っているが、落ちるようになったら修正が必要。
describe("narou-test", () => {
  // まれに時間がかかるので30秒に設定
  vi.setConfig({ testTimeout: 30000 });

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe("search", () => {
    it("if limit = 1 then length = 1", async () => {
      const result = await NarouAPI.search()
        .limit(1)
        .fields([Fields.ncode])
        .execute();
      expect(result.allcount).toBeGreaterThan(1);
      expect(result.limit).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
    });
    it("if gzip = 0", async () => {
      const result = await NarouAPI.search()
        .limit(1)
        .fields([Fields.ncode])
        .gzip(0)
        .execute();
      expect(result.allcount).toBeGreaterThan(1);
      expect(result.limit).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
    });
  });
  describe("searchR18", () => {
    it("if limit = 1 then length = 1", async () => {
      const result = await NarouAPI.searchR18()
        .limit(1)
        .fields([R18Fields.ncode])
        .execute();
      expect(result.allcount).toBeGreaterThan(1);
      expect(result.limit).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
    });
  });
  describe("searchUser", () => {
    it("if limit = 1 then length = 1", async () => {
      const result = await NarouAPI.searchUser()
        .limit(1)
        .fields([UserFields.userid])
        .execute();
      expect(result.allcount).toBeGreaterThan(1);
      expect(result.limit).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
    });
  });
  describe("ranking", () => {
    // 2020/02/01のランキングをテスト
    // https://ranking.riel.live/ranking/d/2020-02-01
    it("2020/02/01 is length 300", async () => {
      const result = await NarouAPI.ranking()
        .date(new Date(2020, 1, 1))
        .execute();
      expect(result).toHaveLength(300);
      // エルディアス・ロードのランキングが1位になっていることを確認
      expect(result[0].ncode.toLowerCase()).toBe("n5180fz");
      expect(result[0].rank).toBe(1);
      expect(result[0].pt).toBe(3403);
    });
    it("2020/02/01 with fields is length 300", async () => {
      const result = await NarouAPI.ranking()
        .date(new Date(2020, 1, 1))
        .executeWithFields([Fields.ncode, Fields.userid]);
      expect(result).toHaveLength(300);
      // エルディアス・ロードのランキングが1位になっていることを確認
      expect(result[0].ncode.toLowerCase()).toBe("n5180fz");
      expect(result[0].rank).toBe(1);
      expect(result[0].pt).toBe(3403);
      expect(result[0].userid).toBe(636551);
      // 変更される可能性があるので内容のテストはできないのでしてない。
    });
  });
  describe("history", () => {
    it("Error: Novel not found.", async () => {
      await expect(
        async () => await NarouAPI.rankingHistory("n0000a")
      ).rejects.toBe("Error: Novel not found.");
    });
    // 植物モンスター娘の日記のランキング履歴をテスト
    // https://ranking.riel.live/detail/n4444ge
    // ランキング履歴は削除されても残っていて変更される可能性がないので、過去のデータを検証する
    it("n4444ge", async () => {
      const result = await NarouAPI.rankingHistory("n4444ge");
      expect(result.length).toBeGreaterThan(1);
      const daily = result.filter(
        ({ date, type }) =>
          // 2020年04月26日(日)	の日間ランキング
          date.getFullYear() === 2020 &&
          date.getMonth() === 3 &&
          date.getDate() === 26 &&
          type === RankingType.Daily
      );
      expect(daily).toHaveLength(1);
      expect(daily[0].rank).toBe(169);
      expect(daily[0].pt).toBe(308);

      const weekly = result.filter(
        ({ date, type }) =>
          // 2020年05月12日(火)	の週間ランキング
          date.getFullYear() === 2020 &&
          date.getMonth() === 4 &&
          date.getDate() === 12 &&
          type === RankingType.Weekly
      );
      expect(weekly).toHaveLength(1);
      expect(weekly[0].rank).toBe(159);
      expect(weekly[0].pt).toBe(2496);

      const monthly = result.filter(
        ({ date, type }) =>
          // 2020年06月01日(月)	の月間ランキング
          date.getFullYear() === 2020 &&
          date.getMonth() === 5 &&
          date.getDate() === 1 &&
          type === RankingType.Monthly
      );
      expect(monthly).toHaveLength(1);
      expect(monthly[0].rank).toBe(197);
      expect(monthly[0].pt).toBe(8882);

      const quarterly = result.filter(
        ({ date, type }) =>
          // 2020年08月01日(土)	の四半期ランキング
          date.getFullYear() === 2020 &&
          date.getMonth() === 7 &&
          date.getDate() === 1 &&
          type === RankingType.Quarterly
      );
      expect(quarterly).toHaveLength(1);
      expect(quarterly[0].rank).toBe(282);
      expect(quarterly[0].pt).toBe(17562);
    });
  });
});
