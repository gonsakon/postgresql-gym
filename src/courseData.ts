import type { Lesson, VideoModule } from "./types";

export const schemaSql = `
DROP TABLE IF EXISTS course_bookings;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS coaches;
DROP TABLE IF EXISTS credit_packages;
DROP TABLE IF EXISTS shop_orders;
DROP TABLE IF EXISTS members;

CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Basic', 'VIP', 'Suspended')),
  city TEXT NOT NULL,
  credits INTEGER NOT NULL CHECK (credits >= 0),
  joined_at DATE NOT NULL
);

CREATE TABLE credit_packages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  credit_amount INTEGER NOT NULL CHECK (credit_amount > 0),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE shop_orders (
  id SERIAL PRIMARY KEY,
  order_no TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'packed', 'shipped', 'cancelled', 'refunded')),
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  paid_at TIMESTAMP,
  shipped_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL,
  note TEXT NOT NULL DEFAULT ''
);

CREATE TABLE coaches (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  specialty TEXT NOT NULL,
  hourly_rate INTEGER NOT NULL
);

CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER NOT NULL REFERENCES coaches(id),
  title TEXT NOT NULL,
  branch TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  price INTEGER NOT NULL CHECK (price >= 0),
  starts_at TIMESTAMP NOT NULL
);

CREATE TABLE course_bookings (
  id SERIAL PRIMARY KEY,
  member_id INTEGER NOT NULL REFERENCES members(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled', 'waitlist')),
  booked_at TIMESTAMP NOT NULL,
  paid_amount INTEGER NOT NULL DEFAULT 0
);

INSERT INTO members (name, email, level, city, credits, joined_at) VALUES
  ('Leo', 'leo@example.com', 'VIP', 'Taipei', 180, '2026-02-10'),
  ('Mina', 'mina@example.com', 'Basic', 'Taichung', 60, '2026-03-02'),
  ('Kai', 'kai@example.com', 'VIP', 'Taipei', 240, '2026-01-18'),
  ('Nora', 'nora@example.com', 'Suspended', 'Kaohsiung', 20, '2025-12-21'),
  ('Ivy', 'ivy@example.com', 'Basic', 'Taipei', 95, '2026-04-05'),
  ('Sean', 'sean@example.com', 'VIP', 'Tainan', 130, '2026-02-28'),
  ('Una', 'una@example.com', 'Basic', 'Taichung', 110, '2026-05-01'),
  ('Tina', 'tina@example.com', 'Basic', 'New Taipei', 40, '2026-05-08');

INSERT INTO credit_packages (name, credit_amount, price, created_at) VALUES
  ('體驗 5 堂包', 5, 1200.00, '2026-06-01 09:00:00'),
  ('入門 10 堂包', 10, 2200.00, '2026-06-02 09:00:00'),
  ('進階 20 堂包', 20, 4000.00, '2026-06-03 09:00:00'),
  ('VIP 50 堂包', 50, 9000.00, '2026-06-04 09:00:00'),
  ('企業 100 堂包', 100, 16000.00, '2026-06-05 09:00:00');

INSERT INTO shop_orders (order_no, customer_name, email, city, status, total_amount, paid_at, shipped_at, created_at, note) VALUES
  ('NW-1001', 'Alice Chen', 'alice@example.com', 'Taipei', 'paid', 1280.00, '2026-08-01 10:20:00', NULL, '2026-08-01 10:05:00', '今早來訊催出貨，揀貨已完成'),
  ('NW-1002', 'Bob Lin', 'bob@example.com', 'Taichung', 'shipped', 2500.00, '2026-08-01 11:40:00', '2026-08-02 09:10:00', '2026-08-01 11:30:00', '已出貨・宅配運送中'),
  ('NW-1003', 'Cara Wu', 'cara@example.com', 'Kaohsiung', 'pending', 890.00, NULL, NULL, '2026-08-02 09:15:00', '下單後尚未付款'),
  ('NW-1004', 'Daniel Ho', 'daniel@example.com', 'Taipei', 'paid', 4200.00, '2026-08-02 12:00:00', NULL, '2026-08-02 11:46:00', '高單價器材・已付款待出'),
  ('NW-1005', 'Emma Tsai', 'emma@example.com', 'Tainan', 'cancelled', 650.00, NULL, NULL, '2026-08-02 14:05:00', '客戶改單後自行取消'),
  ('NW-1006', 'Finn Kao', 'finn@example.com', 'Taipei', 'packed', 3100.00, '2026-08-03 09:30:00', NULL, '2026-08-03 09:12:00', '已打包，等司機簽收'),
  ('NW-1007', 'Grace Liu', 'grace@example.com', 'Taichung', 'paid', 760.00, '2026-08-03 16:45:00', NULL, '2026-08-03 16:30:00', '常規補給品訂單'),
  ('NW-1008', 'Hank Wang', 'hank@example.com', 'Hsinchu', 'refunded', 1200.00, '2026-08-04 10:00:00', NULL, '2026-08-04 09:42:00', '尺寸不合，已退款'),
  ('NW-1009', 'Ivy Yu', 'ivy.order@example.com', 'Taipei', 'shipped', 5600.00, '2026-08-04 13:25:00', '2026-08-05 08:50:00', '2026-08-04 13:10:00', '大額・主管已審・已出貨'),
  ('NW-1010', 'Jack Pai', 'jack@example.com', 'Tainan', 'paid', 9999.00, '2026-08-05 20:20:00', NULL, '2026-08-05 20:05:00', '深夜 20:20 下單・高價器材・大額待主管審核'),
  ('NW-1011', 'Kelly Huang', 'kelly@example.com', 'Kaohsiung', 'pending', 430.00, NULL, NULL, '2026-08-06 08:30:00', '深夜衝動下單・遲遲未付款'),
  ('NW-1012', 'Leo Sun', 'leo.order@example.com', 'Taipei', 'packed', 1800.00, '2026-08-06 09:20:00', NULL, '2026-08-06 09:05:00', '已打包，排隊等出貨');

INSERT INTO coaches (name, email, specialty, hourly_rate) VALUES
  ('Ada', 'ada@gym.test', 'Yoga', 900),
  ('Ben', 'ben@gym.test', 'Weight Training', 1200),
  ('Chloe', 'chloe@gym.test', 'Pilates', 1100),
  ('Duke', 'duke@gym.test', 'Boxing', 1000),
  ('Ella', 'ella@gym.test', 'Dance', 950);

INSERT INTO courses (coach_id, title, branch, capacity, price, starts_at) VALUES
  (1, 'Morning Yoga Flow', 'Taipei', 12, 700, '2026-07-12 08:30:00'),
  (2, 'Strength Basics', 'Taipei', 10, 900, '2026-07-12 19:00:00'),
  (3, 'Pilates Core Lab', 'Taichung', 8, 850, '2026-07-13 18:30:00'),
  (4, 'Boxing Burn', 'Kaohsiung', 14, 750, '2026-07-14 20:00:00'),
  (2, 'Deadlift Clinic', 'Taipei', 6, 1200, '2026-07-15 19:30:00'),
  (1, 'Weekend Mobility', 'Tainan', 10, 650, '2026-07-18 10:00:00');

INSERT INTO course_bookings (member_id, course_id, status, booked_at, paid_amount) VALUES
  (1, 1, 'confirmed', '2026-07-01 09:10:00', 700),
  (1, 1, 'confirmed', '2026-07-01 09:12:00', 700),
  (2, 1, 'confirmed', '2026-07-01 09:20:00', 700),
  (3, 2, 'confirmed', '2026-07-02 12:00:00', 900),
  (5, 2, 'waitlist', '2026-07-02 12:04:00', 0),
  (6, 3, 'confirmed', '2026-07-02 13:30:00', 850),
  (7, 3, 'confirmed', '2026-07-02 14:10:00', 850),
  (4, 4, 'cancelled', '2026-07-03 08:20:00', 0),
  (1, 5, 'confirmed', '2026-07-03 09:00:00', 1200),
  (3, 5, 'confirmed', '2026-07-03 09:11:00', 1200);
`;

