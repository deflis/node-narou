import { NovelSearchBuilderBase } from "./search-builder.js";
import type { ExecuteOptions } from "./narou.js";
import type NarouSearchResults from "./narou-search-results.js";
import type {
  NarouSearchResult,
  SearchResultR18Fields,
  SearchResultOptionalFields,
} from "./narou-search-results.js";
import type {
  R18Site,
  SearchResultFieldNames,
  R18Fields,
  OptionalFields,
} from "./params.js";

export type DefaultR18SearchResultFields = keyof Omit<
  NarouSearchResult,
  "weekly_unique" | "noveltype" | "biggenre" | "genre" | "isr15" | "id"
>;

/**
 * 18禁API検索ヘルパー
 * @class SearchBuilderR18
 */
export default class SearchBuilderR18<
  T extends SearchResultFieldNames = DefaultR18SearchResultFields,
  TOpt extends keyof NarouSearchResult = never
> extends NovelSearchBuilderBase<T | TOpt> {
  /**
   * なろう小説APIへの検索リクエストを実行する
   * @override
   * @param options 実行オプション
   * @returns {Promise<NarouSearchResults>} 検索結果
   */
  execute(
    options?: ExecuteOptions
  ): Promise<NarouSearchResults<NarouSearchResult, T | TOpt>> {
    return this.api.executeNovel18(this.params, options);
  }

  /**
   * 抽出するR18サイトを指定します (nocgenre)。
   * @param sites R18サイトコード、またはR18サイトコードの配列 (1: ノクターンノベルズ, 2: ムーンライトノベルズ(男性向け), 3: ムーンライトノベルズ(BL), 4: ミッドナイトノベルズ)
   * @return {this}
   */
  r18Site(sites: R18Site | readonly R18Site[]) {
    this.set({ nocgenre: NovelSearchBuilderBase.array2string(sites) });
    return this;
  }

  /**
   * X-IDを指定して取得します (xid)。
   * @param ids X-ID、またはX-IDの配列
   * @return {this}
   */
  xid(ids: number | readonly number[]) {
    this.set({ xid: NovelSearchBuilderBase.array2string(ids) });
    return this;
  }

  /**
   * 出力する項目を個別に指定します (of)。
   * 未指定時は全項目出力されます。転送量軽減のため、このパラメータの使用が推奨されます。
   * @param fields 出力するR18フィールド名、またはR18フィールド名の配列
   * @return {SearchBuilderR18<SearchResultR18Fields<R18Fields>>} 型が更新されたビルダー
   */
  fields<TFields extends R18Fields>(
    fields: TFields | readonly TFields[]
  ): SearchBuilderR18<SearchResultR18Fields<R18Fields>> {
    this.set({ of: NovelSearchBuilderBase.array2string(fields) });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this as any;
  }

  /**
   * 出力オプション項目を指定します (opt)。
   * @param option 出力するオプションフィールド名、またはオプションフィールド名の配列
   * @return {SearchBuilderR18<T, SearchResultOptionalFields<TFields>>} 型が更新されたビルダー
   */
  opt<TFields extends OptionalFields>(
    option: TFields | readonly TFields[]
  ): SearchBuilderR18<T, SearchResultOptionalFields<TFields>> {
    this.set({ opt: NovelSearchBuilderBase.array2string(option) });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this as any;
  }
}
