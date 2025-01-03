import type {
  NarouSearchResult,
  UserSearchResult,
} from "./narou-search-results.js";
import type { Join } from "./util/type.js";

export const RankingType = {
  Daily: "d",
  Weekly: "w",
  Monthly: "m",
  Quarterly: "q",
} as const;
export type RankingType = (typeof RankingType)[keyof typeof RankingType];

/**
 * すべてのAPIで共通のクエリパラメータ
 */
export interface ParamsBase {
  /**
   * gzip圧縮してgzipファイルとして返します。
   * gzip圧縮レベルを1～5で指定できます。
   * 転送量上限を減らすためにも推奨
   */
  gzip?: GzipLevel;
  /**
   * 出力形式を指定
   * 本ライブラリはJSONとJSONPのみ対応
   */
  out?: "json" | "jsonp";
}

/**
 * 検索APIで共通のクエリパラメータ
 */
export interface ParamsBaseWithOrder<TOrder extends string> extends ParamsBase {
  /**
   * 出力する項目を個別に指定できます。未指定時は全項目出力されます。
   * 転送量軽減のため、このパラメータの使用が推奨されます。
   */
  of?: string;
  /**
   * 最大出力数を指定できます。指定しない場合は20件になります。
   */
  lim?: number;
  /**	表示開始位置の指定です。 */
  st?: number;
  /** 出力順序を指定できます。 */
  order?: TOrder;
}

/**
 * メソッドにパラメータを指定する際のヘルパー。
 * @see https://dev.syosetu.com/man/api/
 * @see https://dev.syosetu.com/xman/atom/
 */
export interface SearchParams extends ParamsBaseWithOrder<Order> {
  word?: string;
  notword?: string;
  title?: BooleanNumber;
  ex?: BooleanNumber;
  keyword?: BooleanNumber;
  wname?: BooleanNumber;

  biggenre?: Join<BigGenre> | BigGenre;
  notbiggenre?: Join<BigGenre> | BigGenre;
  genre?: Join<Genre> | Genre;
  notgenre?: Join<Genre> | Genre;
  userid?: Join<number> | number;

  nocgenre?: Join<R18Site> | R18Site;
  notnocgenre?: Join<R18Site> | R18Site;
  xid?: Join<number> | number;

  isr15?: BooleanNumber;
  isbl?: BooleanNumber;
  isgl?: BooleanNumber;
  iszankoku?: BooleanNumber;
  istensei?: BooleanNumber;
  istenni?: BooleanNumber;
  istt?: BooleanNumber;

  notr15?: BooleanNumber;
  notbl?: BooleanNumber;
  notgl?: BooleanNumber;
  notzankoku?: BooleanNumber;
  nottensei?: BooleanNumber;
  nottenni?: BooleanNumber;
  nottt?: BooleanNumber;

  minlen?: number;
  maxlen?: number;
  length?: number | Join<number>;

  kaiwaritu?: number | string;
  sasie?: number | string;

  mintime?: number;
  maxtime?: number;
  time?: number | string;

  ncode?: string | Join<string>;

  type?: NovelTypeParam;

  buntai?: BuntaiParam | Join<BuntaiParam>;

  stop?: StopParam;

  ispickup?: BooleanNumber;
  lastup?: string;

  opt?: Join<OptionalFields>;
}

export interface RankingParams extends ParamsBase {
  rtype: `${string}-${RankingType}`;
}

export interface RankingHistoryParams extends ParamsBase {
  ncode: string;
}

/**
 * ユーザー検索パラメータ
 */
export interface UserSearchParams extends ParamsBaseWithOrder<UserOrder> {
  /** 単語を指定できます。半角または全角スペースで区切るとAND抽出になります。部分一致でHITします。検索の対象はユーザ名とユーザ名のフリガナです。 */
  word?: string;
  /** 含みたくない単語を指定できます。スペースで区切ることにより含ませない単語を増やせます。部分一致で除外されます。除外の対象はユーザ名とユーザ名のフリガナです。 */
  notword?: string;
  /** ユーザIDで抽出可能。 */
  userid?: number;
  /** 抽出するユーザのユーザ名のフリガナの頭文字を指定できます。頭文字はユーザ名のフリガナをひらがなに変換し、最初の1文字が「ぁ」～「ん」の場合に対象となります。 */
  name1st?: string;
  /** 抽出するユーザの小説投稿数の下限を指定できます。小説投稿件数が指定された数値以上のユーザを抽出します。 */
  minnovel?: number;
  /** 抽出するユーザの小説投稿数の上限を指定できます。小説投稿件数が指定された数値以下のユーザを抽出します。 */
  maxnovel?: number;
  /** 抽出するユーザのレビュー投稿数の下限を指定できます。レビュー投稿件数が指定された数値以上のユーザを抽出します。 */
  minreview?: number;
  /** 抽出するユーザのレビュー投稿数の上限を指定できます。レビュー投稿件数が指定された数値以下のユーザを抽出します。 */
  maxreview?: number;
}

