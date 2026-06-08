<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">
        <div class="brand-title">PostgreSQL 正體中文練習手冊</div>
        <div class="brand-subtitle">練習室 MVP · 講義 + 沙箱</div>
      </div>
      <div class="search-wrap">
        <label class="search-box">
          <span>搜尋課程或題目...</span>
          <input ref="searchInput" v-model="search" aria-label="搜尋課程或題目" />
          <span class="kbd">⌘ K</span>
        </label>
      </div>
      <div class="status-strip">
        <span class="status-pill">{{ totalProgress.done }}/{{ totalProgress.total }} 已完成</span>
        <span>{{ isReady ? "PostgreSQL 已在瀏覽器中執行" : "沙箱啟動中" }}</span>
      </div>
    </header>

    <aside class="nav">
      <div v-for="group in navSections" :key="group.section" class="nav-section">
        <h2 class="nav-heading">{{ group.section }}</h2>
        <button
          v-for="lesson in group.lessons"
          :key="lesson.id"
          class="lesson-button"
          :class="{ active: activeLesson.id === lesson.id, done: getLessonProgress(lesson.id).done === getLessonProgress(lesson.id).total }"
          type="button"
          @click="selectLesson(lesson.id)"
        >
          <span class="lesson-index">
            {{ getLessonProgress(lesson.id).done === getLessonProgress(lesson.id).total ? "✓" : lessonIndex(lesson) }}
          </span>
          <span class="lesson-meta">
            <span class="lesson-name">{{ lesson.title }}</span>
            <span class="lesson-small">{{ lesson.label }}</span>
          </span>
          <span class="lesson-count">{{ getLessonProgress(lesson.id).done }}/{{ getLessonProgress(lesson.id).total }}</span>
        </button>
      </div>
    </aside>

    <main ref="contentPane" class="content">
      <span class="eyebrow">{{ activeLesson.section }} · {{ activeLesson.label }}</span>
      <h1>{{ activeLesson.title }}</h1>
      <p class="lead">{{ activeLesson.lead }}</p>
      <section class="mission-card">
        <div>
          <span class="mission-label">本章任務</span>
          <h2>任務目標</h2>
          <p>{{ activeLesson.mission }}</p>
        </div>
        <span class="mission-progress">{{ activeLessonProgress.done }}/{{ activeLessonProgress.total }} 步驟完成</span>
      </section>

      <div v-if="activeLesson.isCase" class="case-banner">
        <strong>案件模式</strong><br />
        這裡不是單題刷 SQL，而是先讀一份既有情境資料集，再一步步查詢、修改與驗收。
      </div>

      <section class="lesson-block">
        <h2>教學重點</h2>
        <aside class="coach-card normal">
          <img class="coach-avatar" :src="coachImages.normal" alt="海姐陪跑" />
          <div class="coach-copy">
            <div class="coach-label">海姐陪跑</div>
            <p>{{ activeLesson.coachLine || "我們先把題目拆小，一次只練一個 SQL 動作。" }}</p>
          </div>
        </aside>
        <p>{{ activeLesson.teaching }}</p>
        <pre class="syntax"><code>{{ activeLesson.syntax }}</code></pre>
        <div class="hint-box">
          前幾關先用 members，Node.js 對照題會用 credit_packages；情境任務會先推薦既有資料集，再讓學生改一點 SQL 看結果怎麼變。
        </div>
      </section>

      <section class="lesson-block">
        <h2>任務步驟</h2>
        <div class="exercise-list">
          <button
            v-for="exercise in activeLesson.exercises"
            :key="exercise.id"
            class="exercise-card"
            :class="{ active: exercise.id === activeExercise.id, done: completed.has(exercise.id) }"
            type="button"
            :aria-pressed="exercise.id === activeExercise.id"
            @click="selectExercise(activeLesson.id, exercise.id)"
          >
            <span class="checkmark" aria-hidden="true">{{ completed.has(exercise.id) ? "✓" : "" }}</span>
            <span class="exercise-main">
              <span class="exercise-title">{{ exercise.title }}</span>
              <span class="exercise-desc">{{ exercise.description }}</span>
              <span class="exercise-tags">
                <span v-for="tag in exercise.tags" :key="tag" class="tag">{{ tag }}</span>
              </span>
            </span>
            <span class="select-exercise">
              {{ exercise.id === activeExercise.id ? "處理中" : "開始任務" }}
            </span>
          </button>
        </div>
      </section>

      <section class="lesson-block schema-block">
        <h2>資料表速查</h2>
        <div class="schema-grid">
          <div class="schema-table">
            <strong>members</strong>
            <code>id, name, email, level, city, credits, joined_at</code>
          </div>
          <div class="schema-table">
            <strong>credit_packages</strong>
            <code>id, name, credit_amount, price, created_at</code>
          </div>
          <div class="schema-table">
            <strong>shop_orders</strong>
            <code>id, order_no, customer_name, email, city, status, total_amount, paid_at, shipped_at, created_at, note</code>
          </div>
          <div class="schema-table">
            <strong>coaches</strong>
            <code>id, name, email, specialty, hourly_rate</code>
          </div>
          <div class="schema-table">
            <strong>courses</strong>
            <code>id, coach_id, title, branch, capacity, price, starts_at</code>
          </div>
          <div class="schema-table">
            <strong>course_bookings</strong>
            <code>id, member_id, course_id, status, booked_at, paid_amount</code>
          </div>
        </div>
      </section>

      <details class="lesson-block lesson-details">
        <summary>
          <span>影音課程對照</span>
          <span class="summary-meta">{{ visibleVideoModules.length }} 個相關章節</span>
        </summary>
        <p>這裡只顯示目前這段練習對應的影音章節，其他進階課程先收起來，避免一開始壓力太大。</p>
        <div class="video-module-list">
          <article v-for="module in visibleVideoModules" :key="module.title" class="video-module">
            <div>
              <strong>{{ module.title }}</strong>
              <span>{{ module.count }} 支影片</span>
            </div>
            <ul>
              <li v-for="item in module.items" :key="item">{{ item }}</li>
            </ul>
          </article>
        </div>
        <p class="video-summary">另外 {{ hiddenVideoModuleCount }} 個影音章節已先記錄在系統裡，但不在這個新手單元全部展開。</p>
      </details>

      <details v-if="futureChapters.length > 0" class="lesson-block lesson-details">
        <summary>
          <span>後面才會解鎖</span>
          <span class="summary-meta">{{ futureChapters.length }} 個進階方向</span>
        </summary>
        <ul class="roadmap-list">
          <li v-for="chapter in futureChapters" :key="chapter">{{ chapter }}</li>
        </ul>
      </details>
    </main>

    <section ref="workspacePane" class="workspace">
      <div class="workspace-header">
        <div>
          <span class="workspace-label">目前任務步驟</span>
          <h2 class="workspace-title">{{ activeExercise.title }}</h2>
          <p class="workspace-task">{{ activeExercise.description }}</p>
        </div>
        <button class="reset-button" id="resetDb" type="button" :disabled="isBusy" @click="resetCurrentExercise">重置本題</button>
      </div>
      <textarea
        id="sqlEditor"
        ref="sqlEditor"
        v-model="sql"
        class="editor"
        spellcheck="false"
        @keydown.tab.prevent="insertTab"
      ></textarea>
      <div class="toolbar">
        <button class="run-button" id="runSql" type="button" :disabled="isBusy || !isReady" @click="runSql">執行</button>
        <button class="submit-button" id="submitSql" type="button" :disabled="isBusy || !isReady" @click="submitSql">送出驗收</button>
        <span class="toolbar-note">{{ isReady ? "PostgreSQL 沙箱已就緒" : "PostgreSQL 沙箱初始化中..." }}</span>
      </div>
      <div class="results">
        <div class="hint-box support-box">
          <strong>任務支援</strong>
          <details>
            <summary>提示 1：方向提示</summary>
            <p>{{ activeExercise.hints.direction }}</p>
          </details>
          <details>
            <summary>提示 2：SQL 骨架</summary>
            <pre class="syntax"><code>{{ safeSkeleton }}</code></pre>
          </details>
          <details>
            <summary>提示 3：驗收前檢查</summary>
            <ul class="support-checklist">
              <li v-for="item in taskChecklist" :key="item">{{ item }}</li>
            </ul>
          </details>
        </div>

        <div v-if="isActiveExerciseCompleted" class="solution-card">
          <strong>通過後參考解法</strong>
          <pre class="syntax"><code>{{ activeExercise.hints.answer }}</code></pre>
        </div>
        <div v-else class="locked-solution">參考解法會在這個任務通過後開放。</div>

        <div v-if="feedback" class="feedback" :class="feedback.type">
          <img class="feedback-coach" :src="coachImages[feedbackCoachState]" alt="" />
          <div>
            <div class="feedback-title">{{ feedback.title }}</div>
            <div class="feedback-body">{{ feedback.body }}</div>
            <div class="feedback-coach-line">{{ feedbackCoachMessage }}</div>
          </div>
        </div>
        <div v-else class="empty-result">先按「執行」觀察任務結果；按「送出驗收」才會完成這個步驟。</div>

        <div v-if="result && resultRows.length === 0" class="empty-result">
          {{ result.message || "沒有回傳資料。" }}
        </div>
        <table v-else-if="resultRows.length > 0" class="result-table">
          <thead>
            <tr>
              <th v-for="column in resultColumns" :key="column">{{ column }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in resultRows" :key="rowIndex">
              <td v-for="column in resultColumns" :key="column">{{ formatValue(row[column]) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { PGlite } from "@electric-sql/pglite";
import { computed, nextTick, onMounted, onUnmounted, ref, shallowRef } from "vue";
import { futureChapters, lessons, schemaSql, videoModules } from "./courseData";
import type { CompareOptions, Exercise, Feedback, Lesson, ResultState, SqlRow, SqlValue, VideoModule } from "./types";

const STORAGE_KEY = "postgresql-gym-mvp-progress-v2";

const coachImages = {
  normal: "/images/coach/normal.png",
  confused: "/images/coach/confused.png",
  praise: "/images/coach/praise.png",
  proud: "/images/coach/proud.png"
} as const;

type CoachState = keyof typeof coachImages;

const database = shallowRef<PGlite | null>(null);
const isReady = ref(false);
const isBusy = ref(false);
const search = ref("");
const activeLessonId = ref(lessons[0].id);
const activeExerciseId = ref(lessons[0].exercises[0].id);
const sql = ref(lessons[0].exercises[0].starterSql);
const draftSqlByExerciseId = ref<Record<string, string>>({
  [lessons[0].exercises[0].id]: lessons[0].exercises[0].starterSql
});
const completed = ref<Set<string>>(new Set(loadProgress()));
const result = ref<ResultState | null>(null);
const feedback = ref<Feedback | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);
const sqlEditor = ref<HTMLTextAreaElement | null>(null);
const contentPane = ref<HTMLElement | null>(null);
const workspacePane = ref<HTMLElement | null>(null);

const allExercises = computed(() =>
  lessons.flatMap((lesson) => lesson.exercises.map((exercise) => ({ ...exercise, lessonId: lesson.id })))
);

const activeLesson = computed<Lesson>(() => lessons.find((lesson) => lesson.id === activeLessonId.value) || lessons[0]);

const activeExercise = computed<Exercise>(() => {
  return activeLesson.value.exercises.find((exercise) => exercise.id === activeExerciseId.value) || activeLesson.value.exercises[0];
});

const activeLessonProgress = computed(() => getLessonProgress(activeLesson.value.id));

const totalProgress = computed(() => {
  const total = allExercises.value.length;
  const done = allExercises.value.filter((exercise) => completed.value.has(exercise.id)).length;
  return { done, total };
});

const filteredLessons = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!query) return lessons;

  return lessons
    .map((lesson) => {
      const lessonMatched =
        lesson.title.toLowerCase().includes(query) ||
        lesson.section.toLowerCase().includes(query) ||
        lesson.label.toLowerCase().includes(query);
      const exercises = lesson.exercises.filter((exercise) => {
        const haystack = `${exercise.title} ${exercise.description} ${exercise.tags.join(" ")}`;
        return lessonMatched || haystack.toLowerCase().includes(query);
      });
      return exercises.length > 0 ? { ...lesson, exercises } : null;
    })
    .filter((lesson): lesson is Lesson => Boolean(lesson));
});

