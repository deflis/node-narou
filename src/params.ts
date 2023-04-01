import { NarouSearchResult, UserSearchResult } from "./narou-search-results";
import { Join } from "./util/type";

export const RankingType = {
  Daily: "d",
  Weekly: "w",
  Monthly: "m",
  Quarterly: "q",
} as const;
export type RankingType = typeof RankingType[keyof typeof RankingType];

export interface ParamsBase {
  gzip?: GzipLevel;
  out?: "json" | "jsonp";
}

export interface ParamsBaseWithOrder<TOrder extends string> extends ParamsBase {
  of?: string;
  lim?: number;
  st?: number;
  order?: TOrder;
}

/**
 * {@link SearchBuilder#Fields}メソッドにパラメータを指定する際のヘルパー。
 * @typedef {Object} Fields
 * @property {string} title 小説名
 * @property {string} ncode Nコード
 * @property {string} userid 作者のユーザID(数値)
 * @property {string} writer 作者名
 * @property {string} story 小説のあらすじ
 * @property {string} genre ジャンル
 * @property {string} keyword キーワード
 * @property {string} general_firstup 初回掲載日
 * @property {string} general_lastup 最終掲載日
 * @property {string} noveltype 連載の場合は1、短編の場合は2
 * @property {string} end 連載の場合は1、短編の場合は2
 * @property {string} general_all_no 全掲載話数です。短編の場合は1です。
 * @property {string} length 全掲載話数です。短編の場合は1です。
 * @property {string} time 読了時間(分単位)です。読了時間は小説文字数÷500を切り上げした数値です。
 * @property {string} isstop 長期連載中は1、それ以外は0です。
 * @property {string} pc_or_k 1はケータイのみ、2はPCのみ、3はPCとケータイで投稿された作品です。対象は投稿と次話投稿時のみで、どの端末で執筆されたかを表すものではありません。
 * @property {string} global_point 総合得点(=(ブックマーク数×2)+評価点)
 * @property {string} fav_novel_cnt ブックマーク数
 * @property {string} review_cnt レビュー数
 * @property {string} all_point 評価点
 * @property {string} all_hyoka_cnt 評価者数
 * @property {string} sasie_cnt 挿絵の数
 * @property {string} kaiwaritu 会話率
 * @property {string} novelupdated_at 小説の更新日時
 * @property {string} updated_at 最終更新日時(注意：システム用で小説更新時とは関係ありません)
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
export type BooleanNumber = typeof BooleanNumber[keyof typeof BooleanNumber];

export type SearchResultFieldNames = keyof NarouSearchResult;

export const Fields = {
  title: "t",
  ncode: "n",
  userid: "u",
  writer: "w",
  story: "s",
  biggenre: "bg",
  genre: "g",
  nocgenre: "ng",
  keyword: "k",
  general_firstup: "gf",
  general_lastup: "gl",
  noveltype: "nt",
  end: "e",
  general_all_no: "ga",
  length: "l",
  time: "ti",
  isstop: "i",
  isr15: "isr",
  isbl: "ibl",
  isgl: "igl",
  iszankoku: "izk",
  istensei: "its",
  istenni: "iti",
  pc_or_k: "p",
  global_point: "gp",
  daily_point: "dp",
  weekly_point: "wp",
  monthly_point: "mp",
  quarter_point: "qp",
  yearly_point: "yp",
  fav_novel_cnt: "f",
  impression_cnt: "imp",
  review_cnt: "r",
  all_point: "a",
  all_hyoka_cnt: "ah",
  sasie_cnt: "sa",
  kaiwaritu: "ka",
  novelupdated_at: "nu",
  updated_at: "ua",
} as const;

export type Fields = typeof Fields[keyof Omit<
  NarouSearchResult,
  "novel_type" | "weekly_unique" | "nocgenre"
>];

export const R18Fields = {
  title: "t",
  ncode: "n",
  userid: "u",
  writer: "w",
  story: "s",
  nocgenre: "ng",
  keyword: "k",
  general_firstup: "gf",
  general_lastup: "gl",
  noveltype: "nt",
  end: "e",
  general_all_no: "ga",
  length: "l",
  time: "ti",
  isstop: "i",
  isr15: "isr",
  isbl: "ibl",
  isgl: "igl",
  iszankoku: "izk",
  istensei: "its",
  istenni: "iti",
  pc_or_k: "p",
  global_point: "gp",
  daily_point: "dp",
  weekly_point: "wp",
  monthly_point: "mp",
  quarter_point: "qp",
  yearly_point: "yp",
  fav_novel_cnt: "f",
  impression_cnt: "imp",
  review_cnt: "r",
  all_point: "a",
  all_hyoka_cnt: "ah",
  sasie_cnt: "sa",
  kaiwaritu: "ka",
  novelupdated_at: "nu",
  updated_at: "ua",
} as const;

export type R18Fields = typeof R18Fields[keyof Omit<
  NarouSearchResult,
  "novel_type" | "weekly_unique" | "biggenre" | "genre"
>];

export const UserFields = {
  userid: "u",
  name: "n",
  yomikata: "y",
  name1st: "1",
  novel_cnt: "nc",
  review_cnt: "rc",
  novel_length: "nl",
  sum_global_point: "sg",
} as const;
export type UserFields = typeof UserFields[keyof UserSearchResult];

export const OptionalFields = {
  weekly_unique: "weekly",
} as const;

export type OptionalFields = typeof OptionalFields[keyof Pick<
  NarouSearchResult,
  "weekly_unique"
>];

/*
 * new	新着更新順
 * favnovelcnt	ブックマーク数の多い順
 * reviewcnt	レビュー数の多い順
 * hyoka	総合ポイントの高い順
 * hyokaasc	総合ポイントの低い順
 * dailypoint	日間ポイントの高い順
 * weeklypoint	週間ポイントの高い順
 * monthlypoint	月間ポイントの高い順
 * quarterpoint	四半期ポイントの高い順
 * yearlypoint	年間ポイントの高い順
 * impressioncnt	感想の多い順
 * hyokacnt	評価者数の多い順
 * hyokacntasc	評価者数の少ない順
 * weekly	週間ユニークユーザの多い順 毎週火曜日早朝リセット
 * (前週の日曜日から土曜日分)
 * lengthdesc	小説本文の文字数が多い順
 * lengthasc	小説本文の文字数が少ない順
 * ncodedesc	Nコードが新しい順
 * old	古い順
 */
