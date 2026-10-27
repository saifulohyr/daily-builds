import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { extractLinks, checkUrl, checkFile, main } from "../src/index.ts";

test("extractLinks - returns empty array for empty or text-only content", () => {
  assert.deepEqual(extractLinks(""), []);
  assert.deepEqual(extractLinks("Just some normal text with no urls"), []);
  assert.deepEqual(extractLinks("[local link](./other.md) and [anchor](#heading)"), []);
});

test("extractLinks - extracts inline links with correct line numbers", () => {
  const content = [
    "# Header",
    "Line with [First](https://first.org) and [Second](http://second.com/path).",
    "Line without links",
    "Image: ![Logo](https://img.example.com/logo.png)",
  ].join("\n");

  const links = extractLinks(content);
  assert.equal(links.length, 3);
  assert.deepEqual(links[0], { text: "First", url: "https://first.org", line: 2 });
  assert.deepEqual(links[1], { text: "Second", url: "http://second.com/path", line: 2 });
  assert.deepEqual(links[2], { text: "Logo", url: "https://img.example.com/logo.png", line: 4 });
});

test("extractLinks - extracts autolinks correctly", () => {
  const content = "Contact us at <https://help.example.com> for info.";
  const links = extractLinks(content);
  assert.equal(links.length, 1);
  assert.deepEqual(links[0], {
    text: "https://help.example.com",
    url: "https://help.example.com",
    line: 1,
  });
});

test("checkUrl - handles successful HEAD response", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = (async (url: string, init?: RequestInit) => {
      assert.equal(init?.method, "HEAD");
      return new Response(null, { status: 200, statusText: "OK" });
    }) as any;

    const res = await checkUrl("https://example.com");
    assert.equal(res.ok, true);
    assert.equal(res.status, 200);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("checkUrl - handles 404 response", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = (async () => {
      return new Response(null, { status: 404, statusText: "Not Found" });
    }) as any;

    const res = await checkUrl("https://example.com/missing");
    assert.equal(res.ok, false);
    assert.equal(res.status, 404);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("checkUrl - retries GET when HEAD returns 405 or 403", async () => {
  const originalFetch = globalThis.fetch;
  const methodsCalled: string[] = [];
  try {
    globalThis.fetch = (async (url: string, init?: RequestInit) => {
      methodsCalled.push(init?.method || "GET");
      if (init?.method === "HEAD") {
        return new Response(null, { status: 405, statusText: "Method Not Allowed" });
      }
      return new Response("ok", { status: 200, statusText: "OK" });
    }) as any;

    const res = await checkUrl("https://example.com/no-head");
    assert.deepEqual(methodsCalled, ["HEAD", "GET"]);
    assert.equal(res.ok, true);
    assert.equal(res.status, 200);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("checkUrl - handles network error and timeout", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = (async () => {
      throw new Error("DNS lookup failed");
    }) as any;

    const netErr = await checkUrl("https://nonexistent.domain");
    assert.equal(netErr.ok, false);
    assert.equal(netErr.status, "ERR");
    assert.equal(netErr.error, "DNS lookup failed");

    const timeoutError = new Error("Request timed out");
    timeoutError.name = "TimeoutError";
    globalThis.fetch = (async () => {
      throw timeoutError;
    }) as any;

    const timeoutRes = await checkUrl("https://slow.domain");
    assert.equal(timeoutRes.ok, false);
    assert.equal(timeoutRes.status, "ERR");
    assert.equal(timeoutRes.error, "timeout");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("checkFile - reads markdown file and checks all links", async () => {
  const originalFetch = globalThis.fetch;
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "md-checker-"));
  const tmpFile = path.join(tmpDir, "test.md");

  try {
    await fs.writeFile(
      tmpFile,
      "# Temp\n[Valid](https://example.com/ok)\n[Broken](https://example.com/broken)"
    );

    globalThis.fetch = (async (url: string) => {
      if (url.includes("broken")) {
        return new Response(null, { status: 404, statusText: "Not Found" });
      }
      return new Response(null, { status: 200, statusText: "OK" });
    }) as any;

    const results = await checkFile(tmpFile);
    assert.equal(results.length, 2);
    assert.equal(results[0].ok, true);
    assert.equal(results[0].status, 200);
    assert.equal(results[1].ok, false);
    assert.equal(results[1].status, 404);
  } finally {
    globalThis.fetch = originalFetch;
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});

test("main - CLI behavior with args, flags, and missing files", async () => {
  assert.equal(await main([]), 1);
  assert.equal(await main(["--help"]), 0);
  assert.equal(await main(["-h"]), 0);
  assert.equal(await main(["nonexistent-file-xyz.md"]), 1);
});
