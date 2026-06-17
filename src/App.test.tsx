import { readJSON, writeJSON } from "./utils/storage";

beforeEach(() => {
  localStorage.clear();
});

test("stores and reads JSON values from localStorage", () => {
  writeJSON("test-key", [{ id: "test@example.com", pw: "1234" }]);

  expect(readJSON("test-key", [])).toEqual([{ id: "test@example.com", pw: "1234" }]);
});

test("returns fallback data when stored JSON is invalid", () => {
  localStorage.setItem("broken-json", "{");

  expect(readJSON("broken-json", ["fallback"])).toEqual(["fallback"]);
});
