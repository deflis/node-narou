import NarouAPI, { Fields, RankingType } from "../src";
import { describe, it, expect, vi } from "vitest"

describe("narou-test", () => {
  // まれに時間がかかるので30秒に設定
  vi.setConfig({ testTimeout: 30000 });

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
    // TODO: pageのテストを書く
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
