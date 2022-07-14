import NarouAPI, { Fields } from "../src/";

describe("narou-test", () => {
  describe("search", () => {
    it("if limit = 1 then length = 1", async () => {
      const result = await NarouAPI.search()
        .limit(1)
        .fields([Fields.ncode])
        .execute();
      expect(result.values.length === 1).toBeTruthy();
    });
    it("if gzip = 0", async () => {
      const result = await NarouAPI.search()
        .limit(1)
        .fields([Fields.ncode])
        .gzip(0)
        .execute();
      expect(result.values.length === 1).toBeTruthy();
    });
  });
  describe("ranking", () => {
    it("2020/01/01 is length 300", async () => {
      const result = await NarouAPI.ranking()
        .date(new Date(2020, 1, 1))
        .execute();
      expect(result.length === 300).toBeTruthy();
    });
    it("2020/01/01 with fields is length 300", async () => {
      const result = await NarouAPI.ranking()
        .date(new Date(2020, 1, 1))
        .executeWithFields([Fields.ncode]);
      expect(result.length === 300).toBeTruthy();
    });
  });
  describe("history", () => {
    it("Error: Novel not found.", async () => {
      await expect(
        async () => await NarouAPI.rankingHistory("n0000a")
      ).rejects.toBe("Error: Novel not found.");
    });
    it("n4444ge", async () => {
      const result = await NarouAPI.rankingHistory("n4444ge");
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
