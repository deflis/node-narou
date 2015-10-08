// LICENSE : MIT
"use strict";
import 'source-map-support/register';
import assert from 'power-assert';

import narou from "../";

describe("narou-test", function () {
    context("search", () => {
        it("if limit = 1 then length = 1", () =>
            narou
                .search()
                .limit(1)
                .fields([])
                .execute()
                .then((json) => {
                        assert(json.values.length === 1);
                    })
        );
        it("ncode n1701bm is 異世界食堂", () =>
                narou
                    .search()
                    .ncode("n1701bm")
                    .fields([narou.fields.title])
                    .execute()
                    .then((json) => {
                        assert(json.values.length === 1);
                        assert(json.values[0].title == "異世界食堂");
                    })
        )
        it("ncode n1701bm, n1443bp is 異世界食堂. 異世界はスマートフォンとともに。", () =>
                narou
                    .search()
                    .ncode(["n1701bm", "n1443bp"])
                    .fields([narou.fields.title])
                    .execute()
                    .then((json) => {
                        assert(json.values.length === 2);
                        assert(json.values[1].title == "異世界食堂");
                        assert(json.values[0].title == "異世界はスマートフォンとともに。");
                    })
        )

        it("ncode N1707CX is テスト小説なのです。", () =>
                narou
                    .search()
                    .ncode("N1707CX")
                    .fields([narou.fields.title])
                    .execute()
                    .then((json) => {
                        assert(json.values.length === 1);
                        assert(json.values[0].title == "テスト小説なのです。");
                    })
        )

        it("word テスト小説なのです。", () =>
                narou
                    .search()
                    .word("テスト小説なのです。")
                    .fields([narou.fields.title])
                    .execute()
                    .then((json) => {
                        assert(json.values.length === 1);
                        assert(json.values[0].title == "テスト小説なのです。");
                    })
        )

        it("gzip support", () =>
                Promise.all([narou
                    .search()
                    .ncode("N1707CX")
                    .fields([narou.fields.title])
                    .gzip(5)
                    .execute()
                    .then((json) => {
                        assert(json.values.length === 1);
                        assert(json.values[0].title == "テスト小説なのです。");
                    }), narou
                    .search()
                    .ncode("N1707CX")
                    .fields([narou.fields.title])
                    .gzip(0)
                    .execute()
                    .then((json) => {
                        assert(json.values.length === 1);
                        assert(json.values[0].title == "テスト小説なのです。");
                    })])
        )

    })
});
