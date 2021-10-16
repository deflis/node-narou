import { gunzip, InputType } from "zlib";
import { promisify } from "util";

const gunzipAsync = promisify<InputType, Buffer>(gunzip);

export async function unzipp(data: InputType) {
  const buffer = await gunzipAsync(data);
  return JSON.parse(buffer.toString());
}
