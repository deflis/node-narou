/**
 * {@link NovelSearchBuilderBase.lastUpdate}・{@link NovelSearchBuilderBase.lastNovelUpdate} の日時範囲。
 *
 * @remarks
 * `from`・`to` は境界を含み、少なくとも片方の指定が必要です。
 * 省略した側には制限を設けません。
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

/** 数値条件をAPIの範囲指定に変換する。 */
export function formatNumberCondition(
  condition: NumberSearchCondition
): `${number | ""}-${number | ""}` {
  return formatRange(condition.min, condition.max);
}

function conditionValue(value: number | Date): number {
  const number =
    value instanceof Date ? Math.floor(value.getTime() / 1000) : value;
  if (!Number.isFinite(number) || !Number.isInteger(number) || number < 0) {
    throw new RangeError(
      "検索条件には有効な日付または0以上の整数を指定してください"
    );
  }
  return number;
}

/** 日付条件をAPIの範囲指定に変換する。 */
export function formatDateCondition(condition: DateSearchCondition): string {
  return formatRange(condition.from, condition.to);
}

/** 単一日時を秒単位の一致条件に変換する。 */
export function formatExactDate(value: number | Date): string {
  const timestamp = conditionValue(value);
  return `${timestamp}-${timestamp}`;
}

function formatRange(
  from: number | Date | undefined,
  to: number | Date | undefined
): `${number | ""}-${number | ""}` {
  if (from === undefined && to === undefined) {
    throw new TypeError("範囲の下限または上限を指定してください");
  }
  const min = from === undefined ? undefined : conditionValue(from);
  const max = to === undefined ? undefined : conditionValue(to);
  if (min !== undefined && max !== undefined && min > max) {
    throw new RangeError("範囲の下限は上限以下にしてください");
  }
  return `${min ?? ""}-${max ?? ""}`;
}