export const lessons: Lesson[] = [
  {
    id: "table-warmup",
    section: "資料庫簡介",
    title: "00 先認識一張資料表",
    label: "W5-00",
    lead:
      "第一步先不要急著背語法。我們只看一張 members 表，知道資料表長什麼樣子就好。",
    mission:
      "LiveFit 剛把會員資料交給海姐。你先當資料整理小幫手，確認 members 這張會員表裡到底有哪些資料。",
    coachLine:
      "別急，這一段先不用背語法。你只要看懂資料表是一列一列、一欄一欄組起來的，就已經開始進入狀況了。",
    teaching:
      "資料表可以先想成 Excel 工作表。每一列是一筆會員資料，每一欄是會員的某個屬性，例如 name、level、city、credits。",
    syntax: `SELECT *
FROM members;`,
    exercises: [
      {
        id: "w5-00-01",
        title: "照著看整張會員表",
        description: "海姐想先看 LiveFit 會員表全貌。照著執行一次，把 members 表全部看出來。",
        tags: ["跟打題", "SELECT"],
        type: "query",
        starterSql: `SELECT *
FROM members;`,
        hints: {
          direction: "這題先不用改 SQL。確認 SELECT 後面是 *，FROM 後面是 members。",
          skeleton: `SELECT *
FROM members;`,
          answer: `SELECT *
FROM members;`
        },
        successMessage: "很好，你正確執行了 SELECT *，把 members 會員表的所有欄位和資料列都叫出來了。",
        referenceSql: `SELECT *
FROM members;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
      },
      {
        id: "w5-00-02",
        title: "把 * 改成姓名欄位",
        description: "海姐只想快速掃過會員名字。只回傳 name 欄位。",
        tags: ["改欄位", "單欄位"],
        type: "query",
        starterSql: `SELECT *
FROM members;`,
        hints: {
          direction: "把 SELECT 後面的 * 換成欄位名稱 name，FROM members 保持不變。",
          skeleton: `SELECT 欄位名稱
FROM members;`,
          answer: `SELECT name
FROM members;`
        },
        successMessage: "漂亮，你把 SELECT * 收斂成 SELECT name，只留下海姐現在需要看的會員姓名。",
        referenceSql: `SELECT name
FROM members;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
      },
      {
        id: "w5-00-03",
        title: "再多看一個城市欄位",
        description: "海姐要知道會員名字和所在城市。回傳 name、city 兩個欄位。",
        tags: ["改欄位", "多欄位"],
        type: "query",
        starterSql: `SELECT name
FROM members;`,
        hints: {
          direction: "SELECT 可以一次列多個欄位。欄位之間用逗號隔開，順序要先 name 再 city。",
          skeleton: `SELECT name, 第二個欄位
FROM members;`,
          answer: `SELECT name, city
FROM members;`
        },
        successMessage: "很好，你用逗號一次選出 name 和 city，讓會員名單開始變成可以整理的資料。",
        referenceSql: `SELECT name, city
FROM members;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
      },
      {
        id: "w5-00-04",
        title: "補上會員編號",
        description: "海姐要把會員名字對回系統編號。回傳 id、name 兩個欄位。",
        tags: ["改欄位", "多欄位"],
        type: "query",
        starterSql: `SELECT name
FROM members;`,
        hints: {
          direction: "這題是在 name 前面補上 id。SELECT 後面的欄位順序要先 id 再 name。",
          skeleton: `SELECT 第一個欄位, name
FROM members;`,
          answer: `SELECT id, name
FROM members;`
        },
        successMessage: "很好，你把 id 和 name 放在一起，海姐可以把人名對回資料庫裡的會員編號。",
        referenceSql: `SELECT id, name
FROM members;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
      },
      {
        id: "w5-00-05",
        title: "只看會員所在城市",
        description: "海姐想先觀察會員分布在哪些城市。只回傳 city 欄位。",
        tags: ["改欄位", "單欄位"],
        type: "query",
        starterSql: `SELECT name
FROM members;`,
        hints: {
          direction: "把 SELECT 後面的 name 改成 city，FROM members 保持不變。",
          skeleton: `SELECT 欄位名稱
FROM members;`,
          answer: `SELECT city
FROM members;`
        },
        successMessage: "漂亮，你把查詢收斂到 city 欄位，這就是只拿任務需要資料的第一步。",
        referenceSql: `SELECT city
FROM members;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
      }
    ]
  },
  {
    id: "select-columns",
    section: "SELECT 選欄位",
    title: "01 SELECT：選你真的需要的欄位",
    label: "W5-01",
    lead:
      "後端 API 不一定要把整張表都丟出去。SELECT 的第一個任務，是決定這次回傳哪些欄位。",
    mission:
      "LiveFit 櫃台開始丟不同需求給海姐：有時要基本資料、有時要聯絡清單、有時要點數。你要練會只拿這次任務需要的欄位。",
    coachLine:
      "我們先練一個很穩的動作：只拿需要的欄位。欄位名稱拼對、順序對，SQL 的手感就會慢慢建立起來。",
    teaching:
      "把 `*` 換成欄位名稱，就能讓資料更乾淨。新手先練一件事：欄位名稱要拼對，欄位順序要跟題目一致。",
    syntax: `SELECT id, name, level
FROM members;`,
    exercises: [
      {
        id: "w5-01-01",
        title: "補上會員等級",
        description: "海姐要做會員等級檢查。回傳 id、name、level 三個欄位。",
        tags: ["補欄位", "欄位順序"],
        type: "query",
        starterSql: `SELECT id, name
FROM members;`,
        hints: {
          direction: "現在已經有 id 和 name。請在 SELECT 清單後面補上 level，欄位順序要照題目。",
          skeleton: `SELECT id, name, 第三個欄位
FROM members;`,
          answer: `SELECT id, name, level
FROM members;`
        },
        successMessage: "做得穩，你正確補上 level，讓海姐可以同時看到會員編號、姓名和等級。",
        referenceSql: `SELECT id, name, level
FROM members;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
      },
      {
        id: "w5-01-02",
        title: "會員聯絡資料",
        description: "櫃台要寄通知信。回傳 name、email 兩個欄位。",
        tags: ["補欄位", "聯絡清單"],
        type: "query",
        starterSql: `SELECT name
FROM members;`,
        hints: {
          direction: "聯絡清單需要姓名和 email。把 email 加在 name 後面，兩個欄位用逗號分開。",
          skeleton: `SELECT name, 聯絡欄位
FROM members;`,
          answer: `SELECT name, email
FROM members;`
        },
        successMessage: "很好，你正確選出 name 和 email，LiveFit 的通知清單就不會多帶不需要的欄位。",
        referenceSql: `SELECT name, email
FROM members;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
      },
      {
        id: "w5-01-03",
        title: "會員點數資料",
        description: "海姐要先看每個會員剩多少點數。回傳 name、credits。",
        tags: ["補欄位", "數字欄位"],
        type: "query",
        starterSql: `SELECT name
FROM members;`,
        hints: {
          direction: "credits 是數字欄位。這題只要把它加到 SELECT 清單，不需要寫條件。",
          skeleton: `SELECT name, 點數欄位
FROM members;`,
          answer: `SELECT name, credits
FROM members;`
        },
        successMessage: "很棒，你把 credits 選出來了，海姐現在可以直接看每位會員的剩餘點數。",
        referenceSql: `SELECT name, credits
FROM members;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
      },
      {
        id: "w5-01-04",
        title: "小整合：會員巡檢卡",
        description: "海姐要一張巡檢卡。回傳 id、name、level、city、credits 五個欄位。",
        tags: ["小整合", "欄位順序"],
        type: "query",
        starterSql: `SELECT name, city
FROM members;`,
        hints: {
          direction: "這題是欄位整合。從現有的 name、city 擴充成題目指定的五個欄位，順序要完全一致。",
          skeleton: `SELECT id, name, level, city, credits
FROM members;`,
          answer: `SELECT id, name, level, city, credits
FROM members;`
        },
        successMessage: "很穩，你把五個欄位照順序整理好，海姐拿到的是一張乾淨的會員巡檢卡。",
        referenceSql: `SELECT id, name, level, city, credits
FROM members;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
      },
      {
        id: "w5-01-05",
        title: "會員加入日期清單",
        description: "海姐想知道會員什麼時候加入。回傳 name、joined_at 兩個欄位。",
        tags: ["補欄位", "日期欄位"],
        type: "query",
        starterSql: `SELECT name
FROM members;`,
        hints: {
          direction: "joined_at 是加入日期欄位。把它加在 name 後面，兩個欄位用逗號隔開。",
          skeleton: `SELECT name, 加入日期欄位
FROM members;`,
          answer: `SELECT name, joined_at
FROM members;`
        },
        successMessage: "很好，你把 joined_at 選出來了，現在可以看每位會員的加入日期。",
        referenceSql: `SELECT name, joined_at
FROM members;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
      },
      {
        id: "w5-01-06",
        title: "櫃台快速名冊",
        description: "櫃台要一份可聯絡會員名冊。回傳 id、name、email、city 四個欄位。",
        tags: ["小整合", "欄位順序"],
        type: "query",
        starterSql: `SELECT name, email
FROM members;`,
        hints: {
          direction: "保留 name、email，前面補 id，後面補 city。欄位順序要照任務文字。",
          skeleton: `SELECT id, name, email, city
FROM members;`,
          answer: `SELECT id, name, email, city
FROM members;`
        },
        successMessage: "做得穩，你整理出櫃台真正需要的四個欄位，沒有把整張表都丟出去。",
        referenceSql: `SELECT id, name, email, city
FROM members;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
      },
      {
        id: "w5-01-07",
        title: "點數盤點表",
        description: "海姐要準備點數盤點。回傳 id、name、credits、joined_at 四個欄位。",
        tags: ["小整合", "欄位順序"],
        type: "query",
        starterSql: `SELECT id, name
FROM members;`,
        hints: {
          direction: "先保留 id、name，再依序補上 credits 和 joined_at。",
          skeleton: `SELECT id, name, credits, joined_at
FROM members;`,
          answer: `SELECT id, name, credits, joined_at
FROM members;`
        },
        successMessage: "很好，你把點數和加入日期一起整理出來，這張表已經像後端 API 會回傳的資料了。",
        referenceSql: `SELECT id, name, credits, joined_at
FROM members;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
      }
    ]
  },
  {
    id: "where-one-condition",
    section: "WHERE 篩選條件",
    title: "02 WHERE：一次只加一個條件",
    label: "W5-02",
    lead:
      "WHERE 是查詢條件。先不要一次寫很複雜，我們只練一個條件，讓學生知道條件放在哪裡。",
    mission:
      "LiveFit 要做會員分眾。海姐不想每次都看整張表，你要幫她用 WHERE 挑出這次真正要處理的會員。",
    coachLine:
      "WHERE 很像請資料庫幫你挑資料。先一次挑一種條件就好，不用急著把 AND、OR 全部塞進來。",
    teaching:
      "WHERE 放在 FROM 後面。字串要用單引號，例如 `level = 'VIP'`。數字不用單引號，例如 `credits >= 100`。",
    syntax: `SELECT id, name, level
FROM members
WHERE level = 'VIP';`,
    exercises: [
      {
        id: "w5-02-01",
        title: "把條件改成 VIP 會員",
        description: "海姐要先看 VIP 名單。回傳 id、name、level，只顯示 level 是 VIP 的會員。",
        tags: ["跟打條件", "字串條件"],
        type: "query",
        starterSql: `SELECT id, name, level
FROM members
WHERE level = 'Basic';`,
        hints: {
          direction: "起始 SQL 已經有 WHERE。請把條件值從 Basic 改成任務要求的會員等級。",
          skeleton: `SELECT id, name, level
FROM members
WHERE level = '會員等級';`,
          answer: `SELECT id, name, level
FROM members
WHERE level = 'VIP';`
        },
        successMessage: "很好，你用 WHERE level = 'VIP' 正確篩出了 VIP 會員，沒有把其他等級混進來。",
        referenceSql: `SELECT id, name, level
FROM members
WHERE level = 'VIP';`,
        compare: { order: false, columns: true },
        requires: ["WHERE"]
      },
      {
        id: "w5-02-02",
        title: "把條件改成台北會員",
        description: "LiveFit 台北館要發活動通知。回傳 id、name、city，只顯示 city 是 Taipei 的會員。",
        tags: ["改條件", "字串條件"],
        type: "query",
        starterSql: `SELECT id, name, city
FROM members
WHERE city = 'Taichung';`,
        hints: {
          direction: "欄位已經對了。請把 WHERE 後面的城市條件從 Taichung 改成 Taipei。",
          skeleton: `SELECT id, name, city
FROM members
WHERE city = '城市名稱';`,
          answer: `SELECT id, name, city
FROM members
WHERE city = 'Taipei';`
        },
        successMessage: "做得好，你把 WHERE city 條件改成 Taipei，正確抓出台北館需要聯絡的會員。",
        referenceSql: `SELECT id, name, city
FROM members
WHERE city = 'Taipei';`,
        compare: { order: false, columns: true },
        requires: ["WHERE"]
      },
      {
        id: "w5-02-03",
        title: "找出點數 100 以上會員",
        description: "海姐要挑出點數足夠參加活動的會員。回傳 id、name、credits，只顯示 credits 大於等於 100 的會員。",
        tags: ["改條件", "數字條件"],
        type: "query",
        starterSql: `SELECT id, name, credits
FROM members
WHERE credits >= 0;`,
        hints: {
          direction: "數字條件不用加單引號。把門檻從 0 改成 100，保留 >=。",
          skeleton: `SELECT id, name, credits
FROM members
WHERE credits >= 數字門檻;`,
          answer: `SELECT id, name, credits
FROM members
WHERE credits >= 100;`
        },
        successMessage: "漂亮，你用 credits >= 100 正確篩出點數達標會員，也練到了數字條件不用加引號。",
        referenceSql: `SELECT id, name, credits
FROM members
WHERE credits >= 100;`,
        compare: { order: false, columns: true },
        requires: ["WHERE"]
      },
      {
        id: "w5-02-04",
        title: "小整合：停權聯絡名單",
        description: "海姐要人工確認停權會員。回傳 id、name、email、level，只顯示 level 是 Suspended 的會員。",
        tags: ["小整合", "狀態查詢"],
        type: "query",
        starterSql: `SELECT id, name
FROM members
WHERE level = 'VIP';`,
        hints: {
          direction: "這題要同時改欄位和條件：補上 email、level，並把 VIP 改成 Suspended。",
          skeleton: `SELECT id, name, email, level
FROM members
WHERE level = '會員狀態';`,
          answer: `SELECT id, name, email, level
FROM members
WHERE level = 'Suspended';`
        },
        successMessage: "很好，你同時整理了欄位和 WHERE 狀態條件，海姐拿到的是正確的停權會員聯絡名單。",
        referenceSql: `SELECT id, name, email, level
FROM members
WHERE level = 'Suspended';`,
        compare: { order: false, columns: true },
        requires: ["WHERE"]
      },
      {
        id: "w5-02-05",
        title: "Basic 會員名單",
        description: "櫃台要關心一般會員。回傳 id、name、level，只顯示 level 是 Basic 的會員。",
        tags: ["改條件", "字串條件"],
        type: "query",
        starterSql: `SELECT id, name, level
FROM members
WHERE level = 'VIP';`,
        hints: {
          direction: "欄位已經對了。請把 WHERE 後面的會員等級從 VIP 改成 Basic。",
          skeleton: `SELECT id, name, level
FROM members
WHERE level = '會員等級';`,
          answer: `SELECT id, name, level
FROM members
WHERE level = 'Basic';`
        },
        successMessage: "很好，你把條件切到 Basic，這次名單只留下任務指定的一般會員。",
        referenceSql: `SELECT id, name, level
FROM members
WHERE level = 'Basic';`,
        compare: { order: false, columns: true },
        requires: ["WHERE"]
      },
      {
        id: "w5-02-06",
        title: "台中會員名單",
        description: "LiveFit 台中館要發通知。回傳 name、city，只顯示 city 是 Taichung 的會員。",
        tags: ["改條件", "字串條件"],
        type: "query",
        starterSql: `SELECT name, city
FROM members
WHERE city = 'Taipei';`,
        hints: {
          direction: "把 WHERE 後面的城市從 Taipei 改成 Taichung。文字條件記得用單引號。",
          skeleton: `SELECT name, city
FROM members
WHERE city = '城市名稱';`,
          answer: `SELECT name, city
FROM members
WHERE city = 'Taichung';`
        },
        successMessage: "漂亮，你正確用 city = 'Taichung' 篩出台中會員。",
        referenceSql: `SELECT name, city
FROM members
WHERE city = 'Taichung';`,
        compare: { order: false, columns: true },
        requires: ["WHERE"]
      },
      {
        id: "w5-02-07",
        title: "點數未滿 100 會員",
        description: "海姐想找出可能需要提醒的會員。回傳 id、name、credits，只顯示 credits 小於 100 的會員。",
        tags: ["改條件", "數字條件"],
        type: "query",
        starterSql: `SELECT id, name, credits
FROM members
WHERE credits >= 100;`,
        hints: {
          direction: "這題要把比較方向反過來。小於 100 要使用 < 100，數字不用單引號。",
          skeleton: `SELECT id, name, credits
FROM members
WHERE credits < 數字門檻;`,
          answer: `SELECT id, name, credits
FROM members
WHERE credits < 100;`
        },
        successMessage: "很好，你把條件改成 credits < 100，正確找出點數不足 100 的會員。",
        referenceSql: `SELECT id, name, credits
FROM members
WHERE credits < 100;`,
        compare: { order: false, columns: true },
        requires: ["WHERE"]
      },
      {
        id: "w5-02-08",
        title: "查指定堂數方案",
        description: "Node.js 範例 API 要能查堂數方案。回傳 name、credit_amount、price，只顯示 credit_amount 是 20 的方案。",
        tags: ["Node.js 對照", "數字條件"],
        type: "query",
        starterSql: `SELECT name, credit_amount, price
FROM credit_packages
WHERE credit_amount = 10;`,
        hints: {
          direction: "欄位和資料表都已經對了。把 WHERE 後面的堂數從 10 改成 20。",
          skeleton: `SELECT name, credit_amount, price
FROM credit_packages
WHERE credit_amount = 堂數;`,
          answer: `SELECT name, credit_amount, price
FROM credit_packages
WHERE credit_amount = 20;`
        },
        successMessage: "很好，你查到指定堂數方案，這正是後面 GET /api/credit-package 會需要整理的資料。",
        referenceSql: `SELECT name, credit_amount, price
FROM credit_packages
WHERE credit_amount = 20;`,
        compare: { order: false, columns: true },
        requires: ["WHERE"]
      },
      {
        id: "w5-02-09",
        title: "查高價堂數方案",
        description: "海姐要看價格較高的堂數方案。回傳 name、price，只顯示 price 大於等於 9000 的方案。",
        tags: ["Node.js 對照", "數字條件"],
        type: "query",
        starterSql: `SELECT name, price
FROM credit_packages
WHERE price >= 0;`,
        hints: {
          direction: "price 是數字欄位。把門檻從 0 改成 9000。",
          skeleton: `SELECT name, price
FROM credit_packages
WHERE price >= 價格門檻;`,
          answer: `SELECT name, price
FROM credit_packages
WHERE price >= 9000;`
        },
        successMessage: "做得好，你用 price >= 9000 篩出高價堂數方案。",
        referenceSql: `SELECT name, price
FROM credit_packages
WHERE price >= 9000;`,
        compare: { order: false, columns: true },
        requires: ["WHERE"]
      },
      {
        id: "w5-02-10",
        title: "查企業堂數方案",
        description: "後端刪除前要先確認方案存在。回傳 id、name，只顯示 name 是 企業 100 堂包 的方案。",
        tags: ["Node.js 對照", "字串條件"],
        type: "query",
        starterSql: `SELECT id, name
FROM credit_packages
WHERE name = 'VIP 50 堂包';`,
        hints: {
          direction: "把字串條件從 VIP 50 堂包 改成 企業 100 堂包。中文字串也要用單引號包起來。",
          skeleton: `SELECT id, name
FROM credit_packages
WHERE name = '方案名稱';`,
          answer: `SELECT id, name
FROM credit_packages
WHERE name = '企業 100 堂包';`
        },
        successMessage: "很好，你查到指定方案，這會銜接後面 DELETE /api/credit-package/:id 的刪除前確認。",
        referenceSql: `SELECT id, name
FROM credit_packages
WHERE name = '企業 100 堂包';`,
        compare: { order: false, columns: true },
        requires: ["WHERE"]
      }
    ]
  },
  {
    id: "sort-and-limit",
    section: "order by 排序資料",
    title: "03 ORDER BY / LIMIT：排序和取前幾筆",
    label: "W5-03",
    lead:
      "學生會查資料後，下一個常見需求是排序。排行榜、最新資料、方案價格清單，都從 ORDER BY 開始。",
    mission:
      "LiveFit 活動名單和堂數方案都開始有優先順序：誰最新加入、誰點數最高、哪個方案最便宜。這一關正式解鎖排序。",
    coachLine:
      "排序不是在考數學，是在問資料要用什麼順序排給人看。先分清楚 ASC 和 DESC，就會穩很多。",
    teaching:
      "`ORDER BY 欄位 ASC` 是由小到大，`DESC` 是由大到小。LIMIT 可以限制只拿前幾筆。",
    syntax: `SELECT id, name, credits
FROM members
ORDER BY credits DESC
LIMIT 3;`,
    exercises: [
      {
        id: "w5-03-01",
        title: "最新加入的會員排前面",
        description: "海姐要看最近加入的會員。回傳 name、joined_at，加入日期新的排前面。",
        tags: ["ORDER BY", "DESC"],
        type: "query",
        starterSql: `SELECT name, joined_at
FROM members;`,
        hints: {
          direction: "日期越新越大，所以用 ORDER BY joined_at DESC。",
          skeleton: `SELECT name, joined_at
FROM members
ORDER BY joined_at 排序方向;`,
          answer: `SELECT name, joined_at
FROM members
ORDER BY joined_at DESC;`
        },
        successMessage: "做得好，你用 ORDER BY joined_at DESC 把最新加入的會員排在前面了。",
        referenceSql: `SELECT name, joined_at
FROM members
ORDER BY joined_at DESC;`,
        compare: { order: true, columns: true },
        requires: ["ORDER BY"]
      },
      {
        id: "w5-03-02",
        title: "點數排行榜",
        description: "海姐要看點數排行榜。回傳 name、credits，點數高的排前面。",
        tags: ["ORDER BY", "DESC"],
        type: "query",
        starterSql: `SELECT name, credits
FROM members;`,
        hints: {
          direction: "排行榜通常是數字大的在前面。credits 要搭配 DESC。",
          skeleton: `SELECT name, credits
FROM members
ORDER BY credits DESC;`,
          answer: `SELECT name, credits
FROM members
ORDER BY credits DESC;`
        },
        successMessage: "漂亮，你用 ORDER BY credits DESC 做出點數由高到低的會員排行榜。",
        referenceSql: `SELECT name, credits
FROM members
ORDER BY credits DESC;`,
        compare: { order: true, columns: true },
        requires: ["ORDER BY"]
      },
      {
        id: "w5-03-03",
        title: "點數前三名邀請名單",
        description: "LiveFit 只想先邀請點數最高的三位會員。回傳 name、credits，只顯示前三名。",
        tags: ["ORDER BY", "LIMIT"],
        type: "query",
        starterSql: `SELECT name, credits
FROM members;`,
        hints: {
          direction: "先用 ORDER BY credits DESC 排好排行榜，再用 LIMIT 3 只取前三筆。",
          skeleton: `SELECT name, credits
FROM members
ORDER BY credits DESC
LIMIT 筆數;`,
          answer: `SELECT name, credits
FROM members
ORDER BY credits DESC
LIMIT 3;`
        },
        successMessage: "很穩，你先排序再 LIMIT 3，幫海姐抓出點數最高的前三位邀請對象。",
        referenceSql: `SELECT name, credits
FROM members
ORDER BY credits DESC
LIMIT 3;`,
        compare: { order: true, columns: true },
        requires: ["ORDER BY", "LIMIT"]
      },
      {
        id: "w5-03-04",
        title: "點數由低到高",
        description: "海姐要先照顧點數最少的會員。回傳 name、credits，點數少的排前面。",
        tags: ["ORDER BY", "ASC"],
        type: "query",
        starterSql: `SELECT name, credits
FROM members;`,
        hints: {
          direction: "數字小的排前面要用 ASC。ORDER BY 放在 FROM 後面。",
          skeleton: `SELECT name, credits
FROM members
ORDER BY credits 排序方向;`,
          answer: `SELECT name, credits
FROM members
ORDER BY credits ASC;`
        },
        successMessage: "做得好，你用 ORDER BY credits ASC 把點數少的會員排在前面。",
        referenceSql: `SELECT name, credits
FROM members
ORDER BY credits ASC;`,
        compare: { order: true, columns: true },
        requires: ["ORDER BY"]
      },
      {
        id: "w5-03-05",
        title: "最新三位加入會員",
        description: "海姐只想先看最近加入的三位會員。回傳 name、joined_at，只顯示三筆。",
        tags: ["ORDER BY", "LIMIT"],
        type: "query",
        starterSql: `SELECT name, joined_at
FROM members;`,
        hints: {
          direction: "先用 joined_at DESC 把最新加入排前面，再用 LIMIT 3 留下三筆。",
          skeleton: `SELECT name, joined_at
FROM members
ORDER BY joined_at DESC
LIMIT 筆數;`,
          answer: `SELECT name, joined_at
FROM members
ORDER BY joined_at DESC
LIMIT 3;`
        },
        successMessage: "很穩，你先排序再取三筆，海姐拿到的是最新加入的三位會員。",
        referenceSql: `SELECT name, joined_at
FROM members
ORDER BY joined_at DESC
LIMIT 3;`,
        compare: { order: true, columns: true },
        requires: ["ORDER BY", "LIMIT"]
      },
      {
        id: "w5-03-06",
        title: "方案價格由低到高",
        description: "GET /api/credit-package 回傳前，海姐想先看便宜方案。回傳 name、price，價格低的排前面。",
        tags: ["Node.js 對照", "ASC"],
        type: "query",
        starterSql: `SELECT name, price
FROM credit_packages;`,
        hints: {
          direction: "價格低的排前面要用 ORDER BY price ASC。",
          skeleton: `SELECT name, price
FROM credit_packages
ORDER BY price 排序方向;`,
          answer: `SELECT name, price
FROM credit_packages
ORDER BY price ASC;`
        },
        successMessage: "很好，你把堂數方案依價格由低到高排序，這很像 API 回傳前整理列表。",
        referenceSql: `SELECT name, price
FROM credit_packages
ORDER BY price ASC;`,
        compare: { order: true, columns: true },
        requires: ["ORDER BY"]
      },
      {
        id: "w5-03-07",
        title: "方案價格由高到低",
        description: "海姐想先檢查高價方案。回傳 name、price，價格高的排前面。",
        tags: ["Node.js 對照", "DESC"],
        type: "query",
        starterSql: `SELECT name, price
FROM credit_packages;`,
        hints: {
          direction: "價格高的排前面要用 DESC。排序欄位是 price。",
          skeleton: `SELECT name, price
FROM credit_packages
ORDER BY price 排序方向;`,
          answer: `SELECT name, price
FROM credit_packages
ORDER BY price DESC;`
        },
        successMessage: "漂亮，你用 ORDER BY price DESC 讓高價方案排在前面。",
        referenceSql: `SELECT name, price
FROM credit_packages
ORDER BY price DESC;`,
        compare: { order: true, columns: true },
        requires: ["ORDER BY"]
      },
      {
        id: "w5-03-08",
        title: "堂數最多的方案",
        description: "後端列表要凸顯大堂數方案。回傳 name、credit_amount，堂數多的排前面。",
        tags: ["Node.js 對照", "DESC"],
        type: "query",
        starterSql: `SELECT name, credit_amount
FROM credit_packages;`,
        hints: {
          direction: "credit_amount 越大代表堂數越多，所以要搭配 DESC。",
          skeleton: `SELECT name, credit_amount
FROM credit_packages
ORDER BY credit_amount 排序方向;`,
          answer: `SELECT name, credit_amount
FROM credit_packages
ORDER BY credit_amount DESC;`
        },
        successMessage: "做得好，你把堂數最多的方案排在前面了。",
        referenceSql: `SELECT name, credit_amount
FROM credit_packages
ORDER BY credit_amount DESC;`,
        compare: { order: true, columns: true },
        requires: ["ORDER BY"]
      },
      {
        id: "w5-03-09",
        title: "最便宜三個方案",
        description: "海姐想在首頁只顯示三個最便宜方案。回傳 name、price，只顯示三筆。",
        tags: ["Node.js 對照", "LIMIT"],
        type: "query",
        starterSql: `SELECT name, price
FROM credit_packages;`,
        hints: {
          direction: "先用 price ASC 排成由低到高，再用 LIMIT 3 留下三筆。",
          skeleton: `SELECT name, price
FROM credit_packages
ORDER BY price ASC
LIMIT 筆數;`,
          answer: `SELECT name, price
FROM credit_packages
ORDER BY price ASC
LIMIT 3;`
        },
        successMessage: "很穩，你先排序再 LIMIT 3，拿到最便宜的三個方案。",
        referenceSql: `SELECT name, price
FROM credit_packages
ORDER BY price ASC
LIMIT 3;`,
        compare: { order: true, columns: true },
        requires: ["ORDER BY", "LIMIT"]
      },
      {
        id: "w5-03-10",
        title: "最新兩個新增方案",
        description: "海姐想確認最近新增的方案。回傳 name、created_at，只顯示最新兩筆。",
        tags: ["Node.js 對照", "LIMIT"],
        type: "query",
        starterSql: `SELECT name, created_at
FROM credit_packages;`,
        hints: {
          direction: "created_at 越新越大。先用 DESC 排新到舊，再 LIMIT 2。",
          skeleton: `SELECT name, created_at
FROM credit_packages
ORDER BY created_at DESC
LIMIT 筆數;`,
          answer: `SELECT name, created_at
FROM credit_packages
ORDER BY created_at DESC
LIMIT 2;`
        },
        successMessage: "很好，你把最新新增的兩個方案抓出來了。",
        referenceSql: `SELECT name, created_at
FROM credit_packages
ORDER BY created_at DESC
LIMIT 2;`,
        compare: { order: true, columns: true },
        requires: ["ORDER BY", "LIMIT"]
      }
    ]
  },
  {
    id: "write-one-row",
    section: "資料寫入練習",
    title: "04 INSERT / UPDATE / DELETE：先改一筆資料就好",
    label: "W5-04",
    lead:
      "改資料對新手比較有壓力，所以第一輪只做單筆任務：新增會員、修改點數、維護堂數方案。",
    mission:
      "LiveFit 營運開始要串 Node.js 的 /api/credit-package。你要先用 SQL 練會 POST 新增、更新資料、DELETE 刪除背後會動到的一筆資料。",
    coachLine:
      "改資料會緊張是正常的，所以我們只改一筆。先養成搭配 WHERE 的習慣，後面寫後端 API 會安全很多。",
    teaching:
      "INSERT 是新增資料，UPDATE 是修改資料，DELETE 是刪除資料。UPDATE 和 DELETE 都一定要搭配 WHERE，否則可能整張表都被改掉。",
    syntax: `INSERT INTO credit_packages (name, credit_amount, price, created_at)
VALUES ('午間 8 堂包', 8, 1800, '2026-07-20 10:00:00');`,
    exercises: [
      {
        id: "w5-04-01",
        title: "新增一位練習會員",
        description: "LiveFit 新增了一位會員 Mia。email 是 mia@example.com，level Basic，city Taipei，credits 80，joined_at 2026-07-10。",
        tags: ["INSERT", "單筆新增"],
        type: "mutation",
        starterSql: `INSERT INTO members (name, email, level, city, credits, joined_at)
VALUES ('Mia', 'mia@example.com', 'Basic', 'Taipei', 0, '2026-07-10');`,
        hints: {
          direction: "INSERT INTO 後面列欄位，VALUES 後面照同樣順序放值。起始 SQL 已經放好欄位，請把點數改成任務要求的數字。",
          skeleton: `INSERT INTO members (name, email, level, city, credits, joined_at)
VALUES ('姓名', 'email', '等級', '城市', 點數, '加入日期');`,
          answer: `INSERT INTO members (name, email, level, city, credits, joined_at)
VALUES ('Mia', 'mia@example.com', 'Basic', 'Taipei', 80, '2026-07-10');`
        },
        successMessage: "很棒，你正確用 INSERT INTO members (...) VALUES (...) 新增 Mia，欄位和值都有對齊。",
        requires: ["INSERT"],
        checks: [
          {
            label: "Mia 已正確新增",
            sql: `SELECT name, email, level, city, credits, joined_at::text AS joined_at
FROM members
WHERE email = 'mia@example.com';`,
            expectRows: [
              {
                name: "Mia",
                email: "mia@example.com",
                level: "Basic",
                city: "Taipei",
                credits: 80,
                joined_at: "2026-07-10"
              }
            ]
          }
        ]
      },
      {
        id: "w5-04-02",
        title: "修改 Mina 的點數",
        description: "Mina 完成補課後，海姐要把 Mina 的 credits 改成 90，其他會員不能被改到。",
        tags: ["UPDATE", "WHERE"],
        type: "mutation",
        starterSql: `UPDATE members
SET credits = 60
WHERE name = 'Mina';`,
        hints: {
          direction: "UPDATE 改資料時要保留 WHERE。這題只要把 SET credits 的數字改成 90。",
          skeleton: `UPDATE members
SET credits = 新點數
WHERE name = 'Mina';`,
          answer: `UPDATE members
SET credits = 90
WHERE name = 'Mina';`
        },
        successMessage: "漂亮，你用 UPDATE 加 WHERE 只把 Mina 的 credits 改成 90，其他會員資料沒有被動到。",
        requires: ["UPDATE", "WHERE"],
        checks: [
          {
            label: "Mina credits 是 90",
            sql: `SELECT name, credits FROM members WHERE name = 'Mina';`,
            expectRows: [{ name: "Mina", credits: 90 }]
          },
          {
            label: "其他會員點數沒有被改到",
            sql: `SELECT name, credits
FROM members
WHERE name <> 'Mina'
ORDER BY id;`,
            expectRows: [
              { name: "Leo", credits: 180 },
              { name: "Kai", credits: 240 },
              { name: "Nora", credits: 20 },
              { name: "Ivy", credits: 95 },
              { name: "Sean", credits: 130 },
              { name: "Una", credits: 110 },
              { name: "Tina", credits: 40 }
            ]
          }
        ]
      },
      {
        id: "w5-04-03",
        title: "新增台中會員 Noah",
        description: "LiveFit 新增了一位會員 Noah。email 是 noah@example.com，level Basic，city Taichung，credits 70，joined_at 2026-07-11。",
        tags: ["INSERT", "單筆新增"],
        type: "mutation",
        starterSql: `INSERT INTO members (name, email, level, city, credits, joined_at)
VALUES ('Noah', 'noah@example.com', 'Basic', 'Taipei', 70, '2026-07-11');`,
        hints: {
          direction: "欄位和值已經對齊。請把城市改成任務要求的 Taichung。",
          skeleton: `INSERT INTO members (name, email, level, city, credits, joined_at)
VALUES ('姓名', 'email', '等級', '城市', 點數, '加入日期');`,
          answer: `INSERT INTO members (name, email, level, city, credits, joined_at)
VALUES ('Noah', 'noah@example.com', 'Basic', 'Taichung', 70, '2026-07-11');`
        },
        successMessage: "很好，你正確新增 Noah，並把城市填成 Taichung。",
        requires: ["INSERT"],
        checks: [
          {
            label: "Noah 已正確新增",
            sql: `SELECT name, email, level, city, credits, joined_at::text AS joined_at
FROM members
WHERE email = 'noah@example.com';`,
            expectRows: [
              {
                name: "Noah",
                email: "noah@example.com",
                level: "Basic",
                city: "Taichung",
                credits: 70,
                joined_at: "2026-07-11"
              }
            ]
          }
        ]
      },
      {
        id: "w5-04-04",
        title: "修改 Ivy 的點數",
        description: "Ivy 參加活動後，海姐要把 Ivy 的 credits 改成 120，其他會員不能被改到。",
        tags: ["UPDATE", "WHERE"],
        type: "mutation",
        starterSql: `UPDATE members
SET credits = 95
WHERE name = 'Ivy';`,
        hints: {
          direction: "保留 WHERE name = 'Ivy'，只把 SET credits 後面的數字改成 120。",
          skeleton: `UPDATE members
SET credits = 新點數
WHERE name = 'Ivy';`,
          answer: `UPDATE members
SET credits = 120
WHERE name = 'Ivy';`
        },
        successMessage: "漂亮，你只更新 Ivy 的點數，其他會員資料保持原樣。",
        requires: ["UPDATE", "WHERE"],
        checks: [
          {
            label: "Ivy credits 是 120",
            sql: `SELECT name, credits FROM members WHERE name = 'Ivy';`,
            expectRows: [{ name: "Ivy", credits: 120 }]
          },
          {
            label: "其他會員點數沒有被改到",
            sql: `SELECT name, credits
FROM members
WHERE name <> 'Ivy'
ORDER BY id;`,
            expectRows: [
              { name: "Leo", credits: 180 },
              { name: "Mina", credits: 60 },
              { name: "Kai", credits: 240 },
              { name: "Nora", credits: 20 },
              { name: "Sean", credits: 130 },
              { name: "Una", credits: 110 },
              { name: "Tina", credits: 40 }
            ]
          }
        ]
      },
      {
        id: "w5-04-05",
        title: "新增午間 8 堂包",
        description: "Node.js POST /api/credit-package 會新增堂數方案。新增 name 午間 8 堂包、credit_amount 8、price 1800、created_at 2026-07-20 10:00:00。",
        tags: ["Node.js 對照", "INSERT"],
        type: "mutation",
        starterSql: `INSERT INTO credit_packages (name, credit_amount, price, created_at)
VALUES ('午間 8 堂包', 8, 0, '2026-07-20 10:00:00');`,
        hints: {
          direction: "欄位和值已經對齊。請把 price 從 0 改成任務要求的 1800。",
          skeleton: `INSERT INTO credit_packages (name, credit_amount, price, created_at)
VALUES ('方案名稱', 堂數, 價格, '建立時間');`,
          answer: `INSERT INTO credit_packages (name, credit_amount, price, created_at)
VALUES ('午間 8 堂包', 8, 1800, '2026-07-20 10:00:00');`
        },
        successMessage: "很好，你新增了午間 8 堂包，這會銜接 Node.js POST 新增方案的資料動作。",
        requires: ["INSERT"],
        checks: [
          {
            label: "午間 8 堂包已正確新增",
            sql: `SELECT name, credit_amount, price::text AS price
FROM credit_packages
WHERE name = '午間 8 堂包';`,
            expectRows: [{ name: "午間 8 堂包", credit_amount: 8, price: "1800.00" }]
          }
        ]
      },
      {
        id: "w5-04-06",
        title: "更新入門方案價格",
        description: "海姐要把 入門 10 堂包 的 price 改成 2300，其他方案不能被改到。",
        tags: ["Node.js 對照", "UPDATE"],
        type: "mutation",
        starterSql: `UPDATE credit_packages
SET price = 2200
WHERE name = '入門 10 堂包';`,
        hints: {
          direction: "保留 WHERE name = '入門 10 堂包'，只把 SET price 後面的數字改成 2300。",
          skeleton: `UPDATE credit_packages
SET price = 新價格
WHERE name = '方案名稱';`,
          answer: `UPDATE credit_packages
SET price = 2300
WHERE name = '入門 10 堂包';`
        },
        successMessage: "漂亮，你只更新了入門 10 堂包的價格，其他方案沒有被動到。",
        requires: ["UPDATE", "WHERE"],
        checks: [
          {
            label: "入門 10 堂包 price 是 2300",
            sql: `SELECT name, price::text AS price
FROM credit_packages
WHERE name = '入門 10 堂包';`,
            expectRows: [{ name: "入門 10 堂包", price: "2300.00" }]
          },
          {
            label: "其他方案價格沒有被改到",
            sql: `SELECT name, price::text AS price
FROM credit_packages
WHERE name <> '入門 10 堂包'
ORDER BY id;`,
            expectRows: [
              { name: "體驗 5 堂包", price: "1200.00" },
              { name: "進階 20 堂包", price: "4000.00" },
              { name: "VIP 50 堂包", price: "9000.00" },
              { name: "企業 100 堂包", price: "16000.00" }
            ]
          }
        ]
      },
      {
        id: "w5-04-07",
        title: "更新體驗方案堂數",
        description: "海姐要把 體驗 5 堂包 的 credit_amount 改成 6，其他方案不能被改到。",
        tags: ["Node.js 對照", "UPDATE"],
        type: "mutation",
        starterSql: `UPDATE credit_packages
SET credit_amount = 5
WHERE name = '體驗 5 堂包';`,
        hints: {
          direction: "保留 WHERE，只把 SET credit_amount 後面的數字改成 6。",
          skeleton: `UPDATE credit_packages
SET credit_amount = 新堂數
WHERE name = '方案名稱';`,
          answer: `UPDATE credit_packages
SET credit_amount = 6
WHERE name = '體驗 5 堂包';`
        },
        successMessage: "很好，你只更新了體驗方案的堂數。",
        requires: ["UPDATE", "WHERE"],
        checks: [
          {
            label: "體驗方案堂數是 6",
            sql: `SELECT name, credit_amount
FROM credit_packages
WHERE name = '體驗 5 堂包';`,
            expectRows: [{ name: "體驗 5 堂包", credit_amount: 6 }]
          }
        ]
      },
      {
        id: "w5-04-08",
        title: "刪除企業方案",
        description: "Node.js DELETE /api/credit-package/:id 最後會刪掉一筆方案。刪除 name 是 企業 100 堂包 的資料。",
        tags: ["Node.js 對照", "DELETE"],
        type: "mutation",
        starterSql: `DELETE FROM credit_packages
WHERE name = 'VIP 50 堂包';`,
        hints: {
          direction: "DELETE 一定要保留 WHERE。請把方案名稱從 VIP 50 堂包 改成 企業 100 堂包。",
          skeleton: `DELETE FROM credit_packages
WHERE name = '方案名稱';`,
          answer: `DELETE FROM credit_packages
WHERE name = '企業 100 堂包';`
        },
        successMessage: "做得好，你只刪除了企業 100 堂包，這會銜接 DELETE API 背後的資料刪除概念。",
        requires: ["DELETE", "WHERE"],
        checks: [
          {
            label: "企業 100 堂包已刪除",
            sql: `SELECT COUNT(*)::int AS count
FROM credit_packages
WHERE name = '企業 100 堂包';`,
            expectRows: [{ count: 0 }]
          },
          {
            label: "其他方案仍然存在",
            sql: `SELECT COUNT(*)::int AS count
FROM credit_packages;`,
            expectRows: [{ count: 4 }]
          }
        ]
      },
      {
        id: "w5-04-09",
        title: "新增晚間 12 堂包",
        description: "新增 name 晚間 12 堂包、credit_amount 12、price 2600、created_at 2026-07-21 18:30:00。",
        tags: ["Node.js 對照", "INSERT"],
        type: "mutation",
        starterSql: `INSERT INTO credit_packages (name, credit_amount, price, created_at)
VALUES ('晚間 12 堂包', 12, 2600, '2026-07-21 08:30:00');`,
        hints: {
          direction: "欄位和值都對了，只有時間要改。把 08:30:00 改成任務指定的 18:30:00。",
          skeleton: `INSERT INTO credit_packages (name, credit_amount, price, created_at)
VALUES ('方案名稱', 堂數, 價格, '建立時間');`,
          answer: `INSERT INTO credit_packages (name, credit_amount, price, created_at)
VALUES ('晚間 12 堂包', 12, 2600, '2026-07-21 18:30:00');`
        },
        successMessage: "很好，你新增了晚間 12 堂包，時間也填對了。",
        requires: ["INSERT"],
        checks: [
          {
            label: "晚間 12 堂包已正確新增",
            sql: `SELECT name, credit_amount, price::text AS price, created_at::text AS created_at
FROM credit_packages
WHERE name = '晚間 12 堂包';`,
            expectRows: [
              {
                name: "晚間 12 堂包",
                credit_amount: 12,
                price: "2600.00",
                created_at: "2026-07-21 18:30:00"
              }
            ]
          }
        ]
      },
      {
        id: "w5-04-10",
        title: "刪除體驗方案",
        description: "海姐要下架 體驗 5 堂包。刪除 name 是 體驗 5 堂包 的資料，其他方案要保留。",
        tags: ["Node.js 對照", "DELETE"],
        type: "mutation",
        starterSql: `DELETE FROM credit_packages;`,
        hints: {
          direction: "起始 SQL 太危險，會刪整張表。請加上 WHERE name = '體驗 5 堂包'。",
          skeleton: `DELETE FROM credit_packages
WHERE name = '方案名稱';`,
          answer: `DELETE FROM credit_packages
WHERE name = '體驗 5 堂包';`
        },
        successMessage: "很穩，你把沒有 WHERE 的危險 DELETE 改成只刪指定方案。",
        requires: ["DELETE", "WHERE"],
        checks: [
          {
            label: "體驗 5 堂包已刪除",
            sql: `SELECT COUNT(*)::int AS count
FROM credit_packages
WHERE name = '體驗 5 堂包';`,
            expectRows: [{ count: 0 }]
          },
          {
            label: "其他方案仍然存在",
            sql: `SELECT COUNT(*)::int AS count
FROM credit_packages;`,
            expectRows: [{ count: 4 }]
          }
        ]
      }
    ]
  },
  {
    id: "ecommerce-case",
    section: "情境任務",
    title: "05 雙十一前夜：電商後台夜班巡查",
    label: "W5-05",
    lead:
      "雙十一前夜，LiveFit 電商後台一張 shop_orders 訂單表交到你手上。今晚你頂夜班，沿著付款、打包、出貨一路巡到客服收尾，遇到怪單就處理掉。",
    mission:
      "LiveFit 開了電商賣補給品和器材，雙十一前夜訂單暴衝、白班忙不過來，海姐把你拉來頂一個夜班操作員。「今晚不教新語法——你真的在顧店。把這張訂單表從頭巡到尾，該出貨的出貨、該收的怪單收掉，最後交一份乾淨的班給白班。」",
    coachLine:
      "別緊張，我坐你旁邊。每一步我都會說清楚要做什麼，卡住就喊我——我遞提示、不搶你鍵盤。我們一條一條來。",
    caseBrief:
      "🌙 雙十一前夜・後台夜班。LiveFit 電商的訂單牆上還有 12 筆未結，海姐：「今晚這班我陪你，一條一條清。」",
    teaching:
      "Northwind 是很常見的商務資料練習方向，這裡先用老師整理過的簡化版 shop_orders。你會先觀察資料集，再練 WHERE、ORDER BY、LIMIT、UPDATE、INSERT，難度仍維持在新手可以跟上的範圍。",
    syntax: `SELECT *
FROM shop_orders
LIMIT 8;`,
    isCase: true,
    exercises: [
      {
        id: "w5-05-01",
        title: "交接班：先把今晚的訂單牆叫出來認個臉",
        description: "海姐：動任何單之前，先把前 8 筆叫出來認個臉。查 shop_orders 前 8 筆，看清楚有哪些欄位、status 有哪幾種值、note 寫了什麼。",
        tags: ["資料集偵察", "Northwind Lite"],
        type: "query",
        starterSql: `SELECT *
FROM shop_orders;`,
        hints: {
          direction: "先看 shop_orders 這張表。這題只要在查詢最後加上 LIMIT 8，控制觀察筆數。",
          skeleton: `SELECT *
FROM shop_orders
LIMIT 筆數;`,
          answer: `SELECT *
FROM shop_orders
LIMIT 8;`
        },
        successMessage: "認完臉了。有沒有注意到 note 欄在說話——有人催出貨、有筆深夜下的大單在等審核？接下來就不是憑空查，是照著這張表往下顧。",
        referenceSql: `SELECT *
FROM shop_orders
LIMIT 8;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "LIMIT"]
      },
      {
        id: "w5-05-02",
        title: "先撈已付款、倉庫等著揀貨的單",
        description: "倉庫等著拿清單揀貨。先把已付款的單撈給他們：回傳 order_no、customer_name、status，篩選 status 是 paid。",
        tags: ["WHERE", "訂單狀態"],
        type: "query",
        starterSql: `SELECT order_no, customer_name, status
FROM shop_orders
WHERE status = 'pending';`,
        hints: {
          direction: "欄位已經列好了，只要把 WHERE 條件的狀態從 pending 改成 paid。",
          skeleton: `SELECT order_no, customer_name, status
FROM shop_orders
WHERE status = '狀態值';`,
          answer: `SELECT order_no, customer_name, status
FROM shop_orders
WHERE status = 'paid';`
        },
        successMessage: "清單給倉庫了。有看到那筆 9999 的 Jack Pai 嗎？金額特別大——等等主管會點名要先審它。先往下走。",
        referenceSql: `SELECT order_no, customer_name, status
FROM shop_orders
WHERE status = 'paid';`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "WHERE"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-05-03",
        title: "轉去物流站：哪些打包好了、卡在等出貨",
        description: "付款單交倉庫了，往下游走到物流站。把打包好卻還沒出門的單撈給物流：回傳 order_no、customer_name、city、status，篩選 status 是 packed（帶上 city，他們要排路線）。",
        tags: ["WHERE", "物流"],
        type: "query",
        starterSql: `SELECT order_no, customer_name, city, status
FROM shop_orders
WHERE status = 'paid';`,
        hints: {
          direction: "這題和上一題很像，只是要找 packed。保留四個欄位，修改 WHERE 條件。",
          skeleton: `SELECT order_no, customer_name, city, status
FROM shop_orders
WHERE status = '狀態值';`,
          answer: `SELECT order_no, customer_name, city, status
FROM shop_orders
WHERE status = 'packed';`
        },
        successMessage: "物流拿到路線清單了。其中 NW-1006 已打包、就等司機簽收——等一下你會親手把它送出門。",
        referenceSql: `SELECT order_no, customer_name, city, status
FROM shop_orders
WHERE status = 'packed';`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "WHERE"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-05-04",
        title: "值班主管 line 你：大額單我先審、大的排前面",
        description: "主管 line：『今晚 5000 以上一律我先審，金額大的排前面。』回傳 order_no、customer_name、total_amount，篩選 5000 以上、依 total_amount 由大到小排序。",
        tags: ["WHERE", "ORDER BY"],
        type: "query",
        starterSql: `SELECT order_no, customer_name, total_amount
FROM shop_orders
WHERE total_amount >= 3000
ORDER BY total_amount ASC;`,
        hints: {
          direction: "先把金額門檻改成 5000，再把排序方向改成由大到小 DESC。",
          skeleton: `SELECT order_no, customer_name, total_amount
FROM shop_orders
WHERE total_amount >= 金額
ORDER BY total_amount 排序方向;`,
          answer: `SELECT order_no, customer_name, total_amount
FROM shop_orders
WHERE total_amount >= 5000
ORDER BY total_amount DESC;`
        },
        successMessage: "VIP 審核清單交出去了，那筆 9999 的 Jack Pai 正式登頂第一名。海姐：『大不代表有問題，是它不能出錯，所以多盯兩眼。』",
        referenceSql: `SELECT order_no, customer_name, total_amount
FROM shop_orders
WHERE total_amount >= 5000
ORDER BY total_amount DESC;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "WHERE", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-05-05",
        title: "客服小桃要對帳：給我最新三筆剛付款的",
        description: "客服小桃敲你：『剛有客人問退費，最近三筆剛付款的給我、我要對時間。』回傳 order_no、customer_name、paid_at，篩 paid、依 paid_at 由新到舊、只取 3 筆。",
        tags: ["ORDER BY", "LIMIT"],
        type: "query",
        starterSql: `SELECT order_no, customer_name, paid_at
FROM shop_orders
WHERE status = 'paid'
ORDER BY paid_at ASC;`,
        hints: {
          direction: "狀態條件已經對了。把 paid_at 排序改成 DESC，最後加上 LIMIT 3。",
          skeleton: `SELECT order_no, customer_name, paid_at
FROM shop_orders
WHERE status = 'paid'
ORDER BY paid_at DESC
LIMIT 筆數;`,
          answer: `SELECT order_no, customer_name, paid_at
FROM shop_orders
WHERE status = 'paid'
ORDER BY paid_at DESC
LIMIT 3;`
        },
        successMessage: "最新三筆給小桃了。又是 Jack Pai——20:20 深夜才入帳，第三次冒出來。這筆有點故事了吧？先記著，往下走。",
        referenceSql: `SELECT order_no, customer_name, paid_at
FROM shop_orders
WHERE status = 'paid'
ORDER BY paid_at DESC
LIMIT 3;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "WHERE", "ORDER BY", "LIMIT"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-05-06",
        title: "NW-1001 揀貨完成，推進到已打包",
        description: "倉庫回報：NW-1001（你剛剛撈到的第一筆付款單）揀貨完成了。把它的 status 從 paid 改成 packed。海姐：『UPDATE 會真的改到資料，WHERE 一定要鎖緊，只動這一筆。』",
        tags: ["UPDATE", "單筆修改"],
        type: "mutation",
        starterSql: `UPDATE shop_orders
SET status = 'paid'
WHERE order_no = 'NW-1001';`,
        hints: {
          direction: "WHERE 已經鎖定 NW-1001。只要把 SET status 的值改成 packed。",
          skeleton: `UPDATE shop_orders
SET status = '新狀態'
WHERE order_no = '訂單編號';`,
          answer: `UPDATE shop_orders
SET status = 'packed'
WHERE order_no = 'NW-1001';`
        },
        successMessage: "NW-1001 貼上出貨標籤、進打包區了，沒碰到別單。建議按『查回來看看』確認它真的從 paid 變 packed。物流那邊 NW-1006 也好了，下一條把它送出門。",
        requires: ["UPDATE", "WHERE"],
        checks: [
          {
            label: "NW-1001 狀態已改成 packed",
            sql: `SELECT order_no, status
FROM shop_orders
WHERE order_no = 'NW-1001';`,
            expectRows: [{ order_no: "NW-1001", status: "packed" }]
          }
        ]
      },
      {
        id: "w5-05-07",
        title: "物流司機簽收 NW-1006，蓋上已出貨戳記",
        description: "司機簽收 NW-1006（你剛在物流清單看到的那筆）。出貨不只改狀態，還要記『何時出』：把 status 改成 shipped，並把 shipped_at 設為 2026-08-06 15:30:00。",
        tags: ["UPDATE", "多欄位修改"],
        type: "mutation",
        starterSql: `UPDATE shop_orders
SET status = 'shipped'
WHERE order_no = 'NW-1006';`,
        hints: {
          direction: "這題要一次改兩個欄位：status 和 shipped_at。兩個 SET 項目中間用逗號隔開。",
          skeleton: `UPDATE shop_orders
SET status = '新狀態',
    shipped_at = '出貨時間'
WHERE order_no = '訂單編號';`,
          answer: `UPDATE shop_orders
SET status = 'shipped',
    shipped_at = '2026-08-06 15:30:00'
WHERE order_no = 'NW-1006';`
        },
        successMessage: "NW-1006 上車了、出貨時間也蓋好。這就是後台『出貨』按鈕背後真正在做的事——一次改好幾個欄位。",
        requires: ["UPDATE", "WHERE"],
        checks: [
          {
            label: "NW-1006 已出貨且有出貨時間",
            sql: `SELECT order_no, status, shipped_at::text AS shipped_at
FROM shop_orders
WHERE order_no = 'NW-1006';`,
            expectRows: [{ order_no: "NW-1006", status: "shipped", shipped_at: "2026-08-06 15:30:00" }]
          }
        ]
      },
      {
        id: "w5-05-08",
        title: "幫客服開一張乾淨的退費測試單",
        description: "小桃要測退費流程：『不能拿真客人的單來玩會出事，開一張乾淨測試單。』新增一筆：order_no NW-1013、customer_name Momo Test、email momo.test@example.com、city Taipei、status pending、total_amount 0、created_at 2026-08-07 10:00:00、note 客服測試單。",
        tags: ["INSERT", "客服測試"],
        type: "mutation",
        starterSql: `INSERT INTO shop_orders (order_no, customer_name, email, city, status, total_amount, created_at, note)
VALUES ('NW-1013', 'Momo Test', 'momo.test@example.com', 'Taipei', 'paid', 999, '2026-08-07 10:00:00', '客服測試單');`,
        hints: {
          direction: "欄位和值大多已經排好。請把 status 改成 pending，total_amount 改成 0。",
          skeleton: `INSERT INTO shop_orders (order_no, customer_name, email, city, status, total_amount, created_at, note)
VALUES ('訂單編號', '客戶姓名', 'email', '城市', '狀態', 金額, '建立時間', '備註');`,
          answer: `INSERT INTO shop_orders (order_no, customer_name, email, city, status, total_amount, created_at, note)
VALUES ('NW-1013', 'Momo Test', 'momo.test@example.com', 'Taipei', 'pending', 0, '2026-08-07 10:00:00', '客服測試單');`
        },
        successMessage: "測試單 NW-1013 進系統了，小桃可以拿它跑退費流程、不會動到真客人。你今晚已經把看、查、改、補一條龍走過一遍了。",
        requires: ["INSERT"],
        checks: [
          {
            label: "NW-1013 客服測試單已正確新增",
            sql: `SELECT order_no, customer_name, status, total_amount::text AS total_amount
FROM shop_orders
WHERE order_no = 'NW-1013';`,
            expectRows: [{ order_no: "NW-1013", customer_name: "Momo Test", status: "pending", total_amount: "0.00" }]
          }
        ]
      },
      {
        id: "w5-05-09",
        title: "交班前盤點：把沒走完或出問題的單一次框出來",
        description: "夜班尾聲，海姐要交班報告：『把沒走完或出問題的單一次撈給我。』回傳 order_no、customer_name、status，篩選 status 是 pending、cancelled、refunded，依 id 排序。",
        tags: ["WHERE", "IN"],
        type: "query",
        starterSql: `SELECT order_no, customer_name, status
FROM shop_orders
WHERE status IN ('paid', 'packed')
ORDER BY id;`,
        hints: {
          direction: "欄位和排序已經有了。請把 IN 裡面的狀態改成 pending、cancelled、refunded。",
          skeleton: `SELECT order_no, customer_name, status
FROM shop_orders
WHERE status IN ('狀態一', '狀態二', '狀態三')
ORDER BY id;`,
          answer: `SELECT order_no, customer_name, status
FROM shop_orders
WHERE status IN ('pending', 'cancelled', 'refunded')
ORDER BY id;`
        },
        successMessage: "異常清單出來了。注意 NW-1011 那筆——深夜下單、小額、一直沒付款，像張殭屍單。它就是你今晚要親手了結的最後一條。",
        referenceSql: `SELECT order_no, customer_name, status
FROM shop_orders
WHERE status IN ('pending', 'cancelled', 'refunded')
ORDER BY id;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "WHERE", "IN", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-05-10",
        title: "NW-1011 超過保留時限，依規取消並註記原因",
        description: "你查證 NW-1011：下單後一直沒付款、超過保留時限。用 order_no 鎖死它一筆，status 改成 cancelled、note 改成 逾時未付款——這樣明天白班一看就懂為什麼取消。",
        tags: ["UPDATE", "單筆修改"],
        type: "mutation",
        starterSql: `UPDATE shop_orders
SET status = 'cancelled'
WHERE order_no = 'NW-1011';`,
        hints: {
          direction: "這題要一次改 status 和 note，並且用 order_no = 'NW-1011' 鎖定單筆訂單。",
          skeleton: `UPDATE shop_orders
SET status = '新狀態',
    note = '備註'
WHERE order_no = '訂單編號';`,
          answer: `UPDATE shop_orders
SET status = 'cancelled',
    note = '逾時未付款'
WHERE order_no = 'NW-1011';`
        },
        successMessage: "殭屍單收掉了，原因也寫清楚，沒動到別單。今晚這班顧完了——12 筆從頭巡到尾，該出的出、該收的收。那筆 9999 的大單？主管審過、客服對過時間，虛驚一場、留給白班正式出貨。海姐：『你做完一件完整的事了。明天接班的人會謝謝你。』",
        requires: ["UPDATE", "WHERE"],
        requiredPatterns: [
          {
            label: "這題要用訂單編號鎖定 NW-1011，請寫出 WHERE order_no = 'NW-1011'。",
            pattern: "\\bWHERE\\s+(?:shop_orders\\.)?order_no\\s*=\\s*'NW-1011'",
            preserveStrings: true
          }
        ],
        checks: [
          {
            label: "NW-1011 已取消並留下原因",
            sql: `SELECT order_no, status, note
FROM shop_orders
WHERE order_no = 'NW-1011';`,
            expectRows: [{ order_no: "NW-1011", status: "cancelled", note: "逾時未付款" }]
          }
        ]
      }
    ]
  },
  {
    id: "table-relationships",
    section: "Tables 資料表管理",
    title: "06 Tables：主鍵、外鍵與資料表拆分",
    label: "W5-06",
    lead:
      "這一章先不急著 JOIN。學生先看懂一件事：資料庫常把資料拆成多張表，再用 id 把資料連回來。",
    mission:
      "LiveFit 的課程報名資料不再塞在一張大表裡。海姐把教練、課程、報名紀錄拆成 coaches、courses、course_bookings 三張表，請你先理解主鍵和外鍵，再安全新增、更新與刪除資料。",
    coachLine:
      "看到 member_id、coach_id、course_id 先不要怕。它們不是新魔王，只是用數字指向另一張表的某一筆資料。",
    teaching:
      "主鍵通常是本表每一筆資料的 id；外鍵則是指向另一張表的 id。例如 courses.coach_id 指向 coaches.id，course_bookings.course_id 指向 courses.id。先用查詢確認 id 對得上，再做新增或修改，比硬背 JOIN 更踏實。",
    syntax: `SELECT id, title, coach_id
FROM courses
ORDER BY id;`,
    exercises: [
      {
        id: "w5-06-01",
        title: "先看課程表的外鍵",
        description: "先觀察 courses 課程表。回傳 id、title、coach_id、branch，依 id 由小到大排序。",
        tags: ["主鍵", "外鍵", "觀察資料表"],
        type: "query",
        starterSql: `SELECT id, title, branch
FROM courses;`,
        hints: {
          direction: "courses 的 id 是課程本身的主鍵，coach_id 會指向 coaches。補上 coach_id，並用 id 排序。",
          skeleton: `SELECT id, title, coach_id, branch
FROM courses
ORDER BY id;`,
          answer: `SELECT id, title, coach_id, branch
FROM courses
ORDER BY id;`
        },
        successMessage: "很好，你先看見課程表裡的 id 和 coach_id。這是理解拆表的第一步。",
        referenceSql: `SELECT id, title, coach_id, branch
FROM courses
ORDER BY id;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-06-02",
        title: "查看教練主鍵清單",
        description: "回傳 coaches 的 id、name、specialty，依 id 由小到大排序，讓課程表的 coach_id 可以對回教練。",
        tags: ["主鍵", "coaches"],
        type: "query",
        starterSql: `SELECT name, specialty
FROM coaches;`,
        hints: {
          direction: "這題要補上 id。coaches.id 會被 courses.coach_id 參考。",
          skeleton: `SELECT id, name, specialty
FROM coaches
ORDER BY id;`,
          answer: `SELECT id, name, specialty
FROM coaches
ORDER BY id;`
        },
        successMessage: "漂亮，你把教練主鍵清單查出來了，等等就能看懂課程屬於哪位教練。",
        referenceSql: `SELECT id, name, specialty
FROM coaches
ORDER BY id;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-06-03",
        title: "找出 Ben 教練的課程",
        description: "Ben 在 coaches 表裡的 id 是 2。請從 courses 回傳 id、title、coach_id、branch，篩選 coach_id = 2，依 id 排序。",
        tags: ["外鍵", "WHERE"],
        type: "query",
        starterSql: `SELECT id, title, coach_id, branch
FROM courses
WHERE coach_id = 1;`,
        hints: {
          direction: "這題不需要 JOIN，先練用外鍵查資料。把 coach_id 的條件改成 2，再補排序。",
          skeleton: `SELECT id, title, coach_id, branch
FROM courses
WHERE coach_id = 教練 id
ORDER BY id;`,
          answer: `SELECT id, title, coach_id, branch
FROM courses
WHERE coach_id = 2
ORDER BY id;`
        },
        successMessage: "很好，你用 courses.coach_id 找到了 Ben 的課程，這就是外鍵最基本的用途。",
        referenceSql: `SELECT id, title, coach_id, branch
FROM courses
WHERE coach_id = 2
ORDER BY id;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "WHERE", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-06-04",
        title: "看會員 1 的報名紀錄",
        description: "會員表 members 的 id 可以對到 course_bookings.member_id。請回傳 id、member_id、course_id、status，篩選 member_id = 1，依 id 排序。",
        tags: ["外鍵", "報名紀錄"],
        type: "query",
        starterSql: `SELECT id, member_id, course_id, status
FROM course_bookings
WHERE member_id = 2;`,
        hints: {
          direction: "欄位已經對了，請把 member_id 條件改成 1，並加上 ORDER BY id。",
          skeleton: `SELECT id, member_id, course_id, status
FROM course_bookings
WHERE member_id = 會員 id
ORDER BY id;`,
          answer: `SELECT id, member_id, course_id, status
FROM course_bookings
WHERE member_id = 1
ORDER BY id;`
        },
        successMessage: "很好，你用 member_id 找出會員 1 的所有報名紀錄，開始看懂報名表怎麼連回會員表了。",
        referenceSql: `SELECT id, member_id, course_id, status
FROM course_bookings
WHERE member_id = 1
ORDER BY id;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "WHERE", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-06-05",
        title: "看課程 3 的報名狀態",
        description: "請從 course_bookings 回傳 id、member_id、course_id、status、paid_amount，篩選 course_id = 3，依 id 排序。",
        tags: ["外鍵", "報名紀錄"],
        type: "query",
        starterSql: `SELECT id, member_id, course_id, status
FROM course_bookings
WHERE course_id = 3;`,
        hints: {
          direction: "這題要多回傳 paid_amount，並且用 id 排序。",
          skeleton: `SELECT id, member_id, course_id, status, paid_amount
FROM course_bookings
WHERE course_id = 課程 id
ORDER BY id;`,
          answer: `SELECT id, member_id, course_id, status, paid_amount
FROM course_bookings
WHERE course_id = 3
ORDER BY id;`
        },
        successMessage: "漂亮，你用 course_id 查出課程 3 的報名紀錄，報名表和課程表的關係更清楚了。",
        referenceSql: `SELECT id, member_id, course_id, status, paid_amount
FROM course_bookings
WHERE course_id = 3
ORDER BY id;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "WHERE", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-06-06",
        title: "新增一筆有效候補報名",
        description: "會員 2 想候補課程 2。新增 member_id 2、course_id 2、status waitlist、booked_at 2026-07-04 10:30:00、paid_amount 0。",
        tags: ["INSERT", "外鍵"],
        type: "mutation",
        starterSql: `INSERT INTO course_bookings (member_id, course_id, status, booked_at, paid_amount)
VALUES (2, 99, 'waitlist', '2026-07-04 10:30:00', 0);`,
        hints: {
          direction: "course_id 必須是 courses 裡存在的 id。請把 99 改成任務指定的 2。",
          skeleton: `INSERT INTO course_bookings (member_id, course_id, status, booked_at, paid_amount)
VALUES (會員 id, 課程 id, '報名狀態', '報名時間', 金額);`,
          answer: `INSERT INTO course_bookings (member_id, course_id, status, booked_at, paid_amount)
VALUES (2, 2, 'waitlist', '2026-07-04 10:30:00', 0);`
        },
        successMessage: "很好，你新增了一筆外鍵都對得上的候補報名。資料表拆開後，id 對不對很重要。",
        requires: ["INSERT"],
        checks: [
          {
            label: "會員 2 已候補課程 2",
            sql: `SELECT member_id, course_id, status, booked_at::text AS booked_at, paid_amount
FROM course_bookings
WHERE member_id = 2 AND course_id = 2 AND booked_at = '2026-07-04 10:30:00';`,
            expectRows: [
              {
                member_id: 2,
                course_id: 2,
                status: "waitlist",
                booked_at: "2026-07-04 10:30:00",
                paid_amount: 0
              }
            ]
          }
        ]
      },
      {
        id: "w5-06-07",
        title: "把候補報名改成已確認",
        description: "course_bookings 的 id 是報名紀錄自己的主鍵。請把 id = 5 的報名改成 confirmed，paid_amount 改成 900。",
        tags: ["UPDATE", "主鍵"],
        type: "mutation",
        starterSql: `UPDATE course_bookings
SET status = 'confirmed'
WHERE id = 5;`,
        hints: {
          direction: "這題要一次改 status 和 paid_amount。用 id = 5 鎖定單筆報名紀錄。",
          skeleton: `UPDATE course_bookings
SET status = '新狀態',
    paid_amount = 金額
WHERE id = 報名紀錄 id;`,
          answer: `UPDATE course_bookings
SET status = 'confirmed',
    paid_amount = 900
WHERE id = 5;`
        },
        successMessage: "漂亮，你用主鍵 id 精準更新一筆報名紀錄，沒有動到其他人的資料。",
        requires: ["UPDATE", "WHERE"],
        requiredPatterns: [
          {
            label: "這題要練用主鍵鎖定單筆資料，請寫出 WHERE id = 5。",
            pattern: "\\bWHERE\\s+(?:course_bookings\\.)?id\\s*=\\s*5\\b"
          }
        ],
        checks: [
          {
            label: "報名紀錄 5 已確認且付款金額正確",
            sql: `SELECT id, status, paid_amount
FROM course_bookings
WHERE id = 5;`,
            expectRows: [{ id: 5, status: "confirmed", paid_amount: 900 }]
          }
        ]
      },
      {
        id: "w5-06-08",
        title: "刪除已取消的報名紀錄",
        description: "報名紀錄 id = 8 已取消，海姐要清掉這筆測試資料。請只刪除 id = 8 這一筆。",
        tags: ["DELETE", "主鍵"],
        type: "mutation",
        starterSql: `DELETE FROM course_bookings;`,
        hints: {
          direction: "起始 SQL 很危險，會刪掉整張報名表。請加上 WHERE id = 8。",
          skeleton: `DELETE FROM course_bookings
WHERE id = 報名紀錄 id;`,
          answer: `DELETE FROM course_bookings
WHERE id = 8;`
        },
        successMessage: "很好，你把危險 DELETE 收斂成只刪一筆，這是資料庫操作很重要的安全感。",
        requires: ["DELETE", "WHERE"],
        requiredPatterns: [
          {
            label: "這題要練用主鍵刪除單筆資料，請寫出 WHERE id = 8。",
            pattern: "\\bWHERE\\s+(?:course_bookings\\.)?id\\s*=\\s*8\\b"
          }
        ],
        checks: [
          {
            label: "報名紀錄 8 已刪除",
            sql: `SELECT COUNT(*)::int AS count
FROM course_bookings
WHERE id = 8;`,
            expectRows: [{ count: 0 }]
          },
          {
            label: "其他報名紀錄仍保留",
            sql: `SELECT COUNT(*)::int AS count
FROM course_bookings;`,
            expectRows: [{ count: 9 }]
          }
        ]
      },
      {
        id: "w5-06-09",
        title: "新增一門有教練的課程",
        description: "新增一門 Beginner Boxing Lab：coach_id 4、branch Kaohsiung、capacity 10、price 800、starts_at 2026-07-20 19:00:00。",
        tags: ["INSERT", "外鍵"],
        type: "mutation",
        starterSql: `INSERT INTO courses (coach_id, title, branch, capacity, price, starts_at)
VALUES (9, 'Beginner Boxing Lab', 'Kaohsiung', 10, 800, '2026-07-20 19:00:00');`,
        hints: {
          direction: "coach_id 必須指向 coaches 裡存在的教練。請把 9 改成 4。",
          skeleton: `INSERT INTO courses (coach_id, title, branch, capacity, price, starts_at)
VALUES (教練 id, '課程名稱', '分館', 容量, 價格, '開始時間');`,
          answer: `INSERT INTO courses (coach_id, title, branch, capacity, price, starts_at)
VALUES (4, 'Beginner Boxing Lab', 'Kaohsiung', 10, 800, '2026-07-20 19:00:00');`
        },
        successMessage: "很好，你新增了一門能對回教練的課程。外鍵存在，資料才連得起來。",
        requires: ["INSERT"],
        checks: [
          {
            label: "Beginner Boxing Lab 已正確新增",
            sql: `SELECT coach_id, title, branch, capacity, price, starts_at::text AS starts_at
FROM courses
WHERE title = 'Beginner Boxing Lab';`,
            expectRows: [
              {
                coach_id: 4,
                title: "Beginner Boxing Lab",
                branch: "Kaohsiung",
                capacity: 10,
                price: 800,
                starts_at: "2026-07-20 19:00:00"
              }
            ]
          }
        ]
      },
      {
        id: "w5-06-10",
        title: "修正課程容量限制",
        description: "Deadlift Clinic 的 capacity 不能是 0。請把 title 是 Deadlift Clinic 的課程 capacity 改成 8。",
        tags: ["UPDATE", "constraint"],
        type: "mutation",
        starterSql: `UPDATE courses
SET capacity = 0
WHERE title = 'Deadlift Clinic';`,
        hints: {
          direction: "courses.capacity 有 constraint，必須大於 0。請把 capacity 改成任務指定的 8。",
          skeleton: `UPDATE courses
SET capacity = 新容量
WHERE title = '課程名稱';`,
          answer: `UPDATE courses
SET capacity = 8
WHERE title = 'Deadlift Clinic';`
        },
        successMessage: "很穩，你避開了 capacity > 0 的限制錯誤，也只修正了指定課程。",
        requires: ["UPDATE", "WHERE"],
        requiredPatterns: [
          {
            label: "這題要用課程名稱鎖定 Deadlift Clinic，請寫出 WHERE title = 'Deadlift Clinic'。",
            pattern: "\\bWHERE\\s+(?:courses\\.)?title\\s*=\\s*'Deadlift Clinic'",
            preserveStrings: true
          }
        ],
        checks: [
          {
            label: "Deadlift Clinic 容量已修正為 8",
            sql: `SELECT title, capacity
FROM courses
WHERE title = 'Deadlift Clinic';`,
            expectRows: [{ title: "Deadlift Clinic", capacity: 8 }]
          }
        ]
      }
    ]
  },
  {
    id: "postgres-functions",
    section: "postgres 函式",
    title: "07 postgres 函式：NULL、統計與 UUID",
    label: "W5-07",
    lead:
      "這一章開始把資料變成摘要。先處理 NULL，再用 DISTINCT、COUNT、SUM、AVG 看出資料的大方向。",
    mission:
      "LiveFit 開始要做後台摘要卡。海姐請你先把空值看懂，再做會員數、營收、平均價格和 UUID 格式練習。",
    coachLine:
      "函式不是魔法，先把它當成資料庫幫你算一下、整理一下。每題只放一個重點就好。",
    teaching:
      "NULL 代表沒有資料，不是空字串也不是 0。COALESCE 可以把 NULL 顯示成替代文字；DISTINCT 可以去重；COUNT、SUM、AVG 可以把多筆資料變成摘要。",
    syntax: `SELECT COUNT(*)::int AS member_count
FROM members;`,
    exercises: [
      {
        id: "w5-07-01",
        title: "找還沒有出貨時間的訂單",
        description: "回傳 order_no、customer_name、shipped_at，篩選 shipped_at 是 NULL 的訂單，依 id 排序。",
        tags: ["NULL", "WHERE"],
        type: "query",
        starterSql: `SELECT order_no, customer_name, shipped_at
FROM shop_orders
WHERE shipped_at = NULL;`,
        hints: {
          direction: "NULL 不能用 = 比較，要用 IS NULL。",
          skeleton: `SELECT order_no, customer_name, shipped_at
FROM shop_orders
WHERE shipped_at IS NULL
ORDER BY id;`,
          answer: `SELECT order_no, customer_name, shipped_at
FROM shop_orders
WHERE shipped_at IS NULL
ORDER BY id;`
        },
        successMessage: "很好，你用 IS NULL 找出還沒有出貨時間的訂單。",
        referenceSql: `SELECT order_no, customer_name, shipped_at
FROM shop_orders
WHERE shipped_at IS NULL
ORDER BY id;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "WHERE", "ORDER BY"],
        requiredPatterns: [{ label: "這題要練 IS NULL，請寫出 shipped_at IS NULL。", pattern: "shipped_at\\s+IS\\s+NULL" }],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-07-02",
        title: "把 NULL 顯示成尚未出貨",
        description: "回傳 order_no、ship_status。ship_status 請用 COALESCE，把 shipped_at 為 NULL 的資料顯示成 尚未出貨。只看 NW-1001、NW-1002。",
        tags: ["COALESCE", "NULL"],
        type: "query",
        starterSql: `SELECT order_no, shipped_at::text AS ship_status
FROM shop_orders
WHERE order_no IN ('NW-1001', 'NW-1002')
ORDER BY order_no;`,
        hints: {
          direction: "用 COALESCE(shipped_at::text, '尚未出貨') 幫 NULL 補上顯示文字。",
          skeleton: `SELECT order_no, COALESCE(欄位::text, '替代文字') AS ship_status
FROM shop_orders
WHERE order_no IN ('NW-1001', 'NW-1002')
ORDER BY order_no;`,
          answer: `SELECT order_no, COALESCE(shipped_at::text, '尚未出貨') AS ship_status
FROM shop_orders
WHERE order_no IN ('NW-1001', 'NW-1002')
ORDER BY order_no;`
        },
        successMessage: "漂亮，你用 COALESCE 讓空值在後台表格裡變得可讀。",
        referenceSql: `SELECT order_no, COALESCE(shipped_at::text, '尚未出貨') AS ship_status
FROM shop_orders
WHERE order_no IN ('NW-1001', 'NW-1002')
ORDER BY order_no;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "COALESCE", "WHERE", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-07-03",
        title: "列出會員城市不重複清單",
        description: "回傳 members 裡不重複的 city，依 city 排序。",
        tags: ["DISTINCT"],
        type: "query",
        starterSql: `SELECT city
FROM members
ORDER BY city;`,
        hints: {
          direction: "在 city 前面加 DISTINCT，就會把重複城市合併。",
          skeleton: `SELECT DISTINCT city
FROM members
ORDER BY city;`,
          answer: `SELECT DISTINCT city
FROM members
ORDER BY city;`
        },
        successMessage: "很好，你用 DISTINCT 做出城市去重清單。",
        referenceSql: `SELECT DISTINCT city
FROM members
ORDER BY city;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "DISTINCT", "ORDER BY"]
      },
      {
        id: "w5-07-04",
        title: "計算會員總數",
        description: "回傳 member_count，計算 members 共有幾筆資料。",
        tags: ["COUNT"],
        type: "query",
        starterSql: `SELECT *
FROM members;`,
        hints: {
          direction: "用 COUNT(*) 計算筆數，並用 ::int 讓結果是一般整數。",
          skeleton: `SELECT COUNT(*)::int AS member_count
FROM members;`,
          answer: `SELECT COUNT(*)::int AS member_count
FROM members;`
        },
        successMessage: "很好，你把會員清單變成一個總數摘要。",
        referenceSql: `SELECT COUNT(*)::int AS member_count
FROM members;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "COUNT"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-07-05",
        title: "計算 VIP 會員數",
        description: "回傳 vip_count，計算 level 是 VIP 的會員有幾位。",
        tags: ["COUNT", "WHERE"],
        type: "query",
        starterSql: `SELECT COUNT(*)::int AS vip_count
FROM members;`,
        hints: {
          direction: "COUNT 可以搭配 WHERE，先篩 level = 'VIP' 再計算筆數。",
          skeleton: `SELECT COUNT(*)::int AS vip_count
FROM members
WHERE level = 'VIP';`,
          answer: `SELECT COUNT(*)::int AS vip_count
FROM members
WHERE level = 'VIP';`
        },
        successMessage: "漂亮，你用 WHERE + COUNT 算出 VIP 會員數。",
        referenceSql: `SELECT COUNT(*)::int AS vip_count
FROM members
WHERE level = 'VIP';`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "COUNT", "WHERE"]
      },
      {
        id: "w5-07-06",
        title: "加總會員剩餘點數",
        description: "回傳 total_credits，加總 members.credits。",
        tags: ["SUM"],
        type: "query",
        starterSql: `SELECT credits
FROM members;`,
        hints: {
          direction: "用 SUM(credits) 把所有會員點數加起來。",
          skeleton: `SELECT SUM(credits)::int AS total_credits
FROM members;`,
          answer: `SELECT SUM(credits)::int AS total_credits
FROM members;`
        },
        successMessage: "很好，你用 SUM 算出會員剩餘點數總量。",
        referenceSql: `SELECT SUM(credits)::int AS total_credits
FROM members;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "SUM"]
      },
      {
        id: "w5-07-07",
        title: "計算課程平均價格",
        description: "回傳 average_price，計算 courses.price 平均值，四捨五入成整數。",
        tags: ["AVG"],
        type: "query",
        starterSql: `SELECT AVG(price) AS average_price
FROM courses;`,
        hints: {
          direction: "用 ROUND(AVG(price)) 再轉成 ::int，讓結果是整數。",
          skeleton: `SELECT ROUND(AVG(price))::int AS average_price
FROM courses;`,
          answer: `SELECT ROUND(AVG(price))::int AS average_price
FROM courses;`
        },
        successMessage: "很好，你用 AVG 算出課程平均價格，也練到把結果整理成整數。",
        referenceSql: `SELECT ROUND(AVG(price))::int AS average_price
FROM courses;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "AVG"]
      },
      {
        id: "w5-07-08",
        title: "加總已確認報名收入",
        description: "回傳 confirmed_revenue，加總 course_bookings 中 status 是 confirmed 的 paid_amount。",
        tags: ["SUM", "WHERE"],
        type: "query",
        starterSql: `SELECT SUM(paid_amount)::int AS confirmed_revenue
FROM course_bookings;`,
        hints: {
          direction: "先用 WHERE status = 'confirmed' 篩掉候補和取消，再加總 paid_amount。",
          skeleton: `SELECT SUM(paid_amount)::int AS confirmed_revenue
FROM course_bookings
WHERE status = 'confirmed';`,
          answer: `SELECT SUM(paid_amount)::int AS confirmed_revenue
FROM course_bookings
WHERE status = 'confirmed';`
        },
        successMessage: "漂亮，你把已確認報名收入算成一個摘要數字。",
        referenceSql: `SELECT SUM(paid_amount)::int AS confirmed_revenue
FROM course_bookings
WHERE status = 'confirmed';`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "SUM", "WHERE"]
      },
      {
        id: "w5-07-09",
        title: "計算會員城市數",
        description: "回傳 city_count，計算 members 裡不重複城市共有幾個。",
        tags: ["COUNT", "DISTINCT"],
        type: "query",
        starterSql: `SELECT COUNT(city)::int AS city_count
FROM members;`,
        hints: {
          direction: "把 COUNT(city) 改成 COUNT(DISTINCT city)。",
          skeleton: `SELECT COUNT(DISTINCT city)::int AS city_count
FROM members;`,
          answer: `SELECT COUNT(DISTINCT city)::int AS city_count
FROM members;`
        },
        successMessage: "很好，你把 COUNT 和 DISTINCT 組在一起，算出不重複城市數。",
        referenceSql: `SELECT COUNT(DISTINCT city)::int AS city_count
FROM members;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "COUNT", "DISTINCT"]
      },
      {
        id: "w5-07-10",
        title: "認識 UUID 格式",
        description: "把固定字串 550e8400-e29b-41d4-a716-446655440000 轉成 uuid 後再轉回 text，欄位命名為 sample_uuid。",
        tags: ["UUID", "型別轉換"],
        type: "query",
        starterSql: `SELECT '550e8400-e29b-41d4-a716-446655440000' AS sample_uuid;`,
        hints: {
          direction: "在字串後面加上 ::uuid::text，讓 PostgreSQL 先確認它是合法 UUID。",
          skeleton: `SELECT 'UUID 字串'::uuid::text AS sample_uuid;`,
          answer: `SELECT '550e8400-e29b-41d4-a716-446655440000'::uuid::text AS sample_uuid;`
        },
        successMessage: "很好，你讓 PostgreSQL 確認這段文字符合 UUID 格式。",
        referenceSql: `SELECT '550e8400-e29b-41d4-a716-446655440000'::uuid::text AS sample_uuid;`,
        compare: { order: true, columns: true },
        requires: ["SELECT"],
        requiredPatterns: [{ label: "這題要練 UUID 型別轉換，請使用 ::uuid。", pattern: "::uuid" }]
      }
    ]
  },
  {
    id: "join-relations",
    section: "JOIN 資料關聯",
    title: "08 JOIN：把拆開的資料表接回來",
    label: "W5-08",
    lead:
      "前面已經知道資料會拆成多張表，這一章開始用 JOIN 把人名、課程名、教練名接回任務需要的清單。",
    mission:
      "LiveFit 後台不能只顯示 member_id 或 coach_id。海姐請你用 JOIN 把 id 轉成看得懂的人名、課程名和教練名。",
    coachLine:
      "JOIN 的核心只有一句：左表某欄等於右表某欄。先把 ON 後面的連接條件看懂，其他慢慢來。",
    teaching:
      "INNER JOIN 只留下兩邊都有對到的資料；LEFT JOIN 會保留左表全部資料；RIGHT JOIN 會保留右表全部資料；FULL JOIN 會保留兩邊全部資料。",
    syntax: `SELECT courses.title, coaches.name AS coach_name
FROM courses
INNER JOIN coaches ON courses.coach_id = coaches.id;`,
    exercises: [
      {
        id: "w5-08-01",
        title: "課程接上教練姓名",
        description: "回傳 courses.id、courses.title、coach_name，使用 INNER JOIN 接 coaches，依 courses.id 排序。",
        tags: ["INNER JOIN"],
        type: "query",
        starterSql: `SELECT courses.id, courses.title
FROM courses;`,
        hints: {
          direction: "用 courses.coach_id = coaches.id 把課程接到教練。",
          skeleton: `SELECT courses.id, courses.title, coaches.name AS coach_name
FROM courses
INNER JOIN coaches ON courses.coach_id = coaches.id
ORDER BY courses.id;`,
          answer: `SELECT courses.id, courses.title, coaches.name AS coach_name
FROM courses
INNER JOIN coaches ON courses.coach_id = coaches.id
ORDER BY courses.id;`
        },
        successMessage: "很好，你把課程表的 coach_id 接回教練姓名了。",
        referenceSql: `SELECT courses.id, courses.title, coaches.name AS coach_name
FROM courses
INNER JOIN coaches ON courses.coach_id = coaches.id
ORDER BY courses.id;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "INNER JOIN", "ON", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-08-02",
        title: "報名紀錄接上會員姓名",
        description: "回傳報名 id、member_name、status，使用 INNER JOIN 接 members，依報名 id 排序，只取前 5 筆。",
        tags: ["INNER JOIN", "LIMIT"],
        type: "query",
        starterSql: `SELECT course_bookings.id, course_bookings.member_id, course_bookings.status
FROM course_bookings
ORDER BY course_bookings.id
LIMIT 5;`,
        hints: {
          direction: "用 course_bookings.member_id = members.id 接回會員姓名。",
          skeleton: `SELECT course_bookings.id, members.name AS member_name, course_bookings.status
FROM course_bookings
INNER JOIN members ON course_bookings.member_id = members.id
ORDER BY course_bookings.id
LIMIT 5;`,
          answer: `SELECT course_bookings.id, members.name AS member_name, course_bookings.status
FROM course_bookings
INNER JOIN members ON course_bookings.member_id = members.id
ORDER BY course_bookings.id
LIMIT 5;`
        },
        successMessage: "漂亮，報名紀錄不再只有 member_id，而是看得到會員姓名。",
        referenceSql: `SELECT course_bookings.id, members.name AS member_name, course_bookings.status
FROM course_bookings
INNER JOIN members ON course_bookings.member_id = members.id
ORDER BY course_bookings.id
LIMIT 5;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "INNER JOIN", "ON", "ORDER BY", "LIMIT"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-08-03",
        title: "已確認報名接上課程名稱",
        description: "回傳報名 id、course_title、paid_amount，接 courses，篩選 confirmed，依報名 id 排序，只取前 5 筆。",
        tags: ["INNER JOIN", "WHERE"],
        type: "query",
        starterSql: `SELECT course_bookings.id, course_bookings.course_id, course_bookings.paid_amount
FROM course_bookings
WHERE status = 'confirmed'
ORDER BY id
LIMIT 5;`,
        hints: {
          direction: "用 course_bookings.course_id = courses.id 接課程名稱。",
          skeleton: `SELECT course_bookings.id, courses.title AS course_title, course_bookings.paid_amount
FROM course_bookings
INNER JOIN courses ON course_bookings.course_id = courses.id
WHERE course_bookings.status = 'confirmed'
ORDER BY course_bookings.id
LIMIT 5;`,
          answer: `SELECT course_bookings.id, courses.title AS course_title, course_bookings.paid_amount
FROM course_bookings
INNER JOIN courses ON course_bookings.course_id = courses.id
WHERE course_bookings.status = 'confirmed'
ORDER BY course_bookings.id
LIMIT 5;`
        },
        successMessage: "很好，你把報名紀錄接到課程名稱，後台表格更像人看的資料了。",
        referenceSql: `SELECT course_bookings.id, courses.title AS course_title, course_bookings.paid_amount
FROM course_bookings
INNER JOIN courses ON course_bookings.course_id = courses.id
WHERE course_bookings.status = 'confirmed'
ORDER BY course_bookings.id
LIMIT 5;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "INNER JOIN", "ON", "WHERE", "ORDER BY", "LIMIT"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-08-04",
        title: "LEFT JOIN 看沒有報名的課程",
        description: "保留 courses 左表，回傳 courses.id、courses.title、course_bookings.status，只看 courses.id 是 4 或 6，依 courses.id、course_bookings.id 排序。",
        tags: ["LEFT JOIN"],
        type: "query",
        starterSql: `SELECT courses.id, courses.title
FROM courses
WHERE courses.id IN (4, 6)
ORDER BY courses.id;`,
        hints: {
          direction: "LEFT JOIN 會保留 courses，即使某門課沒有報名紀錄也會出現。",
          skeleton: `SELECT courses.id, courses.title, course_bookings.status
FROM courses
LEFT JOIN course_bookings ON courses.id = course_bookings.course_id
WHERE courses.id IN (4, 6)
ORDER BY courses.id, course_bookings.id;`,
          answer: `SELECT courses.id, courses.title, course_bookings.status
FROM courses
LEFT JOIN course_bookings ON courses.id = course_bookings.course_id
WHERE courses.id IN (4, 6)
ORDER BY courses.id, course_bookings.id;`
        },
        successMessage: "很好，你用 LEFT JOIN 看見沒有報名紀錄的課程仍會被保留下來。",
        referenceSql: `SELECT courses.id, courses.title, course_bookings.status
FROM courses
LEFT JOIN course_bookings ON courses.id = course_bookings.course_id
WHERE courses.id IN (4, 6)
ORDER BY courses.id, course_bookings.id;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "LEFT JOIN", "ON", "WHERE", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-08-05",
        title: "LEFT JOIN 搭配 COALESCE",
        description: "回傳 courses.id、courses.title、booking_status，只看 course id 6。若沒有報名狀態，用 COALESCE 顯示 尚無報名。",
        tags: ["LEFT JOIN", "COALESCE"],
        type: "query",
        starterSql: `SELECT courses.id, courses.title, course_bookings.status AS booking_status
FROM courses
LEFT JOIN course_bookings ON courses.id = course_bookings.course_id
WHERE courses.id = 6;`,
        hints: {
          direction: "把 course_bookings.status 包進 COALESCE，替 NULL 補文字。",
          skeleton: `SELECT courses.id, courses.title, COALESCE(course_bookings.status, '尚無報名') AS booking_status
FROM courses
LEFT JOIN course_bookings ON courses.id = course_bookings.course_id
WHERE courses.id = 6;`,
          answer: `SELECT courses.id, courses.title, COALESCE(course_bookings.status, '尚無報名') AS booking_status
FROM courses
LEFT JOIN course_bookings ON courses.id = course_bookings.course_id
WHERE courses.id = 6;`
        },
        successMessage: "漂亮，你把 LEFT JOIN 產生的 NULL 轉成使用者看得懂的文字。",
        referenceSql: `SELECT courses.id, courses.title, COALESCE(course_bookings.status, '尚無報名') AS booking_status
FROM courses
LEFT JOIN course_bookings ON courses.id = course_bookings.course_id
WHERE courses.id = 6;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "LEFT JOIN", "ON", "COALESCE", "WHERE"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-08-06",
        title: "RIGHT JOIN 保留教練清單",
        description: "回傳 coach_name、course_title，使用 RIGHT JOIN 讓 coaches 保留在右表，依 coaches.id、courses.id 排序。",
        tags: ["RIGHT JOIN"],
        type: "query",
        starterSql: `SELECT coaches.name AS coach_name, courses.title AS course_title
FROM courses
INNER JOIN coaches ON courses.coach_id = coaches.id
ORDER BY coaches.id, courses.id;`,
        hints: {
          direction: "把 INNER JOIN 改成 RIGHT JOIN，保留右邊 coaches。",
          skeleton: `SELECT coaches.name AS coach_name, courses.title AS course_title
FROM courses
RIGHT JOIN coaches ON courses.coach_id = coaches.id
ORDER BY coaches.id, courses.id;`,
          answer: `SELECT coaches.name AS coach_name, courses.title AS course_title
FROM courses
RIGHT JOIN coaches ON courses.coach_id = coaches.id
ORDER BY coaches.id, courses.id;`
        },
        successMessage: "很好，你練到 RIGHT JOIN 的方向感：右表 coaches 會被保留，所以 Ella 沒有課程也會出現在結果裡。",
        referenceSql: `SELECT coaches.name AS coach_name, courses.title AS course_title
FROM courses
RIGHT JOIN coaches ON courses.coach_id = coaches.id
ORDER BY coaches.id, courses.id;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "RIGHT JOIN", "ON", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-08-07",
        title: "FULL JOIN 看兩邊都保留",
        description: "回傳 member_name、order_no，使用 FULL JOIN 用 city 對照 members 和 shop_orders，只看會員 Tina 或訂單 NW-1008，依 member_name、order_no 排序。",
        tags: ["FULL JOIN"],
        type: "query",
        starterSql: `SELECT members.name AS member_name, shop_orders.order_no
FROM members
LEFT JOIN shop_orders ON members.city = shop_orders.city
WHERE members.name = 'Tina' OR shop_orders.order_no = 'NW-1008'
ORDER BY member_name NULLS LAST, shop_orders.order_no;`,
        hints: {
          direction: "把 LEFT JOIN 改成 FULL JOIN。Tina 沒有同城市訂單，NW-1008 也沒有同城市會員，兩邊都要保留下來。",
          skeleton: `SELECT members.name AS member_name, shop_orders.order_no
FROM members
FULL JOIN shop_orders ON members.city = shop_orders.city
WHERE members.name = 'Tina' OR shop_orders.order_no = 'NW-1008'
ORDER BY member_name NULLS LAST, shop_orders.order_no;`,
          answer: `SELECT members.name AS member_name, shop_orders.order_no
FROM members
FULL JOIN shop_orders ON members.city = shop_orders.city
WHERE members.name = 'Tina' OR shop_orders.order_no = 'NW-1008'
ORDER BY member_name NULLS LAST, shop_orders.order_no;`
        },
        successMessage: "很好，你看到 FULL JOIN 真的把兩邊沒有匹配到的資料都留下來了。",
        referenceSql: `SELECT members.name AS member_name, shop_orders.order_no
FROM members
FULL JOIN shop_orders ON members.city = shop_orders.city
WHERE members.name = 'Tina' OR shop_orders.order_no = 'NW-1008'
ORDER BY member_name NULLS LAST, shop_orders.order_no;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "FULL JOIN", "ON", "WHERE", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-08-08",
        title: "使用別名簡化 JOIN",
        description: "使用 c 和 co 當別名，回傳 c.title、coach_name。查詢 Taipei 分館課程，依 c.id 排序。",
        tags: ["JOIN", "AS 別名"],
        type: "query",
        starterSql: `SELECT courses.title, coaches.name AS coach_name
FROM courses
INNER JOIN coaches ON courses.coach_id = coaches.id
WHERE courses.branch = 'Taipei'
ORDER BY courses.id;`,
        hints: {
          direction: "把 courses 改成 AS c，coaches 改成 AS co，後面都用別名。",
          skeleton: `SELECT c.title, co.name AS coach_name
FROM courses AS c
INNER JOIN coaches AS co ON c.coach_id = co.id
WHERE c.branch = 'Taipei'
ORDER BY c.id;`,
          answer: `SELECT c.title, co.name AS coach_name
FROM courses AS c
INNER JOIN coaches AS co ON c.coach_id = co.id
WHERE c.branch = 'Taipei'
ORDER BY c.id;`
        },
        successMessage: "漂亮，你用別名讓 JOIN 查詢短很多。",
        referenceSql: `SELECT c.title, co.name AS coach_name
FROM courses AS c
INNER JOIN coaches AS co ON c.coach_id = co.id
WHERE c.branch = 'Taipei'
ORDER BY c.id;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "INNER JOIN", "ON", "WHERE", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-08-09",
        title: "三張表接出一筆報名",
        description: "用 course_bookings、members、courses 三張表，回傳 booking_id、member_name、course_title，只查 booking id 9。",
        tags: ["多表 JOIN"],
        type: "query",
        starterSql: `SELECT b.id AS booking_id, b.member_id, b.course_id
FROM course_bookings AS b
WHERE b.id = 9;`,
        hints: {
          direction: "先把 b.member_id 接 members，再把 b.course_id 接 courses。",
          skeleton: `SELECT b.id AS booking_id, m.name AS member_name, c.title AS course_title
FROM course_bookings AS b
INNER JOIN members AS m ON b.member_id = m.id
INNER JOIN courses AS c ON b.course_id = c.id
WHERE b.id = 9;`,
          answer: `SELECT b.id AS booking_id, m.name AS member_name, c.title AS course_title
FROM course_bookings AS b
INNER JOIN members AS m ON b.member_id = m.id
INNER JOIN courses AS c ON b.course_id = c.id
WHERE b.id = 9;`
        },
        successMessage: "很好，你完成三張表 JOIN，把一筆報名轉成可讀的會員和課程資訊。",
        referenceSql: `SELECT b.id AS booking_id, m.name AS member_name, c.title AS course_title
FROM course_bookings AS b
INNER JOIN members AS m ON b.member_id = m.id
INNER JOIN courses AS c ON b.course_id = c.id
WHERE b.id = 9;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "INNER JOIN", "ON", "WHERE"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-08-10",
        title: "JOIN 查出教練課程時段",
        description: "回傳 coach_name、course_title、starts_at，查 Ben 教練的課程，依 starts_at 排序。",
        tags: ["JOIN", "WHERE"],
        type: "query",
        starterSql: `SELECT coaches.name AS coach_name, courses.title AS course_title, courses.starts_at
FROM courses
INNER JOIN coaches ON courses.coach_id = coaches.id
ORDER BY courses.starts_at;`,
        hints: {
          direction: "加上 WHERE coaches.name = 'Ben'，只看 Ben 的課程。",
          skeleton: `SELECT coaches.name AS coach_name, courses.title AS course_title, courses.starts_at
FROM courses
INNER JOIN coaches ON courses.coach_id = coaches.id
WHERE coaches.name = 'Ben'
ORDER BY courses.starts_at;`,
          answer: `SELECT coaches.name AS coach_name, courses.title AS course_title, courses.starts_at
FROM courses
INNER JOIN coaches ON courses.coach_id = coaches.id
WHERE coaches.name = 'Ben'
ORDER BY courses.starts_at;`
        },
        successMessage: "漂亮，你用 JOIN 查出指定教練的課程時段。",
        referenceSql: `SELECT coaches.name AS coach_name, courses.title AS course_title, courses.starts_at
FROM courses
INNER JOIN coaches ON courses.coach_id = coaches.id
WHERE coaches.name = 'Ben'
ORDER BY courses.starts_at;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "INNER JOIN", "ON", "WHERE", "ORDER BY"],
        forbidden: ["SELECT *"]
      }
    ]
  },
  {
    id: "group-aggregation",
    section: "group by 分組資料",
    title: "09 GROUP BY：把資料分組成報表",
    label: "W5-09",
    lead:
      "GROUP BY 會把很多列資料依照某個欄位分組，再用 COUNT、SUM、AVG 做摘要。",
    mission:
      "LiveFit 後台開始需要報表：各城市會員數、各狀態報名數、各分館收入。海姐請你用 GROUP BY 做第一批摘要。",
    coachLine:
      "GROUP BY 的心法是：SELECT 裡沒被函式包起來的欄位，通常就要放進 GROUP BY。",
    teaching:
      "COUNT 算筆數，SUM 算總和，AVG 算平均。GROUP BY 會決定要依照哪個欄位分組，HAVING 則是在分組後篩選群組。",
    syntax: `SELECT city, COUNT(*)::int AS member_count
FROM members
GROUP BY city;`,
    exercises: [
      {
        id: "w5-09-01",
        title: "各城市會員數",
        description: "回傳 city、member_count，依 city 分組並排序。",
        tags: ["GROUP BY", "COUNT"],
        type: "query",
        starterSql: `SELECT city
FROM members
ORDER BY city;`,
        hints: {
          direction: "加上 COUNT(*)，並用 GROUP BY city。",
          skeleton: `SELECT city, COUNT(*)::int AS member_count
FROM members
GROUP BY city
ORDER BY city;`,
          answer: `SELECT city, COUNT(*)::int AS member_count
FROM members
GROUP BY city
ORDER BY city;`
        },
        successMessage: "很好，你做出各城市會員數報表。",
        referenceSql: `SELECT city, COUNT(*)::int AS member_count
FROM members
GROUP BY city
ORDER BY city;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "COUNT", "GROUP BY", "ORDER BY"]
      },
      {
        id: "w5-09-02",
        title: "各會員等級剩餘點數",
        description: "回傳 level、total_credits，依 level 分組加總 credits，依 level 排序。",
        tags: ["GROUP BY", "SUM"],
        type: "query",
        starterSql: `SELECT level, credits
FROM members
ORDER BY level;`,
        hints: {
          direction: "credits 要用 SUM，level 要放進 GROUP BY。",
          skeleton: `SELECT level, SUM(credits)::int AS total_credits
FROM members
GROUP BY level
ORDER BY level;`,
          answer: `SELECT level, SUM(credits)::int AS total_credits
FROM members
GROUP BY level
ORDER BY level;`
        },
        successMessage: "漂亮，你把會員等級整理成點數總量摘要。",
        referenceSql: `SELECT level, SUM(credits)::int AS total_credits
FROM members
GROUP BY level
ORDER BY level;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "SUM", "GROUP BY", "ORDER BY"]
      },
      {
        id: "w5-09-03",
        title: "各報名狀態筆數",
        description: "回傳 status、booking_count，統計 course_bookings 各狀態筆數，依 status 排序。",
        tags: ["GROUP BY", "COUNT"],
        type: "query",
        starterSql: `SELECT status
FROM course_bookings
ORDER BY status;`,
        hints: {
          direction: "依 status 分組，計算每組 COUNT(*)。",
          skeleton: `SELECT status, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY status
ORDER BY status;`,
          answer: `SELECT status, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY status
ORDER BY status;`
        },
        successMessage: "很好，你做出各報名狀態的筆數摘要。",
        referenceSql: `SELECT status, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY status
ORDER BY status;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "COUNT", "GROUP BY", "ORDER BY"]
      },
      {
        id: "w5-09-04",
        title: "各課程已確認收入",
        description: "回傳 course_id、confirmed_revenue，只加總 confirmed 報名，依 course_id 排序。",
        tags: ["GROUP BY", "SUM", "WHERE"],
        type: "query",
        starterSql: `SELECT course_id, paid_amount
FROM course_bookings
WHERE status = 'confirmed'
ORDER BY course_id;`,
        hints: {
          direction: "paid_amount 要用 SUM，course_id 要 GROUP BY。",
          skeleton: `SELECT course_id, SUM(paid_amount)::int AS confirmed_revenue
FROM course_bookings
WHERE status = 'confirmed'
GROUP BY course_id
ORDER BY course_id;`,
          answer: `SELECT course_id, SUM(paid_amount)::int AS confirmed_revenue
FROM course_bookings
WHERE status = 'confirmed'
GROUP BY course_id
ORDER BY course_id;`
        },
        successMessage: "漂亮，你做出各課程已確認收入摘要。",
        referenceSql: `SELECT course_id, SUM(paid_amount)::int AS confirmed_revenue
FROM course_bookings
WHERE status = 'confirmed'
GROUP BY course_id
ORDER BY course_id;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "SUM", "WHERE", "GROUP BY", "ORDER BY"]
      },
      {
        id: "w5-09-05",
        title: "各分館平均課程價格",
        description: "回傳 branch、average_price，依 branch 分組，平均 price 四捨五入成整數，依 branch 排序。",
        tags: ["GROUP BY", "AVG"],
        type: "query",
        starterSql: `SELECT branch, price
FROM courses
ORDER BY branch;`,
        hints: {
          direction: "用 ROUND(AVG(price))::int 算每個分館平均價格。",
          skeleton: `SELECT branch, ROUND(AVG(price))::int AS average_price
FROM courses
GROUP BY branch
ORDER BY branch;`,
          answer: `SELECT branch, ROUND(AVG(price))::int AS average_price
FROM courses
GROUP BY branch
ORDER BY branch;`
        },
        successMessage: "很好，你用 GROUP BY + AVG 做出分館平均價格。",
        referenceSql: `SELECT branch, ROUND(AVG(price))::int AS average_price
FROM courses
GROUP BY branch
ORDER BY branch;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "AVG", "GROUP BY", "ORDER BY"]
      },
      {
        id: "w5-09-06",
        title: "各教練課程數",
        description: "回傳 coach_name、course_count。用 LEFT JOIN 保留所有教練，依 coach_name 排序。",
        tags: ["GROUP BY", "LEFT JOIN"],
        type: "query",
        starterSql: `SELECT coaches.name AS coach_name, courses.id
FROM coaches
LEFT JOIN courses ON coaches.id = courses.coach_id;`,
        hints: {
          direction: "用 COUNT(courses.id) 計算每位教練有幾門課，並依教練姓名分組。",
          skeleton: `SELECT coaches.name AS coach_name, COUNT(courses.id)::int AS course_count
FROM coaches
LEFT JOIN courses ON coaches.id = courses.coach_id
GROUP BY coaches.name
ORDER BY coaches.name;`,
          answer: `SELECT coaches.name AS coach_name, COUNT(courses.id)::int AS course_count
FROM coaches
LEFT JOIN courses ON coaches.id = courses.coach_id
GROUP BY coaches.name
ORDER BY coaches.name;`
        },
        successMessage: "漂亮，你把 JOIN 和 GROUP BY 組成教練課程數報表。",
        referenceSql: `SELECT coaches.name AS coach_name, COUNT(courses.id)::int AS course_count
FROM coaches
LEFT JOIN courses ON coaches.id = courses.coach_id
GROUP BY coaches.name
ORDER BY coaches.name;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "COUNT", "LEFT JOIN", "ON", "GROUP BY", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-09-07",
        title: "各分館已確認收入",
        description: "用 courses 接 course_bookings，回傳 branch、confirmed_revenue，只加總 confirmed，依 branch 排序。",
        tags: ["GROUP BY", "JOIN", "SUM"],
        type: "query",
        starterSql: `SELECT courses.branch, course_bookings.paid_amount
FROM courses
INNER JOIN course_bookings ON courses.id = course_bookings.course_id
WHERE course_bookings.status = 'confirmed';`,
        hints: {
          direction: "依 courses.branch 分組，SUM course_bookings.paid_amount。",
          skeleton: `SELECT courses.branch, SUM(course_bookings.paid_amount)::int AS confirmed_revenue
FROM courses
INNER JOIN course_bookings ON courses.id = course_bookings.course_id
WHERE course_bookings.status = 'confirmed'
GROUP BY courses.branch
ORDER BY courses.branch;`,
          answer: `SELECT courses.branch, SUM(course_bookings.paid_amount)::int AS confirmed_revenue
FROM courses
INNER JOIN course_bookings ON courses.id = course_bookings.course_id
WHERE course_bookings.status = 'confirmed'
GROUP BY courses.branch
ORDER BY courses.branch;`
        },
        successMessage: "很好，你用 JOIN + GROUP BY 做出分館收入報表。",
        referenceSql: `SELECT courses.branch, SUM(course_bookings.paid_amount)::int AS confirmed_revenue
FROM courses
INNER JOIN course_bookings ON courses.id = course_bookings.course_id
WHERE course_bookings.status = 'confirmed'
GROUP BY courses.branch
ORDER BY courses.branch;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "SUM", "INNER JOIN", "ON", "WHERE", "GROUP BY", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-09-08",
        title: "找報名數至少 2 筆的課程",
        description: "回傳 course_id、booking_count，依 course_id 分組，使用 HAVING 篩出 COUNT(*) >= 2，依 course_id 排序。",
        tags: ["GROUP BY", "HAVING"],
        type: "query",
        starterSql: `SELECT course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY course_id
ORDER BY course_id;`,
        hints: {
          direction: "HAVING 是分組後的篩選，放在 GROUP BY 後面。",
          skeleton: `SELECT course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY course_id
HAVING COUNT(*) >= 2
ORDER BY course_id;`,
          answer: `SELECT course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY course_id
HAVING COUNT(*) >= 2
ORDER BY course_id;`
        },
        successMessage: "漂亮，你用 HAVING 篩出報名數達標的課程群組。",
        referenceSql: `SELECT course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY course_id
HAVING COUNT(*) >= 2
ORDER BY course_id;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "COUNT", "GROUP BY", "HAVING", "ORDER BY"]
      },
      {
        id: "w5-09-09",
        title: "各訂單狀態金額摘要",
        description: "回傳 status、order_count、total_amount，統計 shop_orders 各狀態訂單數與金額總和，依 status 排序。",
        tags: ["GROUP BY", "SUM"],
        type: "query",
        starterSql: `SELECT status, total_amount
FROM shop_orders
ORDER BY status;`,
        hints: {
          direction: "依 status 分組，COUNT 筆數，SUM total_amount。",
          skeleton: `SELECT status, COUNT(*)::int AS order_count, SUM(total_amount)::text AS total_amount
FROM shop_orders
GROUP BY status
ORDER BY status;`,
          answer: `SELECT status, COUNT(*)::int AS order_count, SUM(total_amount)::text AS total_amount
FROM shop_orders
GROUP BY status
ORDER BY status;`
        },
        successMessage: "很好，你做出訂單狀態的數量與金額摘要。",
        referenceSql: `SELECT status, COUNT(*)::int AS order_count, SUM(total_amount)::text AS total_amount
FROM shop_orders
GROUP BY status
ORDER BY status;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "COUNT", "SUM", "GROUP BY", "ORDER BY"]
      },
      {
        id: "w5-09-10",
        title: "各城市電商訂單數",
        description: "回傳 city、order_count，統計 shop_orders 各城市訂單數，只顯示訂單數至少 2 筆的城市，依 city 排序。",
        tags: ["GROUP BY", "HAVING"],
        type: "query",
        starterSql: `SELECT city, COUNT(*)::int AS order_count
FROM shop_orders
GROUP BY city
ORDER BY city;`,
        hints: {
          direction: "加上 HAVING COUNT(*) >= 2，只保留訂單數至少 2 筆的城市。",
          skeleton: `SELECT city, COUNT(*)::int AS order_count
FROM shop_orders
GROUP BY city
HAVING COUNT(*) >= 2
ORDER BY city;`,
          answer: `SELECT city, COUNT(*)::int AS order_count
FROM shop_orders
GROUP BY city
HAVING COUNT(*) >= 2
ORDER BY city;`
        },
        successMessage: "漂亮，你用 HAVING 篩出訂單較多的城市。",
        referenceSql: `SELECT city, COUNT(*)::int AS order_count
FROM shop_orders
GROUP BY city
HAVING COUNT(*) >= 2
ORDER BY city;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "COUNT", "GROUP BY", "HAVING", "ORDER BY"]
      }
    ]
  },
  {
    id: "subquery-practice",
    section: "子查詢",
    title: "10 子查詢：先查一段，再拿來當條件",
    label: "W5-10",
    lead:
      "子查詢就是把一段 SELECT 放進另一段 SQL 裡。先從 WHERE 子查詢開始，慢慢看懂資料庫如何分兩步回答問題。",
    mission:
      "海姐開始問比較像後台分析的問題：高於平均值、沒有報名、某堂課的報名者。你要用子查詢把答案挖出來。",
    coachLine:
      "子查詢看起來長，但可以先讀括號裡面。括號裡先算出條件，外面的查詢再使用這個條件。",
    teaching:
      "常見子查詢會出現在 WHERE 裡，例如 IN、EXISTS、NOT EXISTS、= (SELECT ...)。也可以放在 SELECT 裡，幫每列資料多算一個摘要。",
    syntax: `SELECT name, credits
FROM members
WHERE credits > (SELECT AVG(credits) FROM members);`,
    exercises: [
      {
        id: "w5-10-01",
        title: "找點數高於平均的會員",
        description: "回傳 name、credits，篩選 credits 大於全體平均 credits，依 credits 由大到小排序。",
        tags: ["WHERE 子查詢", "AVG"],
        type: "query",
        starterSql: `SELECT name, credits
FROM members
ORDER BY credits DESC;`,
        hints: {
          direction: "把平均值放進子查詢：(SELECT AVG(credits) FROM members)。",
          skeleton: `SELECT name, credits
FROM members
WHERE credits > (SELECT AVG(credits) FROM members)
ORDER BY credits DESC;`,
          answer: `SELECT name, credits
FROM members
WHERE credits > (SELECT AVG(credits) FROM members)
ORDER BY credits DESC;`
        },
        successMessage: "很好，你用子查詢找出高於平均點數的會員。",
        referenceSql: `SELECT name, credits
FROM members
WHERE credits > (SELECT AVG(credits) FROM members)
ORDER BY credits DESC;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "WHERE", "ORDER BY"],
        requiredPatterns: [{ label: "這題要練子查詢，請在條件中放入 (SELECT ...)。", pattern: "\\(\\s*SELECT" }],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-10-02",
        title: "找價格高於平均的課程",
        description: "回傳 title、price，篩選 price 大於全課程平均 price，依 price 由大到小排序。",
        tags: ["WHERE 子查詢", "AVG"],
        type: "query",
        starterSql: `SELECT title, price
FROM courses
ORDER BY price DESC;`,
        hints: {
          direction: "用子查詢先算 courses 的平均 price。",
          skeleton: `SELECT title, price
FROM courses
WHERE price > (SELECT AVG(price) FROM courses)
ORDER BY price DESC;`,
          answer: `SELECT title, price
FROM courses
WHERE price > (SELECT AVG(price) FROM courses)
ORDER BY price DESC;`
        },
        successMessage: "漂亮，你用平均價格子查詢找出較高價課程。",
        referenceSql: `SELECT title, price
FROM courses
WHERE price > (SELECT AVG(price) FROM courses)
ORDER BY price DESC;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "WHERE", "ORDER BY"],
        requiredPatterns: [{ label: "這題要練子查詢，請在條件中放入 (SELECT ...)。", pattern: "\\(\\s*SELECT" }],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-10-03",
        title: "找有已確認報名的會員",
        description: "回傳 name，使用 EXISTS 找出至少有一筆 confirmed 報名的會員，依 name 排序。",
        tags: ["EXISTS"],
        type: "query",
        starterSql: `SELECT name
FROM members
ORDER BY name;`,
        hints: {
          direction: "EXISTS 會檢查括號裡是否查得到資料。",
          skeleton: `SELECT name
FROM members
WHERE EXISTS (
  SELECT 1
  FROM course_bookings
  WHERE course_bookings.member_id = members.id
    AND course_bookings.status = 'confirmed'
)
ORDER BY name;`,
          answer: `SELECT name
FROM members
WHERE EXISTS (
  SELECT 1
  FROM course_bookings
  WHERE course_bookings.member_id = members.id
    AND course_bookings.status = 'confirmed'
)
ORDER BY name;`
        },
        successMessage: "很好，你用 EXISTS 找出有已確認報名的會員。",
        referenceSql: `SELECT name
FROM members
WHERE EXISTS (
  SELECT 1
  FROM course_bookings
  WHERE course_bookings.member_id = members.id
    AND course_bookings.status = 'confirmed'
)
ORDER BY name;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "WHERE", "EXISTS", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-10-04",
        title: "找沒有報名的課程",
        description: "回傳 id、title，使用 NOT EXISTS 找出沒有任何報名紀錄的課程，依 id 排序。",
        tags: ["NOT EXISTS"],
        type: "query",
        starterSql: `SELECT id, title
FROM courses
ORDER BY id;`,
        hints: {
          direction: "NOT EXISTS 可以找出子查詢查不到資料的課程。",
          skeleton: `SELECT id, title
FROM courses
WHERE NOT EXISTS (
  SELECT 1
  FROM course_bookings
  WHERE course_bookings.course_id = courses.id
)
ORDER BY id;`,
          answer: `SELECT id, title
FROM courses
WHERE NOT EXISTS (
  SELECT 1
  FROM course_bookings
  WHERE course_bookings.course_id = courses.id
)
ORDER BY id;`
        },
        successMessage: "漂亮，你用 NOT EXISTS 找出還沒有報名紀錄的課程。",
        referenceSql: `SELECT id, title
FROM courses
WHERE NOT EXISTS (
  SELECT 1
  FROM course_bookings
  WHERE course_bookings.course_id = courses.id
)
ORDER BY id;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "WHERE", "NOT EXISTS", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-10-05",
        title: "找有候補的課程",
        description: "回傳 id、title，使用 IN 子查詢找出出現在 waitlist 報名紀錄裡的課程，依 id 排序。",
        tags: ["IN 子查詢"],
        type: "query",
        starterSql: `SELECT id, title
FROM courses
ORDER BY id;`,
        hints: {
          direction: "子查詢先找出 status = 'waitlist' 的 course_id。",
          skeleton: `SELECT id, title
FROM courses
WHERE id IN (
  SELECT course_id
  FROM course_bookings
  WHERE status = 'waitlist'
)
ORDER BY id;`,
          answer: `SELECT id, title
FROM courses
WHERE id IN (
  SELECT course_id
  FROM course_bookings
  WHERE status = 'waitlist'
)
ORDER BY id;`
        },
        successMessage: "很好，你用 IN 子查詢找出有候補的課程。",
        referenceSql: `SELECT id, title
FROM courses
WHERE id IN (
  SELECT course_id
  FROM course_bookings
  WHERE status = 'waitlist'
)
ORDER BY id;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "WHERE", "IN", "ORDER BY"],
        requiredPatterns: [{ label: "這題要練 IN 子查詢，請在 IN 裡放入 SELECT。", pattern: "IN\\s*\\(\\s*SELECT" }],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-10-06",
        title: "找報名 Deadlift Clinic 的會員",
        description: "回傳 name，使用子查詢找出 title 是 Deadlift Clinic 的 course id，再查該課程的報名會員，依 name 排序。",
        tags: ["子查詢", "JOIN"],
        type: "query",
        starterSql: `SELECT members.name
FROM members
INNER JOIN course_bookings ON members.id = course_bookings.member_id
ORDER BY members.name;`,
        hints: {
          direction: "WHERE course_bookings.course_id = (SELECT id FROM courses WHERE title = 'Deadlift Clinic')。",
          skeleton: `SELECT members.name
FROM members
INNER JOIN course_bookings ON members.id = course_bookings.member_id
WHERE course_bookings.course_id = (
  SELECT id
  FROM courses
  WHERE title = 'Deadlift Clinic'
)
ORDER BY members.name;`,
          answer: `SELECT members.name
FROM members
INNER JOIN course_bookings ON members.id = course_bookings.member_id
WHERE course_bookings.course_id = (
  SELECT id
  FROM courses
  WHERE title = 'Deadlift Clinic'
)
ORDER BY members.name;`
        },
        successMessage: "漂亮，你用子查詢找到指定課程，再接會員表顯示姓名。",
        referenceSql: `SELECT members.name
FROM members
INNER JOIN course_bookings ON members.id = course_bookings.member_id
WHERE course_bookings.course_id = (
  SELECT id
  FROM courses
  WHERE title = 'Deadlift Clinic'
)
ORDER BY members.name;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "INNER JOIN", "ON", "WHERE", "ORDER BY"],
        requiredPatterns: [{ label: "這題要用子查詢找 Deadlift Clinic 的 id。", pattern: "\\(\\s*SELECT\\s+id\\s+FROM\\s+courses" }],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-10-07",
        title: "查最貴課程",
        description: "回傳 title、price，使用子查詢找 price 等於 courses 最高 price 的課程。",
        tags: ["MAX", "子查詢"],
        type: "query",
        starterSql: `SELECT title, price
FROM courses
ORDER BY price DESC
LIMIT 1;`,
        hints: {
          direction: "用 WHERE price = (SELECT MAX(price) FROM courses)。",
          skeleton: `SELECT title, price
FROM courses
WHERE price = (SELECT MAX(price) FROM courses);`,
          answer: `SELECT title, price
FROM courses
WHERE price = (SELECT MAX(price) FROM courses);`
        },
        successMessage: "很好，你用 MAX 子查詢找出最貴課程。",
        referenceSql: `SELECT title, price
FROM courses
WHERE price = (SELECT MAX(price) FROM courses);`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "WHERE"],
        requiredPatterns: [{ label: "這題要用 MAX 子查詢。", pattern: "\\(\\s*SELECT\\s+MAX\\(" }],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-10-08",
        title: "每門課旁邊顯示報名數",
        description: "回傳 title、booking_count。booking_count 用 SELECT 裡的子查詢計算每門課的報名數，依 title 排序。",
        tags: ["SELECT 子查詢"],
        type: "query",
        starterSql: `SELECT title
FROM courses
ORDER BY title;`,
        hints: {
          direction: "在 SELECT 後面加一個括號子查詢，依目前 courses.id 計算報名數。",
          skeleton: `SELECT title,
  (
    SELECT COUNT(*)::int
    FROM course_bookings
    WHERE course_bookings.course_id = courses.id
  ) AS booking_count
FROM courses
ORDER BY title;`,
          answer: `SELECT title,
  (
    SELECT COUNT(*)::int
    FROM course_bookings
    WHERE course_bookings.course_id = courses.id
  ) AS booking_count
FROM courses
ORDER BY title;`
        },
        successMessage: "漂亮，你在 SELECT 裡放子查詢，替每門課算出自己的報名數。",
        referenceSql: `SELECT title,
  (
    SELECT COUNT(*)::int
    FROM course_bookings
    WHERE course_bookings.course_id = courses.id
  ) AS booking_count
FROM courses
ORDER BY title;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "COUNT", "WHERE", "ORDER BY"],
        requiredPatterns: [{ label: "這題要在 SELECT 欄位中使用子查詢。", pattern: "SELECT[\\s\\S]*\\(\\s*SELECT" }],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-10-09",
        title: "找比所有 Basic 會員點數都高的會員",
        description: "回傳 name、credits，找 credits 大於 Basic 會員最高 credits 的會員，依 credits 由大到小排序。",
        tags: ["MAX", "子查詢"],
        type: "query",
        starterSql: `SELECT name, credits
