import assert from "node:assert/strict";
import test from "node:test";
import { fromQuery, toQuery, updateQuery } from "../src/query-state.ts";

test("toQuery omits empty values and sorts keys", () => {
  assert.equal(toQuery({ page: 2, q: "tan stack", active: false, skip: null, blank: "" }), "active=false&page=2&q=tan+stack");
});

test("fromQuery accepts leading question mark", () => {
  assert.deepEqual(fromQuery("?tag=ui&sort=new"), { tag: "ui", sort: "new" });
});

test("updateQuery replaces and removes values", () => {
  assert.equal(updateQuery("page=1&tag=ui", { page: 2, tag: null, view: "grid" }), "page=2&view=grid");
});
