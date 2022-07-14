import { SearchBuilderBase } from "./search-builder";
import NarouSearchResults, {
  NarouSearchResult,
  SearchResultR18Fields,
} from "./narou-search-results";
import { R18Site, SearchResultFieldNames, R18Fields } from "./params";

export type DefaultR18SearchResultFields = keyof Omit<
  NarouSearchResult,
  "weekly_unique" | "noveltype" | "biggenre" | "genre" | "isr15" | "id"
>;

/**
 * 18禁API検索ヘルパー
 * @class SearchBuilderR18
 */
export default class SearchBuilderR18<
  T extends SearchResultFieldNames = DefaultR18SearchResultFields
> extends SearchBuilderBase<T> {
  /**
   * なろう小説APIへの検索リクエストを実行する
   * @override
   * @returns {Promise<NarouSearchResults>} 検索結果
   */
  execute(): Promise<NarouSearchResults<T>> {
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
    return this as any;
  }
}
