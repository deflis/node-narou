# node-narou

[なろうデベロッパー](https://dev.syosetu.com/)の API を fluent interface で利用できるラッパーライブラリです。
ブラウザでの JSONP の利用も可能です。

以下の API をラップしています。

- [なろう小説 API](https://dev.syosetu.com/man/api/)
- [なろう小説ランキング API](https://dev.syosetu.com/man/rankapi/)
- [なろう殿堂入り API](https://dev.syosetu.com/man/rankinapi/)
- [なろう R18 小説 API](https://dev.syosetu.com/xman/api/)

## Installation

以下のコマンドでインストールできます。

```
npm install narou
```

## Usage - API

https://deflis.github.io/node-narou/ を参照してください。

ブラウザで利用したい場合 `narou/browser` をimportしてください。こちらを利用することで自動的にfetch(nodejs)への依存がなくなり、JSONPを利用するようになります。

すでにサポート終了していますがfetchをサポートしないNode.jsバージョンで利用する場合は 、 `NarouNovelFetch` にfetchのNode.js実装を渡してください。
なお、その場合の動作は確認していないので動かなければIssueを立ててください。


## Example

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

## Development

```

# watch

npm run watch

# build

npm run build

# test

npm run test

```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
