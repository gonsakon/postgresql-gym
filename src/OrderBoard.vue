<template>
  <section class="order-board">
    <header class="order-board-head">
      <div class="order-board-titlerow">
        <strong>📦 LiveFit 訂單牆</strong>
        <span class="order-board-source">shop_orders ▸ 看板畫面</span>
      </div>
      <span class="order-board-sub">每張卡 = <code>shop_orders</code> 的一列；你改 SQL，這面牆就跟著動。</span>
    </header>
    <div class="order-lanes">
      <div v-for="lane in lanes" :key="lane.status" class="order-lane">
        <div class="lane-label" :class="'st-' + lane.status">
          <span class="lane-zh">{{ lane.label }}<b>{{ lane.orders.length }}</b></span>
          <code class="lane-status">= '{{ lane.status }}'</code>
        </div>
        <div class="lane-cards">
          <div
            v-for="o in lane.orders"
            :key="o.order_no"
            class="order-card"
            :class="['st-' + o.status, { flash: flashed.has(o.order_no) }]"
            :title="o.note || ''"
          >
            <span class="oc-no">{{ o.order_no }}</span>
            <span class="oc-name">{{ o.customer_name }}</span>
            <span class="oc-amt">${{ formatAmt(o.total_amount) }}</span>
          </div>
          <span v-if="!lane.orders.length" class="lane-empty">—</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PGlite } from "@electric-sql/pglite";
import { computed, onMounted, ref, watch } from "vue";

const props = defineProps<{ db: PGlite | null; refreshKey: number }>();

const LANES = [
  { status: "pending", label: "待付款" },
  { status: "paid", label: "已付款" },
  { status: "packed", label: "已打包" },
  { status: "shipped", label: "已出貨" },
  { status: "cancelled", label: "已取消" },
  { status: "refunded", label: "已退款" }
];

interface BoardRow {
  order_no: string;
  customer_name: string;
  total_amount: unknown;
  status: string;
  note: string | null;
}

const rows = ref<BoardRow[]>([]);
const flashed = ref<Set<string>>(new Set());
let prevStatus: Record<string, string> = {};
let flashTimer: ReturnType<typeof setTimeout> | null = null;

const lanes = computed(() =>
  LANES.map((lane) => ({ ...lane, orders: rows.value.filter((r) => r.status === lane.status) }))
);

function formatAmt(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString() : String(value);
}

async function refresh() {
  if (!props.db) return;
  try {
    const res = await props.db.query(
      "SELECT order_no, customer_name, total_amount, status, note FROM shop_orders ORDER BY id;"
    );
    const next = res.rows as BoardRow[];
    const hadPrev = Object.keys(prevStatus).length > 0;
    const changed = new Set<string>();
    for (const r of next) {
      const before = prevStatus[r.order_no];
      // 狀態變了，或這是一筆全新的訂單（INSERT）→ 閃一下
      if (hadPrev && (before === undefined || before !== r.status)) changed.add(r.order_no);
    }
    rows.value = next;
    prevStatus = Object.fromEntries(next.map((r) => [r.order_no, r.status]));
    if (changed.size) {
      flashed.value = changed;
      if (flashTimer) clearTimeout(flashTimer);
      flashTimer = setTimeout(() => {
        flashed.value = new Set();
      }, 1400);
    }
  } catch {
    /* 沙箱還沒就緒或查詢失敗時，維持上一張牆 */
  }
}

onMounted(refresh);
watch(
  () => [props.refreshKey, props.db],
  () => void refresh()
);
</script>
