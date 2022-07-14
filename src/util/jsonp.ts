/**
 * MIT license
 */
import nodeURL from "./url";

// Callback index.
let count = 0;

type CallbackId<Prefix extends string = string> = `${Prefix}${number}`;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: CallbackId]: (data: any) => void;
  }
}
export type JsonpOption = {
  prefix?: string;
  param?: string;
  timeout?: number;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = function () {};

export function jsonp<T>(
  url: string,
  { prefix = "__jp", param = "callback", timeout = 15000 }: JsonpOption = {}
): Promise<T> {
  return new Promise(function (resolve, reject) {
    const targetChild = document.getElementsByTagName("script").item(0);
    const target = targetChild?.parentNode ?? document.head;

    const id: CallbackId = `${prefix}${count++}`;
    const cleanup = function () {
      // Remove the script tag.
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }

      window[id] = noop;

      if (timer) {
        clearTimeout(timer);
      }
    };

    const timer =
      timeout > 0
        ? setTimeout(() => {
            cleanup();
            reject(new Error("Timeout"));
          }, timeout)
        : undefined;

    const callback = (data: T) => {
      cleanup();
      resolve(data);
    };
    window[id] = callback;

    // Create script.
    const script = document.createElement("script");
    const urlObj = new nodeURL(url);
    urlObj.searchParams.set(param, id);
    script.setAttribute("src", urlObj.toString());
    target.insertBefore(script, targetChild);
  });
}
