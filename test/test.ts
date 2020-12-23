// LICENSE : MIT
"use strict";
import "source-map-support/register";
import { assert } from "chai";

import NarouAPI, { Fields } from "../src/";

describe("narou-test", () => {
  context("search", () => {
    it("if limit = 1 then length = 1", async () => {
      const result = await NarouAPI.search()
        .limit(1)
        .fields([Fields.ncode])
        .execute();
      assert(result.values.length === 1);
    });
    it("if gzip = 0", async () => {
      const result = await NarouAPI.search()
        .limit(1)
        .fields([Fields.ncode])
        .gzip(0)
        .execute();
      assert(result.values.length === 1);
    });
  });
  context("ranking", () => {
    it("2020/01/01 is length 300", async () => {
      const result = await NarouAPI.ranking()
        .date(new Date(2020, 1, 1))
        .execute();
      assert(result.length === 300);
    });
    it("2020/01/01 with fields is length 300", async () => {
      const result = await NarouAPI.ranking()
        .date(new Date(2020, 1, 1))
        .executeWithFields([Fields.ncode]);
      assert(result.length === 300);
    });
  });
  context("history", () => {
    it("Error: Novel not found.", async () => {
      try {
        await NarouAPI.rankingHistory("n4444ge");
        assert.fail();
      } catch {}
    });
    it("n4444ge", async () => {
      const result = await NarouAPI.rankingHistory("n4444ge");
      assert.isArray(result);
    });
  });
});
