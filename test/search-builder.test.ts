import {
  beforeAll,
  afterAll,
  afterEach,
  describe,
  test,
  expect,
  vi,
} from "vitest";
import { setupServer } from "msw/node";
import { responseGzipOrJson } from "./mock";
import NarouAPI, {
  BigGenre,
  BooleanNumber,
  BuntaiParam,
  Fields,
  Genre,
  NovelTypeParam,
  OptionalFields,
  Order,
  StopParam,
} from "../src";
import { http } from "msw";

const server = setupServer();

describe("SearchBuilder", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe("gzip", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("gzip"),
            url.searchParams.get("out"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );
      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("5", "json", 2);
    });

    test("if gzip = 0", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("gzip"),
            url.searchParams.get("out"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().gzip(0).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(null, "json", 1);
    });

    test.each([1, 2, 3, 4, 5] as const)("if gzip = %i", async (gzip) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("gzip"),
            url.searchParams.get("out"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().gzip(gzip).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(gzip.toString(), "json", 2);
    });
  });

  describe("limit", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("lim"),
            url.searchParams.get("out"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, "json", 2);
    });

    test.each([1, 10, 100, 500] as const)("if limit = %i", async (limit) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("lim"),
            url.searchParams.get("out"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().limit(limit).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(limit.toString(), "json", 3);
    });
  });

  describe("start", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("start"),
            url.searchParams.get("out"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, "json", 2);
    });

    test.each([1, 10, 100, 500] as const)("if start = %i", async (start) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("st"),
            url.searchParams.get("out"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().start(start).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(start.toString(), "json", 3);
    });
  });

  describe("page", () => {
    describe("default count", () => {
      test.each([1, 2, 3, 4, 5] as const)("if page = %i", async (count) => {
        const mockFn = vi.fn();
        server.use(
          http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
            const url = new URL(request.url);
            const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
            mockFn(
              url.searchParams.get("lim"),
              url.searchParams.get("st"),
              url.searchParams.get("out"),
              url.searchParams.size
            );

            return responseGzipOrJson(response, url);
          })
        );

        const result = await NarouAPI.search().page(count).execute();
        expect(result.allcount).toBe(1);
        expect(result.length).toBe(1);
        expect(result.values).toHaveLength(1);
        expect(result.values[0].ncode).toBe("N1234AB");
        expect(mockFn).toHaveBeenCalledTimes(1);
        // MEMO: gzipがついているのでsizeが4になる
        expect(mockFn).toHaveBeenCalledWith(
          "20",
          (count * 20).toString(),
          "json",
          4
        );
      });
    });

    describe.each([1, 10, 100, 500] as const)("if count = %i", (count) => {
      test.each([1, 2, 3, 4, 5] as const)("if count = %i", async (page) => {
        const mockFn = vi.fn();
        server.use(
          http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
            const url = new URL(request.url);
            const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
            mockFn(
              url.searchParams.get("lim"),
              url.searchParams.get("st"),
              url.searchParams.get("out"),
              url.searchParams.size
            );

            return responseGzipOrJson(response, url);
          })
        );

        const result = await NarouAPI.search().page(page, count).execute();
        expect(result.allcount).toBe(1);
        expect(result.length).toBe(1);
        expect(result.values).toHaveLength(1);
        expect(result.values[0].ncode).toBe("N1234AB");
        expect(mockFn).toHaveBeenCalledTimes(1);
        // MEMO: gzipがついているのでsizeが4になる
        expect(mockFn).toHaveBeenCalledWith(
          count.toString(),
          (page * count).toString(),
          "json",
          4
        );
      });
    });
  });

  describe("order", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(url.searchParams.get("order"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    describe.each(Object.values(Order))("if order = %s", (order) => {
      test(order, async () => {
        const mockFn = vi.fn();
        server.use(
          http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
            const url = new URL(request.url);
            const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
            mockFn(url.searchParams.get("order"), url.searchParams.size);

            return responseGzipOrJson(response, url);
          })
        );

        const result = await NarouAPI.search().order(order).execute();
        expect(result.allcount).toBe(1);
        expect(result.length).toBe(1);
        expect(result.values).toHaveLength(1);
        expect(result.values[0].ncode).toBe("N1234AB");
        expect(mockFn).toHaveBeenCalledTimes(1);
        // MEMO: gzipとoutがついているのでsizeが3になる
        expect(mockFn).toHaveBeenCalledWith(order, 3);
      });
    });
  });

  describe("word", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(url.searchParams.get("word"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test.each(["test", "テスト", "1234", "あいう"])(
      "if word = %s",
      async (word) => {
        const mockFn = vi.fn();
        server.use(
          http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
            const url = new URL(request.url);
            const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
            mockFn(url.searchParams.get("word"), url.searchParams.size);

            return responseGzipOrJson(response, url);
          })
        );

        const result = await NarouAPI.search().word(word).execute();
        expect(result.allcount).toBe(1);
        expect(result.length).toBe(1);
        expect(result.values).toHaveLength(1);
        expect(result.values[0].ncode).toBe("N1234AB");
        expect(mockFn).toHaveBeenCalledTimes(1);
        // MEMO: gzipとoutがついているのでsizeが3になる
        expect(mockFn).toHaveBeenCalledWith(word, 3);
      }
    );
  });

  describe("notWord", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(url.searchParams.get("notword"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test.each(["test", "テスト", "1234", "あいう"])(
      "if not word = %s",
      async (word) => {
        const mockFn = vi.fn();
        server.use(
          http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
            const url = new URL(request.url);
            const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
            mockFn(url.searchParams.get("notword"), url.searchParams.size);

            return responseGzipOrJson(response, url);
          })
        );

        const result = await NarouAPI.search().notWord(word).execute();
        expect(result.allcount).toBe(1);
        expect(result.length).toBe(1);
        expect(result.values).toHaveLength(1);
        expect(result.values[0].ncode).toBe("N1234AB");
        expect(mockFn).toHaveBeenCalledTimes(1);
        // MEMO: gzipとoutがついているのでsizeが3になる
        expect(mockFn).toHaveBeenCalledWith(word, 3);
      }
    );
  });

  describe("byTitle", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(url.searchParams.get("title"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test("if byTitle = true", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(url.searchParams.get("title"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().byTitle().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.True.toString(), 3);
    });

    test("if byTitle = false", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(url.searchParams.get("title"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().byTitle(false).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.False.toString(), 3);
    });
  });

  describe("byOutline", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(url.searchParams.get("ex"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test("if byOutline = true", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(url.searchParams.get("ex"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().byOutline().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.True.toString(), 3);
    });

    test("if byOutline = false", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(url.searchParams.get("ex"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().byOutline(false).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.False.toString(), 3);
    });
  });

  describe("byKeyword", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(url.searchParams.get("keyword"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test("if byKeyword = true", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(url.searchParams.get("keyword"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().byKeyword().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.True.toString(), 3);
    });

    test("if byKeyword = false", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(url.searchParams.get("keyword"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().byKeyword(false).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.False.toString(), 3);
    });
  });

  describe("byAuthor", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(url.searchParams.get("wname"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test("if byAuthor = true", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(url.searchParams.get("wname"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().byAuthor().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.True.toString(), 3);
    });

    test("if byAuthor = false", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(url.searchParams.get("wname"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().byAuthor(false).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.False.toString(), 3);
    });
  });

  describe("isBL", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("isbl"),
            url.searchParams.get("notbl"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, null, 2);
    });

    test("if isBL = true", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("isbl"),
            url.searchParams.get("notbl"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().isBL().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(
        BooleanNumber.True.toString(),
        null,
        3
      );
    });

    test("if isBL = false", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("isbl"),
            url.searchParams.get("notbl"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().isBL(false).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(
        null,
        BooleanNumber.True.toString(),
        3
      );
    });
  });

  describe("isGL", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("isgl"),
            url.searchParams.get("notgl"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, null, 2);
    });

    test("if isGL = true", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("isgl"),
            url.searchParams.get("notgl"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().isGL().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(
        BooleanNumber.True.toString(),
        null,
        3
      );
    });

    test("if isGL = false", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("isgl"),
            url.searchParams.get("notgl"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().isGL(false).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(
        null,
        BooleanNumber.True.toString(),
        3
      );
    });
  });

  describe("isZankoku", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("iszankoku"),
            url.searchParams.get("notzankoku"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, null, 2);
    });

    test("if isZankoku = true", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("iszankoku"),
            url.searchParams.get("notzankoku"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().isZankoku().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(
        BooleanNumber.True.toString(),
        null,
        3
      );
    });

    test("if isZankoku = false", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("iszankoku"),
            url.searchParams.get("notzankoku"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().isZankoku(false).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(
        null,
        BooleanNumber.True.toString(),
        3
      );
    });
  });

  describe("isTensei", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("istensei"),
            url.searchParams.get("nottensei"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, null, 2);
    });

    test("if isTensei = true", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("istensei"),
            url.searchParams.get("nottensei"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().isTensei().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(
        BooleanNumber.True.toString(),
        null,
        3
      );
    });

    test("if isTensei = false", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("istensei"),
            url.searchParams.get("nottensei"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().isTensei(false).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(
        null,
        BooleanNumber.True.toString(),
        3
      );
    });
  });

  describe("isTenni", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("istenni"),
            url.searchParams.get("nottenni"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, null, 2);
    });

    test("if isTenni = true", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("istenni"),
            url.searchParams.get("nottenni"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().isTenni().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(
        BooleanNumber.True.toString(),
        null,
        3
      );
    });

    test("if isTenni = false", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("istenni"),
            url.searchParams.get("nottenni"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().isTenni(false).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(
        null,
        BooleanNumber.True.toString(),
        3
      );
    });
  });

  describe("isTT", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(
            url.searchParams.get("istt"),
            url.searchParams.get("nottt"),
            url.searchParams.size
          );

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, null, 2);
    });

    test("if set isTT", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }, { ncode: "N1234AB" }];
          mockFn(url.searchParams.get("istt"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().isTT().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.True.toString(), 3);
    });
  });

  describe("length", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("length"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test.each([1, 10, 100])("if length = %i", async (length) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("length"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().length(length).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(length.toString(), 3);
    });

    test.each([1000, 10000, 100000])("if length = `0-%i`", async (length) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("length"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().length([0, length]).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(`0-${length}`, 3);
    });
  });

  describe("kaiwaritu", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);

          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("kaiwaritu"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test.each([1, 10, 100])("if kaiwaritu = %i", async (kaiwaritu) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);

          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("kaiwaritu"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().kaiwaritu(kaiwaritu).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(kaiwaritu.toString(), 3);
    });

    test.each([
      [0, 10],
      [10, 20],
      [20, 30],
    ])("if kaiwaritu = `%i-%i`", async (min, max) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);

          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("kaiwaritu"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().kaiwaritu(min, max).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(`${min}-${max}`, 3);
    });
  });

  describe("sasie", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);

          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("sasie"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test.each([1, 10, 100])("if sasie = %i", async (sasie) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);

          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("sasie"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().sasie(sasie).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(sasie.toString(), 3);
    });

    test.each([
      [0, 10],
      [10, 20],
      [20, 30],
    ])("if sasie = `%i-%i`", async (min, max) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);

          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("sasie"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().sasie([min, max]).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(`${min}-${max}`, 3);
    });
  });

  describe("time", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);

          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("time"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test.each([1, 10, 100])("if time = %i", async (time) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);

          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("time"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().time(time).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(time.toString(), 3);
    });

    test.each([
      [0, 10],
      [10, 20],
      [20, 30],
    ])("if time = `%i-%i`", async (min, max) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);

          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("time"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().time([min, max]).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(`${min}-${max}`, 3);
    });
  });

  describe("ncode", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);

          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("ncode"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBeGreaterThanOrEqual(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test.each(["N1234AB", "N5678CD", "N9012EF"])(
      "if ncode = %s",
      async (ncode) => {
        const mockFn = vi.fn();
        server.use(
          http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
            const url = new URL(request.url);

            const response = [{ allcount: 1 }];
            mockFn(url.searchParams.get("ncode"), url.searchParams.size);

            return responseGzipOrJson(response, url);
          })
        );

        const result = await NarouAPI.search().ncode(ncode).execute();
        expect(result.allcount).toBe(1);
        expect(mockFn).toHaveBeenCalledTimes(1);
        // MEMO: gzipとoutがついているのでsizeが3になる
        expect(mockFn).toHaveBeenCalledWith(ncode, 3);
      }
    );

    test("if ncode = `N1234AB`, `N5678CD`, `N9012EF`", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);

          const response = [{ allcount: 3 }];
          mockFn(url.searchParams.get("ncode"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search()
        .ncode(["N1234AB", "N5678CD", "N9012EF"])
        .execute();
      expect(result.allcount).toBe(3);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith("N1234AB-N5678CD-N9012EF", 3);
    });
  });

  describe("type", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("type"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test.each(Object.values(NovelTypeParam))("if type = %s", async (type) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("type"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().type(type).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(type, 3);
    });
  });

  describe("buntai", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("buntai"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test.each(Object.values(BuntaiParam))("if buntai = %i", async (buntai) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("buntai"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().buntai(buntai).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(buntai.toString(), 3);
    });

    test("if buntai = `1-2-4-6`", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 3 }];
          mockFn(url.searchParams.get("buntai"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search()
        .buntai([
          BuntaiParam.NoJisageKaigyouOoi,
          BuntaiParam.NoJisageKaigyoHutsuu,
          BuntaiParam.JisageKaigyoOoi,
          BuntaiParam.JisageKaigyoHutsuu,
        ])
        .execute();
      expect(result.allcount).toBe(3);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith("1-2-4-6", 3);
    });
  });

  describe("isStop", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("stop"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test("if isStop = true", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("stop"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().isStop().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(StopParam.Stopping.toString(), 3);
    });

    test("if isStop = false", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("stop"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().isStop(false).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(StopParam.NoStopping.toString(), 3);
    });
  });

  describe("isPickup", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);

          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("ispickup"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test("if isPickup", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);

          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("ispickup"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().isPickup().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.True.toString(), 3);
    });

  describe("lastUpdate", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);

          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("lastup"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test.each([
      [1, 10],
      [10, 100],
      [100, 1000],
    ])("if lastUpdate = %i-%i", async (min, max) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);

          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("lastup"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().lastUpdate(min, max).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(`${min}-${max}`, 3);
    });

    test.each([
      [new Date(2021, 1, 1), new Date(2021, 1, 10)],
      [new Date(2021, 1, 10), new Date(2021, 1, 20)],
      [new Date(2021, 1, 20), new Date(2021, 1, 30)],
    ])("if lastUpdate = %s-%s", async (min, max) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);

          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("lastup"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().lastUpdate(min, max).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipとoutがついているのでsizeが3になる
      // MEMO: unixtimeに変換する
      expect(mockFn).toHaveBeenCalledWith(
        `${min.getTime() / 1000}-${max.getTime() / 1000}`,
        3
      );
    });
  });

  describe("lastNovelUpdate", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);

          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("lastupdate"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test.each([
      [1, 10],
      [10, 100],
      [100, 1000],
    ])("if lastNovelUpdate = %i-%i", async (min, max) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);

          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("lastupdate"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search()
        .lastNovelUpdate(min, max)
        .execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(`${min}-${max}`, 3);
    });

    test.each([
      [new Date(2021, 1, 1), new Date(2021, 1, 10)],
      [new Date(2021, 1, 10), new Date(2021, 1, 20)],
      [new Date(2021, 1, 20), new Date(2021, 1, 30)],
    ])("if lastNovelUpdate = %s-%s", async (min, max) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);

          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("lastupdate"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search()
        .lastNovelUpdate(min, max)
        .execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが3になる
      // MEMO: unixtimeに変換する
      expect(mockFn).toHaveBeenCalledWith(
        `${min.getTime() / 1000}-${max.getTime() / 1000}`,
        3
      );
    });
  });

  describe("bigGenre", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("biggenre"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test.each(Object.values(BigGenre))("if bigGenre = %i", async (bigGenre) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("biggenre"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().bigGenre(bigGenre).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(bigGenre.toString(), 3);
    });

    test("if bigGenre = `1-2-3`", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 3 }];
          mockFn(url.searchParams.get("biggenre"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search()
        .bigGenre([BigGenre.Renai, BigGenre.Fantasy, BigGenre.Bungei])
        .execute();
      expect(result.allcount).toBe(3);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith("1-2-3", 3);
    });
  });

  describe("notBigGenre", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("notbiggenre"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test.each(Object.values(BigGenre))(
      "if notBigGenre = %i",
      async (notBigGenre) => {
        const mockFn = vi.fn();
        server.use(
          http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
            const url = new URL(request.url);
            const response = [{ allcount: 1 }];
            mockFn(url.searchParams.get("notbiggenre"), url.searchParams.size);

            return responseGzipOrJson(response, url);
          })
        );

        const result = await NarouAPI.search()
          .notBigGenre(notBigGenre)
          .execute();
        expect(result.allcount).toBe(1);
        expect(mockFn).toHaveBeenCalledTimes(1);
        // MEMO: gzipがついているのでsizeが3になる
        expect(mockFn).toHaveBeenCalledWith(notBigGenre.toString(), 3);
      }
    );

    test("if notBigGenre = `1-2-3`", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 3 }];
          mockFn(url.searchParams.get("notbiggenre"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search()
        .notBigGenre([BigGenre.Renai, BigGenre.Fantasy, BigGenre.Bungei])
        .execute();
      expect(result.allcount).toBe(3);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith("1-2-3", 3);
    });
  });

  describe("genre", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("genre"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test.each(Object.values(Genre))("if genre = %i", async (genre) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("genre"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().genre(genre).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(genre.toString(), 3);
    });

    test("if genre = `201-202-9801`", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 3 }];
          mockFn(url.searchParams.get("genre"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search()
        .genre([Genre.FantasyHigh, Genre.FantasyLow, Genre.NonGenre])
        .execute();
      expect(result.allcount).toBe(3);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith("201-202-9801", 3);
    });
  });

  describe("notGenre", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("notgenre"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test.each(Object.values(Genre))("if notGenre = %i", async (notGenre) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("notgenre"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().notGenre(notGenre).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(notGenre.toString(), 3);
    });

    test("if notGenre = `201-202-9801`", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 3 }];
          mockFn(url.searchParams.get("notgenre"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search()
        .notGenre([Genre.FantasyHigh, Genre.FantasyLow, Genre.NonGenre])
        .execute();
      expect(result.allcount).toBe(3);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith("201-202-9801", 3);
    });
  });

  describe("userId", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("userid"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test.each([1234, 5678, 9012])("if userId = %s", async (userId) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("userid"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().userId(userId).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(userId.toString(), 3);
    });

    test("if userId = `1234-5678-9012`", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 3 }];
          mockFn(url.searchParams.get("userid"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search()
        .userId([1234, 5678, 9012])
        .execute();
      expect(result.allcount).toBe(3);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith("1234-5678-9012", 3);
    });
  });

  describe("isR15", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("isr15"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが2になる
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test("if isR15 = true", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("isr15"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().isR15().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.True.toString(), 3);
    });

    test("if isR15 = false", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("notr15"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().isR15(false).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      // MEMO: gzipがついているのでsizeが3になる
      expect(mockFn).toHaveBeenCalledWith(BooleanNumber.True.toString(), 3);
    });
  });

  describe("fields", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("of"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test.each(Object.values(Fields))("if fields = %s", async (field) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("of"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search().fields(field).execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(field, 3);
    });

    test("if fields = `ncode-genre`", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];
          mockFn(url.searchParams.get("of"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      const result = await NarouAPI.search()
        .fields([Fields.ncode, Fields.genre])
        .execute();
      expect(result.allcount).toBe(1);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(`${Fields.ncode}-${Fields.genre}`, 3);
    });
  });

  describe("opt", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];

          mockFn(url.searchParams.get("opt"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      await NarouAPI.search().execute();
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(null, 2);
    });

    test.each([OptionalFields.weekly_unique])("if opt = %s", async (opt) => {
      const mockFn = vi.fn();
      server.use(
        http.get("https://api.syosetu.com/novelapi/api/", ({ request }) => {
          const url = new URL(request.url);
          const response = [{ allcount: 1 }];

          mockFn(url.searchParams.get("opt"), url.searchParams.size);

          return responseGzipOrJson(response, url);
        })
      );

      await NarouAPI.search().opt(opt).execute();
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(opt, 3);
    });
  });
});
