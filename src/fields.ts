
/**
 * {@link SearchBuilder#Field}メソッドにパラメータを指定する際のヘルパー。
 * @typedef {Object} Field
 * @property {number} title 小説名
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

type Field = "t"| "n"| "u"| "w"| "s"| "g"|"k"|"gf"|"gl"|"nt"|"e"|"ga"|"l"|"ti"| "i"| "p"| "gp"| "f"| "r"| "a"| "ah"| "sa"| "ka"| "nu"| "ua";
namespace Field {
    export const title: Field = "t"
    export const ncode: Field = "n"
    export const userid: Field = "u"
    export const writer: Field = "w"
    export const story: Field = "s"
    export const genre: Field = "g"
    export const keyword: Field = "k"
    export const general_firstup: Field = "gf"
    export const general_lastup: Field = "gl"
    export const noveltype: Field = "nt"
    export const end: Field = "e"
    export const general_all_no: Field = "ga"
    export const length: Field = "l"
    export const time: Field = "ti"
    export const isstop: Field = "i"
    export const pc_or_k: Field = "p"
    export const global_point: Field = "gp"
    export const fav_novel_cnt: Field = "f"
    export const review_cnt: Field = "r"
    export const all_point: Field = "a"
    export const all_hyoka_cnt: Field = "ah"
    export const sasie_cnt: Field = "sa"
    export const kaiwaritu: Field = "ka"
    export const novelupdated_at: Field = "nu"
    export const updated_at: Field = "ua"
}
export default Field