FROM members
ORDER BY credits DESC;`,
        hints: {
          direction: "子查詢先找出 Basic 會員最高 credits。",
          skeleton: `SELECT name, credits
FROM members
WHERE credits > (
  SELECT MAX(credits)
  FROM members
  WHERE level = 'Basic'
)
ORDER BY credits DESC;`,
          answer: `SELECT name, credits
FROM members
WHERE credits > (
  SELECT MAX(credits)
  FROM members
  WHERE level = 'Basic'
)
ORDER BY credits DESC;`
        },
        successMessage: "很好，你用子查詢把比較條件變成資料庫算出的值。",
        referenceSql: `SELECT name, credits
FROM members
WHERE credits > (
  SELECT MAX(credits)
  FROM members
  WHERE level = 'Basic'
)
ORDER BY credits DESC;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "WHERE", "ORDER BY"],
        requiredPatterns: [{ label: "這題要用 MAX 子查詢。", pattern: "\\(\\s*SELECT\\s+MAX\\(" }],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-10-10",
        title: "從分組結果再篩選",
        description: "先在子查詢中依 status 分組計算 booking_count，再從外層查出 booking_count >= 2 的狀態，依 status 排序。",
        tags: ["FROM 子查詢", "GROUP BY"],
        type: "query",
        starterSql: `SELECT status, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY status
ORDER BY status;`,
        hints: {
          direction: "把分組查詢放進 FROM (...) AS status_counts，外層再 WHERE booking_count >= 2。",
          skeleton: `SELECT status, booking_count
FROM (
  SELECT status, COUNT(*)::int AS booking_count
  FROM course_bookings
  GROUP BY status
) AS status_counts
WHERE booking_count >= 2
ORDER BY status;`,
          answer: `SELECT status, booking_count
FROM (
  SELECT status, COUNT(*)::int AS booking_count
  FROM course_bookings
  GROUP BY status
) AS status_counts
WHERE booking_count >= 2
ORDER BY status;`
        },
        successMessage: "漂亮，你用 FROM 子查詢把分組結果當成一張暫時資料表再篩選。",
        referenceSql: `SELECT status, booking_count
FROM (
  SELECT status, COUNT(*)::int AS booking_count
  FROM course_bookings
  GROUP BY status
) AS status_counts
WHERE booking_count >= 2
ORDER BY status;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "COUNT", "GROUP BY", "WHERE", "ORDER BY"],
        requiredPatterns: [{ label: "這題要把子查詢放在 FROM 後面。", pattern: "FROM\\s*\\(\\s*SELECT" }],
        forbidden: ["SELECT *"]
      }
    ]
  },
  {
    id: "incident-room",
    section: "事故調查室",
    title: "11 事故調查室：LiveFit 後台資料偵查",
    label: "W5-11",
    lead:
      "最後一章把前面技能包成情境任務。你不是在刷語法，而是在幫後台找資料異常。",
    mission:
      "八月帳目對不起來了：有會員投訴被重複扣堂數、幾筆大額訂單卡著沒出貨、收入又異常集中在少數人身上。海姐把後台資料攤在你面前——「這次不是刷題，是辦案。我們用 SQL 一條一條把異常揪出來，最後寫一份結案摘要。」",
    coachLine:
      "情境題不要急著寫很長。先問：我要哪張表？要不要 JOIN？要不要 GROUP BY？有沒有子查詢比較清楚？",
    teaching:
      "事故調查題會混用 WHERE、JOIN、GROUP BY、HAVING、EXISTS。每一題仍然有明確輸出欄位，先照任務把結果查出來。",
    syntax: `SELECT member_id, course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY member_id, course_id
