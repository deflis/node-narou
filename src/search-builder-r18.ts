import api from "./narou";
import SearchBuilder from "./search-builder";
import INarouSearchResults from "./narou-search-results";
import { R18Site } from "./params";

/**
 * 18禁API検索ヘルパー
 * @class SearchBuilderR18
 */
export default class SearchBuilderR18 extends SearchBuilder {
  /**
   * なろう小説APIへの検索リクエストを実行する
   * @override
   * @returns {Promise<INarouSearchResults>} 検索結果
   */
  execute(): Promise<INarouSearchResults> {
    return api.executeNovel18(this.params);
  }

  r18Site(sites: R18Site | R18Site[]) {
    let nocgenre: number | string;
    if (Array.isArray(sites)) {
      nocgenre = (<string[]>(<any>sites)).join("-");
    } else {
      nocgenre = sites;
    }
    this.set({ nocgenre });
    return this;
  }

  /**
   *
   * @return {SearchBuilder} this
   */
  xid(ids: number | number[]) {
    let xid: number | string;
    if (Array.isArray(ids)) {
      xid = (<string[]>(<any>ids)).join("-");
    } else {
      xid = ids;
    }
    this.set({ xid });
    return this;
  }
}
