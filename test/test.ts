// LICENSE : MIT
"use strict";
import "source-map-support/register";
import { assert } from "chai";

import MockAdapter from "axios-mock-adapter";
import NarouAPI, { Fields } from "../src/";

describe("narou-test", () => {
  context("search", () => {
    it("if limit = 1 then length = 1", async () => {
      const result = await NarouAPI.search()
        .limit(1)
        .fields([])
        .execute();
      assert(result.values.length === 1);
    });
  });
});