const navSections = computed(() => {
  const groups = new Map<string, Lesson[]>();
  for (const lesson of filteredLessons.value) {
    if (!groups.has(lesson.section)) groups.set(lesson.section, []);
    groups.get(lesson.section)?.push(lesson);
  }
  return [...groups.entries()].map(([section, groupLessons]) => ({ section, lessons: groupLessons }));
});

const visibleVideoModules = computed(() => getLessonVideoModules(activeLesson.value));

const hiddenVideoModuleCount = computed(() => videoModules.length - visibleVideoModules.value.length);

const feedbackCoachState = computed<CoachState>(() => {
  if (totalProgress.value.done === totalProgress.value.total && totalProgress.value.total > 0) return "proud";
  if (feedback.value?.type === "pass") return "praise";
  if (feedback.value?.type === "fail") return "confused";
  return "normal";
});

const feedbackCoachMessage = computed(() => {
  if (totalProgress.value.done === totalProgress.value.total && totalProgress.value.total > 0) {
    return "很穩，這一輪題庫都打勾了。先把這個節奏記住，下一輪再慢慢加 JOIN 和 GROUP BY。";
  }

  if (feedback.value?.type === "pass") {
    return "做得不錯，這一步很穩。你剛剛讓 SQL 正確找到資料，先把這個手感記住。";
  }

  if (feedback.value?.type === "fail") {
    return "別急，這通常只是欄位、條件或排序的小卡點。先看錯誤訊息，再用「執行」觀察結果怎麼變。";
  }

  return "「執行」會先看結果，「送出驗收」才會驗收並打勾。";
});