export const Order = {
  FavoriteNovelCount: "favnovelcnt",
  ReviewCount: "favnovelcnt",
  HyokaDesc: "hyoka",
  HyokaAsc: "hyokaasc",
  ImpressionCount: "impressioncnt",
  HyokaCountDesc: "hyokacnt",
  HyokaCountAsc: "hyokacntasc",
  Weekly: "weekly",
  LengthDesc: "lengthdesc",
  LengthAsc: "lengthasc",
  NCodeDesc: "ncodedesc",
  New: "new",
  Old: "old",
  DailyPoint: "dailypoint",
  WeeklyPoint: "weeklypoint",
  MonthlyPoint: "monthlypoint",
  QuarterPoint: "quarterpoint",
  YearlyPoint: "yearlypoint",
} as const;

export type Order = typeof Order[keyof typeof Order];

export const R18Site = {
  Nocturne: 1,
  MoonLight: 2,
  MoonLightBL: 3,
  Midnight: 4,
} as const;

export type R18Site = typeof R18Site[keyof typeof R18Site];

export const R18SiteNotation: { readonly [K in R18Site]: string } = {
  [R18Site.Nocturne]: "ノクターンノベルズ(男性向け)",
  [R18Site.MoonLight]: "ムーンライトノベルズ(女性向け)",
  [R18Site.MoonLightBL]: "ムーンライトノベルズ(BL)",
  [R18Site.Midnight]: "ミッドナイトノベルズ(大人向け)",
} as const;

export const BigGenre = {
  Renai: 1,
  Fantasy: 2,
  Bungei: 3,
  Sf: 4,
  Sonota: 99,
  NonGenre: 98,
} as const;

export type BigGenre = typeof BigGenre[keyof typeof BigGenre];

export const BigGenreNotation: { readonly [K in BigGenre]: string } = {
  [BigGenre.Renai]: "恋愛",
  [BigGenre.Fantasy]: "ファンタジー",
  [BigGenre.Bungei]: "文芸",
  [BigGenre.Sf]: "SF",
  [BigGenre.Sonota]: "その他",
  [BigGenre.NonGenre]: "ノンジャンル",
} as const;

export const Genre = {
  RenaiIsekai: 101,
  RenaiGenjitsusekai: 102,
  FantasyHigh: 201,
  FantasyLow: 202,
  BungeiJyunbungei: 301,
  BungeiHumanDrama: 302,
  BungeiHistory: 303,
  BungeiSuiri: 304,
  BungeiHorror: 305,
  BungeiAction: 306,
  BungeiComedy: 307,
  SfVrgame: 401,
  SfSpace: 402,
  SfKuusoukagaku: 403,
  SfPanic: 404,
  SonotaDouwa: 9901,
  SonotaShi: 9902,
  SonotaEssei: 9903,
  SonotaReplay: 9904,
  SonotaSonota: 9999,
  NonGenre: 9801,
} as const;
export type Genre = typeof Genre[keyof typeof Genre];

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

export const BuntaiParam = {
  NoJisageKaigyouOoi: 1,
  NoJisageKaigyoHutsuu: 2,
  JisageKaigyoOoi: 4,
  JisageKaigyoHutsuu: 6,
} as const;

export type BuntaiParam = typeof BuntaiParam[keyof typeof BuntaiParam];

export const StopParam = {
  NoStopping: 1,
  Stopping: 2,
} as const;

export type StopParam = typeof StopParam[keyof typeof StopParam];

export const NovelTypeParam = {
  Short: "t",
  RensaiNow: "r",
  RensaiEnd: "er",
  Rensai: "re",
  ShortAndRensai: "ter",
} as const;
export type NovelTypeParam = typeof NovelTypeParam[keyof typeof NovelTypeParam];

export const UserOrder = {
  New: "new",
  NovelCount: "novelcnt",
  ReviewCount: "reviewcnt",
  NovelLength: "novellength",
  SumGlobalPoint: "sumglobalpoint",
  Old: "old",
} as const;
export type UserOrder = typeof UserOrder[keyof typeof UserOrder];

export type GzipLevel = 0 | 1 | 2 | 3 | 4 | 5;
