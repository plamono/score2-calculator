"use strict";

const assert = require("node:assert/strict");
const Score2 = require("./score2.js");

// Published SCORE2 paper example for the very-high-risk region:
// age 50, current smoker, SBP 140, TC 5.5, HDL 1.3 mmol/L.
const base = { age: 50, smoking: 1, sbp: 140, totalCholesterol: 5.5, hdl: 1.3 };
const male = Score2.calculate({ ...base, sex: "male" }).risk;
const female = Score2.calculate({ ...base, sex: "female" }).risk;

assert.ok(Math.abs(male - 14.0) < 0.1, `Male expected 14.0%, got ${male}`);
assert.ok(Math.abs(female - 13.7) < 0.1, `Female expected 13.7%, got ${female}`);
assert.equal(Score2.category(49, 2.5).key, "high");
assert.equal(Score2.category(50, 10).key, "very-high");
assert.equal(Score2.category(70, 7.5).key, "high");
assert.equal(Score2.category(70, 15).key, "very-high");

const opMale = Score2.calculate({
  sex: "male", age: 75, smoking: 1, sbp: 140, totalCholesterol: 6, hdl: 1.3
});
const opFemale = Score2.calculate({
  sex: "female", age: 75, smoking: 1, sbp: 140, totalCholesterol: 6, hdl: 1.3
});
assert.equal(opMale.model, "SCORE2-OP");
assert.ok(Math.abs(opMale.risk - 40.8) < 0.1, `OP male expected 40.8%, got ${opMale.risk}`);
assert.ok(Math.abs(opFemale.risk - 46.2) < 0.1, `OP female expected 46.2%, got ${opFemale.risk}`);
assert.throws(() => Score2.calculate({ ...base, sex: "male", age: 90 }), /40 до 89/);

// Original SCORE high-risk chart checks (fatal CVD only).
const legacy = Score2.calculate({
  sex: "male", age: 60, smoking: 1, sbp: 160, totalCholesterol: 6, hdl: null
});
assert.equal(legacy.model, "SCORE");
assert.ok(Math.abs(legacy.risk - 17.65) < 0.02, `SCORE expected 17.65%, got ${legacy.risk}`);
assert.throws(
  () => Score2.calculate({ sex: "male", age: 75, smoking: 0, sbp: 140, totalCholesterol: 5.5, hdl: null }),
  /требуется ЛПВП/
);

console.log(`OK: SCORE2 ${male.toFixed(1)}%; SCORE2-OP ${opMale.risk.toFixed(1)}%; SCORE ${legacy.risk.toFixed(1)}%`);
