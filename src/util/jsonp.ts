/**
 * MIT license
 */

// Callback index.
let count = 0;

type CallbackId<Prefix extends string = string> = `${Prefix}${number}`;

declare global {
  interface Window {
    [key: CallbackId]: ((data: unknown) => void) | undefined;
  }
}

// 既存のグローバル変数を上書きしないコールバック関数名を生成する。
function nextCallbackId(prefix: string): CallbackId {
  while (true) {
    const id: CallbackId = `${prefix}${count++}`;
    if (!(id in window)) return id;
  }
}

// タイムアウト直後の遅延レスポンスを受け流す猶予時間。
const lateResponseTimeout = 15000;

/**
 * JSONP呼び出しのオプション設定
 */
export type JsonpOption = {
  /**
   * コールバック関数名のプレフィックス
   * @default "__jp"
   */
  prefix?: string;

  /**
   * コールバック関数名を指定するURLパラメータ名
   * @default "callback"
   */
  param?: string;

  /**
   * タイムアウト時間（ミリ秒）
   * 0以下の場合はタイムアウトしません。
   * タイムアウト後は遅延レスポンス用の関数を最大15秒間保持します。
   * @default 15000
   */
  timeout?: number;
};

/**
 * JSONPリクエストを実行してデータを取得します。
 *
 * @param url - リクエスト先のURL
 * @param options - JSONP呼び出しのオプション設定
 * @returns JSONPリクエストの結果をPromiseで返します
 * @throws {Error} タイムアウトが発生した場合、"Timeout"メッセージのエラーをスローします
 *
 * @example
 * ```typescript
 * // 基本的な使用方法
 * const data = await jsonp<ResponseType>('https://example.com/api');
 *
 * // オプション指定
 * const data = await jsonp<ResponseType>('https://example.com/api', {
 *   prefix: 'customPrefix',
 *   param: 'callbackParam',
 *   timeout: 10000
 * });
 * ```
 */
export function jsonp<T>(
  url: string,
  { prefix = "__jp", param = "callback", timeout = 15000 }: JsonpOption = {}
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // 副作用を起こす前にURLとscriptを準備する。
    const urlObj = new URL(url);

    // 最初のscriptタグの直前に挿入する。scriptがない場合はheadを使用する。
    const targetChild = document.getElementsByTagName("script").item(0);
    const target = targetChild?.parentNode ?? document.head;
    const script = document.createElement("script");

    // ユニークなコールバック関数名を生成し、URLパラメータに追加する。
    const id = nextCallbackId(prefix);

    urlObj.searchParams.set(param, id);
    script.setAttribute("src", urlObj.toString());

    // 応答・読み込みイベント・タイムアウトによる終了処理の重複を防ぐ。
    let settled = false;

    // タイマー、イベントハンドラー、scriptタグ、コールバックを解放する。
    const cleanup = (allowLateResponse = false) => {
      if (timer !== undefined) clearTimeout(timer);
      script.onload = null;
      script.onerror = null;
      if (script.parentNode) script.parentNode.removeChild(script);

      if (allowLateResponse) {
        // 即時削除による遅延レスポンスのReferenceErrorを一定時間防ぐ。
        // 応答が来ない場合も期限後に削除し、windowに蓄積させない。
        const discard = () => {
          clearTimeout(expiry);
          // 別の処理が同名のプロパティを設定していた場合は削除しない。
          if (window[id] === discard) delete window[id];
        };
        const expiry = setTimeout(discard, lateResponseTimeout);
        window[id] = discard;
      } else {
        delete window[id];
      }
    };

    // エラー時もリソースを解放してからPromiseをrejectする。
    const fail = (error: unknown, allowLateResponse = false) => {
      if (settled) return;
      settled = true;
      cleanup(allowLateResponse);
      reject(error);
    };

    // JSONPレスポンスから呼び出せるよう、コールバックをwindowに登録する。
    // データ受信後はリソースを解放し、Promiseをresolveする。
    window[id] = (data: unknown) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(data as T);
    };
    // 読み込み失敗や、コールバックを呼ばずに読み込みが完了した場合を検知する。
    script.onerror = () => fail(new Error("JSONP script failed to load"));
    script.onload = () => fail(new Error("JSONP callback was not called"));

    // 指定時間内に応答がなければエラーにする。0以下の場合は無効にする。
    const timer =
      timeout > 0
        ? setTimeout(() => fail(new Error("Timeout"), true), timeout)
        : undefined;

    // DOMにscriptタグを挿入してリクエストを開始する。
    // 挿入自体が例外になった場合も、登録済みのコールバックとタイマーを解放する。
    try {
      target.insertBefore(script, targetChild);
    } catch (error) {
      fail(error);
    }
  });
}
