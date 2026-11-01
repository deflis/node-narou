import { afterEach, describe, expect, test, vi } from "vitest";
import { search, searchR18 } from "../src/index.js";
import type {
  DateSearchCondition,
  NumberSearchCondition,
  SearchParams,
} from "../src/index.js";
import NarouNovelFetch from "../src/narou-fetch.js";

// 公開APIに渡す直前のパラメータを検証し、外部通信は行わない。
describe.each([search, searchR18])(
  "オブジェクト検索条件: %s",
  (createBuilder) => {
    afterEach(() => vi.restoreAllMocks());

    function setup() {
      const api = new NarouNovelFetch();
      const execute = vi.fn<(params: SearchParams) => Promise<never>>();
      api.executeNovel = execute;
      api.executeNovel18 = execute;
      return { builder: createBuilder("", api), execute };
    }

    describe.each(["length", "kaiwaritu", "sasie", "time"] as const)(
      "%s",
      (method) => {
        test.each<[NumberSearchCondition, string]>([
          [{ min: 0 }, "0-"],
          [{ max: 10 }, "-10"],
          [{ min: 0, max: 10 }, "0-10"],
          [{ min: 10, max: 10 }, "10-10"],
        ])("%j → %s", async (condition, expected) => {
          const { builder, execute } = setup();
          expect(builder[method](condition)).toBe(builder);
          await builder.execute();
          expect(execute).toHaveBeenCalledWith(
            { [method]: expected },
            undefined
          );
        });

        test.each([
          {},
          { min: 2, max: 1 },
          { min: NaN },
          { max: Infinity },
          { min: -1 },
          { max: 1.5 },
        ])("不正な条件 %j を拒否", (condition) => {
          const { builder, execute } = setup();
          expect(() =>
            builder[method](condition as NumberSearchCondition)
          ).toThrow();
          expect(execute).not.toHaveBeenCalled();
        });
      }
    );

    describe.each([
      ["lastUpdate", "lastup"],
      ["lastNovelUpdate", "lastupdate"],
    ] as const)("%s", (method, param) => {
      test.each<[DateSearchCondition, string]>([
        [{ from: 0 }, "0-20"],
        [{ from: new Date(10999) }, "10-20"],
        [{ to: 0 }, "0-0"],
        [{ to: new Date(10999) }, "0-10"],
        [{ from: new Date(0), to: 10 }, "0-10"],
        [{ from: 10, to: new Date(10999) }, "10-10"],
      ])("%j → %s", async (condition, expected) => {
        vi.spyOn(Date, "now").mockReturnValue(20999);
        const { builder, execute } = setup();
        expect(builder[method](condition)).toBe(builder);
        await builder.execute();
        expect(execute).toHaveBeenCalledWith({ [param]: expected }, undefined);
      });

      test("終了省略時の現在時刻は条件指定時に確定する", async () => {
        const now = vi.spyOn(Date, "now").mockReturnValue(20999);
        const { builder, execute } = setup();
        builder[method]({ from: 10 });
        now.mockReturnValue(30999);
        await builder.execute();
        expect(execute).toHaveBeenCalledWith({ [param]: "10-20" }, undefined);
      });

      test.each([
        "thisweek",
        "lastweek",
        "sevenday",
        "thismonth",
        "lastmonth",
        "0-10",
        "20260101000000",
      ])("既存の文字列 %s はそのまま渡す", async (value) => {
        const { builder, execute } = setup();
        await builder[method](value).execute();
        expect(execute).toHaveBeenCalledWith({ [param]: value }, undefined);
      });

      test("既存の日時2引数は数値・Dateとも維持", async () => {
        const { builder, execute } = setup();
        await builder[method](0, 10).execute();
        expect(execute).toHaveBeenLastCalledWith(
          { [param]: "0-10" },
          undefined
        );
        await builder[method](new Date(0), new Date(10999)).execute();
        expect(execute).toHaveBeenLastCalledWith(
          { [param]: "0-10" },
          undefined
        );
      });

      test.each<[number | Date, string]>([
        [0, "0-0"],
        [10, "10-10"],
        [new Date(10999), "10-10"],
      ])("単一日時 %s → %s", async (value, expected) => {
        const { builder, execute } = setup();
        expect(builder[method](value)).toBe(builder);
        await builder.execute();
        expect(execute).toHaveBeenCalledWith({ [param]: expected }, undefined);
      });

      test.each([new Date(NaN), -1, Infinity, 0.5])(
        "無効な単一日時 %s を拒否",
        (value) => {
          const { builder } = setup();
          expect(() => builder[method](value)).toThrow();
        }
      );

      test.each([
        {},
        { from: 2, to: 1 },
        { from: new Date(NaN) },
        { to: Infinity },
        { from: -1 },
      ])("不正な条件 %j を拒否", (condition) => {
        const { builder, execute } = setup();
        expect(() =>
          builder[method](condition as DateSearchCondition)
        ).toThrow();
        expect(execute).not.toHaveBeenCalled();
      });
    });

    test("既存形式とオブジェクト形式をチェーンし、条件を上書きできる", async () => {
      const { builder, execute } = setup();
      await builder
        .length([10, 20])
        .length({ min: 5, max: 30 })
        .length(15)
        .sasie([0, 0])
        .time(10)
        .kaiwaritu(10, 20)
        .lastUpdate("thisweek")
        .lastNovelUpdate(new Date(0), new Date(10000))
        .execute();
      expect(execute).toHaveBeenCalledWith(
        {
          length: "15",
          sasie: "0",
          time: "10",
          kaiwaritu: "10-20",
          lastup: "thisweek",
          lastupdate: "0-10",
        },
        undefined
      );
    });
  }
);

test("無効なオブジェクト条件を型で拒否", () => {
  const builder = search();
  function invalidConditions() {
    // @ts-expect-error 空の条件は指定できない
    builder.length({});
    // @ts-expect-error 一致条件は値を直接渡す
    builder.time({ exact: 1, min: 0 });
    // @ts-expect-error 数値には min/max を使う
    builder.sasie({ before: 10 });
    // @ts-expect-error 日付には from/to を使う
    builder.lastUpdate({ min: 0 });
    // @ts-expect-error 日付の一致条件は値を直接渡す
    builder.lastNovelUpdate({ exact: new Date(), from: 0 });
  }
  expect(invalidConditions).toBeTypeOf("function");
});
