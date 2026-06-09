# PostgreSQL Gym

Vue 3 + Vite + TypeScript 的文件式 PostgreSQL 練習手冊。用 PGlite 在瀏覽器裡跑真正的 PostgreSQL，提供教學章節、SQL 編輯器、結果驗收與進度打勾，海姐（coach-hex）陪跑。

12 個章節由淺到深：認識資料表 → SELECT / WHERE / ORDER BY → 寫入 → JOIN → GROUP BY → 子查詢，並穿插情境式的「事故調查」關。進階關（06–11）的資料表對齊 Node.js 課程最終作業（健身房預約 SaaS），學生練的資料形狀＝之後要寫的專案。

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
