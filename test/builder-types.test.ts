import { describe, expectTypeOf, test } from "vitest";
import NarouAPI, {
  Fields,
  OptionalFields,
  R18Fields,
  UserFields,
} from "../src/index.js";
import NarouBrowserAPI from "../src/index.browser.js";
import type {
  DefaultSearchResultFields,
  NarouRankingResult,
  NarouSearchResult,
  UserSearchResult,
} from "../src/index.js";

// executeは呼び出さず、tsc --noEmitで公開APIの型を検証する。
describe.each([
  { name: "Node", api: NarouAPI },
  { name: "browser", api: NarouBrowserAPI },
])("$name builder types", ({ api }) => {
  test("通常検索のデフォルト項目", () => {
    const builder = api.search();

    expectTypeOf<
      Awaited<ReturnType<typeof builder.execute>>["values"]
    >().toEqualTypeOf<
      readonly Pick<NarouSearchResult, DefaultSearchResultFields>[]
    >();
  });

  test("通常検索の単一項目とreadonly配列", () => {
    const single = api.search().fields(Fields.title);
    const multiple = api.search().fields([Fields.title, Fields.ncode] as const);

    expectTypeOf<
      Awaited<ReturnType<typeof single.execute>>["values"]
    >().toEqualTypeOf<readonly { title: string }[]>();
    expectTypeOf<
      Awaited<ReturnType<typeof multiple.execute>>["values"]
    >().toEqualTypeOf<readonly { title: string; ncode: string }[]>();
  });

  test("項目未指定時はnovel_typeを返す", () => {
    const novel = api.search();
    const r18 = api.searchR18();

    expectTypeOf<Awaited<ReturnType<typeof novel.execute>>["values"][number]>()
      .toHaveProperty("novel_type")
      .toEqualTypeOf<1 | 2>();
    expectTypeOf<
      Awaited<ReturnType<typeof novel.execute>>["values"][number]
    >().not.toHaveProperty("noveltype");
    expectTypeOf<Awaited<ReturnType<typeof r18.execute>>["values"][number]>()
      .toHaveProperty("novel_type")
      .toEqualTypeOf<1 | 2>();
    expectTypeOf<
      Awaited<ReturnType<typeof r18.execute>>["values"][number]
    >().not.toHaveProperty("noveltype");
  });

  test("of=nt指定時はnovel_typeではなくnoveltypeを返す", () => {
    const novel = api.search().fields(Fields.noveltype);
    const r18 = api.searchR18().fields(R18Fields.noveltype);

    expectTypeOf<
      Awaited<ReturnType<typeof novel.execute>>["values"]
    >().toEqualTypeOf<readonly { noveltype: 1 | 2 }[]>();
    expectTypeOf<
      Awaited<ReturnType<typeof r18.execute>>["values"]
    >().toEqualTypeOf<readonly { noveltype: 1 | 2 }[]>();
  });

  test("R18検索はuseridを取得項目に含めない", () => {
    const r18 = api.searchR18();
    const novel = api.search();
    expectTypeOf<
      Awaited<ReturnType<typeof r18.execute>>["values"][number]
    >().not.toHaveProperty("userid");
    expectTypeOf<
      Awaited<ReturnType<typeof novel.execute>>["values"][number]
    >().toHaveProperty("userid").toEqualTypeOf<number>();
    expectTypeOf(R18Fields).not.toHaveProperty("userid");

    function invalidUsage() {
      // @ts-expect-error R18 APIはユーザーIDの出力に対応していない
      api.searchR18().fields(Fields.userid);
    }
    expectTypeOf(invalidUsage).returns.toBeVoid();
  });

  test("通常検索のoptとfieldsの順序に依存しない型推論", () => {
    const optFirst = api
      .search()
      .opt(OptionalFields.weekly_unique)
      .fields(Fields.title);
    const fieldsFirst = api
      .search()
      .fields(Fields.title)
      .opt([OptionalFields.weekly_unique] as const);

    expectTypeOf<
      Awaited<ReturnType<typeof optFirst.execute>>["values"]
    >().toEqualTypeOf<readonly { title: string; weekly_unique: number }[]>();
    expectTypeOf<
      Awaited<ReturnType<typeof fieldsFirst.execute>>["values"]
    >().toEqualTypeOf<readonly { title: string; weekly_unique: number }[]>();
  });

  test("通常検索の条件チェーンと取得項目の再指定", () => {
    const builder = api
      .search()
      .fields([Fields.title, Fields.ncode])
      .opt(OptionalFields.weekly_unique)
      .word("test")
      .length({ min: 100 })
      .page(1, 10)
      .fields(Fields.title);

    expectTypeOf<
      Awaited<ReturnType<typeof builder.execute>>["values"]
    >().toEqualTypeOf<readonly { title: string; weekly_unique: number }[]>();
  });

  test("R18検索の専用項目と条件チェーン", () => {
    const builder = api
      .searchR18()
      .fields([R18Fields.title, R18Fields.nocgenre] as const)
      .opt(OptionalFields.weekly_unique)
      .xid([1, 2])
      .word("test")
      .limit(10);

    expectTypeOf<
      Awaited<ReturnType<typeof builder.execute>>["values"]
    >().toEqualTypeOf<
      readonly {
        title: string;
        nocgenre: NarouSearchResult["nocgenre"];
        weekly_unique: number;
      }[]
    >();
  });

  test("ユーザー検索のデフォルト項目", () => {
    const builder = api.searchUser();

    expectTypeOf<
      Awaited<ReturnType<typeof builder.execute>>["values"]
    >().toEqualTypeOf<readonly UserSearchResult[]>();
  });

  test("ユーザー検索の単一項目とreadonly配列", () => {
    const single = api.searchUser().fields(UserFields.name);
    const multiple = api
      .searchUser()
      .fields([UserFields.name, UserFields.userid] as const);

    expectTypeOf<
      Awaited<ReturnType<typeof single.execute>>["values"]
    >().toEqualTypeOf<readonly { name: string }[]>();
    expectTypeOf<
      Awaited<ReturnType<typeof multiple.execute>>["values"]
    >().toEqualTypeOf<readonly { name: string; userid: number }[]>();
  });

  test("ユーザー検索の条件チェーンと取得項目の再指定", () => {
    const builder = api
      .searchUser()
      .fields([UserFields.name, UserFields.userid])
      .word("test")
      .minNovel(1)
      .page(1, 10)
      .fields(UserFields.userid);

    expectTypeOf<
      Awaited<ReturnType<typeof builder.execute>>["values"]
    >().toEqualTypeOf<readonly { userid: number }[]>();
  });

  test("ランキングの基本結果とデフォルトの詳細項目", () => {
    const builder = api.ranking();

    expectTypeOf(builder.execute).returns.toEqualTypeOf<
      Promise<NarouRankingResult[]>
    >();
    expectTypeOf(() => builder.executeWithFields()).returns.toEqualTypeOf<
      Promise<
        (NarouRankingResult &
          Partial<Pick<NarouSearchResult, DefaultSearchResultFields>>)[]
      >
    >();
  });

  test("ランキングの取得項目の指定とオプションの組み合わせ", () => {
    const builder = api.ranking();

    expectTypeOf(() =>
      builder.executeWithFields(Fields.title)
    ).returns.toEqualTypeOf<
      Promise<(NarouRankingResult & { title?: string })[]>
    >();
    expectTypeOf(() =>
      builder.executeWithFields(
        [Fields.title, Fields.writer],
        [OptionalFields.weekly_unique]
      )
    ).returns.toEqualTypeOf<
      Promise<
        (NarouRankingResult & {
          title?: string;
          writer?: string;
          weekly_unique?: number;
        })[]
      >
    >();
    expectTypeOf(() =>
      builder.executeWithFields([], OptionalFields.weekly_unique)
    ).returns.toEqualTypeOf<
      Promise<
        (NarouRankingResult &
          Partial<
            Pick<NarouSearchResult, DefaultSearchResultFields | "weekly_unique">
          >)[]
      >
    >();
  });

  test("未取得の項目と他API専用のフィールドを型で拒否", () => {
    // この関数は実行せず、@ts-expect-errorが有効かを型チェックする。
    function invalidUsage() {
      // @ts-expect-error 通常検索ではR18専用のフィールドを指定できない
      api.search().fields(R18Fields.nocgenre);
      // @ts-expect-error R18検索では通常検索専用のフィールドを指定できない
      api.searchR18().fields(Fields.genre);
      // @ts-expect-error ユーザー検索では小説タイトルを指定できない
      api.searchUser().fields(Fields.title);

      const result = api.search().fields(Fields.title).execute();
      void result.then(({ values }) => {
        // @ts-expect-error 未取得のncodeは参照できない
        return values[0].ncode;
      });
    }

    expectTypeOf(invalidUsage).returns.toBeVoid();
  });
});