const resultRows = computed(() => (result.value?.rows || []).map((row) => normalizeRow(row)));

const resultColumns = computed(() => (resultRows.value.length > 0 ? Object.keys(resultRows.value[0]) : []));

const isActiveExerciseCompleted = computed(() => completed.value.has(activeExercise.value.id));

const safeSkeleton = computed(() => buildSafeSkeleton(activeExercise.value));

const taskChecklist = computed(() => buildTaskChecklist(activeExercise.value));

function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as string[]) : [];
  } catch {
    return [];
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed.value]));
}

function getLessonProgress(lessonId: string) {
  const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
  const done = lesson.exercises.filter((exercise) => completed.value.has(exercise.id)).length;
  return { done, total: lesson.exercises.length };
}

function lessonIndex(lesson: Lesson) {
  const parts = lesson.label.split("-");
  return parts[parts.length - 1] || lesson.label;
}

function selectLesson(lessonId: string) {
  const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
  const firstIncomplete = lesson.exercises.find((exercise) => !completed.value.has(exercise.id));
  const stackedLayout = isStackedLayout();
  setActiveExercise(lesson.id, (firstIncomplete || lesson.exercises[0]).id, {
    focusEditor: !stackedLayout,
    scrollEditorIntoView: false
  });
  nextTick(() => {
    if (contentPane.value) contentPane.value.scrollTop = 0;
    if (stackedLayout) window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function selectExercise(lessonId: string, exerciseId: string) {
  setActiveExercise(lessonId, exerciseId, { focusEditor: true, scrollEditorIntoView: isStackedLayout() });
}

function setActiveExercise(
  lessonId: string,
  exerciseId: string,
  options: { focusEditor?: boolean; scrollEditorIntoView?: boolean } = {}
) {
  saveCurrentDraft();
  const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
  const exercise = lesson.exercises.find((item) => item.id === exerciseId) || lesson.exercises[0];
  activeLessonId.value = lesson.id;
  activeExerciseId.value = exercise.id;
  sql.value = getExerciseDraft(exercise);
  result.value = null;
  feedback.value = null;
  if (options.focusEditor) focusSqlEditor(options.scrollEditorIntoView);
}

function getLessonVideoModules(lesson: Lesson): VideoModule[] {
  const titlesByLesson: Record<string, string[]> = {
    "table-warmup": ["資料庫簡介"],
    "select-columns": ["建立 SQL 資料表"],
    "where-one-condition": ["SQL 語法教學"],
    "sort-and-limit": ["order by 排序資料"],
    "write-one-row": ["建立 SQL 資料表", "SQL 語法教學"],
    "ecommerce-case": ["SQL 語法教學", "order by 排序資料", "建立 SQL 資料表"],
    "table-relationships": ["Tables 資料表管理"],
    "postgres-functions": ["postgres 函式"],
    "join-relations": ["JOIN 資料關聯"],
    "group-aggregation": ["group by 分組資料", "JOIN 資料關聯"],
    "subquery-practice": ["子查詢 (Subquery)"],
    "incident-room": ["JOIN 資料關聯", "group by 分組資料", "子查詢 (Subquery)"]
  };
  const titles = titlesByLesson[lesson.id] || [lesson.section];
  return videoModules.filter((module) => titles.includes(module.title));
}

const commonColumnNames = [
  "id",
  "name",
  "email",
  "level",
  "city",
  "credits",
  "joined_at",
  "credit_amount",
  "price",
  "created_at",
  "order_no",
  "customer_name",
  "status",
  "total_amount",
  "paid_at",
  "shipped_at",
  "note",
  "coach_id",
  "title",
  "branch",
  "capacity",
  "starts_at",
  "specialty",
  "hourly_rate",
  "member_id",
  "course_id",
  "booked_at",
  "paid_amount"
];

const snapshotTables = ["members", "credit_packages", "shop_orders", "coaches", "courses", "course_bookings"] as const;

function normalizeValue(value: SqlValue): SqlValue {
  if (value instanceof Date) {
    const iso = value.toISOString();
    if (iso.endsWith("T00:00:00.000Z")) return iso.slice(0, 10);
    return iso.replace("T", " ").replace(".000Z", "");
  }
  if (typeof value === "bigint") return Number(value);
  return value;
}

function normalizeRow(row: SqlRow): SqlRow {
  const next: SqlRow = {};
  for (const [key, value] of Object.entries(row)) {
    next[key] = normalizeValue(value);
  }
  return next;
}

function normalizeRows(rows: SqlRow[], options: CompareOptions = {}) {
  const normalized = rows.map((row) => normalizeRow(row));

  if (!options.order) {
    return normalized.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  }

  return normalized;
}

function formatValue(value: SqlValue) {
  if (value === null || value === undefined) return "NULL";
  return String(value);
}

function saveCurrentDraft() {
  draftSqlByExerciseId.value[activeExerciseId.value] = sql.value;
}

function saveExerciseDraft(exerciseId: string, sqlText: string) {
  draftSqlByExerciseId.value[exerciseId] = sqlText;
}

function getExerciseDraft(exercise: Exercise) {
  return draftSqlByExerciseId.value[exercise.id] ?? exercise.starterSql;
}

function buildSafeSkeleton(exercise: Exercise) {
  const requirements = exercise.requires || [];

  if (requirements.includes("INSERT")) {
    return `INSERT INTO 資料表 (欄位一, 欄位二, ...)
VALUES (值一, 值二, ...);`;
  }

  if (requirements.includes("UPDATE")) {
    return `UPDATE 資料表
SET 要修改的欄位 = 新值
WHERE 只鎖定這一筆資料的條件;`;
  }

  if (requirements.includes("DELETE")) {
    return `DELETE FROM 資料表
WHERE 只刪除這一筆資料的條件;`;
  }

  if (requirements.includes("ORDER BY") && requirements.includes("LIMIT")) {
    return `SELECT 要看的欄位
FROM 資料表
ORDER BY 排序欄位 排序方向
LIMIT 筆數;`;
  }

  if (requirements.includes("ORDER BY")) {
    return `SELECT 要看的欄位
FROM 資料表
ORDER BY 排序欄位 排序方向;`;
  }

  if (requirements.includes("WHERE")) {
    return `SELECT 要看的欄位
FROM 資料表
WHERE 欄位 運算子 條件值;`;
  }

  return `SELECT 要看的欄位
FROM 資料表;`;
}

function buildTaskChecklist(exercise: Exercise) {
  const requirements = exercise.requires || [];
  const items = ["回頭看任務文字：要回傳哪些欄位？順序有沒有一致？"];

  if (requirements.includes("WHERE")) {
    items.push("如果條件值是文字，記得用單引號，例如 'Taipei'。");
  }

  if (requirements.includes("ORDER BY")) {
    items.push("排序方向要想清楚：由小到大是 ASC，由大到小是 DESC。");
  }

  if (requirements.includes("LIMIT")) {
    items.push("LIMIT 放在排序後面，確認只留下任務要求的筆數。");
  }

  if (requirements.includes("INSERT")) {
    items.push("欄位清單和 VALUES 的順序要一一對齊，文字和日期要加單引號。");
  }

  if (requirements.includes("UPDATE")) {
    items.push("UPDATE 一定要保留 WHERE，確認只改任務指定的那一筆資料。");
  }

  if (requirements.includes("DELETE")) {
    items.push("DELETE 一定要保留 WHERE，確認只刪除任務指定的那一筆資料。");
  }

  if (exercise.forbidden?.includes("SELECT *")) {
    items.push("這題不要用 SELECT *，請明確寫出任務要看的欄位。");
  }

  if (exercise.type === "mutation") {
    items.push("修改、新增或刪除前，先確認 WHERE 或 VALUES 已經鎖定任務指定資料，再按「執行」或「送出驗收」。");
  } else {
    items.push("先按「執行」看表格，再按「送出驗收」。");
  }

  return items;
}

function isStackedLayout() {
  return window.matchMedia("(max-width: 760px)").matches;
}

function focusSqlEditor(scrollIntoView = false) {
  nextTick(() => {
    if (scrollIntoView) {
      workspacePane.value?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    window.requestAnimationFrame(() => {
      sqlEditor.value?.focus({ preventScroll: true });
    });
  });
}

function getUnorderedSignature(rows: SqlRow[]) {
  return JSON.stringify(
    normalizeRows(rows, { order: false }).map((row) => {
      const sortedRow: SqlRow = {};
      for (const key of Object.keys(row).sort()) {
        sortedRow[key] = row[key];
      }
      return sortedRow;
    })
  );
}

function findFirstDifferentCell(actual: SqlRow[], expected: SqlRow[]) {
  const rowCount = Math.min(actual.length, expected.length);

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const keys = Object.keys(expected[rowIndex] || {});
    for (const key of keys) {
      if (actual[rowIndex]?.[key] !== expected[rowIndex]?.[key]) {
        return {
          rowNumber: rowIndex + 1,
          column: key,
          actual: actual[rowIndex]?.[key],
          expected: expected[rowIndex]?.[key]
        };
      }
    }
  }

  return null;
}

function compareRows(actualRows: SqlRow[], expectedRows: SqlRow[], options: CompareOptions = {}) {
  const actual = normalizeRows(actualRows, options);
  const expected = normalizeRows(expectedRows, options);

  if (actual.length !== expected.length) {
    const direction = actual.length > expected.length ? "多了" : "少了";
    return {
      pass: false,
      message: `筆數不同：你的結果是 ${actual.length} 筆，預期是 ${expected.length} 筆。資料${direction}，先檢查 WHERE 條件或 LIMIT。`
    };
  }

  if (options.columns && expected.length > 0) {
    const expectedColumns = Object.keys(expected[0]);
    const actualColumns = actual.length > 0 ? Object.keys(actual[0]) : [];
    if (JSON.stringify(actualColumns) !== JSON.stringify(expectedColumns)) {
      return {
        pass: false,
        message: `欄位不同：你現在回傳 ${actualColumns.join(", ") || "沒有欄位"}，這題要回傳 ${expectedColumns.join(", ")}。先檢查 SELECT 後面的欄位。`
      };
    }
  }

  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    if (options.order && getUnorderedSignature(actual) === getUnorderedSignature(expected)) {
      return {
        pass: false,
        message: "資料內容是對的，但順序還不對。先檢查 ORDER BY 的欄位和 ASC / DESC。"
      };
    }

    const differentCell = findFirstDifferentCell(actual, expected);
    if (differentCell) {
      return {
        pass: false,
        message: `資料內容還不一樣：第 ${differentCell.rowNumber} 筆的 ${differentCell.column} 是 ${formatValue(differentCell.actual)}，預期是 ${formatValue(differentCell.expected)}。先回頭檢查題目條件。`
      };
    }

    return {
      pass: false,
      message: "資料內容還不一樣。可以先按「執行」看表格，再檢查欄位、WHERE 條件或排序。"
    };
  }

  return { pass: true, message: "結果與標準答案一致。" };
}

async function getDatabaseSnapshot() {
  if (!database.value) throw new Error("PostgreSQL 沙箱尚未準備好。");
  const snapshot: Record<string, SqlRow[]> = {};

  for (const table of snapshotTables) {
    const queryResult = await database.value.query(`SELECT * FROM ${table} ORDER BY id;`);
    snapshot[table] = queryResult.rows as SqlRow[];
  }

  return snapshot;
}

function compareDatabaseSnapshots(actual: Record<string, SqlRow[]>, expected: Record<string, SqlRow[]>) {
  for (const table of snapshotTables) {
    const comparison = compareRows(actual[table] || [], expected[table] || [], {
      order: true,
      columns: true
    });

    if (!comparison.pass) {
      return {
        pass: false,
        message: `${table} 最後狀態不符合任務預期。${comparison.message}`
      };
    }
  }

  return { pass: true, message: "資料庫狀態與任務預期一致。" };
}

function stripSqlComments(sqlText: string) {
  return sqlText.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

function getSqlStatements(sqlText: string) {
  return stripSqlComments(sqlText)
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

function stripSqlQuotedSegments(
  sqlText: string,
  options: { single: boolean; double: boolean; dollar: boolean }
) {
  let output = "";

  for (let index = 0; index < sqlText.length; index += 1) {
    const char = sqlText[index];

    if (options.single && char === "'") {
      output += "''";
      index += 1;
      while (index < sqlText.length) {
        if (sqlText[index] === "'" && sqlText[index + 1] === "'") {
          index += 2;
          continue;
        }

        if (sqlText[index] === "'") break;
        index += 1;
      }

      continue;
    }

    if (options.double && char === "\"") {
      output += "\"\"";
      index += 1;
      while (index < sqlText.length) {
        if (sqlText[index] === "\"" && sqlText[index + 1] === "\"") {
          index += 2;
          continue;
        }

        if (sqlText[index] === "\"") break;
        index += 1;
      }

      continue;
    }

    if (options.dollar && char === "$") {
      const tag = sqlText.slice(index).match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/)?.[0];
      if (tag) {
        const endIndex = sqlText.indexOf(tag, index + tag.length);
        output += `${tag}${tag}`;
        if (endIndex === -1) break;
        index = endIndex + tag.length - 1;
        continue;
      }
    }

    output += char;
  }

  return output;
}

function stripSqlStrings(sqlText: string) {
  return stripSqlQuotedSegments(sqlText, { single: true, double: true, dollar: true });
}

function getFeatureSql(sqlText: string) {
  return stripSqlStrings(stripSqlComments(sqlText));
}

function getRequiredPatternSql(sqlText: string, preserveStrings?: boolean) {
  return stripSqlQuotedSegments(stripSqlComments(sqlText), {
    single: !preserveStrings,
    double: true,
    dollar: true
  });
}

function getJoinTypes(normalizedSql: string) {
  const joinTypes: string[] = [];
  const joinRegex = /\b(?:(INNER|LEFT|RIGHT|FULL|CROSS)(?:\s+OUTER)?\s+)?JOIN\b/g;
  for (const match of normalizedSql.matchAll(joinRegex)) {
    joinTypes.push(match[1] || "INNER");
  }

  return joinTypes;
}

function hasUnsafeWriteKeyword(sqlText: string) {
  const featureSql = getFeatureSql(sqlText);
  return /\b(INSERT|UPDATE|DELETE|MERGE|CREATE|DROP|ALTER|TRUNCATE|REPLACE|COPY)\b/i.test(featureSql);
}

function checkSqlFeatures(sqlText: string, exercise: Exercise) {
  const featureSql = getFeatureSql(sqlText);
  const commentFreeSql = stripSqlComments(sqlText);
  const normalized = featureSql.replace(/\s+/g, " ").trim().toUpperCase();
  const problems: string[] = [];

  if (exercise.type === "mutation" && getSqlStatements(sqlText).length !== 1) {
    problems.push("修改資料的任務一次只接受一個 INSERT、UPDATE 或 DELETE 語句。請不要用多段 SQL 先改錯再修回來。");
  }

  if (exercise.type === "mutation") {
    const writeActions = featureSql.match(/\b(INSERT|UPDATE|DELETE)\b/gi) || [];
    if (writeActions.length !== 1) {
      problems.push("修改資料的任務一次只練一個 INSERT、UPDATE 或 DELETE 動作。");
    }

    if (/\bRETURNING\b/i.test(featureSql)) {
      problems.push("這套新手任務先不使用 RETURNING，請只寫出任務指定的資料修改語句。");
    }
  }

  const joinTypes = getJoinTypes(normalized);
  const requiredJoinTypes: Record<string, string> = {
    "INNER JOIN": "INNER",
    "LEFT JOIN": "LEFT",
    "RIGHT JOIN": "RIGHT",
    "FULL JOIN": "FULL"
  };
  const requiredJoinTypeSet = new Set(
    (exercise.requires || [])
      .map((required) => requiredJoinTypes[required.trim().toUpperCase().replace(/\s+/g, " ")])
      .filter(Boolean)
  );
  for (const required of exercise.requires || []) {
    const normalizedRequired = required.trim().toUpperCase().replace(/\s+/g, " ");

    if (requiredJoinTypes[normalizedRequired]) {
      if (!joinTypes.includes(requiredJoinTypes[normalizedRequired])) {
        problems.push(`這題需要練 ${required}。`);
      }
      continue;
    }

    const regex = new RegExp(`\\b${normalizedRequired.replace(/\s+/g, "\\s+")}\\b`);
    if (!regex.test(normalized)) {
      problems.push(`這題需要練 ${required}。`);
    }
  }

  if (requiredJoinTypeSet.size === 1 && joinTypes.some((joinType) => !requiredJoinTypeSet.has(joinType))) {
    const expectedJoin = Object.keys(requiredJoinTypes).find((label) => requiredJoinTypes[label] === [...requiredJoinTypeSet][0]);
    problems.push(`這題要專心練 ${expectedJoin}，請不要混用其他 JOIN 類型。`);
  }

  for (const forbidden of exercise.forbidden || []) {
    if (forbidden === "SELECT *" && /SELECT\s+\*/i.test(featureSql)) {
      problems.push("這題不接受 SELECT *，請明確列出欄位。");
    }
  }

  for (const requiredPattern of exercise.requiredPatterns || []) {
    const regex = new RegExp(requiredPattern.pattern, "i");
    const targetSql = getRequiredPatternSql(commentFreeSql, requiredPattern.preserveStrings);
    if (!regex.test(targetSql)) {
      problems.push(requiredPattern.label);
    }
  }

  return problems;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function getErrorField(error: unknown, field: "code" | "hint" | "position" | "detail") {
  if (!error || typeof error !== "object" || !(field in error)) return undefined;
  const value = (error as Record<string, unknown>)[field];
  return typeof value === "string" || typeof value === "number" ? value : undefined;
}

function getQuotedName(message: string) {
  return message.match(/"([^"]+)"/)?.[1];
}

function getTokenAtPosition(sqlText: string, position: string | number | undefined) {
  const index = Number(position) - 1;
  if (!Number.isFinite(index) || index < 0 || index >= sqlText.length) return "";
  const before = sqlText.slice(0, index).match(/[A-Za-z_][A-Za-z0-9_]*$/)?.[0] || "";
  const after = sqlText.slice(index).match(/^[A-Za-z_][A-Za-z0-9_]*/)?.[0] || "";
  return `${before}${after}`;
}

function formatSqlPosition(sqlText: string, position: string | number | undefined) {
  const index = Number(position) - 1;
  if (!Number.isFinite(index) || index < 0) return "";

  const lines = sqlText.slice(0, index).split(/\r?\n/);
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;
  return `位置在第 ${line} 行第 ${column} 個字附近。`;
}

function formatSqlError(error: unknown, sqlText: string) {
  const message = getErrorMessage(error);
  const code = getErrorField(error, "code");
  const hint = getErrorField(error, "hint");
  const position = getErrorField(error, "position");
  const quotedName = getQuotedName(message);
  const tokenAtPosition = getTokenAtPosition(sqlText, position);
  const positionText = formatSqlPosition(sqlText, position);
  const originalText = `原始訊息：${message}`;

  if (message === "請先輸入 SQL。") {
    return "請先輸入 SQL，再按「執行」或「送出驗收」。";
  }

  if (/unterminated quoted string/i.test(message)) {
    return `字串少了結尾單引號。像 Taipei 這種文字要寫成 'Taipei'，請檢查單引號是不是一前一後成對。${positionText} ${originalText}`;
  }

  if (code === "42703" || /column ".+" does not exist/i.test(message)) {
    const missingName = tokenAtPosition || quotedName;
    const likelyMissingQuotes =
      missingName && sqlText.match(new RegExp(`=\\s*${missingName}\\b`, "i")) && !commonColumnNames.includes(missingName.toLowerCase());

    if (likelyMissingQuotes) {
      return `PostgreSQL 把 ${missingName} 當成欄位名稱了。如果你要比對文字，請加單引號，例如 city = 'Taipei'。${positionText} ${originalText}`;
    }

    const hintedColumn = typeof hint === "string" ? getQuotedName(hint)?.replace(/^[^.]+\./, "") : "";
    const hintText = hintedColumn ? ` PostgreSQL 猜你可能想寫 ${hintedColumn}。` : "";
    return `找不到欄位 ${quotedName ? `"${quotedName}"` : "名稱"}。請檢查 SELECT、WHERE 或 ORDER BY 裡的欄位拼字；常用欄位包含 name, city, credits, credit_amount, price, order_no, status, total_amount, coach_id, member_id, course_id。${positionText}${hintText} ${originalText}`;
  }

  if (code === "42P01" || /relation ".+" does not exist/i.test(message)) {
    return `找不到資料表 ${quotedName ? `"${quotedName}"` : "名稱"}。目前練習常用 members、credit_packages、shop_orders、coaches、courses、course_bookings，請檢查 FROM 後面的表名。${positionText} ${originalText}`;
  }

  if (code === "22P02" || /invalid input syntax/i.test(message)) {
    return `資料型態不對。數字欄位像 credits 要填數字，不要加文字；日期要像 '2026-07-10' 這樣用單引號包起來。${positionText} ${originalText}`;
  }

  if (code === "23502" || /null value/i.test(message)) {
    return `有必填欄位沒有填到。新增資料時，欄位清單和 VALUES 要一一對齊，文字、日期和必要欄位都要填。${positionText} ${originalText}`;
  }

  if (code === "23514" || /violates check constraint/i.test(message)) {
    return `資料不符合欄位限制。常見限制像 level 只能是 'Basic'、'VIP'、'Suspended'；訂單 status 只能是 pending、paid、packed、shipped、cancelled、refunded；報名 status 只能是 confirmed、cancelled、waitlist；金額和堂數不能小於 0，課程容量必須大於 0。${positionText} ${originalText}`;
  }

  if (code === "23505" || /duplicate key value/i.test(message)) {
    const detail = getErrorField(error, "detail");
    return `資料重複了，資料庫不允許建立第二筆一樣的唯一資料。請檢查 name 或 order_no 這類唯一欄位是不是已經存在。${detail ? `細節：${detail}。` : ""} ${originalText}`;
  }

  if (code === "23503" || /foreign key constraint/i.test(message)) {
    return `外鍵資料對不起來。這通常代表你填的 member_id、coach_id 或 course_id 在對應資料表不存在。先回頭查 members、coaches 或 courses 有沒有這個 id。${positionText} ${originalText}`;
  }

  if (code === "42804" || /datatype mismatch/i.test(message)) {
    return `欄位型態不一致。文字要用單引號，數字不要加引號，日期請用像 '2026-07-10' 的格式。${positionText} ${originalText}`;
  }

  if (code === "42601" || /syntax error/i.test(message)) {
    return `SQL 語法卡住了，通常是關鍵字拼錯、順序放錯，或少了逗號/分號/引號。先檢查 SELECT、FROM、WHERE、ORDER BY、LIMIT 的拼字和順序。${positionText} ${originalText}`;
  }

  return `PostgreSQL 回報錯誤。${positionText} ${originalText}`;
}

async function resetDatabase() {
  if (!database.value) return;
  await database.value.exec(schemaSql);
}

async function runSql() {
  if (!database.value || isBusy.value) return;
  isBusy.value = true;
  feedback.value = null;
  result.value = null;

  try {
    const sqlText = sql.value.trim();
    if (!sqlText) throw new Error("請先輸入 SQL。");

    const exercise = activeExercise.value;
    const featureSql = getFeatureSql(sqlText);
    if (exercise.type === "query" && !/^(SELECT|WITH|EXPLAIN)\b/i.test(featureSql.trim())) {
      feedback.value = {
        type: "fail",
        title: "這題只允許查詢",
        body: "這是查詢任務，按「執行」時只接受 SELECT、WITH 或 EXPLAIN。要練 INSERT、UPDATE、DELETE 時請切到對應任務。"
      };
      return;
    }

    if (exercise.type === "query" && hasUnsafeWriteKeyword(sqlText)) {
      feedback.value = {
        type: "fail",
        title: "這題只能安全查詢",
        body: "查詢任務的「執行」不接受 INSERT、UPDATE、DELETE、DROP 等會改資料的語法。請改用 SELECT 查詢資料。"
      };
      return;
    }

    if (exercise.type === "mutation") {
      const featureProblems = checkSqlFeatures(sqlText, exercise);
      if (featureProblems.length > 0) {
        feedback.value = {
          type: "fail",
          title: "這題還不能安全執行",
          body: `先補齊這題的安全條件，再執行 SQL：${featureProblems.join(" ")}`
        };
        return;
      }
    }

    await resetDatabase();

    if (/^(SELECT|WITH|EXPLAIN)\b/i.test(sqlText)) {
      const queryResult = await database.value.query(sqlText);
      const rows = queryResult.rows as SqlRow[];
      result.value = { rows, message: `已從本題初始資料執行查詢，共 ${rows.length} 筆。` };
    } else {
      await database.value.exec(sqlText);
      result.value = { rows: [], message: "已從本題初始資料執行 SQL。送出驗收時會用乾淨資料檢查整個資料庫狀態。" };
    }
  } catch (error) {
    feedback.value = {
      type: "fail",
      title: "SQL 執行失敗",
      body: formatSqlError(error, sql.value.trim())
    };
  } finally {
    isBusy.value = false;
  }
}

async function submitSql() {
  if (!database.value || isBusy.value) return;
  isBusy.value = true;
  feedback.value = null;
  result.value = null;

  const exercise = activeExercise.value;

  try {
    const sqlText = sql.value.trim();
    if (!sqlText) throw new Error("請先輸入 SQL。");

    const featureProblems = checkSqlFeatures(sqlText, exercise);
    if (featureProblems.length > 0) {
      feedback.value = {
        type: "fail",
        title: "這題的練習目標還沒達成",
        body: `方向可以，再補上這題要練的語法：${featureProblems.join(" ")}`
      };
      return;
    }

    if (exercise.type === "query") {
      if (!exercise.referenceSql) throw new Error("這題缺少標準答案 SQL。");
      await resetDatabase();
      const actualResult = await database.value.query(sqlText);
      const actualRows = actualResult.rows as SqlRow[];
      await resetDatabase();
      const expectedResult = await database.value.query(exercise.referenceSql);
      const expectedRows = expectedResult.rows as SqlRow[];
      const comparison = compareRows(actualRows, expectedRows, exercise.compare);
      result.value = { rows: actualRows, message: `你的查詢結果，共 ${actualRows.length} 筆。` };

      if (!comparison.pass) {
        feedback.value = {
          type: "fail",
          title: "這題還沒通過",
          body: `你的 SQL 已經跑起來了，我們再對一下題目條件。${comparison.message}`
        };
        return;
      }
    } else {
      await resetDatabase();
      await database.value.exec(sqlText);

      const failedChecks: string[] = [];
      for (const check of exercise.checks || []) {
        const checkResult = await database.value.query(check.sql);
        const comparison = compareRows(checkResult.rows as SqlRow[], check.expectRows, {
          order: true,
          columns: true
        });
        if (!comparison.pass) {
          failedChecks.push(`${check.label}：${comparison.message}`);
        }
      }

      const actualSnapshot = await getDatabaseSnapshot();
      await resetDatabase();
      await database.value.exec(exercise.hints.answer);
      const expectedSnapshot = await getDatabaseSnapshot();
      const snapshotComparison = compareDatabaseSnapshots(actualSnapshot, expectedSnapshot);
      if (!snapshotComparison.pass) {
        failedChecks.push(snapshotComparison.message);
      }

      if (failedChecks.length > 0) {
        result.value = { rows: [], message: "SQL 已執行，但資料狀態還沒通過驗收。" };
        feedback.value = {
          type: "fail",
          title: "資料庫狀態不符合預期",
          body: `SQL 有執行成功，差在資料狀態還沒對上。${failedChecks.join(" ")}`
        };
        return;
      }

      result.value = { rows: [], message: "資料庫狀態驗收通過。" };
    }

    const nextCompleted = new Set(completed.value);
    nextCompleted.add(exercise.id);
    completed.value = nextCompleted;
    saveProgress();
    feedback.value = {
      type: "pass",
      title: "通過，這題已打勾",
      body: exercise.successMessage
    };
  } catch (error) {
    feedback.value = {
      type: "fail",
      title: "驗收失敗",
      body: formatSqlError(error, sql.value.trim())
    };
  } finally {
    isBusy.value = false;
  }
}

async function resetCurrentExercise() {
  if (isBusy.value) return;
  isBusy.value = true;
  feedback.value = null;
  result.value = null;
  sql.value = activeExercise.value.starterSql;
  saveExerciseDraft(activeExercise.value.id, activeExercise.value.starterSql);

  try {
    await resetDatabase();
    feedback.value = {
      type: "pass",
      title: "本題已重置",
      body: "資料和 SQL 起始語法都已還原，可以放心重練一次。"
    };
  } catch (error) {
    feedback.value = {
      type: "fail",
      title: "重置失敗",
      body: `先別急，重置時遇到這個訊息：${error instanceof Error ? error.message : String(error)}`
    };
  } finally {
    isBusy.value = false;
  }
}

function insertTab(event: KeyboardEvent) {
  const editor = event.target as HTMLTextAreaElement;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  sql.value = `${editor.value.slice(0, start)}  ${editor.value.slice(end)}`;
  nextTick(() => {
    if (!sqlEditor.value) return;
    sqlEditor.value.selectionStart = sqlEditor.value.selectionEnd = start + 2;
  });
}

function focusSearch(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.value?.focus();
  }
}

async function initDatabase() {
  try {
    database.value = new PGlite();
    await resetDatabase();
    isReady.value = true;
  } catch (error) {
    feedback.value = {
      type: "fail",
      title: "PostgreSQL 沙箱初始化失敗",
      body: error instanceof Error ? error.message : String(error)
    };
  }
}

onMounted(() => {
  window.addEventListener("keydown", focusSearch);
  void initDatabase();
});

onUnmounted(() => {
  window.removeEventListener("keydown", focusSearch);
});
</script>