HAVING COUNT(*) > 1;`,
    isCase: true,
    exercises: [
      {
        id: "w5-11-01",
        title: "找重複報名組合",
        description: "回傳 member_id、course_id、booking_count，找出同一會員同一課程報名超過 1 筆的組合。",
        tags: ["事故調查", "GROUP BY"],
        type: "query",
        starterSql: `SELECT member_id, course_id
FROM course_bookings
ORDER BY member_id, course_id;`,
        hints: {
          direction: "依 member_id、course_id 分組，再 HAVING COUNT(*) > 1。",
          skeleton: `SELECT member_id, course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY member_id, course_id
HAVING COUNT(*) > 1
ORDER BY member_id, course_id;`,
          answer: `SELECT member_id, course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY member_id, course_id
HAVING COUNT(*) > 1
ORDER BY member_id, course_id;`
        },
        successMessage: "很好，你找出重複報名的 member_id 和 course_id 組合。",
        referenceSql: `SELECT member_id, course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY member_id, course_id
HAVING COUNT(*) > 1
ORDER BY member_id, course_id;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "COUNT", "GROUP BY", "HAVING", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-11-02",
        title: "把重複報名翻成人名課名",
        description: "用 JOIN 回傳 member_name、course_title、booking_count，找出同一會員同一課程報名超過 1 筆的資料。",
        tags: ["事故調查", "JOIN", "GROUP BY"],
        type: "query",
        starterSql: `SELECT b.member_id, b.course_id, COUNT(*)::int AS booking_count
FROM course_bookings AS b
GROUP BY b.member_id, b.course_id
HAVING COUNT(*) > 1;`,
        hints: {
          direction: "接 members 和 courses，GROUP BY 要放人名和課名。",
          skeleton: `SELECT m.name AS member_name, c.title AS course_title, COUNT(*)::int AS booking_count
FROM course_bookings AS b
INNER JOIN members AS m ON b.member_id = m.id
INNER JOIN courses AS c ON b.course_id = c.id
GROUP BY m.name, c.title
HAVING COUNT(*) > 1
ORDER BY member_name, course_title;`,
          answer: `SELECT m.name AS member_name, c.title AS course_title, COUNT(*)::int AS booking_count
FROM course_bookings AS b
INNER JOIN members AS m ON b.member_id = m.id
INNER JOIN courses AS c ON b.course_id = c.id
GROUP BY m.name, c.title
HAVING COUNT(*) > 1
ORDER BY member_name, course_title;`
        },
        successMessage: "漂亮，你把異常 id 翻成營運同事看得懂的人名和課名。",
        referenceSql: `SELECT m.name AS member_name, c.title AS course_title, COUNT(*)::int AS booking_count
FROM course_bookings AS b
INNER JOIN members AS m ON b.member_id = m.id
INNER JOIN courses AS c ON b.course_id = c.id
GROUP BY m.name, c.title
HAVING COUNT(*) > 1
ORDER BY member_name, course_title;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "INNER JOIN", "ON", "COUNT", "GROUP BY", "HAVING", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-11-03",
        title: "找已付款但還沒出貨的訂單",
        description: "回傳 order_no、customer_name、total_amount，篩選 paid 且 shipped_at 是 NULL 的訂單，依 total_amount 由大到小排序。",
        tags: ["事故調查", "NULL"],
        type: "query",
        starterSql: `SELECT order_no, customer_name, total_amount
