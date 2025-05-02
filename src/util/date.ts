// 日付関連のユーティリティ関数

/**
 * 文字列の日付（yyyyMMdd形式）をDateオブジェクトに変換する
 * @param dateStr yyyyMMdd形式の日付文字列
 * @returns Dateオブジェクト
 */
export function parseDate(dateStr: string): Date {
  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1; // JavaScriptの月は0から始まる
  const day = parseInt(dateStr.substring(6, 8), 10);

  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * 日付をyyyyMMdd形式の文字列に変換する
 * @param date 日付
 * @returns yyyyMMdd形式の文字列
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * 指定された日数を加算した新しい日付を返す
 * @param date 元の日付
 * @param days 加算する日数
 * @returns 新しい日付
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}