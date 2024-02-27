import { NovelSearchBuilderBase } from "./search-builder.js";
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
   * @returns {Promise<NarouSearchResults>} 検索結果
   */
  execute(): Promise<NarouSearchResults<NarouSearchResult, T | TOpt>> {
    return this.api.executeNovel18(this.params);
  }

  r18Site(sites: R18Site | readonly R18Site[]) {
    this.set({ nocgenre: NovelSearchBuilderBase.array2string(sites) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  xid(ids: number | readonly number[]) {
    this.set({ xid: NovelSearchBuilderBase.array2string(ids) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  fields<TFields extends R18Fields>(
    fields: TFields | readonly TFields[]
  ): SearchBuilderR18<SearchResultR18Fields<R18Fields>> {
    this.set({ of: NovelSearchBuilderBase.array2string(fields) });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this as any;
  }

  opt<TFields extends OptionalFields>(
    option: TFields | readonly TFields[]
  ): SearchBuilderR18<T, SearchResultOptionalFields<TFields>> {
    this.set({ opt: NovelSearchBuilderBase.array2string(option) });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this as any;
  }
}