FROM shop_orders
WHERE status = 'paid'
ORDER BY total_amount DESC;`,
        hints: {
          direction: "加上 shipped_at IS NULL，才是已付款但還沒出貨。",
          skeleton: `SELECT order_no, customer_name, total_amount
FROM shop_orders
WHERE status = 'paid' AND shipped_at IS NULL
ORDER BY total_amount DESC;`,
          answer: `SELECT order_no, customer_name, total_amount
FROM shop_orders
WHERE status = 'paid' AND shipped_at IS NULL
ORDER BY total_amount DESC;`
        },
        successMessage: "很好，你找出付款後仍待出貨的訂單。",
        referenceSql: `SELECT order_no, customer_name, total_amount
FROM shop_orders
WHERE status = 'paid' AND shipped_at IS NULL
ORDER BY total_amount DESC;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "WHERE", "ORDER BY"],
        requiredPatterns: [{ label: "這題要確認 shipped_at 是 NULL。", pattern: "shipped_at\\s+IS\\s+NULL" }],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-11-04",
        title: "找大額待出貨訂單",
        description: "回傳 order_no、customer_name、total_amount，篩選 paid、shipped_at IS NULL、total_amount >= 5000，依 total_amount 由大到小排序。",
        tags: ["事故調查", "WHERE"],
        type: "query",
        starterSql: `SELECT order_no, customer_name, total_amount
FROM shop_orders
WHERE status = 'paid' AND shipped_at IS NULL
ORDER BY total_amount DESC;`,
        hints: {
          direction: "在 WHERE 裡再加上 total_amount >= 5000。",
          skeleton: `SELECT order_no, customer_name, total_amount
FROM shop_orders
WHERE status = 'paid'
  AND shipped_at IS NULL
  AND total_amount >= 5000
ORDER BY total_amount DESC;`,
          answer: `SELECT order_no, customer_name, total_amount
FROM shop_orders
WHERE status = 'paid'
  AND shipped_at IS NULL
  AND total_amount >= 5000
ORDER BY total_amount DESC;`
        },
        successMessage: "漂亮，你把付款未出貨裡的大額訂單挑出來了。",
        referenceSql: `SELECT order_no, customer_name, total_amount
FROM shop_orders
WHERE status = 'paid'
  AND shipped_at IS NULL
  AND total_amount >= 5000
ORDER BY total_amount DESC;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "WHERE", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-11-05",
        title: "找沒有任何報名的課程",
        description: "用 LEFT JOIN 回傳 courses.id、courses.title，找出沒有報名紀錄的課程，依 courses.id 排序。",
        tags: ["事故調查", "LEFT JOIN"],
        type: "query",
        starterSql: `SELECT courses.id, courses.title
