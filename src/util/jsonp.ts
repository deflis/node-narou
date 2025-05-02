/**
 * MIT license
 */

// Callback index.
let count = 0;

type CallbackId<Prefix extends string = string> = `${Prefix}${number}`;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: CallbackId]: (data: any) => void;
  }
}

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
   * @default 15000
   */
  timeout?: number;
};

const noop = function () { };

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
  return new Promise(function (resolve, reject) {
    // 最初のscriptタグを取得し、そのタグの直前に新しいscriptタグを挿入するための参照を取得
    // これにより、ページの構造を大きく変えることなくscriptを追加できる
    const targetChild = document.getElementsByTagName("script").item(0);
    const target = targetChild?.parentNode ?? document.head;

    // ユニークなコールバック関数名を生成
    const id: CallbackId = `${prefix}${count++}`;
    
    // リソース解放用の関数を定義
    // スクリプトタグの削除、コールバック関数のクリーンアップ、タイマーのクリアを行う
    const cleanup = function () {
      // Remove the script tag.
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }

      // コールバック関数を空の関数に置き換えてメモリリークを防止
      window[id] = noop;

      if (timer) {
        clearTimeout(timer);
      }
    };

    // タイムアウト処理の設定
    // 指定された時間内にレスポンスがない場合はエラーとして処理
    const timer =
      timeout > 0
        ? setTimeout(() => {
          cleanup();
          reject(new Error("Timeout"));
        }, timeout)
        : undefined;

    // サーバーからのレスポンスを処理するコールバック関数
    const callback = (data: T) => {
      cleanup();
      resolve(data);
    };
    
    // グローバルスコープにコールバック関数を登録
    // これによりJSONPのレスポンスから関数が呼び出せるようになる
    window[id] = callback;

    // JSONPリクエスト用のscriptタグを作成
    const script = document.createElement("script");
    const urlObj = new URL(url);
    
    // URLにコールバック関数名をパラメータとして追加
    urlObj.searchParams.set(param, id);
    script.setAttribute("src", urlObj.toString());
    
    // DOMにscriptタグを挿入し、リクエストを開始
    target.insertBefore(script, targetChild);
  });
}
