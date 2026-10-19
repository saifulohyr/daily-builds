import assert from "node:assert/strict";
import { contrastRatio, luminance, wcag } from "./contrast.js";

assert.equal(luminance("#000000"), 0);
assert.equal(luminance("#ffffff"), 1);
assert.equal(contrastRatio("#000000", "#ffffff"), 21);
assert.equal(contrastRatio("#777777", "#ffffff").toFixed(2), "4.48");
assert.deepEqual(wcag(4.5), { normalAA: true, normalAAA: false, largeAA: true, largeAAA: true });
assert.throws(() => luminance("#fff"), /#RRGGBB/);
console.log("validation passed");
