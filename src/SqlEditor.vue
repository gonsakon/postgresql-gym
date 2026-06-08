<template>
  <div ref="host" class="cm-host"></div>
</template>

<script setup lang="ts">
import { indentWithTab } from "@codemirror/commands";
import { PostgreSQL, sql } from "@codemirror/lang-sql";
import { EditorState, Prec, StateEffect, StateField } from "@codemirror/state";
import type { DecorationSet } from "@codemirror/view";
import { Decoration, EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps<{ modelValue: string; errorLine?: number | null }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "run"): void;
  (e: "submit"): void;
}>();

const host = ref<HTMLElement | null>(null);
let view: EditorView | null = null;

// 錯誤行高亮：用 StateEffect 從外部設定要標紅的行號。
const setErrorLine = StateEffect.define<number | null>();
const errorLineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(value, tr) {
    value = value.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(setErrorLine)) {
        const lineNo = effect.value;
        if (!lineNo || lineNo < 1 || lineNo > tr.state.doc.lines) {
          value = Decoration.none;
        } else {
          const line = tr.state.doc.line(lineNo);
          value = Decoration.set([Decoration.line({ class: "cm-error-line" }).range(line.from)]);
        }
      }
    }
    return value;
  },
  provide: (field) => EditorView.decorations.from(field)
});

// 餵給自動補全的資料表 / 欄位（與 schema-grid 一致）。
const schema = {
  members: ["id", "name", "email", "level", "city", "credits", "joined_at"],
  credit_packages: ["id", "name", "credit_amount", "price", "created_at"],
  shop_orders: [
    "id",
    "order_no",
    "customer_name",
    "email",
    "city",
    "status",
    "total_amount",
    "paid_at",
    "shipped_at",
    "created_at",
    "note"
  ],
  coaches: ["id", "name", "email", "specialty", "hourly_rate"],
  courses: ["id", "coach_id", "title", "branch", "capacity", "price", "starts_at"],
  course_bookings: ["id", "member_id", "course_id", "status", "booked_at", "paid_amount"]
};

const darkTheme = EditorView.theme(
  {
    "&": { color: "#e7f2ef", backgroundColor: "#101827", height: "100%", minHeight: "240px" },
    ".cm-content": { fontFamily: "var(--mono)", caretColor: "#e7f2ef", padding: "14px 0" },
    ".cm-gutters": { backgroundColor: "#0c1320", color: "#5b6b86", border: "none" },
    ".cm-activeLine": { backgroundColor: "rgba(255, 255, 255, 0.04)" },
    ".cm-activeLineGutter": { backgroundColor: "rgba(255, 255, 255, 0.06)", color: "#9fb0cc" },
    "&.cm-focused .cm-cursor": { borderLeftColor: "#e7f2ef" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
      backgroundColor: "#2a3a55"
    },
    ".cm-error-line": { backgroundColor: "rgba(166, 66, 58, 0.32)" },
    ".cm-scroller": { fontFamily: "var(--mono)", lineHeight: "1.58", overflow: "auto" }
  },
  { dark: true }
);

function makeState(doc: string) {
  return EditorState.create({
    doc,
    extensions: [
      Prec.highest(
        keymap.of([
          { key: "Mod-Enter", preventDefault: true, run: () => (emit("run"), true) },
          { key: "Mod-Shift-Enter", preventDefault: true, run: () => (emit("submit"), true) },
          indentWithTab
        ])
      ),
      basicSetup,
      sql({ dialect: PostgreSQL, schema, upperCaseKeywords: true }),
      errorLineField,
      darkTheme,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const value = update.state.doc.toString();
          if (value !== props.modelValue) emit("update:modelValue", value);
        }
      })
    ]
  });
}

onMounted(() => {
  if (!host.value) return;
  view = new EditorView({ state: makeState(props.modelValue), parent: host.value });
});

onBeforeUnmount(() => {
  view?.destroy();
  view = null;
});

// 外部改 modelValue（換題、重置本題、下一題）→ 同步回編輯器。
watch(
  () => props.modelValue,
  (value) => {
    if (!view) return;
    const current = view.state.doc.toString();
    if (value !== current) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }
);

watch(
  () => props.errorLine ?? null,
  (lineNo) => {
    view?.dispatch({ effects: setErrorLine.of(lineNo) });
  }
);

defineExpose({
  focus: () => view?.focus()
});
</script>

<style scoped>
.cm-host {
  height: 100%;
  min-height: 240px;
  overflow: hidden;
  border-bottom: 1px solid var(--line);
}

.cm-host :deep(.cm-editor) {
  height: 100%;
}

.cm-host :deep(.cm-editor.cm-focused) {
  outline: none;
}
</style>