FROM courses
ORDER BY courses.id;`,
        hints: {
          direction: "LEFT JOIN 後，course_bookings.id IS NULL 代表沒有對到報名。",
          skeleton: `SELECT courses.id, courses.title
FROM courses
LEFT JOIN course_bookings ON courses.id = course_bookings.course_id
WHERE course_bookings.id IS NULL
ORDER BY courses.id;`,
          answer: `SELECT courses.id, courses.title
FROM courses
LEFT JOIN course_bookings ON courses.id = course_bookings.course_id
WHERE course_bookings.id IS NULL
ORDER BY courses.id;`
        },
        successMessage: "很好，你用 LEFT JOIN 找出沒有任何報名的課程。",
        referenceSql: `SELECT courses.id, courses.title
FROM courses
LEFT JOIN course_bookings ON courses.id = course_bookings.course_id
WHERE course_bookings.id IS NULL
ORDER BY courses.id;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "LEFT JOIN", "ON", "WHERE", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-11-06",
        title: "會員已確認付款排行榜",
        description: "回傳 member_name、paid_total，用 JOIN 和 GROUP BY 加總 confirmed 報名付款，依 paid_total 由大到小、member_name 排序。",
        tags: ["事故調查", "GROUP BY"],
        type: "query",
        starterSql: `SELECT members.name AS member_name, course_bookings.paid_amount
FROM members
INNER JOIN course_bookings ON members.id = course_bookings.member_id
WHERE course_bookings.status = 'confirmed';`,
        hints: {
          direction: "依 members.name 分組，SUM confirmed 的 paid_amount。",
          skeleton: `SELECT members.name AS member_name, SUM(course_bookings.paid_amount)::int AS paid_total
FROM members
INNER JOIN course_bookings ON members.id = course_bookings.member_id
WHERE course_bookings.status = 'confirmed'
GROUP BY members.name
ORDER BY paid_total DESC, member_name;`,
          answer: `SELECT members.name AS member_name, SUM(course_bookings.paid_amount)::int AS paid_total
FROM members
INNER JOIN course_bookings ON members.id = course_bookings.member_id
WHERE course_bookings.status = 'confirmed'
GROUP BY members.name
ORDER BY paid_total DESC, member_name;`
        },
        successMessage: "漂亮，你做出已確認付款的會員排行榜。",
        referenceSql: `SELECT members.name AS member_name, SUM(course_bookings.paid_amount)::int AS paid_total
FROM members
INNER JOIN course_bookings ON members.id = course_bookings.member_id
WHERE course_bookings.status = 'confirmed'
GROUP BY members.name
ORDER BY paid_total DESC, member_name;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "INNER JOIN", "ON", "SUM", "WHERE", "GROUP BY", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-11-07",
        title: "找沒有已確認報名的會員",
        description: "回傳 name，使用 NOT EXISTS 找出沒有 confirmed 報名的會員，依 name 排序。",
        tags: ["事故調查", "NOT EXISTS"],
        type: "query",
        starterSql: `SELECT name
