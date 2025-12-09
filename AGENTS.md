# Repository Guidelines

## プロジェクト構成とモジュール整理
- ライブラリ本体は `src/`（Node 向け `index.ts`、ブラウザ向け `index.browser.ts`、共通実装 `index.common.ts`、ビルダー類や Narou API 実装が置かれます）。ユーティリティは `src/util/`。
- テストは `test/` に機能別の `*.test.ts` と `mock.ts`（MSW による API モック）を配置。ビルド成果物は `dist/`（コミット対象外）が生成されます。
- ドキュメントは TypeDoc 生成物として `docs/` に出力（`docs:clean` でクリア）。設定ファイルは `tsconfig.json`、`eslint.config.mjs`、`vitest.config.ts`、ビルドは `tsup.config.ts`。

## ビルド・テスト・開発コマンド
- 依存取得: `pnpm install`（pnpm>=8, Node>=16）
- 全チェック: `pnpm run check`（lint + 型チェック + テスト）
- ビルド: `pnpm run build`（tsup で ESM/CJS/ブラウザ向け出力） / 型のみ: `pnpm run check:build`
- Lint/フォーマット: `pnpm run check:lint` / 自動修正: `pnpm run format`
- テスト: `pnpm run test`（Vitest、V8 カバレッジレポート出力）
- ドキュメント: `pnpm run docs`（clean→typedoc→api.json→llms.txt）

## コーディングスタイルと命名
- TypeScript/ES2020、strict モード。モジュール解決は bundler ベース、ESM 前提。
- ESLint + @typescript-eslint + Prettier（`eslint.config.mjs`）。ファイル名はケバブケース、型・クラスは PascalCase、関数/変数は lowerCamelCase。インデント 2 スペース、セミコロンあり。
- ビルダーはメソッドチェーンで引数を組み立てる設計を踏襲すること。Narou API エンドポイントやパラメータは `params.ts` の型に従う。
- fetch 実装 (`narou-fetch.ts`) と JSONP 実装 (`narou-jsonp.ts`) で同一の抽象 API (`narou.ts`) を満たす構造。共通処理は `index.common.ts` に寄せ、新規 API を追加する際は共通型→抽象→個別実装の順に拡張する。
- ブラウザ向けコードでは JSONP の script 挿入周りでグローバル汚染を避けるため、既存ユーティリティ（`util/` 配下）を再利用する。

## テスト指針
- Vitest を使用し、MSW で外部 API をモック。新規機能は成功系とエラー系を `test/<feature>.test.ts` に追加し、ビルダーのチェーン結果・クエリ生成を検証する。
- カバレッジはデフォルトで text/json/json-summary を出力。ローカルで失敗を防ぐため、`pnpm run check` を PR 前に実行。
- 通信仕様変更時はモックレスポンスと期待型をセットで更新し、`mock.ts` のシナリオを増やして後方互換を確認する。非決定的な値を扱う場合はスナップショットより型ベースの検証を優先。

## 設定・セキュリティ・リリースTips
- 環境要件: Node 16 以上、pnpm 8 以上。CI 互換を保つため LTS 系での動作確認を推奨。
- 外部 API は公開エンドポイントだが、追加で秘密鍵を使う処理を導入しないこと。テストやサンプルで個人情報・トークンを埋め込まない。
- 公開前に `dist/` を再生成し、`package.json` の `files` に含まれることを確認。`prepack` は format→build を実行するため、ローカルで失敗しない状態に整えてから publish/リリース作業を行う。
