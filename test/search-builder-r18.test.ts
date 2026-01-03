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
  OptionalFields,
  R18Fields,
  R18Site,
} from "../src";
import { http } from "msw";

const server = setupServer();

const setupMockHandler = (
  mockFn: (...args: unknown[]) => void,
  watchParams: string[] = ["out"]
) => {
  server.use(
    http.get("https://api.syosetu.com/novel18api/api/", ({ request }) => {
      const url = new URL(request.url);
      const params = url.searchParams;
      const response = [{ allcount: 1 }, { ncode: "N1234AB" }];

      const values = watchParams.map(param => params.get(param));
      mockFn(...values, params.size);

      return responseGzipOrJson(response, url);
    })
  );
};

const setupHeaderHandler = (mockFn: (...args: unknown[]) => void) => {
  server.use(
    http.get("https://api.syosetu.com/novel18api/api/", ({ request }) => {
      const url = new URL(request.url);
      const response = [{ allcount: 1 }, { ncode: "N1234AB" }];

      mockFn(request.headers.get("x-test"));

      return responseGzipOrJson(response, url);
    })
  );
};

describe("SearchBuilderR18", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe("execute", () => {
    test("execute should call executeNovel18", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["out"]);

      const result = await NarouAPI.searchR18().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("json", 2);
    });
  });

  describe("r18Site", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["nocgenre", "out"]);

      const result = await NarouAPI.searchR18().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(null, "json", 2);
    });

    test.each(Object.values(R18Site))("if r18Site = %i", async (site) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["nocgenre", "out"]);

      const result = await NarouAPI.searchR18().r18Site(site).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(site.toString(), "json", 3);
    });

    test("if r18Site = [1, 2, 3]", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["nocgenre", "out"]);

      const result = await NarouAPI.searchR18()
        .r18Site([R18Site.Nocturne, R18Site.MoonLight, R18Site.MoonLightBL])
        .execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("1-2-3", "json", 3);
    });
  });

  describe("execute options", () => {
    test("fetchOptionsがリクエストに渡される", async () => {
      const mockFn = vi.fn();
      setupHeaderHandler(mockFn);

      const result = await NarouAPI.searchR18().execute({
        fetchOptions: { headers: { "x-test": "hello" } },
      });

      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("hello");
    });
  });

  describe("xid", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["xid", "out"]);

      const result = await NarouAPI.searchR18().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(null, "json", 2);
    });

    test.each([123, 456, 789])("if xid = %i", async (id) => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["xid", "out"]);

      const result = await NarouAPI.searchR18().xid(id).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(id.toString(), "json", 3);
    });

    test("if xid = [123, 456, 789]", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["xid", "out"]);

      const result = await NarouAPI.searchR18().xid([123, 456, 789]).execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("123-456-789", "json", 3);
    });
  });

  describe("fields", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["of", "out"]);

      const result = await NarouAPI.searchR18().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(null, "json", 2);
    });

    test("if fields = R18Fields.title", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["of", "out"]);

      const result = await NarouAPI.searchR18()
        .fields(R18Fields.title)
        .execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("t", "json", 3);
    });

    test("if fields = [R18Fields.title, R18Fields.ncode]", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["of", "out"]);

      const result = await NarouAPI.searchR18()
        .fields([R18Fields.title, R18Fields.ncode])
        .execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("t-n", "json", 3);
    });
  });

  describe("opt", () => {
    test("default", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["opt", "out"]);

      const result = await NarouAPI.searchR18().execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith(null, "json", 2);
    });

    test("if opt = OptionalFields.weekly_unique", async () => {
      const mockFn = vi.fn();
      setupMockHandler(mockFn, ["opt", "out"]);

      const result = await NarouAPI.searchR18()
        .opt(OptionalFields.weekly_unique)
        .execute();
      expect(result.allcount).toBe(1);
      expect(result.length).toBe(1);
      expect(result.values).toHaveLength(1);
      expect(result.values[0].ncode).toBe("N1234AB");
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("weekly", "json", 3);
    });
  });
});
