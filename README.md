# 📚 node-narou

[![npm version](https://badge.fury.io/js/narou.svg)](https://badge.fury.io/js/narou)
[![Node.js CI](https://github.com/deflis/node-narou/actions/workflows/nodejs-test.yml/badge.svg)](https://github.com/deflis/node-narou/actions/workflows/nodejs-test.yml)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/deflis/node-narou)

[なろうデベロッパー](https://dev.syosetu.com/)の API を fluent interface で利用できる TypeScript ライブラリです。  
A TypeScript wrapper library for Narou Developer APIs with fluent interface.

## ✨ 特徴

- 🔗 **メソッドチェーン対応**: 直感的な fluent interface で API を操作
- 🌐 **マルチ環境対応**: Node.js とブラウザの両方で動作
- 📝 **TypeScript 完全対応**: 型安全性と IntelliSense サポート
- 🔀 **デュアル実装**: fetch (Node.js) と JSONP (ブラウザ) を自動選択
- 📚 **全 API カバー**: なろうデベロッパーの全 API に対応

## 🚀 対応 API

| API | 説明 | 関数 |
|-----|------|------|
| [なろう小説 API](https://dev.syosetu.com/man/api/) | 小説の検索・絞り込み | `search()` |
| [なろう小説ランキング API](https://dev.syosetu.com/man/rankapi/) | ランキング取得 | `ranking()` |
| [なろう殿堂入り API](https://dev.syosetu.com/man/rankinapi/) | ランキング履歴取得 | `rankingHistory()` |
| [なろう R18 小説 API](https://dev.syosetu.com/xman/api/) | 18禁小説検索 | `searchR18()` |
| [なろうユーザ検索 API](https://dev.syosetu.com/man/userapi/) | ユーザー検索 | `searchUser()` |

## 📦 インストール

```bash
# 推奨: pnpm
pnpm add narou

# または
npm install narou
yarn add narou
```

ライブラリは Node.js 16 以上に対応します。Node.js 16 には標準の `fetch` がないため、fetch 互換実装を `NarouNovelFetch` のコンストラクタに渡してください。開発ツールの実行には Node.js 24.11 以上が必要です。

```typescript
import { NarouNovelFetch, search } from "narou";

// fetchImpl は利用環境で用意した fetch 互換関数
const api = new NarouNovelFetch(fetchImpl);
const result = await search("異世界", api).limit(10).execute();
```

## 🚀 クイックスタート

### Node.js での使用

```typescript
import { search, ranking } from "narou";
import { Genre, Order, RankingType } from "narou";

// 異世界恋愛小説を検索
const result = await search("異世界")
  .genre(Genre.RenaiIsekai)
  .order(Order.FavoriteNovelCount)
  .limit(10)
  .execute();

console.log(`${result.allcount}件の小説が見つかりました`);
```

### ブラウザでの使用

```typescript
// ブラウザでは専用のインポートを使用（JSONP対応）
import { search } from "narou/browser";

const result = await search("魔法").execute();
```

## 📖 詳細な API ドキュメント

- **🔗 [完全な API ドキュメント](https://deflis.github.io/node-narou/)** - TypeDoc で生成された詳細なドキュメント
- **🤖 [LLM 向けドキュメント](https://deflis.github.io/node-narou/llms.txt)** - AI/LLM が理解しやすい形式のドキュメント（TypeDoc JSON から自動生成）

## 📝 使用例

```typescript
import { search, ranking, rankingHistory, searchR18 } from "narou";
import {
  Genre,
  GenreNotation,
  Order,
  NovelTypeParam,
  RankingType,
  R18Site,
  R18SiteNotation,
} from "narou";

// なろう小説 API
const searchResult = await search("word")
  .genre(Genre.RenaiIsekai) // 異世界〔恋愛〕
  .order(Order.FavoriteNovelCount) // ブックマーク数の多い順
  .type(NovelTypeParam.RensaiNow) // 連載中
  .execute();

console.log(searchResult.allcount);

for (const novel of searchResult.values) {
  console.log(novel.title);
  console.log(novel.ncode);
  console.log(GenreNotation[novel.genre]); // 値から名前を取得できるヘルパーもあります
}

// なろう小説ランキング API
const rankingResult = await ranking()
  .date(new Date("2023-04-01"))
  .type(RankingType.Daily)
  .execute();

for (const novel of rankingResult) {
  console.log(novel.ncode);
  console.log(novel.rank);
  console.log(novel.pt);
}

// なろう小説ランキング API となろう小説 API を組み合わせたヘルパーもあります
const rankingResultWithDetail = await ranking()
  .date(new Date("2023-04-01"))
  .type(RankingType.Daily)
  .executeWithFields();

for (const novel of rankingResultWithDetail) {
  console.log(novel.ncode);
  console.log(novel.rank);
  console.log(novel.pt);
  console.log(novel.title);
}

// なろう殿堂入り API
const rankingHistoryResult = await rankingHistory("**NCODE**");

for (const history of rankingHistoryResult) {
  console.log(history.type);
  console.log(history.date);
  console.log(history.pt);
  console.log(history.rank);
}

// 18禁小説 API
const searchR18Result = await searchR18("word")
  .r18Site(R18Site.Nocturne) // ノクターン
  .order(Order.FavoriteNovelCount) // ブックマーク数の多い順
  .type(NovelTypeParam.RensaiNow) // 連載中
  .execute();

console.log(searchR18Result.allcount);

for (const novel of searchR18Result.values) {
  console.log(novel.title);
  console.log(novel.ncode);
  console.log(R18SiteNotation[novel.nocgenre]); // 値から名前を取得できるヘルパーもあります
}
```

## 🛠️ 開発

開発には Node.js 24.11 以上と pnpm 12.16.1 以上を使用します。pnpm のバージョンは `package.json` の `packageManager` で固定しています。

型チェックは TypeScript 7、Lint は Oxlint（型情報を使用）、フォーマットは Oxfmt、ビルドは tsdown、テストは Vitest を使用します。TypeDoc は TypeScript 7 未対応のため、`tools/docs/` の専用ワークスペースに TypeScript 6 とともに分離しています。

```bash
# 依存関係のインストール
pnpm install

# ビルド
pnpm run build

# テスト実行
pnpm run test

# カバレッジ計測
pnpm run test:coverage

# 型チェック
pnpm run check

# ドキュメント生成（TypeDoc + llms.txt）
pnpm run docs
```

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成: `git checkout -b my-new-feature`
3. 変更をコミット: `git commit -am 'Add some feature'`
4. ブランチにプッシュ: `git push origin my-new-feature`
5. プルリクエストを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。
