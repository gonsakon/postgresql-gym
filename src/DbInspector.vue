<template>
  <section class="db-inspector" :class="{ open, pulse: justOpened }">
    <!-- 收合 bar -->
    <button class="dbi-bar" type="button" @click="toggleOpen">
      <span class="dbi-icon">🗄</span>
      <span class="dbi-bar-title">資料庫透視鏡</span>
      <span class="dbi-bar-meta">{{ tableList.length }} 張表<template v-if="focusName"> · 本關：{{ focusName }}</template></span>
      <span class="dbi-chevron" aria-hidden="true">{{ open ? "▾" : "▸" }}</span>
    </button>

    <div v-if="open" class="dbi-body">
      <!-- 三態 pill tab -->
      <div class="dbi-tabs" role="tablist">
        <button
          v-for="t in TABS"
          :key="t.key"
          class="dbi-tab"
          :class="{ active: tab === t.key }"
          type="button"
          role="tab"
          :aria-selected="tab === t.key"
          @click="switchTab(t.key)"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- 表清單 -->
      <div v-if="tab === 'tables'" class="dbi-pane dbi-tables">
        <div class="dbi-chip-row">
          <button
            v-for="t in focusTables"
            :key="t.name"
            class="dbi-chip focus"
            :class="{ active: t.name === selected }"
            type="button"
            @click="selectTable(t.name)"
          >
            <span class="dbi-chip-head"><b>{{ t.name }}</b><span class="dbi-chip-count">{{ t.count }} 列</span></span>
            <span v-if="t.descr" class="dbi-chip-descr">{{ t.descr }}</span>
          </button>
        </div>
        <details v-if="otherTables.length" class="dbi-others">
          <summary>其他資料表（{{ otherTables.length }}）</summary>
          <div class="dbi-chip-row">
            <button
              v-for="t in otherTables"
              :key="t.name"
              class="dbi-chip"
              :class="{ active: t.name === selected }"
              type="button"
              @click="selectTable(t.name)"
            >
              <span class="dbi-chip-head"><b>{{ t.name }}</b><span class="dbi-chip-count">{{ t.count }} 列</span></span>
            <span v-if="t.descr" class="dbi-chip-descr">{{ t.descr }}</span>
            </button>
          </div>
        </details>
        <p class="dbi-empty" v-if="!tableList.length">沙箱讀取中…</p>
      </div>

      <!-- 欄位卡 -->
      <div v-else-if="tab === 'columns'" class="dbi-pane">
        <div class="dbi-pane-head">
          <b>{{ selected }}</b> 的欄位（{{ columns.length }}）
        </div>
        <ul class="dbi-cols">
          <li v-for="c in columns" :key="c.name" class="dbi-col">
            <span class="dbi-col-name">
              {{ c.name }}
              <span v-if="c.isPk" class="dbi-flag pk" title="主鍵">🔑</span>
              <span v-if="c.fk" class="dbi-flag fk" :title="`外鍵 → ${c.fk.table}(${c.fk.col})`">🔗{{ c.fk.table }}</span>
            </span>
            <span class="dbi-col-type">{{ c.typeLabel }}</span>
            <span class="dbi-col-null" :class="{ req: !c.nullable }">{{ c.nullable ? "可空" : "必填" }}</span>
            <span v-if="c.purpose" class="dbi-col-purpose">{{ c.purpose }}</span>
            <span v-if="c.check" class="dbi-col-check">{{ c.check }}</span>
          </li>
        </ul>
      </div>

      <!-- 資料預覽 -->
      <div v-else class="dbi-pane dbi-rows">
        <div class="dbi-pane-head">
          <b>{{ selected }}</b> 的真實資料
          <span class="dbi-preview-note">顯示前 {{ rows.length }}{{ totalCount != null ? ` / 共 ${totalCount}` : "" }} 列 · 框內可上下左右捲看全部</span>
        </div>
        <div class="dbi-table-wrap">
          <table class="dbi-table">
            <thead>
              <tr><th v-for="col in rowCols" :key="col">{{ col }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in rows" :key="i">
                <td v-for="col in rowCols" :key="col">{{ fmt(row[col]) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PGlite } from "@electric-sql/pglite";
import { computed, onMounted, ref, watch } from "vue";

type SqlValue = string | number | boolean | Date | null | undefined;
type SqlRow = Record<string, SqlValue>;

const props = defineProps<{
  db: PGlite | null;
  refreshKey: number;
  /** 本關相關表，第一個視為主表（高亮置頂、預設選中） */
  tables?: string[];
  /** 元件鍵：換關卡時重置展開/選表狀態 */
  sceneKey?: string;
}>();

type TabKey = "tables" | "columns" | "rows";
const TABS: { key: TabKey; label: string }[] = [
  { key: "tables", label: "有哪些表" },
  { key: "columns", label: "每欄是什麼" },
  { key: "rows", label: "看真實資料" }
];

const OPEN_KEY = "postgresql-gym-mvp-dbi-open-v1";
const TAB_KEY = "postgresql-gym-mvp-dbi-tab-v1";

const open = ref(loadOpen());
const tab = ref<TabKey>(loadTab());
const tableList = ref<{ name: string; count: number; descr: string | null }[]>([]);
const selected = ref<string>("");
const columns = ref<ColumnInfo[]>([]);
const rows = ref<SqlRow[]>([]);
const rowCols = ref<string[]>([]);
const totalCount = ref<number | null>(null);

interface ColumnInfo {
  name: string;
  typeLabel: string;
  nullable: boolean;
  isPk: boolean;
  fk: { table: string; col: string } | null;
  check: string | null;
  purpose: string | null;
}

const focusSet = computed(() => new Set(props.tables ?? []));
const focusName = computed(() => props.tables?.[0] ?? "");
const focusTables = computed(() => {
  if (!focusSet.value.size) return tableList.value;
  const inFocus = tableList.value.filter((t) => focusSet.value.has(t.name));
  return inFocus.length ? inFocus : tableList.value;
});
const otherTables = computed(() => {
  if (!focusSet.value.size) return [];
  return tableList.value.filter((t) => !focusSet.value.has(t.name));
});

function loadOpen() {
  // 預設展開（桌機與訂單牆左右並排，不互相擠壓；窄螢幕才上下堆疊）。
  try {
    return localStorage.getItem(OPEN_KEY) !== "0";
  } catch {
    return true;
  }
}
function loadTab(): TabKey {
  try {
    const v = localStorage.getItem(TAB_KEY);
    return v === "columns" || v === "rows" ? v : "tables";
  } catch {
    return "tables";
  }
}
function toggleOpen() {
  open.value = !open.value;
  try {
    localStorage.setItem(OPEN_KEY, open.value ? "1" : "0");
  } catch {
    /* ignore */
  }
  if (open.value && !tableList.value.length) void loadTables();
}
function switchTab(next: TabKey) {
  tab.value = next;
  try {
    localStorage.setItem(TAB_KEY, next);
  } catch {
    /* ignore */
  }
  void loadForTab();
}
function selectTable(name: string) {
  selected.value = name;
  if (tab.value === "tables") switchTab("columns");
  else void loadForTab();
}

const justOpened = ref(false);
let pulseTimer: ReturnType<typeof setTimeout> | null = null;

/** 給開場劇情用：海姐帶玩家打開透視鏡到某個 tab / 表（並脈動一下吸引注意） */
function openTo(targetTab: TabKey, table?: string) {
  open.value = true;
  if (table) selected.value = table;
  switchTab(targetTab);
  justOpened.value = true;
  if (pulseTimer) clearTimeout(pulseTimer);
  pulseTimer = setTimeout(() => {
    justOpened.value = false;
  }, 2400);
}

const ZH_TYPE: Record<string, string> = {
  text: "文字",
  "character varying": "文字",
  integer: "整數",
  bigint: "整數",
  smallint: "整數",
  numeric: "數值",
  "double precision": "數值",
  real: "數值",
  boolean: "真假",
  date: "日期",
  "timestamp without time zone": "時間",
  "timestamp with time zone": "時間"
};
function zhType(raw: string) {
  return ZH_TYPE[raw] ? `${ZH_TYPE[raw]}` : raw;
}

function parseCheck(def: string): { col: string | null; label: string } | null {
  // 列舉型：col = ANY (ARRAY['a'::text, 'b'::text, ...])
  if (/ANY\s*\(\s*ARRAY/i.test(def)) {
    const col = def.match(/([a-z_][a-z0-9_]*)\s*=\s*ANY/i)?.[1] ?? null;
    const vals = [...def.matchAll(/'((?:[^']|'')*)'\s*::/g)].map((m) => m[1].replace(/''/g, "'"));
    if (vals.length) return { col, label: `只能填 ${vals.join(" / ")}` };
  }
  // 範圍型：col >= 0 / col > 0
  const m = def.match(/([a-z_][a-z0-9_]*)\s*(>=|<=|>|<)\s*\(?(-?[0-9.]+)\)?/i);
  if (m) {
    const op = m[2].replace(">=", "≥").replace("<=", "≤");
    return { col: m[1], label: `必須 ${op} ${m[3]}` };
  }
  return null;
}

function fmt(v: SqlValue) {
  if (v === null || v === undefined) return "NULL";
  if (v instanceof Date) {
    const iso = v.toISOString();
    return iso.endsWith("T00:00:00.000Z") ? iso.slice(0, 10) : iso.replace("T", " ").replace(".000Z", "");
  }
  return String(v);
}

async function loadTables() {
  if (!props.db) return;
  try {
    const res = await props.db.query<{ table_name: string; descr: string | null }>(
      `SELECT table_name, obj_description(('public.' || table_name)::regclass, 'pg_class') AS descr
       FROM information_schema.tables
       WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name`
    );
    const names = res.rows.map((r) => r.table_name);
    const withCounts: { name: string; count: number; descr: string | null }[] = [];
    for (const row of res.rows) {
      const name = row.table_name;
      try {
        const c = await props.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM "${name}"`);
        withCounts.push({ name, count: Number(c.rows[0]?.n ?? 0), descr: row.descr ?? null });
      } catch {
        withCounts.push({ name, count: 0, descr: row.descr ?? null });
      }
    }
    tableList.value = withCounts;
    if (!selected.value || !names.includes(selected.value)) {
      selected.value = props.tables?.find((t) => names.includes(t)) ?? names[0] ?? "";
    }
  } catch {
    /* 沙箱尚未就緒 */
  }
}

async function loadColumns(table: string) {
  if (!props.db || !table) return;
  try {
    const [colRes, pkRes, fkRes, checkRes] = await Promise.all([
      props.db.query<{ column_name: string; data_type: string; is_nullable: string; purpose: string | null }>(
        `SELECT column_name, data_type, is_nullable,
                col_description('${table}'::regclass, ordinal_position) AS purpose
         FROM information_schema.columns
         WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`,
        [table]
      ),
      props.db.query<{ column_name: string }>(
        `SELECT kcu.column_name FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name
         WHERE tc.table_name=$1 AND tc.constraint_type='PRIMARY KEY'`,
        [table]
      ),
      props.db.query<{ column_name: string; ref_table: string; ref_col: string }>(
        `SELECT kcu.column_name, ccu.table_name AS ref_table, ccu.column_name AS ref_col
         FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name
         JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name=ccu.constraint_name
         WHERE tc.table_name=$1 AND tc.constraint_type='FOREIGN KEY'`,
        [table]
      ),
      props.db.query<{ def: string }>(
        `SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conrelid=$1::regclass AND contype='c'`,
        [table]
      )
    ]);

    const pkSet = new Set(pkRes.rows.map((r) => r.column_name));
    const fkMap = new Map(fkRes.rows.map((r) => [r.column_name, { table: r.ref_table, col: r.ref_col }]));
    const checkMap = new Map<string, string>();
    for (const r of checkRes.rows) {
      const parsed = parseCheck(r.def);
      if (parsed?.col) checkMap.set(parsed.col, parsed.label);
    }

    columns.value = colRes.rows.map((r) => ({
      name: r.column_name,
      typeLabel: zhType(r.data_type),
      nullable: r.is_nullable === "YES",
      isPk: pkSet.has(r.column_name),
      fk: fkMap.get(r.column_name) ?? null,
      check: checkMap.get(r.column_name) ?? null,
      purpose: r.purpose ?? null
    }));
  } catch {
    columns.value = [];
  }
}

async function loadRows(table: string) {
  if (!props.db || !table) return;
  try {
    const res = await props.db.query(`SELECT * FROM "${table}" ORDER BY 1 LIMIT 20`);
    rows.value = res.rows as SqlRow[];
    rowCols.value = rows.value.length ? Object.keys(rows.value[0]) : [];
    totalCount.value = tableList.value.find((t) => t.name === table)?.count ?? null;
  } catch {
    rows.value = [];
    rowCols.value = [];
  }
}

async function loadForTab() {
  if (tab.value === "tables") await loadTables();
  else if (tab.value === "columns") await loadColumns(selected.value);
  else await loadRows(selected.value);
}

async function refresh() {
  if (!props.db || !open.value) return;
  await loadTables();
  if (tab.value === "columns") await loadColumns(selected.value);
  else if (tab.value === "rows") await loadRows(selected.value);
}

onMounted(() => {
  if (open.value) void refresh();
});

watch(
  () => [props.refreshKey, props.db],
  () => void refresh()
);

// 換關卡：重置選表（透視鏡聚焦到新主表）
watch(
  () => props.sceneKey,
  () => {
    selected.value = "";
    void refresh();
  }
);

defineExpose({ openTo });
</script>

<style scoped>
.db-inspector {
  border: 1px solid rgba(120, 150, 200, 0.22);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(20, 30, 48, 0.92), rgba(13, 21, 34, 0.95));
  overflow: hidden;
  font-family: Inter, "Noto Sans TC", system-ui, sans-serif;
  color: #e8eef8;
}
.db-inspector.pulse {
  animation: dbi-pulse 0.8s ease-in-out 3;
}
@keyframes dbi-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(88, 210, 192, 0);
    border-color: rgba(120, 150, 200, 0.22);
  }
  50% {
    box-shadow: 0 0 0 3px rgba(88, 210, 192, 0.35);
    border-color: rgba(88, 210, 192, 0.7);
  }
}
.dbi-bar {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  background: transparent;
  border: none;
  color: inherit;
  font-weight: 700;
  cursor: pointer;
}
.dbi-bar:hover {
  transform: none;
  background: rgba(255, 255, 255, 0.03);
}
.dbi-icon {
  font-size: 16px;
}
.dbi-bar-title {
  font-size: 14px;
  letter-spacing: 0.3px;
}
.dbi-bar-meta {
  color: #8da3c4;
  font-size: 12px;
  font-weight: 500;
}
.dbi-chevron {
  margin-left: auto;
  color: #58d2c0;
  font-size: 13px;
}
.dbi-body {
  border-top: 1px solid rgba(120, 150, 200, 0.16);
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dbi-tabs {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  background: rgba(10, 16, 26, 0.6);
  border-radius: 10px;
  align-self: flex-start;
}
.dbi-tab {
  padding: 6px 14px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: #8da3c4;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.dbi-tab:hover {
  transform: none;
  color: #e8eef8;
}
.dbi-tab.active {
  background: linear-gradient(135deg, #1f6f64, #2aa392);
  color: #fff;
}
.dbi-pane {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dbi-pane-head {
  font-size: 13px;
  color: #aebcd6;
}
.dbi-pane-head b {
  color: #e8eef8;
  font-family: var(--mono, monospace);
}
.dbi-preview-note {
  color: #8da3c4;
  font-size: 12px;
  margin-left: 6px;
}
.dbi-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.dbi-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  max-width: 320px;
  padding: 9px 13px;
  border-radius: 10px;
  background: rgba(12, 20, 34, 0.7);
  border: 1px solid rgba(120, 150, 200, 0.18);
  color: #cdd8ec;
  cursor: pointer;
  font-family: var(--mono, monospace);
}
.dbi-chip-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.dbi-chip-count {
  font-size: 11px;
  color: #8da3c4;
}
.dbi-chip-descr {
  margin-top: 4px;
  font-family: Inter, "Noto Sans TC", sans-serif;
  font-size: 11px;
  color: #9fb0cc;
  line-height: 1.45;
  white-space: normal;
  text-align: left;
}
.dbi-chip:hover {
  transform: translateY(-1px);
  border-color: rgba(88, 210, 192, 0.45);
}
.dbi-chip b {
  font-size: 13px;
  color: #e8eef8;
}
.dbi-chip span {
  font-size: 11px;
  color: #8da3c4;
}
.dbi-chip.focus {
  border-color: rgba(88, 210, 192, 0.5);
  background: rgba(31, 111, 100, 0.22);
}
.dbi-chip.active {
  outline: 2px solid #58d2c0;
  outline-offset: 1px;
}
.dbi-others {
  font-size: 12px;
}
.dbi-others summary {
  color: #8da3c4;
  cursor: pointer;
  padding: 4px 0;
}
.dbi-cols {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dbi-col {
  display: grid;
  grid-template-columns: minmax(120px, 1fr) 56px 50px;
  align-items: center;
  gap: 4px 12px;
  padding: 7px 10px;
  border-radius: 8px;
  background: rgba(12, 20, 34, 0.55);
  font-size: 12.5px;
}
.dbi-col-name {
  font-family: var(--mono, monospace);
  color: #e8eef8;
  display: flex;
  align-items: center;
  gap: 6px;
}
.dbi-flag {
  font-size: 11px;
}
.dbi-flag.fk {
  color: #82aaff;
  font-family: Inter, sans-serif;
}
.dbi-col-type {
  color: #ffcb6b;
}
.dbi-col-null {
  color: #8da3c4;
  font-size: 11px;
}
.dbi-col-null.req {
  color: #f6b35a;
}
.dbi-col-purpose {
  grid-column: 1 / -1;
  margin-top: 3px;
  color: #c7d3e8;
  font-size: 11.5px;
  line-height: 1.55;
}
.dbi-col-check {
  grid-column: 1 / -1;
  margin-top: 2px;
  padding: 3px 9px;
  border-radius: 6px;
  background: rgba(137, 221, 255, 0.09);
  color: #a6e0ff;
  font-size: 11.5px;
  line-height: 1.5;
}
.dbi-table-wrap {
  overflow: auto;
  max-height: 320px;
  border-radius: 8px;
  border: 1px solid rgba(120, 150, 200, 0.16);
}
.dbi-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 12px;
  font-family: var(--mono, monospace);
}
.dbi-table th,
.dbi-table td {
  padding: 6px 10px;
  text-align: left;
  white-space: nowrap;
  border-bottom: 1px solid rgba(120, 150, 200, 0.12);
}
.dbi-table th {
  position: sticky;
  top: 0;
  background: #0f1726;
  color: #9fb0cc;
  font-weight: 700;
}
.dbi-table td {
  color: #cdd8ec;
}
.dbi-empty {
  color: #8da3c4;
  font-size: 12px;
}
</style>
