import { gunzip, InputType } from "zlib";
import { promisify } from "util";

const gunzipAsync = promisify<InputType, Buffer>(gunzip);

const decoder = new TextDecoder()
/**
 * 圧縮されたJSONデータを解凍して解析します。
 * 
 * @param data - ArrayBuffer形式の圧縮データ
 * @returns 解凍されたデータからパースされたJSONオブジェクト
 * @throws {string} データが解凍できない、または解凍されたデータが有効なJSONでない場合、
 *                  解凍されたデータの文字列表現をスローします。
 * @throws {string} 解凍中にエラーが発生した場合、元のデータの文字列表現をスローします。
 */
export async function unzipp(data: ArrayBuffer) {
  try {
    const buffer = await gunzipAsync(data);
    try {
      return JSON.parse(decoder.decode(buffer));
    } catch {
      throw decoder.decode(buffer);
    }
  } catch (e) {
    if (typeof e === "string") throw e;
    throw decoder.decode(data);
  }
}
