# PostgreSQL Gym MVP

Vue 3 + Vite + TypeScript 的文件式 PostgreSQL 練習手冊原型。第一版用 PGlite 在瀏覽器中執行 PostgreSQL，提供教學章節、SQL 編輯器、驗收與進度打勾。

目前先做「新手模式」：練習題貼著既有影音課程章節走，先用 `members` 單表建立手感，再逐步進到 WHERE、ORDER BY、INSERT、UPDATE。JOIN、GROUP BY、子查詢與事故情境先保留為後續章節。

設計動機與當初的取捨見 [WHY.md](WHY.md)。

## Run

```bash
npm install
npm run dev
```

開啟終端機顯示的 Vite URL。

## Structure

- `src/App.vue`：主要練習室畫面與互動流程。
- `src/courseData.ts`：資料庫 seed、題目、影音課程對照。
- `src/types.ts`：題目、驗收、回饋與 SQL row 型別。
- `src/main.ts`：Vue app 入口。
