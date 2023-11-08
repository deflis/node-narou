import { gunzip, InputType } from "zlib";
import { promisify } from "util";

const gunzipAsync = promisify<InputType, Buffer>(gunzip);

const decoder = new TextDecoder()
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