export const BooleanNumber = {
  True: 1,
  False: 0,
} as const;
export type BooleanNumber = (typeof BooleanNumber)[keyof typeof BooleanNumber];

export type SearchResultFieldNames = keyof NarouSearchResult;

/**
 * なろう小説APIのofパラメータに指定できる出力する項目
 * @see https://dev.syosetu.com/man/api/#output
 */
export const Fields = {
  /** 小説名 */
  title: "t",
  /** Nコード */
  ncode: "n",
  /** 作者のユーザID(数値) */
  userid: "u",
  /** 作者名 */
  writer: "w",
  /** 小説のあらすじ */
  story: "s",
  /** 大ジャンル */
  biggenre: "bg",
  /** ジャンル */
  genre: "g",
  /** キーワード */
  keyword: "k",
  /** 初回掲載日 */
  general_firstup: "gf",
  /** 最終掲載日 */
  general_lastup: "gl",
  /** 連載の場合は1、短編の場合は2 */
  noveltype: "nt",
  /** 短編小説と完結済小説は0となっています。連載中は1です。 */
  end: "e",
  /** 全掲載部分数 */
  general_all_no: "ga",
  /** 小説文字数 */
  length: "l",
  /** 読了時間(分単位) */
  time: "ti",
  /** 長期連載停止中 */
  isstop: "i",
  /** 登録必須キーワードに「R15」が含まれる場合は1、それ以外は0です。 */
  isr15: "isr",
  /** 登録必須キーワードに「ボーイズラブ」が含まれる場合は1、それ以外は0です。 */
  isbl: "ibl",
  /** 登録必須キーワードに「ガールズラブ」が含まれる場合は1、それ以外は0です。 */
  isgl: "igl",
  /** 登録必須キーワードに「残酷な描写あり」が含まれる場合は1、それ以外は0です。 */
  iszankoku: "izk",
  /** 登録必須キーワードに「異世界転生」が含まれる場合は1、それ以外は0です。 */
  istensei: "its",
  /** 登録必須キーワードに「異世界転移」が含まれる場合は1、それ以外は0です。 */
  istenni: "iti",
  /** 総合評価ポイント */
  global_point: "gp",
  /** 日間ポイント */
  daily_point: "dp",
  /** 週間ポイント */
  weekly_point: "wp",
  /** 月間ポイント */
  monthly_point: "mp",
  /** 四半期ポイント */
  quarter_point: "qp",
  /** 年間ポイント */
  yearly_point: "yp",
  /** ブックマーク数 */
  fav_novel_cnt: "f",
  /** 感想数 */
  impression_cnt: "imp",
  /** レビュー数 */
  review_cnt: "r",
  /** 評価ポイント */
  all_point: "a",
  /** 評価者数 */
  all_hyoka_cnt: "ah",
  /** 挿絵の数 */
  sasie_cnt: "sa",
  /** 会話率 */
  kaiwaritu: "ka",
  /** 小説の更新日時 */
  novelupdated_at: "nu",
  /**
   * 最終更新日時
   * システム用で小説更新時とは関係ありません
   */
  updated_at: "ua",
} as const;

export type Fields = (typeof Fields)[keyof Omit<
  NarouSearchResult,
  "novel_type" | "weekly_unique" | "nocgenre"
>];

/**
 * なろうR18小説APIのofパラメータに指定できる出力する項目
 * @see https://dev.syosetu.com/xman/api/#output
 */
