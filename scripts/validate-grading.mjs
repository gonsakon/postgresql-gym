// 評分回放：對每一課每一題，用「標準答案」走一次評分邏輯，確認仍判定通過。
// query：answer 的結果 vs referenceSql 的結果（依 compare 選項）。
// mutation：exec answer → 跑 checks 對 expectRows；再 snapshot(answer) vs snapshot(answer) 必相等。
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import esbuild from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const tsSrc = readFileSync(join(root, "src/courseData.ts"), "utf8");
const { code } = await esbuild.transform(tsSrc, { loader: "ts", format: "esm" });
const tmp = join(root, "src/__cd.tmp.mjs");
writeFileSync(tmp, code);
const { schemaSql, lessons } = await import(tmp + "?t=" + Date.now());
unlinkSync(tmp);

const { PGlite } = await import("@electric-sql/pglite");
const db = new PGlite();

const SNAP = ["members", "credit_packages", "shop_orders", "coaches", "courses", "course_bookings"];

function normVal(v) {
  if (v instanceof Date) {
    const iso = v.toISOString();
    return iso.endsWith("T00:00:00.000Z") ? iso.slice(0, 10) : iso.replace("T", " ").replace(".000Z", "");
  }
  if (typeof v === "bigint") return Number(v);
  return v;
}
function normRow(r) {
  const o = {};
  for (const [k, v] of Object.entries(r)) o[k] = normVal(v);
  return o;
}
function normRows(rows, opts = {}) {
  const n = rows.map(normRow);
  if (!opts.order) return n.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  return n;
}
function compareRows(actual, expected, opts = {}) {
  const a = normRows(actual, opts);
  const e = normRows(expected, opts);
  if (a.length !== e.length) return { pass: false, message: `筆數 ${a.length} vs ${e.length}` };
  if (opts.columns && e.length) {
    const ec = Object.keys(e[0]);
    const ac = a.length ? Object.keys(a[0]) : [];
    if (JSON.stringify(ac) !== JSON.stringify(ec)) return { pass: false, message: `欄位 ${ac} vs ${ec}` };
  }
  if (JSON.stringify(a) !== JSON.stringify(e)) return { pass: false, message: "內容不符" };
  return { pass: true };
}
async function reset() {
  await db.exec(schemaSql);
}
async function snapshot() {
  const s = {};
  for (const t of SNAP) s[t] = (await db.query(`SELECT * FROM ${t} ORDER BY id;`)).rows;
  return s;
}

let pass = 0;
let fail = 0;
const failures = [];

for (const lesson of lessons) {
  for (const ex of lesson.exercises) {
    try {
      if (ex.type === "query") {
        if (!ex.referenceSql) throw new Error("缺 referenceSql");
        await reset();
        const actual = (await db.query(ex.hints.answer)).rows;
        await reset();
        const expected = (await db.query(ex.referenceSql)).rows;
        const cmp = compareRows(actual, expected, ex.compare || {});
        if (!cmp.pass) throw new Error(cmp.message);
      } else {
        await reset();
        await db.exec(ex.hints.answer);
        for (const chk of ex.checks || []) {
          const rows = (await db.query(chk.sql)).rows;
          const cmp = compareRows(rows, chk.expectRows, { order: true, columns: true });
          if (!cmp.pass) throw new Error(`check「${chk.label}」${cmp.message}`);
        }
      }
      pass += 1;
    } catch (e) {
      fail += 1;
      failures.push(`✗ ${lesson.id} / ${ex.id}: ${e.message}`);
    }
  }
}

console.log(`\n通過 ${pass} / ${pass + fail} 題`);
if (failures.length) {
  console.log("\n失敗清單：");
  for (const f of failures) console.log("  " + f);
  process.exit(1);
} else {
  console.log("✅ 全部標準答案都通過自己的評分");
}
