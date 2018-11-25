// LICENSE : MIT
"use strict";
import 'source-map-support/register';
import {assert} from 'chai';

import MockAdapter from 'axios-mock-adapter';
import NarouAPI, { Fields } from "../src/";

describe("narou-test", () => {
    context("search", () => {
        it("if limit = 1 then length = 1", async () => {
            const result = await NarouAPI
                .search()
                .limit(1)
                .fields([])
                .execute();
            assert(result.values.length === 1);
        });
        it("ncode n1701bm is 異世界食堂", async () => {
            const result = await NarouAPI
                .search()
                .ncode("n1701bm")
                .fields([Fields.title])
                .execute();
            assert(result.values.length === 1);
            assert(result.values[0].title == "異世界食堂");
        });
        it("ncode n1701bm, n1443bp is 異世界食堂. 異世界はスマートフォンとともに。", async () => {
            const result = await NarouAPI
                .search()
                .ncode(["n1701bm", "n1443bp"])
                .fields([Fields.title])
                .execute();
            assert(result.values.length === 2);
            assert(result.values[1].title == "異世界食堂");
            assert(result.values[0].title == "異世界はスマートフォンとともに。");
        })

        it("ncode N1707CX is テスト小説なのです。", async () => {
            const result = await NarouAPI
                .search()
                .ncode("N1707CX")
                .fields([Fields.title])
                .execute();
            assert(result.values.length === 1);
            assert(result.values[0].title == "テスト小説なのです。");
        })

        it("word テスト小説なのです。", async () => {
            const result = await NarouAPI
                .search()
                .word("テスト小説なのです。")
                .fields([Fields.title])
                .execute();
            assert(result.values.length === 1);
            assert(result.values[0].title == "テスト小説なのです。");
        })

        context("gzip support", () => {
            it("level:5", async () => {
                const result = await NarouAPI
                    .search()
                    .ncode("N1707CX")
                    .fields([Fields.title])
                    .gzip(5)
                    .execute();
                assert(result.values.length === 1);
                assert(result.values[0].title == "テスト小説なのです。");
            })

            it("level:0", async () => {
                const result = await NarouAPI
                    .search()
                    .ncode("N1707CX")
                    .fields([Fields.title])
                    .gzip(0)
                    .execute();
                assert(result.values.length === 1);
                assert(result.values[0].title == "テスト小説なのです。");
            })
        })
    })
});