export const R18Fields = {
  /** 小説名 */
  title: "t",
  /** Nコード */
  ncode: "n",
  /** 作者のユーザID(数値) */
  userid: "u",
  /** 作者名 */
  writer: "w",
  /** 小説のあらすじ */
  story: "s",
  /** 掲載サイト */
  nocgenre: "ng",
  /** キーワード */
  keyword: "k",
  /** 初回掲載日 */
  general_firstup: "gf",
  /** 最終掲載日 */
  general_lastup: "gl",
  /** 連載の場合は1、短編の場合は2 */
  noveltype: "nt",
  /** 短編小説と完結済小説は0となっています。連載中は1です。 */
  end: "e",
  /** 全掲載部分数 */
  general_all_no: "ga",
  /** 小説文字数 */
  length: "l",
  /** 読了時間(分単位) */
  time: "ti",
  /** 長期連載停止中 */
  isstop: "i",
  /** 登録必須キーワードに「ボーイズラブ」が含まれる場合は1、それ以外は0です。 */
  isbl: "ibl",
  /** 登録必須キーワードに「ガールズラブ」が含まれる場合は1、それ以外は0です。 */
  isgl: "igl",
  /** 登録必須キーワードに「残酷な描写あり」が含まれる場合は1、それ以外は0です。 */
  iszankoku: "izk",
  /** 登録必須キーワードに「異世界転生」が含まれる場合は1、それ以外は0です。 */
  istensei: "its",
  /** 登録必須キーワードに「異世界転移」が含まれる場合は1、それ以外は0です。 */
  istenni: "iti",
  /** 総合評価ポイント */
  global_point: "gp",
  /** 日間ポイント */
  daily_point: "dp",
  /** 週間ポイント */
  weekly_point: "wp",
  /** 月間ポイント */
  monthly_point: "mp",
  /** 四半期ポイント */
  quarter_point: "qp",
  /** 年間ポイント */
  yearly_point: "yp",
  /** R18ブックマーク数 */
  fav_novel_cnt: "f",
  /** 感想数 */
  impression_cnt: "imp",
  /** レビュー数 */
  review_cnt: "r",
  /** 評価ポイント */
  all_point: "a",
  /** 評価者数 */
  all_hyoka_cnt: "ah",
  /** 挿絵の数 */
  sasie_cnt: "sa",
  /** 会話率 */
  kaiwaritu: "ka",
  /** 小説の更新日時 */
  novelupdated_at: "nu",
  /**
   * 最終更新日時
   * システム用で小説更新時とは関係ありません
   */
  updated_at: "ua",
} as const;

export type R18Fields = (typeof R18Fields)[keyof Omit<
  NarouSearchResult,
  "novel_type" | "weekly_unique" | "biggenre" | "genre" | "isr15"
>];

/**
 * オプション項目
 */
export const OptionalFields = {
  /**
   * 週間ユニークユーザ[項目名:weekly_unique]が追加されます。
   * 週間ユニークユーザは前週の日曜日から土曜日分のユニークの合計です。
   * 毎週火曜日早朝に更新されます。
   */
  weekly_unique: "weekly",
} as const;

export type OptionalFields = (typeof OptionalFields)[keyof Pick<
  NarouSearchResult,
  "weekly_unique"
>];

/**
 * ユーザ検索APIのofパラメータに指定できる出力する項目
 * @see https://dev.syosetu.com/man/userapi/#output
 */
export const UserFields = {
  /** ユーザID */
  userid: "u",
  /** ユーザ名 */
  name: "n",
  /** ユーザ名のフリガナ */
  yomikata: "y",
  /** ユーザ名のフリガナの頭文字 */
  name1st: "1",
  /** 小説投稿数 */
  novel_cnt: "nc",
  /** レビュー投稿数 */
  review_cnt: "rc",
  /** 小説累計文字数 */
  novel_length: "nl",
  /** 総合評価ポイントの合計 */
  sum_global_point: "sg",
} as const;
export type UserFields = (typeof UserFields)[keyof UserSearchResult];

/**
 * 出力順序
 */