FROM members
ORDER BY name;`,
        hints: {
          direction: "NOT EXISTS 裡查該會員是否有 confirmed 報名。",
          skeleton: `SELECT name
FROM members
WHERE NOT EXISTS (
  SELECT 1
  FROM course_bookings
  WHERE course_bookings.member_id = members.id
    AND course_bookings.status = 'confirmed'
)
ORDER BY name;`,
          answer: `SELECT name
FROM members
WHERE NOT EXISTS (
  SELECT 1
  FROM course_bookings
  WHERE course_bookings.member_id = members.id
    AND course_bookings.status = 'confirmed'
)
ORDER BY name;`
        },
        successMessage: "很好，你找出沒有已確認報名的會員，這可以交給營運追蹤。",
        referenceSql: `SELECT name
FROM members
WHERE NOT EXISTS (
  SELECT 1
  FROM course_bookings
  WHERE course_bookings.member_id = members.id
    AND course_bookings.status = 'confirmed'
)
ORDER BY name;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "WHERE", "NOT EXISTS", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-11-08",
        title: "各分館報名筆數",
        description: "用 LEFT JOIN 回傳 branch、booking_count，統計每個分館的報名筆數，依 branch 排序。",
        tags: ["事故調查", "GROUP BY"],
        type: "query",
        starterSql: `SELECT courses.branch, course_bookings.id
FROM courses
LEFT JOIN course_bookings ON courses.id = course_bookings.course_id;`,
        hints: {
          direction: "依 courses.branch 分組，COUNT course_bookings.id。",
          skeleton: `SELECT courses.branch, COUNT(course_bookings.id)::int AS booking_count
FROM courses
LEFT JOIN course_bookings ON courses.id = course_bookings.course_id
GROUP BY courses.branch
ORDER BY courses.branch;`,
          answer: `SELECT courses.branch, COUNT(course_bookings.id)::int AS booking_count
FROM courses
LEFT JOIN course_bookings ON courses.id = course_bookings.course_id
GROUP BY courses.branch
ORDER BY courses.branch;`
        },
        successMessage: "漂亮，你把課程報名數整理成分館摘要。",
        referenceSql: `SELECT courses.branch, COUNT(course_bookings.id)::int AS booking_count
FROM courses
LEFT JOIN course_bookings ON courses.id = course_bookings.course_id
GROUP BY courses.branch
ORDER BY courses.branch;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "COUNT", "LEFT JOIN", "ON", "GROUP BY", "ORDER BY"],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-11-09",
        title: "列出重複報名的原始紀錄",
        description: "回傳 id、member_id、course_id、status，找出屬於重複報名組合的原始報名紀錄，依 id 排序。",
        tags: ["事故調查", "子查詢"],
        type: "query",
        starterSql: `SELECT id, member_id, course_id, status
