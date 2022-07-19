import { SearchBuilderBase } from "./search-builder";
import NarouSearchResults, {
  NarouSearchResult,
  SearchResultR18Fields,
  SerachResultOptionalFields,
} from "./narou-search-results";
import {
  R18Site,
  SearchResultFieldNames,
  R18Fields,
  OptionalFields,
} from "./params";

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
> extends SearchBuilderBase<T | TOpt> {
  /**
   * なろう小説APIへの検索リクエストを実行する
   * @override
   * @returns {Promise<NarouSearchResults>} 検索結果
   */
  execute(): Promise<NarouSearchResults<T | TOpt>> {
    return this.api.executeNovel18(this.params);
  }

  r18Site(sites: R18Site | R18Site[]) {
    this.set({ nocgenre: SearchBuilderBase.array2string(sites) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  xid(ids: number | number[]) {
    this.set({ xid: SearchBuilderBase.array2string(ids) });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  fields<TFields extends R18Fields>(
    fields: TFields | TFields[]
  ): SearchBuilderR18<SearchResultR18Fields<R18Fields>> {
    this.set({ of: SearchBuilderBase.array2string(fields) });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this as any;
  }

  opt<TFields extends OptionalFields>(
    option: TFields | TFields[]
  ): SearchBuilderR18<T, SerachResultOptionalFields<TFields>> {
    this.set({ opt: SearchBuilderBase.array2string(option) });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this as any;
  }
}