export const Order = {
  /** ブックマーク数の多い順 */
  FavoriteNovelCount: "favnovelcnt",
  /** レビュー数の多い順 */
  ReviewCount: "favnovelcnt",
  /** 総合ポイントの高い順 */
  HyokaDesc: "hyoka",
  /** 総合ポイントの低い順 */
  HyokaAsc: "hyokaasc",
  /** 感想の多い順 */
  ImpressionCount: "impressioncnt",
  /** 評価者数の多い順 */
  HyokaCountDesc: "hyokacnt",
  /** 評価者数の少ない順 */
  HyokaCountAsc: "hyokacntasc",
  /** 週間ユニークユーザの多い順 */
  Weekly: "weekly",
  /** 小説本文の文字数が多い順 */
  LengthDesc: "lengthdesc",
  /** 小説本文の文字数が少ない順 */
  LengthAsc: "lengthasc",
  /** Nコードが新しい順 */
  NCodeDesc: "ncodedesc",
  /** 新着更新順 */
  New: "new",
  /** 古い順 */
  Old: "old",
  /** 日間ポイントの高い順 */
  DailyPoint: "dailypoint",
  /** 週間ポイントの高い順 */
  WeeklyPoint: "weeklypoint",
  /** 月間ポイントの高い順 */
  MonthlyPoint: "monthlypoint",
  /** 四半期ポイントの高い順 */
  QuarterPoint: "quarterpoint",
  /** 年間ポイントの高い順 */
  YearlyPoint: "yearlypoint",
  /** 初回掲載順 */
  GeneralFirstUp: "generalfirstup",
} as const;

export type Order = (typeof Order)[keyof typeof Order];

/** R18掲載サイト */
export const R18Site = {
  /** ノクターンノベルズ(男性向け) */
  Nocturne: 1,
  /** ムーンライトノベルズ(女性向け) */
  MoonLight: 2,
  /** ムーンライトノベルズ(BL) */
  MoonLightBL: 3,
  /** ミッドナイトノベルズ(大人向け) */
  Midnight: 4,
} as const;

export type R18Site = (typeof R18Site)[keyof typeof R18Site];

/** R18掲載サイト表記ヘルパー */
export const R18SiteNotation: { readonly [K in R18Site]: string } = {
  [R18Site.Nocturne]: "ノクターンノベルズ(男性向け)",
  [R18Site.MoonLight]: "ムーンライトノベルズ(女性向け)",
  [R18Site.MoonLightBL]: "ムーンライトノベルズ(BL)",
  [R18Site.Midnight]: "ミッドナイトノベルズ(大人向け)",
} as const;

/** 大ジャンル */
export const BigGenre = {
  /** 恋愛 */
  Renai: 1,
  /** ファンタジー */
  Fantasy: 2,
  /** 文芸 */
  Bungei: 3,
  /** SF */
  Sf: 4,
  /** その他 */
  Sonota: 99,
  /** ノンジャンル */
  NonGenre: 98,
} as const;

export type BigGenre = (typeof BigGenre)[keyof typeof BigGenre];

/** 大ジャンル表記ヘルパー */
export const BigGenreNotation: { readonly [K in BigGenre]: string } = {
  [BigGenre.Renai]: "恋愛",
  [BigGenre.Fantasy]: "ファンタジー",
  [BigGenre.Bungei]: "文芸",
  [BigGenre.Sf]: "SF",
  [BigGenre.Sonota]: "その他",
  [BigGenre.NonGenre]: "ノンジャンル",
} as const;

/** ジャンル */
export const Genre = {
  /** 異世界〔恋愛〕*/
  RenaiIsekai: 101,
  /** 現実世界〔恋愛〕*/
  RenaiGenjitsusekai: 102,
  /** ハイファンタジー〔ファンタジー〕*/
  FantasyHigh: 201,
  /** ローファンタジー〔ファンタジー〕*/
  FantasyLow: 202,
  /** 純文学〔文芸〕*/
  BungeiJyunbungei: 301,
  /** ヒューマンドラマ〔文芸〕*/
  BungeiHumanDrama: 302,
  /** 歴史〔文芸〕*/
  BungeiHistory: 303,
  /** 推理〔文芸〕*/
  BungeiSuiri: 304,
  /** ホラー〔文芸〕*/
  BungeiHorror: 305,
  /** アクション〔文芸〕*/
  BungeiAction: 306,
  /** コメディー〔文芸〕*/
  BungeiComedy: 307,
  /** VRゲーム〔SF〕*/
  SfVrgame: 401,
  /** 宇宙〔SF〕*/
  SfSpace: 402,
  /** 空想科学〔SF〕*/
  SfKuusoukagaku: 403,
  /** パニック〔SF〕*/
  SfPanic: 404,
  /** 童話〔その他〕*/
  SonotaDouwa: 9901,
  /** 詩〔その他〕*/
  SonotaShi: 9902,
  /** エッセイ〔その他〕*/
  SonotaEssei: 9903,
  /** リプレイ〔その他〕*/
  SonotaReplay: 9904,
  /** その他〔その他〕 */
  SonotaSonota: 9999,
  /** ノンジャンル〔ノンジャンル〕*/
  NonGenre: 9801,
} as const;
export type Genre = (typeof Genre)[keyof typeof Genre];

