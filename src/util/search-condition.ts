import type { Join } from "./type.js";

/**
 * {@link NovelSearchBuilderBase.lastUpdate}・{@link NovelSearchBuilderBase.lastNovelUpdate} の日時範囲。
 *
 * @remarks
 * `from`・`to` は境界を含み、少なくとも片方の指定が必要です。
 * `from` の省略時はUNIXタイムスタンプ0、`to` の省略時は条件指定時の現在時刻を使用します。
 * 値は `Date` または0以上の整数のUNIXタイムスタンプ（秒）で、混在も可能です。
 * `Date` のミリ秒部分は切り捨てます。開始日時は終了日時以下にしてください。
 *
 * @example
 * ```ts
 * const range: DateSearchCondition = { from: new Date("2026-01-01T00:00:00Z") };
 * ```
 */
export type DateSearchCondition =
  | { from: number | Date; to?: number | Date }
  | { from?: number | Date; to: number | Date };

/**
 * 文字数・会話率・挿絵数・読了時間に使用する数値範囲。
 *
 * @remarks
 * `min`・`max` は境界を含み、片側だけでも指定できます。
 * 値は0以上の整数で、下限は上限以下にしてください。
 * 単位は各検索メソッドに従います。完全一致は数値をメソッドに直接渡します。
 *
 * @example
 * ```ts
 * const range: NumberSearchCondition = { min: 1000, max: 10000 };
 * const minimum: NumberSearchCondition = { min: 1000 };
 * const maximum: NumberSearchCondition = { max: 10000 };
 * ```
 */
export type NumberSearchCondition =
  | { min: number; max?: number }
  | { min?: number; max: number };

/** 配列から重複を除去する。 */
function distinct<T>(values: readonly T[]): T[] {
  return Array.from(new Set(values));
}

/** 複数指定を重複のないハイフン区切りの文字列に変換する。 */
export function formatListCondition<T extends string | number>(
  value: T | readonly T[]
): Join<T> {
  return (typeof value === "object"
    ? distinct(value).join("-")
    : value.toString()) as Join<T>;
}

/** 数値・配列・オブジェクトの検索条件をAPIの文字列に変換する。 */
export function formatNumberCondition(
  condition: number | readonly number[] | NumberSearchCondition
): Join<number | ""> {
  if (typeof condition === "number" || Array.isArray(condition)) {
    return formatListCondition(condition);
  }
  const { min, max } = condition as NumberSearchCondition;
  return formatRange(min, max);
}

/** 数値の1引数・2引数形式とオブジェクト形式を変換する。 */
export function formatNumberBounds(
  min: number | NumberSearchCondition,
  max?: number
): number | string {
  if (typeof min === "object") return formatNumberCondition(min);
  return max == null ? min : `${min}-${max}`;
}

/** 日時の文字列・一致・2引数の範囲・オブジェクト形式を変換する。 */
export function formatDateCondition(
  condition: string | number | Date | DateSearchCondition,
  end: number | Date | undefined
): string {
  if (typeof condition === "string") return condition;
  if (typeof condition === "number" || condition instanceof Date) {
    if (end === undefined) return formatExactDate(condition);
    // 両端がDateの場合は秒に変換する。
    if (condition instanceof Date && end instanceof Date) {
      return `${toTimestamp(condition)}-${toTimestamp(end)}`;
    }
    return `${String(condition)}-${String(end)}`;
  }
  const { from, to } = condition;
  if (from === undefined && to === undefined) {
    throw new TypeError("開始日時または終了日時を指定してください");
  }
  return formatRange(
    from === undefined ? 0 : toTimestamp(from),
    to === undefined ? Math.floor(Date.now() / 1000) : toTimestamp(to)
  );
}

/** 単一日時を秒単位の一致条件に変換する。 */
function formatExactDate(value: number | Date): string {
  const timestamp = toTimestamp(value);
  return formatRange(timestamp, timestamp);
}

/** 日時を秒単位に揃える。値の検証は共通の範囲処理で行う。 */
function toTimestamp(value: number | Date): number {
  return value instanceof Date ? Math.floor(value.getTime() / 1000) : value;
}

/** 数値の境界を検証し、片側省略を許すAPIの範囲指定を生成する。 */
function formatRange(
  min: number | undefined,
  max: number | undefined
): `${number | ""}-${number | ""}` {
  if (min === undefined && max === undefined) {
    throw new TypeError("範囲の下限または上限を指定してください");
  }
  if (min !== undefined) validateRangeValue(min);
  if (max !== undefined) validateRangeValue(max);
  if (min !== undefined && max !== undefined && min > max) {
    throw new RangeError("範囲の下限は上限以下にしてください");
  }
  return `${min ?? ""}-${max ?? ""}`;
}

function validateRangeValue(value: number): void {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    throw new RangeError(
      "検索条件には有効な日付または0以上の整数を指定してください"
    );
  }
}
