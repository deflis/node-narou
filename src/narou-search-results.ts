import type {
  BooleanNumber as BooleanNumber,
  Genre,
  R18Site,
  SearchParams,
  Fields,
  BigGenre,
  R18Fields,
  OptionalFields,
  UserFields,
} from "./params.js";

/**
 * なろう小説API検索結果
 */
export default class NarouSearchResults<T, TKey extends keyof T> {
  /**
   * 検索結果数
   */
  allcount: number;
  /**
   * 結果表示上限数
   */
  limit: number;
  /**
   * 結果表示開始数
   */
  start: number;
  /**
   * 結果表示の現在ページ(=start/limit)
   */
  page: number;
  /**
   * 今回取得できた検索結果の数
   */
  length: number;
  /**
   * 検索結果
   */
  values: readonly Pick<T, TKey>[];

  /**
   * @constractor
   * @private
   */
  constructor(
    [header, ...result]: [{ allcount: number }, ...Pick<T, TKey>[]],
    params: SearchParams
  ) {
    const count = header.allcount;
    const limit = params.lim ?? 20;
    const start = params.st ?? 0;

    this.allcount = count;
    this.limit = limit;
    this.start = start;
    this.page = start / limit;
    this.length = result.length;
    this.values = result;
  }
}

/**
 * 小説情報
 * @see https://dev.syosetu.com/man/api/#output
 * @see https://dev.syosetu.com/xman/api/#output
 */
export interface NarouSearchResult {
  /** 小説名 */
  title: string;
  /** Nコード */
  ncode: string;
  /** 作者のユーザID(数値) */
  userid: number;
  /** 作者名 */
  writer: string;
  /** 小説のあらすじ */
  story: string;
  /** 掲載サイト */
  nocgenre: R18Site;
  /** 大ジャンル */
  biggenre: BigGenre;
  /** ジャンル */
  genre: Genre;
  /** キーワード */
  keyword: string;
  /** 初回掲載日 YYYY-MM-DD HH:MM:SSの形式 */
  general_firstup: string;
  /** 最終掲載日 YYYY-MM-DD HH:MM:SSの形式 */
  general_lastup: string;
  /** 連載の場合は1、短編の場合は2 */
  novel_type: NovelType;
  /** 連載の場合は1、短編の場合は2 */
  noveltype: NovelType;
  /** 短編小説と完結済小説は0となっています。連載中は1です。 */
  end: End;
  /** 全掲載話数です。短編の場合は1です。 */
  general_all_no: number;
  /** 小説文字数です。スペースや改行は文字数としてカウントしません。 */
  length: number;
  /** 読了時間(分単位)です。読了時間は小説文字数÷500を切り上げした数値です。 */
  time: number;
  /** 長期連載中は1、それ以外は0です。 */
  isstop: BooleanNumber;
  /** 登録必須キーワードに「R15」が含まれる場合は1、それ以外は0です。 */
  isr15: BooleanNumber;
  /** 登録必須キーワードに「ボーイズラブ」が含まれる場合は1、それ以外は0です。 */
  isbl: BooleanNumber;
  /** 登録必須キーワードに「ガールズラブ」が含まれる場合は1、それ以外は0です。 */
  isgl: BooleanNumber;
  /** 登録必須キーワードに「残酷な描写あり」が含まれる場合は1、それ以外は0です。 */
  iszankoku: BooleanNumber;
  /** 登録必須キーワードに「異世界転生」が含まれる場合は1、それ以外は0です。 */
  istensei: BooleanNumber;
  /** 登録必須キーワードに「異世界転移」が含まれる場合は1、それ以外は0です。 */
  istenni: BooleanNumber;
  /** 総合得点(=(ブックマーク数×2)+評価点) */
  global_point: number;
  /**
   * 日間ポイント
   * ランキング集計時点から過去24時間以内で新たに登録されたブックマークや評価が対象
   */
  daily_point: number;
  /**
   * 週間ポイント
   * ランキング集計時点から過去7日以内で新たに登録されたブックマークや評価が対象
   */
  weekly_point: number;
  /**
   * 月間ポイント
   * ランキング集計時点から過去30日以内で新たに登録されたブックマークや評価が対象
   */
  monthly_point: number;
  /**
   * 四半期ポイント
   * ランキング集計時点から過去90日以内で新たに登録されたブックマークや評価が対象
   */
  quarter_point: number;
  /**
   * 年間ポイント
   * ランキング集計時点から過去365日以内で新たに登録されたブックマークや評価が対象
   */
  yearly_point: number;
  /** ブックマーク数 */
  fav_novel_cnt: number;
  /** 感想数 */
  impression_cnt: number;
  /** レビュー数 */
  review_cnt: number;
  /** 評価ポイント */
  all_point: number;
  /** 評価者数 */
  all_hyoka_cnt: number;
  /** 挿絵の数 */
  sasie_cnt: number;
  /**
   * 会話率
   * @see https://dev.syosetu.com/man/kaiwa/
   */
  kaiwaritu: number;
  /**
   * 小説の更新日時
   */
  novelupdated_at: string;
  /**
   * 最終更新日時
   * システム用で小説更新時とは関係ありません
   */
  updated_at: string;
  /** 週間ユニークユーザー数 */
  weekly_unique: number;
}

/**
 * ユーザ情報
 * @see https://dev.syosetu.com/man/userapi/#output
 */
export interface UserSearchResult {
  /** ユーザID */
  userid: number;
  /** ユーザ名 */
  name: string;
  /** ユーザ名のフリガナ */
  yomikata: string;
  /**
   * ユーザ名のフリガナの頭文字
   * ひらがな以外の場合はnullまたは空文字となります。
   */
  name1st: string;
  /** 小説投稿数 */
  novel_cnt: number;
  /** レビュー投稿数 */
  review_cnt: number;
  /**
   * 小説累計文字数
   * スペースや改行は文字数としてカウントしません。
   */
  novel_length: number;
  /**
   * 総合評価ポイントの合計
   * 投稿済小説でそれぞれ獲得した総合評価ポイントの合計です。
   */
  sum_global_point: number;
}

/**
 * noveltype/novel_typeの値ヘルパー
 */
export const NovelType = {
  /** 連載 */
  Rensai: 1,
  /** 短編 */
  Tanpen: 2,
} as const;
export type NovelType = typeof NovelType[keyof typeof NovelType];

/**
 * endの値ヘルパー
 */
export const End = {
  /** 短編小説と完結済小説 */
  KanketsuOrTanpen: 0,
  /** 連載中 */
  Rensai: 1,
} as const;
export type End = typeof End[keyof typeof End];

export type SearchResultFields<T extends Fields> = {
  [K in keyof typeof Fields]: typeof Fields[K] extends T ? K : never;
}[keyof typeof Fields];

export type SearchResultOptionalFields<T extends OptionalFields> = {
  [K in keyof typeof OptionalFields]: typeof OptionalFields[K] extends T
  ? K
  : never;
}[keyof typeof OptionalFields];

export type SearchResultR18Fields<T extends R18Fields> = {
  [K in keyof typeof R18Fields]: typeof R18Fields[K] extends T ? K : never;
}[keyof typeof R18Fields];

export type UserSearchResultFields<T extends UserFields> = {
  [K in keyof typeof UserFields]: typeof UserFields[K] extends T ? K : never;
}[keyof typeof UserFields];

export type PickedNarouSearchResult<T extends keyof NarouSearchResult> = Pick<
  NarouSearchResult,
  T
>;
