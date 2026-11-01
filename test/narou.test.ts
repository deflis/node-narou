import NarouAPI, { Fields, R18Fields, RankingType, UserFields } from "../src";
import { describe, it, expect, vi } from "vitest";

// MEMO: このファイルのテストは外部APIを利用するため、結果が変わる可能性がある。
// そのため、結果が変わる可能性が少ないものを選択してテストを行っているが、落ちるようになったら修正が必要。
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
  describe.each(["search", "searchR18"] as const)(
    "%s 日付範囲の片側省略（実API）",
    (searchMethod) => {
      describe.each(["lastUpdate", "lastNovelUpdate"] as const)(
        "%s",
        (dateMethod) => {
          it("終了日時を補完せず送信しても下限で絞り込める", async () => {
            const builder =
              searchMethod === "search"
                ? NarouAPI.search().fields([Fields.ncode])
                : NarouAPI.searchR18().fields([R18Fields.ncode]);
            // 2100年以降の更新は存在しない。条件が無視されれば0件にはならない。
            const from = Math.floor(
              new Date("2100-01-01T00:00:00Z").getTime() / 1000
            );
            const result = await builder
              .limit(1)
              [dateMethod](`${from}-`)
              .execute();

            expect(result.allcount).toBe(0);
            expect(result.values).toHaveLength(0);
          });

          it("開始日時を補完せず送信しても上限で絞り込める", async () => {
            const builder =
              searchMethod === "search"
                ? NarouAPI.search().fields([
                    Fields.ncode,
                    Fields.general_lastup,
                    Fields.novelupdated_at,
                  ])
                : NarouAPI.searchR18().fields([
                    R18Fields.ncode,
                    R18Fields.general_lastup,
                    R18Fields.novelupdated_at,
                  ]);
            const result = await builder
              .limit(1)
              [dateMethod]("-1262304000")
              .execute();

            expect(result.allcount).toBeGreaterThan(0);
            expect(result.values).toHaveLength(1);
            const date =
              dateMethod === "lastUpdate"
                ? result.values[0].general_lastup
                : result.values[0].novelupdated_at;
            // APIの日付表記はJST。上限は2010-01-01T00:00:00Z。
            expect(
              Date.parse(`${date.replace(" ", "T")}+09:00`)
            ).toBeLessThanOrEqual(1262304000000);
          });

          it.each([
            {
              name: "終了日時を省略",
              condition: { from: new Date("2000-01-01T00:00:00Z") },
            },
            {
              name: "開始日時を省略",
              condition: { to: new Date() },
            },
          ])("$name して検索結果を取得できる", async ({ condition }) => {
            const builder =
              searchMethod === "search"
                ? NarouAPI.search().fields([Fields.ncode])
                : NarouAPI.searchR18().fields([R18Fields.ncode]);
            const result = await builder
              .limit(1)
              [dateMethod](condition)
              .execute();

            expect(result.allcount).toBeGreaterThan(0);
            expect(result.values).toHaveLength(1);
            expect(result.values[0].ncode).toEqual(expect.any(String));
          });
        }
      );
    }
  );
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
