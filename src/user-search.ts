import NarouSearchResults from "./narou-search-results";
import type {
  UserSearchResult,
  UserSearchResultFields,
} from "./narou-search-results";
import type { UserFields, UserOrder, UserSearchParams } from "./params";
import { SearchBuilderBase } from "./search-builder";

/**
 * なろうユーザ検索API
 * @class UserSearch
 */
export default class UserSearchBuilder<
  TField extends keyof UserSearchResult = keyof UserSearchResult
> extends SearchBuilderBase<UserSearchParams, UserOrder> {
  /**
   * 単語を指定できます。
   * 半角または全角スペースで区切るとAND抽出になります。
   * 部分一致でHITします。検索の対象はユーザ名とユーザ名のフリガナです。
   */
  word(word: string) {
    this.set({ word });
    return this;
  }

  /**
   * 含みたくない単語を指定できます。
   * スペースで区切ることにより含ませない単語を増やせます。部分一致で除外されます。
   * 除外の対象はユーザ名とユーザ名のフリガナです。
   */
  notWord(notword: string) {
    this.set({ notword });
    return this;
  }

  /**
   * ユーザIDで抽出可能。
   */
  userId(userid: number) {
    this.set({ userid });
    return this;
  }

  /**
   * 抽出するユーザのユーザ名のフリガナの頭文字を指定できます。
   * 頭文字はユーザ名のフリガナをひらがなに変換し、最初の1文字が「ぁ」～「ん」の場合に対象となります。
   * 「ぱ」や「ば」等の半濁音や濁音は清音として扱われます。
   * 漢字や英数字が頭文字のユーザは対象外です。
   */
  name1st(name1st: string) {
    this.set({ name1st });
    return this;
  }

  /**
   * 抽出するユーザの小説投稿数の下限を指定できます。
   * 小説投稿件数が指定された数値以上のユーザを抽出します。
   */
  minNovel(minnovel: number) {
    this.set({ minnovel });
    return this;
  }

  /**
   * 抽出するユーザの小説投稿数の上限を指定できます。
   * 小説投稿件数が指定された数値以下のユーザを抽出します。
   */
  maxNovel(maxnovel: number) {
    this.set({ maxnovel });
    return this;
  }

  /**
   * 抽出するユーザのレビュー投稿数の下限を指定できます。
   * レビュー投稿件数が指定された数値以上のユーザを抽出します。
   */
  minReview(minreview: number) {
    this.set({ minreview });
    return this;
  }

  /**
   * 抽出するユーザのレビュー投稿数の上限を指定できます。
   * レビュー投稿件数が指定された数値以下のユーザを抽出します。
   */
  maxReview(maxreview: number) {
    this.set({ maxreview });
    return this;
  }

  /**
   * 出力する項目を個別に指定できます。未指定時は全項目出力されます。転送量軽減のため、このパラメータの使用が推奨されます。
   * @return {SearchBuilder} this
   */
  fields<TFields extends UserFields>(
    fields: TFields | readonly TFields[]
  ): UserSearchBuilder<UserSearchResultFields<TFields>> {
    this.set({ of: UserSearchBuilder.array2string(fields) });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this as any;
  }

  /**
   * なろう小説APIへのリクエストを実行する
   * @returns ランキング
   */
  execute(): Promise<NarouSearchResults<UserSearchResult, TField>> {
    return this.api.executeUserSearch(this.params as UserSearchParams);
  }
}
