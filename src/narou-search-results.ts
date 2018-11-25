/**
 * なろう小説API検索結果
 * @class NarouSearchResults
 */

export default class NarouSearchResults {
  allcount: number;
  limit: number;
  start: number;
  page: number;
  length: number;
  values: NarouSearchResult[];

  /**
   * @constractor
   * @private
   */
  constructor(result: any[], params: any) {
    let count = result.shift().allcount;

    let limit = 20;
    if (params.hasOwnProperty("lim")) {
      limit = params.lim;
    }

    let start = 0;
    if (params.hasOwnProperty("start")) {
      start = params.start;
    }

    /**
     * 検索結果数
     * @type {number}
     */
    this.allcount = count;
    /**
     * 結果表示上限数
     * @type {number}
     */
    this.limit = limit;
    /**
     * 結果表示開始数
     * @type {number}
     */
    this.start = start;
    /**
     * 結果表示ページ数
     * @type {number}
     */
    this.page = start / limit;
    /**
     * 結果数
     * @type {number}
     */
    this.length = result.length;
    /**
     * 検索結果
     * @type {NarouSearchResult[]}
     */
    this.values = result;
  }
}

/**
 * @typedef {Object} NarouSearchResult
 * @property {number} title 小説名
 * @property {string} ncode Nコード
 * @property {number} userid 作者のユーザID(数値)
 * @property {string} writer 作者名
 * @property {string} story 小説のあらすじ
 * @property {number} genre ジャンル
 * @property {string} keyword キーワード
 * @property {string} general_firstup 初回掲載日 YYYY-MM-DD HH:MM:SSの形式
 * @property {string} general_lastup 最終掲載日 YYYY-MM-DD HH:MM:SSの形式
 * @property {number} noveltype 連載の場合は1、短編の場合は2
 * @property {number} end 連載の場合は1、短編の場合は2
 * @property {number} general_all_no 全掲載話数です。短編の場合は1です。
 * @property {number} length 全掲載話数です。短編の場合は1です。
 * @property {number} time 読了時間(分単位)です。読了時間は小説文字数÷500を切り上げした数値です。
 * @property {number} isstop 長期連載中は1、それ以外は0です。
 * @property {number} pc_or_k 1はケータイのみ、2はPCのみ、3はPCとケータイで投稿された作品です。対象は投稿と次話投稿時のみで、どの端末で執筆されたかを表すものではありません。
 * @property {number} global_point 総合得点(=(ブックマーク数×2)+評価点)
 * @property {number} fav_novel_cnt ブックマーク数
 * @property {number} review_cnt レビュー数
 * @property {number} all_point 評価点
 * @property {number} all_hyoka_cnt 評価者数
 * @property {number} sasie_cnt 挿絵の数
 * @property {number} kaiwaritu 会話率
 * @property {number} novelupdated_at 小説の更新日時
 * @property {number} updated_at 最終更新日時(注意：システム用で小説更新時とは関係ありません)
 */

export interface NarouSearchResult {
  title: string;
  ncode: string;
  userid: number;
  writer: string;
  story: string;
  genre: number;
  keyword: string;
  general_firstup: string;
  general_lastup: string;
  novel_type: number;
  noveltype: number;
  end: number;
  general_all_no: number;
  length: number;
  time: number;
  isstop: number;
  isr15: number;
  isbl: number;
  isgl: number;
  iszankoku: number;
  istensei: number;
  istenni: number;
  pc_or_k: number;
  global_point: number;
  fav_novel_cnt: number;
  review_cnt: number;
  all_point: number;
  all_hyoka_cnt: number;
  sasie_cnt: number;
  kaiwaritu: number;
  novelupdated_at: number;
  update_at: number;
}
