/**
 * 文字列に変換可能な型を表します。
 * 
 * このタイプには以下が含まれます：
 * - `string`: 文字列プリミティブ
 * - `number`: 数値
 * - `bigint`: 任意精度の整数
 * - `boolean`: 真/偽の値
 * - `null`: null値
 * - `undefined`: undefined値
 * 
 * これらの型はすべて、文字列連結や文字列変換可能な値を期待する関数で安全に使用できます。
 */
type Stringable = string | number | bigint | boolean | null | undefined;

/**
 * ハイフンで結合された2つの文字列変換可能な値、または単一の値を表すユーティリティタイプ。
 * 
 * @template T - 文字列に変換可能な型
 * @returns `${T}-${T}` (ハイフンで結合された2つの値) または `${T}` (単一の値)
 * 
 * @example
 * type Numbers = 1 | 2 | 3;
 * type JoinedNumbers = Join<Numbers>; // '1' | '2' | '3' | '1-1' | '1-2' | '1-3' | '2-1' | '2-2' | '2-3' | '3-1' | '3-2' | '3-3'
 */
export type Join<T extends Stringable> = `${T}-${T}` | `${T}`;
