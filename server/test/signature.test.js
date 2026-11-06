import { test } from "node:test";
import assert from "node:assert/strict";
import { signPayload, verifySignature, MAX_SKEW_MS } from "../src/lib/signature.js";

const secret = "a".repeat(64);
const body = '{"sender":"HUMO","body":"popolnenie 129 437.00 UZS","receivedAt":1}';
const now = 1_800_000_000_000;
const sig = (ts, b = body, path = "/api/sms/ingest") => signPayload(secret, String(ts), "POST", path, b);
const req = (over = {}) => ({ ts: String(now), signature: sig(now), method: "POST", path: "/api/sms/ingest", body, ...over });

test("valid signature", () => {
  assert.equal(verifySignature(secret, req(), now), true);
});

test("tampered body is rejected", () => {
  assert.equal(verifySignature(secret, req({ body: body.replace("437", "999") }), now), false);
});

test("other path is rejected", () => {
  assert.equal(verifySignature(secret, req({ path: "/api/sms/recent" }), now), false);
});

test("old timestamp is rejected", () => {
  const ts = now - MAX_SKEW_MS - 1;
  assert.equal(verifySignature(secret, req({ ts: String(ts), signature: sig(ts) }), now), false);
});

test("wrong secret is rejected", () => {
  assert.equal(verifySignature("b".repeat(64), req(), now), false);
});

test("missing or malformed signature is rejected", () => {
  assert.equal(verifySignature(secret, req({ signature: "" }), now), false);
  assert.equal(verifySignature(secret, req({ signature: "zz" }), now), false);
  assert.equal(verifySignature("", req(), now), false);
});