FROM course_bookings
ORDER BY id;`,
        hints: {
          direction: "子查詢先找重複的 member_id、course_id 組合，外層再抓原始紀錄。",
          skeleton: `SELECT id, member_id, course_id, status
FROM course_bookings
WHERE (member_id, course_id) IN (
  SELECT member_id, course_id
  FROM course_bookings
  GROUP BY member_id, course_id
  HAVING COUNT(*) > 1
)
ORDER BY id;`,
          answer: `SELECT id, member_id, course_id, status
FROM course_bookings
WHERE (member_id, course_id) IN (
  SELECT member_id, course_id
  FROM course_bookings
  GROUP BY member_id, course_id
  HAVING COUNT(*) > 1
)
ORDER BY id;`
        },
        successMessage: "很好，你用子查詢把重複組合轉成可追查的原始紀錄。",
        referenceSql: `SELECT id, member_id, course_id, status
FROM course_bookings
WHERE (member_id, course_id) IN (
  SELECT member_id, course_id
  FROM course_bookings
  GROUP BY member_id, course_id
  HAVING COUNT(*) > 1
)
ORDER BY id;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "WHERE", "GROUP BY", "HAVING", "ORDER BY"],
        requiredPatterns: [{ label: "這題要用子查詢找重複組合。", pattern: "IN\\s*\\(\\s*SELECT" }],
        forbidden: ["SELECT *"]
      },
      {
        id: "w5-11-10",
        title: "事故摘要計數",
        description: "回傳 duplicate_booking_pairs、courses_without_booking。用兩個子查詢分別計算重複報名組合數、沒有報名的課程數。",
        tags: ["事故調查", "多個子查詢"],
        type: "query",
        starterSql: `SELECT 0 AS duplicate_booking_pairs,
  0 AS courses_without_booking;`,
        hints: {
          direction: "SELECT 裡可以放多個子查詢，各自算一個摘要數字。",
          skeleton: `SELECT
  (
    SELECT COUNT(*)::int
    FROM (
      SELECT member_id, course_id
      FROM course_bookings
      GROUP BY member_id, course_id
      HAVING COUNT(*) > 1
    ) AS duplicate_pairs
  ) AS duplicate_booking_pairs,
  (
    SELECT COUNT(*)::int
    FROM courses
    WHERE NOT EXISTS (
      SELECT 1
      FROM course_bookings
      WHERE course_bookings.course_id = courses.id
    )
  ) AS courses_without_booking;`,
          answer: `SELECT
  (
    SELECT COUNT(*)::int
    FROM (
      SELECT member_id, course_id
      FROM course_bookings
      GROUP BY member_id, course_id
      HAVING COUNT(*) > 1
    ) AS duplicate_pairs
  ) AS duplicate_booking_pairs,
  (
    SELECT COUNT(*)::int
    FROM courses
    WHERE NOT EXISTS (
      SELECT 1
      FROM course_bookings
      WHERE course_bookings.course_id = courses.id
    )
  ) AS courses_without_booking;`
        },
        successMessage: "結案。你把重複報名與無人報名兩個事故指標收斂成一列摘要——這就是遞給主管的結案報告第一行。八月的帳，查清楚了。",
        referenceSql: `SELECT
  (
    SELECT COUNT(*)::int
    FROM (
      SELECT member_id, course_id
      FROM course_bookings
      GROUP BY member_id, course_id
      HAVING COUNT(*) > 1
    ) AS duplicate_pairs
  ) AS duplicate_booking_pairs,
  (
    SELECT COUNT(*)::int
    FROM courses
    WHERE NOT EXISTS (
      SELECT 1
      FROM course_bookings
      WHERE course_bookings.course_id = courses.id
    )
  ) AS courses_without_booking;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "COUNT"],
        requiredPatterns: [{ label: "這題要在 SELECT 裡放多個子查詢。", pattern: "SELECT[\\s\\S]*\\(\\s*SELECT[\\s\\S]*\\(\\s*SELECT" }]
      }
    ]
  }
];

export const futureChapters: string[] = [];

export const videoModules: VideoModule[] = [
  {
    title: "資料庫簡介",
    count: 2,
    items: ["什麼是資料庫", "什麼是 SQL？"]
  },
  {
    title: "建立 SQL 資料表",
    count: 7,
    items: [
      "資料庫三劍客、table、row、column",
      "透過 Excel 深入了解資料庫設計三劍客",
      "常用資料庫資料庫型態（VARCHAR、INT）",
      "INSERT：加入一筆資料到 table",
      "SELECT：查找資料方法",
      "新增 AS 別名",
      "增加 SQL 註解"
    ]
  },
  {
    title: "SQL 語法教學",
    count: 6,
    items: [
      "WHERE：篩選資料",
      "比較運算子：>、<、>=、=",
      "邏輯運算子：AND、OR",
      "集合與範圍運算子：IN、NOT IN、BETWEEN",
      "UPDATE：更新欄位",
      "DELETE：刪除欄位"
    ]
  },
  {
    title: "Tables 資料表管理",
    count: 9,
    items: [
      "從單張資料表升級到多張資料表",
      "主鍵、外來鍵",
      "資料表拆分",
      "ID 自動地增",
      "完整資料庫流程",
      "WHERE 合併資料表查詢",
      "inner join",
      "constraint 約束提醒",
      "預留任務"
    ]
  },
  {
    title: "postgres 函式",
    count: 6,
    items: ["NULL", "COALESCE", "DISTINCT", "COUNT", "SUM / AVG", "UUID"]
  },
  {
    title: "JOIN 資料關聯",
    count: 6,
    items: ["JOIN 關鍵語法", "inner join", "left join", "right join", "full join", "JOIN + COALESCE"]
  },
  {
    title: "order by 排序資料",
    count: 3,
    items: ["order by 排序方法", "多條件排序方法", "Join 組合 + 排序技巧"]
  },
  {
    title: "group by 分組資料",
    count: 4,
    items: ["為什麼要學 group by", "group by 語法", "group by + join", "group by 延伸運用"]
  },
  {
    title: "子查詢 (Subquery)",
    count: 3,
    items: ["為什麼要學子查詢", "where 子查詢應用", "多個子查詢應用方式"]
  }
];
