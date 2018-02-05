
export type booleanNumber = 0|1

export interface SearchParams {
    gzip?: GzipLevel
    out?: "json"
    of?: string
    lim?: number
    st?: number
    order?: Order

    word?: string
    notword?: string
    title?: booleanNumber
    ex?: booleanNumber
    keyword?: booleanNumber
    wname?: booleanNumber

    biggenre?: string|BigGenre
    notbiggenre?: string|BigGenre
    genre?: string|Genre
    notgenre?: string|Genre
    userid?: string|number


    nocgenre?: string|number
    notnocgenre?: string|number
    xid?: string|number

    isr15?: booleanNumber
    isbl?: booleanNumber
    isgl?: booleanNumber
    iszankoku?: booleanNumber
    istensei?: booleanNumber
    istenni?: booleanNumber
    istt?: booleanNumber

    notr15?: booleanNumber
    notbl?: booleanNumber
    notgl?: booleanNumber
    notzankoku?: booleanNumber
    nottensei?: booleanNumber
    nottenni?: booleanNumber
    nottt?: booleanNumber

    minlen?: number
    maxlen?: number
    length?: number|string

    kaiwaritu?: number|string
    sasie?: number|string

    mintime?: number
    maxtime?: number
    time?: number|string

    ncode?: string

    type?: NovelType

    buntai?: Buntai|string

    stop?: Stop

    ispickup?: booleanNumber
    lastup?: string

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

export enum Fields {
    title = "t",
    ncode = "n",
    userid = "u",
    writer = "w",
    story = "s",
    genre = "g",
    keyword = "k",
    general_firstup = "gf",
    general_lastup = "gl",
    noveltype = "nt",
    end = "e",
    general_all_no = "ga",
    length = "l",
    time = "ti",
    isstop = "i",
    pc_or_k = "p",
    global_point = "gp",
    fav_novel_cnt = "f",
    review_cnt = "r",
    all_point = "a",
    all_hyoka_cnt = "ah",
    sasie_cnt = "sa",
    kaiwaritu = "ka",
    novelupdated_at = "nu",
    updated_at = "ua",
}

/*
    * allunique 閲覧者の多い順(未実装)
    * favnovelcnt	ブックマーク数の多い順
    * reviewcnt	レビュー数の多い順
    * hyoka	総合評価の高い順
    * hyokaasc	総合評価の低い順
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
export enum Order {
    AllUnique = "allunique",
    FavoriteNovelCount = "favnovelcnt",
    ReviewCount = "favnovelcnt",
    HyokaDesc = "hyoka",
    HyokaAsc = "hyokaasc",
    ImpressionCount = "impressioncnt",
    HyokaCountDesc = "hyokacnt",
    HyokaCountAsc = "hyokacntasc",
    Weekly = "weekly",
    LengthDesc = "lengthdesc",
    LengthAsc = "lengthasc",
    NCodeDesc = "ncodedesc",
    NCodeAsc = "old",
}

export enum R18Site {
    Nocturne = 1,
    MoonLight = 2,
    MoonLightBL = 3,
    Midnight = 4,
}

export enum BigGenre {
    Renai = 1,
    Fantasy = 2,
    Bungei = 3,
    Sf = 4,
    Sonota = 99,
    Nongenre = 98,
}

export enum Genre {
    RenaiIsekai = 101,
    RenaiGenjitsusekai = 102,
    FantasyHigh = 201,
    FantasyLow = 202,
    BungeiJyunbungei = 301,
    BungeiHumanDrama = 302,
    BungeiHistory  = 303,
    BungeiSuiri = 304,
    BungeiHorror = 305,
    BungeiAction = 306,
    BungeiComedy = 307,
    SfVrgame = 401,
    SfSpace = 402,
    SfKuusoukagaku = 403,
    SfPanic = 404,
    SonotaDouwa = 9901,
    SonotaShi = 9902,
    SonotaEssei = 9903,
    SonotaReplay = 9904,
    SonotaSonota = 9999,
    Nongenre = 9801,
}

export enum Buntai {
    NoJisageKaigyouOoi  = 1,
    NoJisageKaigyoHutsuu  = 2,
    JisageKaigyoOoi  = 4,
    JisageKaigyoHutsuu  = 6,
}

export enum Stop {
    NoStopping = 1,
    Stopping = 2,
}

export enum NovelType {
    Short = "t",
    RensaiNow = "r",
    RensaiEnd = "er",
    Rensai = "re",
    ShortAndRensai = "ter",
}

export type GzipLevel = 0|1|2|3|4|5