/** ジャンル表記ヘルパー */
export const GenreNotation: { readonly [K in Genre]: string } = {
  [Genre.RenaiIsekai]: "異世界〔恋愛〕",
  [Genre.RenaiGenjitsusekai]: "現実世界〔恋愛〕",
  [Genre.FantasyHigh]: "ハイファンタジー〔ファンタジー〕",
  [Genre.FantasyLow]: "ローファンタジー〔ファンタジー〕",
  [Genre.BungeiJyunbungei]: "純文学〔文芸〕",
  [Genre.BungeiHumanDrama]: "ヒューマンドラマ〔文芸〕",
  [Genre.BungeiHistory]: "歴史〔文芸〕",
  [Genre.BungeiSuiri]: "推理〔文芸〕",
  [Genre.BungeiHorror]: "ホラー〔文芸〕",
  [Genre.BungeiAction]: "アクション〔文芸〕",
  [Genre.BungeiComedy]: "コメディー〔文芸〕",
  [Genre.SfVrgame]: "VRゲーム〔SF〕",
  [Genre.SfSpace]: "宇宙〔SF〕",
  [Genre.SfKuusoukagaku]: "空想科学〔SF〕",
  [Genre.SfPanic]: "パニック〔SF〕",
  [Genre.SonotaDouwa]: "童話〔その他〕",
  [Genre.SonotaShi]: "詩〔その他〕",
  [Genre.SonotaEssei]: "エッセイ〔その他〕",
  [Genre.SonotaReplay]: "リプレイ〔その他〕",
  [Genre.SonotaSonota]: "その他〔その他〕",
  [Genre.NonGenre]: "ノンジャンル〔ノンジャンル〕",
} as const;

/** 文体指定 */
export const BuntaiParam = {
  /** 字下げされておらず、連続改行が多い作品 */
  NoJisageKaigyouOoi: 1,
  /** 字下げされていないが、改行数は平均な作品 */
  NoJisageKaigyoHutsuu: 2,
  /** 字下げが適切だが、連続改行が多い作品 */
  JisageKaigyoOoi: 4,
  /** 字下げが適切でかつ改行数も平均な作品 */
  JisageKaigyoHutsuu: 6,
} as const;

export type BuntaiParam = (typeof BuntaiParam)[keyof typeof BuntaiParam];

/** 連載停止中指定 */
export const StopParam = {
  /** 長期連載停止中を除きます */
  NoStopping: 1,
  /** 長期連載停止中のみ取得します */
  Stopping: 2,
} as const;

export type StopParam = (typeof StopParam)[keyof typeof StopParam];

/** 小説タイプ指定 */
export const NovelTypeParam = {
  /** 短編 */
  Short: "t",
  /** 連載中 */
  RensaiNow: "r",
  /** 完結済連載小説 */
  RensaiEnd: "er",
  /** すべての連載小説(連載中および完結済) */
  Rensai: "re",
  /** 短編と完結済連載小説 */
  ShortAndRensai: "ter",
} as const;
export type NovelTypeParam =
  (typeof NovelTypeParam)[keyof typeof NovelTypeParam];

export const UserOrder = {
  /** ユーザIDの新しい順 */
  New: "new",
  /** 小説投稿数の多い順 */
  NovelCount: "novelcnt",
  /** レビュー投稿数の多い順 */
  ReviewCount: "reviewcnt",
  /** 小説累計文字数の多い順 */
  NovelLength: "novellength",
  /** 総合評価ポイントの合計の多い順 */
  SumGlobalPoint: "sumglobalpoint",
  /** ユーザIDの古い順 */
  Old: "old",
} as const;
export type UserOrder = (typeof UserOrder)[keyof typeof UserOrder];

export type GzipLevel = 0 | 1 | 2 | 3 | 4 | 5;
