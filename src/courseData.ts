import type { Lesson, VideoModule } from "./types";

export const schemaSql = `
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS credit_purchases;
DROP TABLE IF EXISTS course_bookings;
DROP TABLE IF EXISTS coach_link_skill;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS coaches;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS users;
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

-- ===== 06–11 進階關：對齊最終作業（健身房管理系統 SaaS）的真實資料表 =====
-- 表名小寫、id SERIAL（教學友善），欄位/型別/關聯照真實作業。
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(320) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('USER', 'COACH', 'ADMIN')),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE coaches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
  experience_years INTEGER NOT NULL,
  description TEXT NOT NULL,
  profile_image_url VARCHAR(2048),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE coach_link_skill (
  id SERIAL PRIMARY KEY,
  coach_id INTEGER NOT NULL REFERENCES coaches(id),
  skill_id INTEGER NOT NULL REFERENCES skills(id),
  created_at TIMESTAMP NOT NULL,
  UNIQUE (coach_id, skill_id)
);

CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  skill_id INTEGER NOT NULL REFERENCES skills(id),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  start_at TIMESTAMP NOT NULL,
  end_at TIMESTAMP NOT NULL,
  max_participants INTEGER NOT NULL,
  meeting_url VARCHAR(2048) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE course_bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  booking_at TIMESTAMP NOT NULL,
  join_at TIMESTAMP,
  leave_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancellation_reason VARCHAR(255),
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE credit_purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  credit_package_id INTEGER NOT NULL REFERENCES credit_packages(id),
  purchased_credits INTEGER NOT NULL,
  price_paid NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  purchase_at TIMESTAMP NOT NULL
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  credit_package_id INTEGER NOT NULL REFERENCES credit_packages(id),
  merchant_order_no VARCHAR(30) NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  purchased_credits INTEGER NOT NULL,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'failed')),
  newebpay_trade_no VARCHAR(30),
  payment_type VARCHAR(20),
  paid_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL
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

-- users：1-5 教練(COACH)、6-12 學員(USER)。Jack Pai = id 11（收入大戶＋卡關訂單）。
INSERT INTO users (name, email, role, created_at, updated_at) VALUES
  ('Ada Lin',  'ada@livefit.test',  'COACH', '2026-01-05 09:00:00', '2026-01-05 09:00:00'),
  ('Ben Wu',   'ben@livefit.test',  'COACH', '2026-01-06 09:00:00', '2026-01-06 09:00:00'),
  ('Chloe Ho', 'chloe@livefit.test','COACH', '2026-01-07 09:00:00', '2026-01-07 09:00:00'),
  ('Duke Yeh', 'duke@livefit.test', 'COACH', '2026-01-08 09:00:00', '2026-01-08 09:00:00'),
  ('Ella Kao', 'ella@livefit.test', 'COACH', '2026-01-09 09:00:00', '2026-01-09 09:00:00'),
  ('Leo Chen', 'leo@example.com',   'USER',  '2026-02-10 10:00:00', '2026-02-10 10:00:00'),
  ('Mina Su',  'mina@example.com',  'USER',  '2026-03-02 10:00:00', '2026-03-02 10:00:00'),
  ('Kai Lo',   'kai@example.com',   'USER',  '2026-01-18 10:00:00', '2026-01-18 10:00:00'),
  ('Nora Pan', 'nora@example.com',  'USER',  '2025-12-21 10:00:00', '2025-12-21 10:00:00'),
  ('Ivy Yu',   'ivy@example.com',   'USER',  '2026-04-05 10:00:00', '2026-04-05 10:00:00'),
  ('Jack Pai', 'jack@example.com',  'USER',  '2026-02-28 10:00:00', '2026-02-28 10:00:00'),
  ('Una Wang', 'una@example.com',   'USER',  '2026-05-01 10:00:00', '2026-05-01 10:00:00');

INSERT INTO skills (name, created_at) VALUES
  ('重訓',     '2026-01-01 09:00:00'),
  ('瑜伽',     '2026-01-01 09:00:00'),
  ('有氧',     '2026-01-01 09:00:00'),
  ('飛輪',     '2026-01-01 09:00:00'),
  ('拳擊',     '2026-01-01 09:00:00'),
  ('皮拉提斯', '2026-01-01 09:00:00');

INSERT INTO coaches (user_id, experience_years, description, profile_image_url, created_at, updated_at) VALUES
  (1, 8, '專攻肌力與體能，帶過上百位學員。', 'https://img.livefit.test/ada.jpg',  '2026-01-05 09:00:00', '2026-01-05 09:00:00'),
  (2, 5, '重訓與增肌教學，注重姿勢安全。',   'https://img.livefit.test/ben.jpg',  '2026-01-06 09:00:00', '2026-01-06 09:00:00'),
  (3, 6, '瑜伽與皮拉提斯，擅長伸展放鬆。',   NULL,                               '2026-01-07 09:00:00', '2026-01-07 09:00:00'),
  (4, 4, '拳擊有氧，高強度燃脂。',           'https://img.livefit.test/duke.jpg', '2026-01-08 09:00:00', '2026-01-08 09:00:00'),
  (5, 3, '飛輪與心肺訓練。',                 NULL,                               '2026-01-09 09:00:00', '2026-01-09 09:00:00');

INSERT INTO coach_link_skill (coach_id, skill_id, created_at) VALUES
  (1, 1, '2026-01-05 09:00:00'),
  (1, 3, '2026-01-05 09:00:00'),
  (2, 1, '2026-01-06 09:00:00'),
  (3, 2, '2026-01-07 09:00:00'),
  (3, 6, '2026-01-07 09:00:00'),
  (4, 5, '2026-01-08 09:00:00'),
  (4, 3, '2026-01-08 09:00:00'),
  (5, 4, '2026-01-09 09:00:00');

-- courses：線上課（meeting_url），由教練(user_id 1-5)開。最後兩堂沒人報（LEFT JOIN 練習用）。
INSERT INTO courses (user_id, skill_id, name, description, start_at, end_at, max_participants, meeting_url, created_at, updated_at) VALUES
  (1, 1, '肌力入門班',   '從零開始的重量訓練。', '2026-07-12 19:00:00', '2026-07-12 20:00:00', 10, 'https://meet.livefit.test/c1', '2026-06-01 09:00:00', '2026-06-01 09:00:00'),
  (1, 3, '晨間有氧',     '喚醒身體的有氧課。',   '2026-07-13 08:00:00', '2026-07-13 08:50:00', 12, 'https://meet.livefit.test/c2', '2026-06-01 09:00:00', '2026-06-01 09:00:00'),
  (2, 1, '進階增肌',     '大重量分組訓練。',     '2026-07-14 19:30:00', '2026-07-14 20:45:00',  6, 'https://meet.livefit.test/c3', '2026-06-02 09:00:00', '2026-06-02 09:00:00'),
  (3, 2, '舒緩瑜伽',     '放鬆與伸展。',         '2026-07-15 18:30:00', '2026-07-15 19:30:00',  8, 'https://meet.livefit.test/c4', '2026-06-02 09:00:00', '2026-06-02 09:00:00'),
  (3, 6, '皮拉提斯核心', '核心穩定訓練。',       '2026-07-16 18:30:00', '2026-07-16 19:30:00',  8, 'https://meet.livefit.test/c5', '2026-06-03 09:00:00', '2026-06-03 09:00:00'),
  (4, 5, '拳擊燃脂',     '高強度拳擊有氧。',     '2026-07-17 20:00:00', '2026-07-17 21:00:00', 14, 'https://meet.livefit.test/c6', '2026-06-03 09:00:00', '2026-06-03 09:00:00'),
  (5, 4, '週末飛輪',     '心肺爆發訓練。',       '2026-07-19 10:00:00', '2026-07-19 10:45:00', 16, 'https://meet.livefit.test/c7', '2026-06-04 09:00:00', '2026-06-04 09:00:00'),
  (2, 1, '冷門深蹲專修', '只練深蹲。',           '2026-07-20 19:00:00', '2026-07-20 20:00:00',  6, 'https://meet.livefit.test/c8', '2026-06-05 09:00:00', '2026-06-05 09:00:00');

-- course_bookings：學員(6-12)報名。植入【重複報名】Leo(6) 把 course 1 報了兩次。
INSERT INTO course_bookings (user_id, course_id, booking_at, join_at, leave_at, cancelled_at, cancellation_reason, created_at) VALUES
  (6, 1, '2026-07-01 09:10:00', '2026-07-12 18:58:00', '2026-07-12 20:02:00', NULL, NULL, '2026-07-01 09:10:00'),
  (6, 1, '2026-07-01 09:12:00', NULL, NULL, NULL, NULL, '2026-07-01 09:12:00'),
  (7, 1, '2026-07-01 09:20:00', '2026-07-12 19:01:00', '2026-07-12 20:00:00', NULL, NULL, '2026-07-01 09:20:00'),
  (8, 3, '2026-07-02 12:00:00', '2026-07-14 19:28:00', '2026-07-14 20:40:00', NULL, NULL, '2026-07-02 12:00:00'),
  (10, 3, '2026-07-02 12:04:00', NULL, NULL, '2026-07-10 11:00:00', '臨時有事', '2026-07-02 12:04:00'),
  (11, 4, '2026-07-02 13:30:00', '2026-07-15 18:31:00', '2026-07-15 19:25:00', NULL, NULL, '2026-07-02 13:30:00'),
  (12, 4, '2026-07-02 14:10:00', '2026-07-15 18:35:00', '2026-07-15 19:30:00', NULL, NULL, '2026-07-02 14:10:00'),
  (9, 6, '2026-07-03 08:20:00', NULL, NULL, '2026-07-03 20:00:00', '報錯課程', '2026-07-03 08:20:00'),
  (6, 5, '2026-07-03 09:00:00', '2026-07-16 18:29:00', '2026-07-16 19:28:00', NULL, NULL, '2026-07-03 09:00:00'),
  (8, 5, '2026-07-03 09:11:00', '2026-07-16 18:30:00', '2026-07-16 19:30:00', NULL, NULL, '2026-07-03 09:11:00'),
  (11, 2, '2026-07-04 07:30:00', '2026-07-13 07:58:00', '2026-07-13 08:48:00', NULL, NULL, '2026-07-04 07:30:00'),
  (11, 6, '2026-07-04 20:30:00', '2026-07-17 19:58:00', '2026-07-17 21:00:00', NULL, NULL, '2026-07-04 20:30:00');

-- credit_purchases：植入【收入集中】Jack Pai(11) 大量購買、其餘零星。
INSERT INTO credit_purchases (user_id, credit_package_id, purchased_credits, price_paid, created_at, purchase_at) VALUES
  (6, 2, 10, 2200.00, '2026-06-10 10:00:00', '2026-06-10 10:00:00'),
  (7, 2, 10, 2200.00, '2026-06-11 10:00:00', '2026-06-11 10:00:00'),
  (8, 3, 20, 4000.00, '2026-06-12 10:00:00', '2026-06-12 10:00:00'),
  (11, 4, 50, 9000.00, '2026-06-13 10:00:00', '2026-06-13 10:00:00'),
  (11, 3, 20, 4000.00, '2026-07-01 21:00:00', '2026-07-01 21:00:00'),
  (12, 2, 10, 2200.00, '2026-06-15 10:00:00', '2026-06-15 10:00:00');

-- orders：藍新金流訂單。植入【Jack Pai 卡關】大額 unpaid、深夜下、一直沒付。
INSERT INTO orders (user_id, credit_package_id, merchant_order_no, amount, purchased_credits, payment_status, newebpay_trade_no, payment_type, paid_at, created_at) VALUES
  (6, 2, 'NO20260610001', 2200, 10, 'paid', 'NWP240610A', 'CREDIT', '2026-06-10 10:05:00', '2026-06-10 10:00:00'),
  (7, 2, 'NO20260611001', 2200, 10, 'paid', 'NWP240611A', 'CREDIT', '2026-06-11 10:03:00', '2026-06-11 10:00:00'),
  (8, 3, 'NO20260612001', 4000, 20, 'paid', 'NWP240612A', 'WEBATM', '2026-06-12 10:08:00', '2026-06-12 10:00:00'),
  (11, 4, 'NO20260613001', 9000, 50, 'paid', 'NWP240613A', 'CREDIT', '2026-06-13 10:10:00', '2026-06-13 10:00:00'),
  (11, 4, 'NO20260620001', 9000, 50, 'unpaid', NULL, NULL, NULL, '2026-06-20 20:20:00'),
  (9, 2, 'NO20260618001', 2200, 10, 'failed', NULL, 'CREDIT', NULL, '2026-06-18 14:00:00'),
  (12, 2, 'NO20260615001', 2200, 10, 'paid', 'NWP240615A', 'CREDIT', '2026-06-15 10:04:00', '2026-06-15 10:00:00'),
  (10, 2, 'NO20260622001', 2200, 10, 'unpaid', NULL, NULL, NULL, '2026-06-22 09:00:00');

-- 欄位用途（COMMENT ON COLUMN）：給「資料庫透視鏡」反查顯示，讓學生看懂每一欄是做什麼用的。
COMMENT ON COLUMN members.id IS '會員編號，系統自動給的唯一號';
COMMENT ON COLUMN members.name IS '會員名字';
COMMENT ON COLUMN members.email IS '會員的 email';
COMMENT ON COLUMN members.level IS '會員等級：Basic 一般、VIP 貴賓、Suspended 已停權';
COMMENT ON COLUMN members.city IS '會員所在城市';
COMMENT ON COLUMN members.credits IS '剩餘點數，上課會扣，不能小於 0';
COMMENT ON COLUMN members.joined_at IS '加入會員的日期';

COMMENT ON COLUMN credit_packages.id IS '點數包編號';
COMMENT ON COLUMN credit_packages.name IS '點數包名稱（不可重複）';
COMMENT ON COLUMN credit_packages.credit_amount IS '這包送幾點';
COMMENT ON COLUMN credit_packages.price IS '售價';
COMMENT ON COLUMN credit_packages.created_at IS '上架時間';

COMMENT ON COLUMN shop_orders.id IS '訂單流水號，系統自動給';
COMMENT ON COLUMN shop_orders.order_no IS '對外訂單編號（NW- 開頭，給人看、給你下條件用的那個）';
COMMENT ON COLUMN shop_orders.customer_name IS '下單客戶姓名';
COMMENT ON COLUMN shop_orders.email IS '客戶 email';
COMMENT ON COLUMN shop_orders.city IS '寄送城市';
COMMENT ON COLUMN shop_orders.status IS '訂單走到哪一站：pending 待付款→paid 已付款→packed 已打包→shipped 已出貨；或 cancelled 取消、refunded 退款';
COMMENT ON COLUMN shop_orders.total_amount IS '訂單金額，不能小於 0';
COMMENT ON COLUMN shop_orders.paid_at IS '付款時間；還沒付款就是空的（NULL）';
COMMENT ON COLUMN shop_orders.shipped_at IS '出貨時間；還沒出貨就是空的（NULL）';
COMMENT ON COLUMN shop_orders.created_at IS '下單時間';
COMMENT ON COLUMN shop_orders.note IS '備註；夜班的線索常常藏在這欄';

COMMENT ON COLUMN users.id IS '使用者編號';
COMMENT ON COLUMN users.name IS '姓名';
COMMENT ON COLUMN users.email IS 'Email（不可重複）';
COMMENT ON COLUMN users.role IS '角色：USER 學員、COACH 教練、ADMIN 管理員';
COMMENT ON COLUMN users.created_at IS '註冊時間';
COMMENT ON COLUMN users.updated_at IS '最後更新時間';

COMMENT ON COLUMN skills.id IS '專長編號';
COMMENT ON COLUMN skills.name IS '專長名稱，例如 重訓、瑜伽（不可重複）';
COMMENT ON COLUMN skills.created_at IS '建立時間';

COMMENT ON COLUMN coaches.id IS '教練編號';
COMMENT ON COLUMN coaches.user_id IS '這位教練是哪個使用者，對到 users.id（外鍵，一對一）';
COMMENT ON COLUMN coaches.experience_years IS '教學年資';
COMMENT ON COLUMN coaches.description IS '教練簡介';
COMMENT ON COLUMN coaches.profile_image_url IS '大頭照網址（可空）';

COMMENT ON COLUMN coach_link_skill.id IS '關聯編號';
COMMENT ON COLUMN coach_link_skill.coach_id IS '哪位教練，對到 coaches.id（外鍵）';
COMMENT ON COLUMN coach_link_skill.skill_id IS '哪個專長，對到 skills.id（外鍵）。教練↔專長多對多';

COMMENT ON COLUMN courses.id IS '課程編號';
COMMENT ON COLUMN courses.user_id IS '開課教練是哪個使用者，對到 users.id（外鍵）';
COMMENT ON COLUMN courses.skill_id IS '這堂課的專長，對到 skills.id（外鍵）';
COMMENT ON COLUMN courses.name IS '課程名稱';
COMMENT ON COLUMN courses.start_at IS '開課時間';
COMMENT ON COLUMN courses.end_at IS '結束時間';
COMMENT ON COLUMN courses.max_participants IS '人數上限';
COMMENT ON COLUMN courses.meeting_url IS '線上課程會議連結（這是線上課，沒有實體分館）';

COMMENT ON COLUMN course_bookings.id IS '報名編號';
COMMENT ON COLUMN course_bookings.user_id IS '哪位學員報的，對到 users.id（外鍵）';
COMMENT ON COLUMN course_bookings.course_id IS '報哪一堂課，對到 courses.id（外鍵）';
COMMENT ON COLUMN course_bookings.booking_at IS '報名時間';
COMMENT ON COLUMN course_bookings.join_at IS '實際進入課程的時間（沒上就是空）';
COMMENT ON COLUMN course_bookings.leave_at IS '離開課程的時間（沒上就是空）';
COMMENT ON COLUMN course_bookings.cancelled_at IS '取消時間；沒取消就是空（NULL）';
COMMENT ON COLUMN course_bookings.cancellation_reason IS '取消原因';

COMMENT ON COLUMN credit_purchases.id IS '購買紀錄編號';
COMMENT ON COLUMN credit_purchases.user_id IS '哪位學員買的，對到 users.id（外鍵）';
COMMENT ON COLUMN credit_purchases.credit_package_id IS '買了哪個方案，對到 credit_packages.id（外鍵）';
COMMENT ON COLUMN credit_purchases.purchased_credits IS '這次買到幾點';
COMMENT ON COLUMN credit_purchases.price_paid IS '實際付了多少錢';
COMMENT ON COLUMN credit_purchases.purchase_at IS '購買時間';

COMMENT ON COLUMN orders.id IS '訂單編號';
COMMENT ON COLUMN orders.user_id IS '下單學員，對到 users.id（外鍵）';
COMMENT ON COLUMN orders.credit_package_id IS '買哪個方案，對到 credit_packages.id（外鍵）';
COMMENT ON COLUMN orders.merchant_order_no IS '商店訂單編號（給金流用，不可重複）';
COMMENT ON COLUMN orders.amount IS '訂單金額';
COMMENT ON COLUMN orders.payment_status IS '付款狀態：unpaid 未付款、paid 已付款、failed 付款失敗';
COMMENT ON COLUMN orders.newebpay_trade_no IS '藍新金流交易序號；沒付款成功就是空';
COMMENT ON COLUMN orders.paid_at IS '付款完成時間；沒付就是空（NULL）';
COMMENT ON COLUMN orders.purchased_credits IS '這筆訂單付款後會給幾點';
COMMENT ON COLUMN orders.payment_type IS '付款方式（CREDIT 信用卡、WEBATM 等）；沒付款成功就是空';
COMMENT ON COLUMN orders.created_at IS '下單時間';
COMMENT ON COLUMN credit_purchases.created_at IS '建立時間';
COMMENT ON COLUMN course_bookings.created_at IS '建立時間';
COMMENT ON COLUMN courses.description IS '課程說明';
COMMENT ON COLUMN courses.created_at IS '建立時間';
COMMENT ON COLUMN courses.updated_at IS '最後更新時間';
COMMENT ON COLUMN coaches.created_at IS '建立時間';
COMMENT ON COLUMN coaches.updated_at IS '最後更新時間';
COMMENT ON COLUMN coach_link_skill.created_at IS '建立時間';

-- 資料表用途（COMMENT ON TABLE）：給透視鏡「有哪些表」顯示，辦案/認表時一眼知道每張表放什麼。
COMMENT ON TABLE members IS '健身房會員資料（誰是會員、等級、剩多少點）';
COMMENT ON TABLE credit_packages IS '點數方案（會員買點數來上課）';
COMMENT ON TABLE shop_orders IS '電商訂單（賣補給品、器材的線上訂單）';
COMMENT ON TABLE users IS '使用者（學員與教練都在這，用 role 區分）';
COMMENT ON TABLE skills IS '專長項目（重訓、瑜伽、有氧…）';
COMMENT ON TABLE coaches IS '教練資料（每位教練對到一個 user，記年資與簡介）';
COMMENT ON TABLE coach_link_skill IS '教練↔專長對照（多對多）';
COMMENT ON TABLE courses IS '開課資料（線上課：哪位教練、哪個專長、時間、人數上限、會議連結）';
COMMENT ON TABLE course_bookings IS '課程報名紀錄（哪位學員報了哪堂課、進出/取消時間）';
COMMENT ON TABLE credit_purchases IS '點數購買紀錄（誰買了哪個方案、付多少）';
COMMENT ON TABLE orders IS '金流訂單（買點數方案的藍新付款訂單）';
`;

export const lessons: Lesson[] = [
  {
    id: "table-warmup",
    section: "資料庫簡介",
    title: "00 先認識一張資料表",
    label: "W5-00",
    tables: ["members"],
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
    tables: ["members"],
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
    tables: ["members", "credit_packages"],
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
    tables: ["members", "credit_packages"],
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
    tables: ["members", "credit_packages"],
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
      "別緊張，我坐你旁邊——把我當你的私人教練，只是今晚練的是 SQL 不是深蹲。每一步我先講清楚要做什麼，卡住就喊一聲，我遞提示、不搶你鍵盤。別憋氣，我們一條一條來。",
    caseBrief:
      "🌙 雙十一前夜・後台只剩我們倆。訂單牆上 12 筆未結，海姐挽起袖子：「來，跟緊我。一條一條清，天亮前把這班漂亮收掉。」",
    teaching:
      "Northwind 是很常見的商務資料練習方向，這裡先用老師整理過的簡化版 shop_orders。你會先觀察資料集，再練 WHERE、ORDER BY、LIMIT、UPDATE、INSERT，難度仍維持在新手可以跟上的範圍。",
    syntax: `SELECT *
FROM shop_orders
LIMIT 8;`,
    isCase: true,
    tables: ["shop_orders"],
    introScript: [
      {
        text: "欸，你來啦，坐。今晚這班有點硬——雙十一前夜，後台只剩我們倆。但別緊張，我坐你旁邊，一筆一筆陪你清。",
        art: "normal"
      },
      {
        text: "接班第一件事：先把今晚要顧的資料庫巡一遍。進控制室後，那塊「🗄 資料庫透視鏡」就是我們的盤點清單——有哪幾張表、各幾筆，先心裡有底。今晚的主角是 shop_orders 這張訂單表，其他表先認個臉就好，後面幾課才用到。",
        art: "normal"
      },
      {
        text: "巡訂單表的欄位，特別留意 status（狀態）和 total_amount（金額）這兩欄，今晚都會用到。尤其 status 有它自己的規矩：一筆單只能走 pending、paid、packed、shipped、cancelled、refunded 這六站，填別的填不進去——這不是我刁難你，是這張表自己訂的。",
        art: "normal"
      },
      {
        text: "最後記一句今晚的保命口訣：等下那面會動的「訂單牆」很漂亮，但它只是把 shop_orders 畫得好看而已。你查的、改的，永遠是底下這張表——牆是給人看的，表是給機器讀的。把這句刻進去，待會兒手不抖，心也不會慌。",
        art: "proud"
      },
      {
        text: "好，深呼吸，跟我一起吐氣。準備好就進控制室——我先幫你把「資料庫透視鏡」翻到真實資料那頁，我們並肩看一眼這 12 筆長什麼樣，再回頭寫今晚第一條查詢。第一下我牽著你，第二下你就自己來了。慢慢來，姿勢對比快重要。",
        art: "praise"
      }
    ],
    exercises: [
      {
        id: "w5-05-01",
        title: "交接班：先把今晚的訂單牆叫出來認個臉",
        description: "海姐：第一件事不難——我已經幫你把 SQL 寫好了，直接按「執行」，把訂單牆前 8 筆叫出來認個臉。看清楚有哪些欄位、status 有哪幾種值、note 寫了什麼。",
        tags: ["資料集偵察", "Northwind Lite"],
        type: "query",
        starterSql: `SELECT *
FROM shop_orders
LIMIT 8;`,
        hints: {
          direction: "SQL 已經幫你寫好了，直接按「執行」就會看到前 8 筆。LIMIT 8 的意思就是只看前 8 列。",
          skeleton: `SELECT *
FROM shop_orders
LIMIT 筆數;`,
          answer: `SELECT *
FROM shop_orders
LIMIT 8;`
        },
        successMessage: "認完臉了。有沒有發現 note 欄在碎碎念——有人一早就來催出貨，還有一筆 20:20 深夜下的大單卡在那等審核，金額大得有點搶眼。先把這兩個名字記在後腦勺。你剛查出來這幾列，就是上面訂單牆那些卡片的真身：牆是畫面，這張 shop_orders 才是底牌。走，照著它往下顧。",
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
        successMessage: "漂亮，清單甩給倉庫了，他們可以開揀。欸——有沒有瞄到那筆 9999 的 Jack Pai？金額大得像在閃燈。我跟你打賭，等等主管一定第一個點名要審它。先擱著，這條我們待會兒一定會回來找它。",
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
        successMessage: "這組乾淨，物流拿到路線可以排車了。其中 NW-1006 已經打包好、就差司機簽收——記住它，等一下你會親手把它送出門。第一次按下『出貨』那一下，手感很特別，你會喜歡的。",
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
        successMessage: "看吧，被我說中了——VIP 審核清單一排序，那筆 9999 的 Jack Pai 直接登頂第一名。我教你一件事：金額大不代表它有鬼，是它『不能出錯』，所以我們多盯兩眼。這種單啊，越貴越要慢、越要穩，跟舉大重量一樣，急不得。",
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
        successMessage: "最新三筆遞給小桃了。欸你看——又是 Jack Pai，20:20 深夜才入帳，這已經是它今晚第三次冒出來了吧？同一筆單在我眼前晃三遍，我這直覺就開始癢。先別動它，把名字釘牢——這筆遲早得有人把它查個明白，今晚先盯緊，別讓它溜了。",
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
          direction: "WHERE 已經鎖定 NW-1001。只要把 SET status 的值改成 packed。（不確定 status 能填哪些？打開右邊透視鏡的「每欄是什麼」，看 status 的規則。）",
          skeleton: `UPDATE shop_orders
SET status = '新狀態'
WHERE order_no = '訂單編號';`,
          answer: `UPDATE shop_orders
SET status = 'packed'
WHERE order_no = 'NW-1001';`
        },
        successMessage: "穩。NW-1001 貼好標籤、進打包區了，旁邊一筆都沒碰到——你 WHERE 鎖得很乾淨，核心有收緊。抬頭看訂單牆：你只動了 shop_orders 一個欄位，那張卡片就自己從『已付款』飄到『已打包』。看到沒？牆永遠在演這張表，你才是導演。物流那邊 NW-1006 也好了，下一條，換你把它送出門。",
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
        successMessage: "上車了！NW-1006 出門，出貨時間的戳記也蓋得漂漂亮亮。怎麼樣，第一次親手把一筆單送出門，是不是比想像中爽？這就是後台那顆『出貨』按鈕背後真正在跑的事——一次把好幾個欄位改對。你剛剛做的不是練習，是真的把一個包裹送到了人家手上。",
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
          direction: "欄位和值大多已經排好。請把 status 改成 pending，total_amount 改成 0。（status 能填哪些、金額有什麼限制？右邊透視鏡「每欄是什麼」都查得到。）",
          skeleton: `INSERT INTO shop_orders (order_no, customer_name, email, city, status, total_amount, created_at, note)
VALUES ('訂單編號', '客戶姓名', 'email', '城市', '狀態', 金額, '建立時間', '備註');`,
          answer: `INSERT INTO shop_orders (order_no, customer_name, email, city, status, total_amount, created_at, note)
VALUES ('NW-1013', 'Momo Test', 'momo.test@example.com', 'Taipei', 'pending', 0, '2026-08-07 10:00:00', '客服測試單');`
        },
        successMessage: "乾淨的測試單 NW-1013 進系統了，小桃可以拿它放心跑退費流程，不會誤傷任何一個真客人——這份細心，是好操作員跟莽撞操作員的差別。你看，今晚看、查、改、補一條龍，你全走過一遍了。手感是不是回來了？剩最後一段收操，跟我走。",
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
        successMessage: "異常清單框出來了，交班報告有底了。但你盯一下 NW-1011 那筆——深夜衝動下了單、小額，然後就沒了下文，遲遲不付款，像張賴在系統裡不走的殭屍單。它就是今晚最後一條、要你親手了結的。深呼吸，最後一下，我陪你按下去。",
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
          direction: "這題要一次改 status 和 note，並且用 order_no = 'NW-1011' 鎖定單筆訂單。（cancelled 是不是合法狀態？右邊透視鏡「每欄是什麼」看 status 規則就知道。）",
          skeleton: `UPDATE shop_orders
SET status = '新狀態',
    note = '備註'
WHERE order_no = '訂單編號';`,
          answer: `UPDATE shop_orders
SET status = 'cancelled',
    note = '逾時未付款'
WHERE order_no = 'NW-1011';`
        },
        successMessage: "收操。那張殭屍單了結了，取消原因也寫得明明白白，旁邊一筆沒碰——明天白班一看 note 就懂為什麼。12 筆，從頭巡到尾，該出的出、該收的收。至於那筆 9999 的 Jack Pai？主管看了一眼說金額太大、要再等財務複核，今晚先擱著沒動——它還卡在那，留給後面接手的人去把它查個清楚。我跟你說真的——你今晚做完了一件完整的事，不是十題練習，是一整個夜班。明天接班的人不認識你，但他會謝謝你。換口氣吧，辛苦了。",
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
    tables: ["users", "skills", "coaches", "coach_link_skill", "courses", "course_bookings", "credit_packages", "credit_purchases", "orders"],
    lead:
      "這一章先不急著 JOIN。學生先看懂一件事：資料庫常把資料拆成多張表，再用 id 把資料連回來。",
    mission:
      "LiveFit 的資料不再塞在一張大表裡。海姐把會員、教練、課程、報名、訂單拆成 users、coaches、courses、course_bookings、orders 等好幾張表，請你先理解主鍵和外鍵，再用查詢順著外鍵在表與表之間找到對應的資料。",
    coachLine:
      "看到 user_id、course_id、skill_id 先不要怕。它們不是新魔王，只是用數字指向另一張表的某一筆資料。",
    teaching:
      "主鍵通常是本表每一筆資料的 id；外鍵則是指向另一張表的 id。例如 courses.user_id 指向 users.id（開課教練），course_bookings.course_id 指向 courses.id。先用查詢順著外鍵確認 id 對得上，比硬背 JOIN 更踏實。",
    syntax: `SELECT id, name, user_id
FROM courses
ORDER BY id;`,
    exercises: [
      {
        id: "w5-06-01",
        title: "先看 coaches 表的外鍵",
        description: "海姐：認關聯第一步，先看 coaches 表。它的 user_id 就是外鍵——指向 users 表的某個人。查 coaches 的 id 和 user_id。",
        tags: ["主鍵外鍵", "關聯"],
        type: "query",
        starterSql: `SELECT *
FROM coaches;`,
        hints: {
          direction: "把 SELECT * 改成只選 id 和 user_id 兩欄。",
          skeleton: `SELECT 欄位, 欄位
FROM coaches;`,
          answer: `SELECT id, user_id
FROM coaches
ORDER BY id;`
        },
        successMessage: "看到了嗎——每位教練都帶一個 user_id，那就是外鍵，順著它就能找到這位教練是 users 裡的哪個人。",
        referenceSql: `SELECT id, user_id
FROM coaches
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
      },
      {
        id: "w5-06-02",
        title: "用外鍵找某教練開的課",
        description: "課程表 courses 的 user_id 指向開課的教練（一個 user）。查 user_id = 2 這位教練開了哪些課，回傳 id、name。",
        tags: ["外鍵查詢", "WHERE"],
        type: "query",
        starterSql: `SELECT id, name
FROM courses;`,
        hints: {
          direction: "加上 WHERE user_id = 2，只留下這位教練的課。",
          skeleton: `SELECT id, name
FROM courses
WHERE user_id = 編號;`,
          answer: `SELECT id, name
FROM courses
WHERE user_id = 2
ORDER BY id;`
        },
        successMessage: "這就是「用外鍵查關聯」：courses.user_id 一鎖，就把這位教練的課全撈出來了。",
        referenceSql: `SELECT id, name
FROM courses
WHERE user_id = 2
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "WHERE"]
      },
      {
        id: "w5-06-03",
        title: "看某學員報了哪些課",
        description: "報名表 course_bookings 同時帶 user_id（誰報的）和 course_id（報哪堂）。查 user_id = 6 這位學員的報名，回傳 id、course_id。",
        tags: ["一對多", "WHERE"],
        type: "query",
        starterSql: `SELECT id, course_id
FROM course_bookings;`,
        hints: {
          direction: "加 WHERE user_id = 6，鎖定這位學員。",
          skeleton: `SELECT id, course_id
FROM course_bookings
WHERE user_id = 編號;`,
          answer: `SELECT id, course_id
FROM course_bookings
WHERE user_id = 6
ORDER BY id;`
        },
        successMessage: "一個學員可以有很多筆報名——這就是「一對多」。注意他報了同一堂課（course_id=1）兩次喔，這個之後辦案會用到。",
        referenceSql: `SELECT id, course_id
FROM course_bookings
WHERE user_id = 6
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "WHERE"]
      },
      {
        id: "w5-06-04",
        title: "看某堂課有誰報名",
        description: "換個方向：同一張 course_bookings，這次用 course_id 查。查 course_id = 1 這堂課有哪些學員報名，回傳 id、user_id。",
        tags: ["一對多", "WHERE"],
        type: "query",
        starterSql: `SELECT id, user_id
FROM course_bookings;`,
        hints: {
          direction: "加 WHERE course_id = 1。",
          skeleton: `SELECT id, user_id
FROM course_bookings
WHERE course_id = 編號;`,
          answer: `SELECT id, user_id
FROM course_bookings
WHERE course_id = 1
ORDER BY id;`
        },
        successMessage: "同一張表，換個外鍵欄位就換個視角：剛剛是「某人報哪些課」，現在是「某課有誰報」。關聯是雙向的。",
        referenceSql: `SELECT id, user_id
FROM course_bookings
WHERE course_id = 1
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "WHERE"]
      },
      {
        id: "w5-06-05",
        title: "教練與專長：多對多",
        description: "一位教練可以有多個專長，一個專長也有多位教練——中間靠 coach_link_skill 這張對照表。查 coach_id = 1 這位教練連到哪些 skill_id。",
        tags: ["多對多", "對照表"],
        type: "query",
        starterSql: `SELECT coach_id, skill_id
FROM coach_link_skill;`,
        hints: {
          direction: "加 WHERE coach_id = 1。",
          skeleton: `SELECT coach_id, skill_id
FROM coach_link_skill
WHERE coach_id = 編號;`,
          answer: `SELECT coach_id, skill_id
FROM coach_link_skill
WHERE coach_id = 1
ORDER BY skill_id;`
        },
        successMessage: "這就是「多對多」的接法：不直接連，而是中間放一張對照表。教練 1 連到兩個專長，看到了吧。",
        referenceSql: `SELECT coach_id, skill_id
FROM coach_link_skill
WHERE coach_id = 1
ORDER BY skill_id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "WHERE"]
      },
      {
        id: "w5-06-06",
        title: "看某學員的金流訂單",
        description: "orders 是買點數方案的金流訂單，user_id 指向下單的學員。查 user_id = 11 這位學員的訂單，回傳 merchant_order_no、amount、payment_status。",
        tags: ["外鍵查詢", "訂單"],
        type: "query",
        starterSql: `SELECT merchant_order_no, amount, payment_status
FROM orders;`,
        hints: {
          direction: "加 WHERE user_id = 11。",
          skeleton: `SELECT merchant_order_no, amount, payment_status
FROM orders
WHERE user_id = 編號;`,
          answer: `SELECT merchant_order_no, amount, payment_status
FROM orders
WHERE user_id = 11
ORDER BY id;`
        },
        successMessage: "這位學員有兩筆訂單，一筆 paid 一筆 unpaid——那筆沒付的，之後辦案會回來查它。",
        referenceSql: `SELECT merchant_order_no, amount, payment_status
FROM orders
WHERE user_id = 11
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "WHERE"]
      },
      {
        id: "w5-06-07",
        title: "用 role 區分教練與學員",
        description: "users 表把教練和學員放在一起，用 role 欄位區分（COACH / USER）。撈出所有 role 是 COACH 的人，回傳 id、name。",
        tags: ["role", "WHERE"],
        type: "query",
        starterSql: `SELECT id, name
FROM users;`,
        hints: {
          direction: "加 WHERE role = 'COACH'，字串要加單引號。",
          skeleton: `SELECT id, name
FROM users
WHERE role = '角色';`,
          answer: `SELECT id, name
FROM users
WHERE role = 'COACH'
ORDER BY id;`
        },
        successMessage: "一張 users 表用 role 同時裝下教練和學員——這就是真實系統省表的方式。教練其實就是一種 user。",
        referenceSql: `SELECT id, name
FROM users
WHERE role = 'COACH'
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "WHERE"]
      },
      {
        id: "w5-06-08",
        title: "找某專長的所有課程",
        description: "courses 的 skill_id 指向這堂課的專長。查 skill_id = 1（重訓）的課，回傳 id、name。",
        tags: ["外鍵查詢", "WHERE"],
        type: "query",
        starterSql: `SELECT id, name
FROM courses;`,
        hints: {
          direction: "加 WHERE skill_id = 1。",
          skeleton: `SELECT id, name
FROM courses
WHERE skill_id = 編號;`,
          answer: `SELECT id, name
FROM courses
WHERE skill_id = 1
ORDER BY id;`
        },
        successMessage: "同一個專長底下會開很多堂課，又是一個一對多。你已經很會用外鍵在表之間穿梭了。",
        referenceSql: `SELECT id, name
FROM courses
WHERE skill_id = 1
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "WHERE"]
      },
      {
        id: "w5-06-09",
        title: "看某方案被誰買過",
        description: "credit_purchases 記錄誰買了哪個方案。查 credit_package_id = 4（VIP 50 堂包）被哪些學員買過，回傳 id、user_id。",
        tags: ["外鍵查詢", "WHERE"],
        type: "query",
        starterSql: `SELECT id, user_id
FROM credit_purchases;`,
        hints: {
          direction: "加 WHERE credit_package_id = 4。",
          skeleton: `SELECT id, user_id
FROM credit_purchases
WHERE credit_package_id = 編號;`,
          answer: `SELECT id, user_id
FROM credit_purchases
WHERE credit_package_id = 4
ORDER BY id;`
        },
        successMessage: "認得 user_id=11 嗎？又是他——VIP 方案就是他買的。這張關聯網你已經摸熟了，接下來就把這些表用 JOIN 接起來。",
        referenceSql: `SELECT id, user_id
FROM credit_purchases
WHERE credit_package_id = 4
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "WHERE"]
      }
    ]
  },
  {
    id: "postgres-functions",
    section: "postgres 函式",
    title: "07 postgres 函式：字串、日期、NULL 與 CASE",
    label: "W5-07",
    tables: ["users", "skills", "coaches", "courses", "course_bookings", "credit_packages", "orders"],
    lead:
      "這一章把單筆資料加工：大小寫、長度、日期、四捨五入、NULL 處理，還有用 CASE 把機器值翻成人看得懂的字。",
    mission:
      "LiveFit 要把原始欄位整理成看得懂的樣子。海姐請你先把空值（NULL）處理好，再練字串、日期、四捨五入，最後用 CASE 把狀態翻成中文。",
    coachLine:
      "函式不是魔法，先把它當成資料庫幫你加工一下、整理一下。每題只放一個重點就好。",
    teaching:
      "NULL 代表沒有資料，不是空字串也不是 0；COALESCE 可以把 NULL 顯示成替代文字。UPPER／LENGTH／SPLIT_PART 處理字串，EXTRACT 取日期的某一部分，ROUND 四捨五入，CASE 則像 if-else，把值翻成你想要的樣子。另外你會看到結果常加 ::int，那是把算出來的數字轉成整數；而 EXTRACT(EPOCH FROM 兩個時間相減) 會給你總秒數，再自己除以 60 換成分鐘。",
    syntax: `SELECT name, UPPER(name) AS upper_name
FROM users
WHERE role = 'COACH';`,
    exercises: [
      {
        id: "w5-07-01",
        title: "把教練名字轉大寫",
        description: "UPPER() 把文字轉大寫。撈出所有教練（role=COACH）的 name，並多一欄 upper_name 是大寫版。",
        tags: ["字串函式", "UPPER"],
        type: "query",
        starterSql: `SELECT name
FROM users
WHERE role = 'COACH';`,
        hints: {
          direction: "多選一欄 UPPER(name) AS upper_name。",
          skeleton: `SELECT name, UPPER(欄位) AS upper_name
FROM users
WHERE role = 'COACH';`,
          answer: `SELECT name, UPPER(name) AS upper_name
FROM users
WHERE role = 'COACH'
ORDER BY id;`
        },
        successMessage: "UPPER 是最常見的字串函式之一，跟 LOWER 一對。AS 幫算出來的欄位取個好名字。",
        referenceSql: `SELECT name, UPPER(name) AS upper_name
FROM users
WHERE role = 'COACH'
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
      },
      {
        id: "w5-07-02",
        title: "算專長名稱的字數",
        description: "LENGTH() 算文字長度。回傳每個 skill 的 name，和一欄 name_length 是它的字數。",
        tags: ["字串函式", "LENGTH"],
        type: "query",
        starterSql: `SELECT name
FROM skills;`,
        hints: {
          direction: "多選 LENGTH(name) AS name_length。",
          skeleton: `SELECT name, LENGTH(欄位) AS name_length
FROM skills;`,
          answer: `SELECT name, LENGTH(name) AS name_length
FROM skills
ORDER BY id;`
        },
        successMessage: "LENGTH 數的是「字數」，所以中文也是一個字算一個。皮拉提斯 4 個字，重訓 2 個字。",
        referenceSql: `SELECT name, LENGTH(name) AS name_length
FROM skills
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
      },
      {
        id: "w5-07-03",
        title: "取出開課的月份",
        description: "EXTRACT() 從日期時間抓出某個部分。回傳每堂課的 name，和一欄 start_month 是 start_at 的月份。",
        tags: ["日期函式", "EXTRACT"],
        type: "query",
        starterSql: `SELECT name, start_at
FROM courses;`,
        hints: {
          direction: "用 EXTRACT(MONTH FROM start_at) 取月份，外面包 ::int 變整數。",
          skeleton: `SELECT name, EXTRACT(MONTH FROM 欄位)::int AS start_month
FROM courses;`,
          answer: `SELECT name, EXTRACT(MONTH FROM start_at)::int AS start_month
FROM courses
ORDER BY id;`
        },
        successMessage: "EXTRACT 可以抓 YEAR / MONTH / DAY / HOUR…，分析時間資料超常用。（這批課剛好都排在 7 月，所以月份全顯示 7——資料本來就這樣，不是你寫錯。）",
        referenceSql: `SELECT name, EXTRACT(MONTH FROM start_at)::int AS start_month
FROM courses
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
      },
      {
        id: "w5-07-04",
        title: "方案價格四捨五入",
        description: "ROUND() 做四捨五入。回傳每個方案的 name，和一欄 price 是 price 四捨五入成整數。",
        tags: ["數值函式", "ROUND"],
        type: "query",
        starterSql: `SELECT name, price
FROM credit_packages;`,
        hints: {
          direction: "用 ROUND(price) 再 ::int。",
          skeleton: `SELECT name, ROUND(欄位)::int AS price
FROM credit_packages;`,
          answer: `SELECT name, ROUND(price)::int AS price
FROM credit_packages
ORDER BY id;`
        },
        successMessage: "ROUND 還能指定小數位，例如 ROUND(price, 1)。金額顯示常常用得到。",
        referenceSql: `SELECT name, ROUND(price)::int AS price
FROM credit_packages
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
      },
      {
        id: "w5-07-05",
        title: "沒有照片就顯示替代字",
        description: "有些教練的 profile_image_url 是空的（NULL）。用 COALESCE 讓沒照片的顯示「尚未上傳」。回傳 id 和一欄 photo。",
        tags: ["NULL 處理", "COALESCE"],
        type: "query",
        starterSql: `SELECT id, profile_image_url
FROM coaches;`,
        hints: {
          direction: "用 COALESCE(profile_image_url, '尚未上傳') AS photo。",
          skeleton: `SELECT id, COALESCE(欄位, '替代字') AS photo
FROM coaches;`,
          answer: `SELECT id, COALESCE(profile_image_url, '尚未上傳') AS photo
FROM coaches
ORDER BY id;`
        },
        successMessage: "COALESCE 回傳第一個不是 NULL 的值——處理「可能是空」的欄位的標準做法。",
        referenceSql: `SELECT id, COALESCE(profile_image_url, '尚未上傳') AS photo
FROM coaches
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
      },
      {
        id: "w5-07-06",
        title: "把付款狀態翻成中文",
        description: "用 CASE 把 orders 的 payment_status 翻成中文。回傳 merchant_order_no，和一欄 status_zh：paid→已付款、unpaid→未付款、failed→付款失敗。",
        tags: ["CASE", "條件"],
        type: "query",
        starterSql: `SELECT merchant_order_no, payment_status
FROM orders;`,
        hints: {
          direction: "用 CASE payment_status WHEN 'paid' THEN '已付款' … END AS status_zh。",
          skeleton: `SELECT merchant_order_no,
       CASE payment_status WHEN '值' THEN '中文' ... END AS status_zh
FROM orders;`,
          answer: `SELECT merchant_order_no,
       CASE payment_status
         WHEN 'paid' THEN '已付款'
         WHEN 'unpaid' THEN '未付款'
         WHEN 'failed' THEN '付款失敗'
       END AS status_zh
FROM orders
ORDER BY id;`
        },
        successMessage: "CASE 是 SQL 裡的 if-else，把機器值翻成人看得懂的字，報表最愛用。",
        referenceSql: `SELECT merchant_order_no,
       CASE payment_status
         WHEN 'paid' THEN '已付款'
         WHEN 'unpaid' THEN '未付款'
         WHEN 'failed' THEN '付款失敗'
       END AS status_zh
FROM orders
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"],
        requiredPatterns: [{ label: "這題要用 CASE。", pattern: "\\bCASE\\b" }]
      },
      {
        id: "w5-07-07",
        title: "算每堂課多長（分鐘）",
        description: "課程有 start_at 和 end_at。兩個時間相減得到一段時間，用 EXTRACT(EPOCH …) 換算成分鐘。回傳 name 和一欄 minutes。",
        tags: ["日期運算", "EXTRACT"],
        type: "query",
        starterSql: `SELECT name, start_at, end_at
FROM courses;`,
        hints: {
          direction: "(end_at - start_at) 是一段時間，用 EXTRACT(EPOCH FROM …) 取秒數再 /60，最後 ::int。",
          skeleton: `SELECT name,
       (EXTRACT(EPOCH FROM (end_at - start_at)) / 60)::int AS minutes
FROM courses;`,
          answer: `SELECT name,
       (EXTRACT(EPOCH FROM (end_at - start_at)) / 60)::int AS minutes
FROM courses
ORDER BY id;`
        },
        successMessage: "兩個時間相減會得到 interval，EXTRACT(EPOCH …) 把它變成秒，再換算成你要的單位。",
        referenceSql: `SELECT name,
       (EXTRACT(EPOCH FROM (end_at - start_at)) / 60)::int AS minutes
FROM courses
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
      },
      {
        id: "w5-07-08",
        title: "判斷學員有沒有出席",
        description: "course_bookings 的 join_at 是空的代表沒進過教室。用 CASE 判斷：join_at 是 NULL→「未出席」，否則「已出席」。回傳 id 和一欄 attended。",
        tags: ["CASE", "NULL"],
        type: "query",
        starterSql: `SELECT id, join_at
FROM course_bookings;`,
        hints: {
          direction: "用 CASE WHEN join_at IS NULL THEN '未出席' ELSE '已出席' END。",
          skeleton: `SELECT id,
       CASE WHEN 欄位 IS NULL THEN '未出席' ELSE '已出席' END AS attended
FROM course_bookings;`,
          answer: `SELECT id,
       CASE WHEN join_at IS NULL THEN '未出席' ELSE '已出席' END AS attended
FROM course_bookings
ORDER BY id;`
        },
        successMessage: "CASE WHEN … IS NULL 是把「有沒有值」變成看得懂的標籤——出席紀錄分析的常用招。",
        referenceSql: `SELECT id,
       CASE WHEN join_at IS NULL THEN '未出席' ELSE '已出席' END AS attended
FROM course_bookings
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"],
        requiredPatterns: [{ label: "這題要用 CASE。", pattern: "\\bCASE\\b" }]
      },
      {
        id: "w5-07-09",
        title: "從 email 取出網域",
        description: "SPLIT_PART(字串, 分隔符, 第幾段) 切字串。用 @ 切 email、取第 2 段就是網域。回傳 name 和一欄 domain。",
        tags: ["字串函式", "SPLIT_PART"],
        type: "query",
        starterSql: `SELECT name, email
FROM users;`,
        hints: {
          direction: "用 SPLIT_PART(email, '@', 2) AS domain。",
          skeleton: `SELECT name, SPLIT_PART(欄位, '@', 2) AS domain
FROM users;`,
          answer: `SELECT name, SPLIT_PART(email, '@', 2) AS domain
FROM users
ORDER BY id;`
        },
        successMessage: "SPLIT_PART 切字串很方便，分析網域、檔名、代碼都用得到。函式這關你過了，接下來進 JOIN。",
        referenceSql: `SELECT name, SPLIT_PART(email, '@', 2) AS domain
FROM users
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
      }
    ]
  },
  {
    id: "join-relations",
    section: "JOIN 資料關聯",
    title: "08 JOIN：把拆開的資料表接回來",
    label: "W5-08",
    tables: ["users", "skills", "coaches", "coach_link_skill", "courses", "course_bookings", "credit_packages", "credit_purchases", "orders"],
    lead:
      "前面已經知道資料會拆成多張表，這一章開始用 JOIN 把人名、課程名、教練名接回任務需要的清單。",
    mission:
      "LiveFit 後台不能只顯示 user_id 或 course_id。海姐請你用 JOIN 把 id 轉成看得懂的人名、課程名和教練名。",
    coachLine:
      "JOIN 的核心只有一句：左表某欄等於右表某欄。先把 ON 後面的連接條件看懂，其他慢慢來。",
    teaching:
      "先認識「表別名」：FROM coaches c 的那個 c，是幫這張表取個短綽號，後面寫 c.user_id 就等於 coaches.user_id——少打字、兩張表同名欄位時也分得清。接著看 JOIN：INNER JOIN 只留下兩邊都有對到的資料；LEFT JOIN 會保留左表全部資料；RIGHT JOIN 會保留右表全部資料；FULL JOIN 會保留兩邊全部資料。",
    syntax: `SELECT courses.name, users.name AS coach_name
FROM courses
INNER JOIN users ON courses.user_id = users.id;`,
    exercises: [
      {
        id: "w5-08-01",
        title: "教練的名字＋年資（兩表 JOIN）",
        description: "coaches 只有 user_id，名字在 users。用 INNER JOIN 把兩張表接起來，回傳 u.name、c.experience_years。",
        tags: ["INNER JOIN", "兩表"],
        type: "query",
        starterSql: `SELECT c.experience_years
FROM coaches c;`,
        hints: {
          direction: "JOIN users u ON c.user_id = u.id，再多選 u.name。",
          skeleton: `SELECT u.name, c.experience_years
FROM coaches c
JOIN users u ON c.外鍵 = u.id;`,
          answer: `SELECT u.name, c.experience_years
FROM coaches c
JOIN users u ON c.user_id = u.id
ORDER BY c.id;`
        },
        successMessage: "JOIN 就是「用外鍵把兩張表拼回一張」。c.user_id = u.id 是接點，名字就補上來了。",
        referenceSql: `SELECT u.name, c.experience_years
FROM coaches c
JOIN users u ON c.user_id = u.id
ORDER BY c.id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "JOIN"]
      },
      {
        id: "w5-08-02",
        title: "每堂課是哪位教練開的",
        description: "courses.user_id 指向開課教練。JOIN users 拿教練名字，回傳 course_name（課名）、coach_name（教練名）。",
        tags: ["INNER JOIN", "別名"],
        type: "query",
        starterSql: `SELECT co.name AS course_name
FROM courses co;`,
        hints: {
          direction: "JOIN users u ON co.user_id = u.id，多選 u.name AS coach_name。",
          skeleton: `SELECT co.name AS course_name, u.name AS coach_name
FROM courses co
JOIN users u ON co.外鍵 = u.id;`,
          answer: `SELECT co.name AS course_name, u.name AS coach_name
FROM courses co
JOIN users u ON co.user_id = u.id
ORDER BY co.id;`
        },
        successMessage: "兩張表都有 name，所以要用 AS 取別名分清楚。這就是課表後台「課名＋教練」的真實查法。",
        referenceSql: `SELECT co.name AS course_name, u.name AS coach_name
FROM courses co
JOIN users u ON co.user_id = u.id
ORDER BY co.id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "JOIN"]
      },
      {
        id: "w5-08-03",
        title: "報名清單：誰報了哪堂課（三表 JOIN）",
        description: "course_bookings 只有 user_id 和 course_id 兩個編號。一次 JOIN users 和 courses，回傳 member_name、course_name。",
        tags: ["三表 JOIN", "報名"],
        type: "query",
        starterSql: `SELECT b.user_id, b.course_id
FROM course_bookings b;`,
        hints: {
          direction: "JOIN users u ON b.user_id=u.id，再 JOIN courses c ON b.course_id=c.id，選 u.name、c.name。",
          skeleton: `SELECT u.name AS member_name, c.name AS course_name
FROM course_bookings b
JOIN users u ON b.user_id = u.id
JOIN courses c ON b.course_id = c.id;`,
          answer: `SELECT u.name AS member_name, c.name AS course_name
FROM course_bookings b
JOIN users u ON b.user_id = u.id
JOIN courses c ON b.course_id = c.id
ORDER BY b.id;`
        },
        successMessage: "兩個外鍵就接兩次 JOIN。一張全是編號的報名表，瞬間變成看得懂的人名＋課名。",
        referenceSql: `SELECT u.name AS member_name, c.name AS course_name
FROM course_bookings b
JOIN users u ON b.user_id = u.id
JOIN courses c ON b.course_id = c.id
ORDER BY b.id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "JOIN"]
      },
      {
        id: "w5-08-04",
        title: "每堂課屬於什麼專長",
        description: "courses.skill_id 指向 skills。JOIN 起來，回傳 course_name、skill_name。",
        tags: ["INNER JOIN", "別名"],
        type: "query",
        starterSql: `SELECT co.name AS course_name
FROM courses co;`,
        hints: {
          direction: "JOIN skills s ON co.skill_id = s.id，多選 s.name AS skill_name。",
          skeleton: `SELECT co.name AS course_name, s.name AS skill_name
FROM courses co
JOIN skills s ON co.外鍵 = s.id;`,
          answer: `SELECT co.name AS course_name, s.name AS skill_name
FROM courses co
JOIN skills s ON co.skill_id = s.id
ORDER BY co.id;`
        },
        successMessage: "穩。換一個外鍵（skill_id）就接到另一張表。JOIN 的套路你抓到了。",
        referenceSql: `SELECT co.name AS course_name, s.name AS skill_name
FROM courses co
JOIN skills s ON co.skill_id = s.id
ORDER BY co.id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "JOIN"]
      },
      {
        id: "w5-08-05",
        title: "每位教練會哪些專長（四表 JOIN）",
        description: "多對多要穿過對照表。從 coach_link_skill 出發，JOIN coaches→users 拿教練名、JOIN skills 拿專長名。回傳 coach_name、skill_name，依教練名、專長名排序。",
        tags: ["多對多 JOIN", "四表"],
        type: "query",
        starterSql: `SELECT cls.coach_id, cls.skill_id
FROM coach_link_skill cls;`,
        hints: {
          direction: "分三段慢慢接：① cls JOIN coaches c（ON cls.coach_id = c.id）拿到教練那一列 → ② 再 JOIN users u（ON c.user_id = u.id）拿教練名字 → ③ 另外 JOIN skills s（ON cls.skill_id = s.id）拿專長名字。一段一段加，不要一次吞四個 JOIN。",
          skeleton: `SELECT u.name AS coach_name, s.name AS skill_name
FROM coach_link_skill cls
JOIN coaches c ON cls.coach_id = c.id
JOIN users u ON c.user_id = u.id
JOIN skills s ON cls.skill_id = s.id;`,
          answer: `SELECT u.name AS coach_name, s.name AS skill_name
FROM coach_link_skill cls
JOIN coaches c ON cls.coach_id = c.id
JOIN users u ON c.user_id = u.id
JOIN skills s ON cls.skill_id = s.id
ORDER BY u.name, s.name;`
        },
        successMessage: "穿過對照表的多對多 JOIN——這題有點硬，你做到了。真實系統最常見的就是這種結構。",
        referenceSql: `SELECT u.name AS coach_name, s.name AS skill_name
FROM coach_link_skill cls
JOIN coaches c ON cls.coach_id = c.id
JOIN users u ON c.user_id = u.id
JOIN skills s ON cls.skill_id = s.id
ORDER BY u.name, s.name;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "JOIN"]
      },
      {
        id: "w5-08-06",
        title: "找出沒人報名的課（LEFT JOIN）",
        description: "INNER JOIN 會漏掉「沒有對應」的那些。用 LEFT JOIN courses → course_bookings，再篩 b.id IS NULL，就找得到一個人都沒報的課。回傳 c.name。",
        tags: ["LEFT JOIN", "IS NULL"],
        type: "query",
        starterSql: `SELECT c.name
FROM courses c
JOIN course_bookings b ON b.course_id = c.id;`,
        hints: {
          direction: "把 JOIN 改成 LEFT JOIN，再加 WHERE b.id IS NULL。",
          skeleton: `SELECT c.name
FROM courses c
LEFT JOIN course_bookings b ON b.course_id = c.id
WHERE b.id IS NULL;`,
          answer: `SELECT c.name
FROM courses c
LEFT JOIN course_bookings b ON b.course_id = c.id
WHERE b.id IS NULL
ORDER BY c.id;`
        },
        successMessage: "LEFT JOIN 的看家本領：連「什麼都沒發生」的課都照得出來。沒人報的課行銷得知道。",
        referenceSql: `SELECT c.name
FROM courses c
LEFT JOIN course_bookings b ON b.course_id = c.id
WHERE b.id IS NULL
ORDER BY c.id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "LEFT JOIN"]
      },
      {
        id: "w5-08-07",
        title: "誰買了哪個方案",
        description: "credit_purchases 連著學員和方案。JOIN users 和 credit_packages，回傳 member_name、package_name。",
        tags: ["三表 JOIN", "購買"],
        type: "query",
        starterSql: `SELECT cp.user_id, cp.credit_package_id
FROM credit_purchases cp;`,
        hints: {
          direction: "JOIN users u ON cp.user_id=u.id，JOIN credit_packages p ON cp.credit_package_id=p.id。",
          skeleton: `SELECT u.name AS member_name, p.name AS package_name
FROM credit_purchases cp
JOIN users u ON cp.user_id = u.id
JOIN credit_packages p ON cp.credit_package_id = p.id;`,
          answer: `SELECT u.name AS member_name, p.name AS package_name
FROM credit_purchases cp
JOIN users u ON cp.user_id = u.id
JOIN credit_packages p ON cp.credit_package_id = p.id
ORDER BY cp.id;`
        },
        successMessage: "看到了嗎——同一個人 Jack 又冒出來了。這種「誰買了什麼」的 JOIN，是營收分析的起點。",
        referenceSql: `SELECT u.name AS member_name, p.name AS package_name
FROM credit_purchases cp
JOIN users u ON cp.user_id = u.id
JOIN credit_packages p ON cp.credit_package_id = p.id
ORDER BY cp.id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "JOIN"]
      },
      {
        id: "w5-08-08",
        title: "未付款訂單是誰的（JOIN＋WHERE＋排序）",
        description: "把 orders 接上 users，篩出 payment_status 是 unpaid 的，依金額由大到小排。回傳 member_name、amount。",
        tags: ["JOIN", "WHERE", "ORDER BY"],
        type: "query",
        starterSql: `SELECT u.name AS member_name, o.amount
FROM orders o
JOIN users u ON o.user_id = u.id;`,
        hints: {
          direction: "加 WHERE o.payment_status = 'unpaid'，再 ORDER BY o.amount DESC。",
          skeleton: `SELECT u.name AS member_name, o.amount
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.payment_status = '狀態'
ORDER BY o.amount DESC;`,
          answer: `SELECT u.name AS member_name, o.amount
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.payment_status = 'unpaid'
ORDER BY o.amount DESC;`
        },
        successMessage: "JOIN＋WHERE＋ORDER BY 三招齊發——排最上面那筆 9000 的未付款，就是之後辦案要追的卡關訂單。",
        referenceSql: `SELECT u.name AS member_name, o.amount
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.payment_status = 'unpaid'
ORDER BY o.amount DESC;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "JOIN", "WHERE", "ORDER BY"]
      }
    ]
  },
  {
    id: "group-aggregation",
    section: "group by 分組資料",
    title: "09 GROUP BY：把資料分組成報表",
    label: "W5-09",
    tables: ["users", "coach_link_skill", "courses", "course_bookings", "credit_purchases", "orders"],
    lead:
      "GROUP BY 會把很多列資料依照某個欄位分組，再用 COUNT、SUM、AVG 做摘要。",
    mission:
      "LiveFit 後台開始需要報表：每堂課報名數、每位教練開幾堂、每個方案的營收。海姐請你用 GROUP BY 做第一批摘要。",
    coachLine:
      "GROUP BY 的心法是：SELECT 裡沒被函式包起來的欄位，通常就要放進 GROUP BY。",
    teaching:
      "COUNT 算筆數，SUM 算總和，AVG 算平均。GROUP BY 會決定要依照哪個欄位分組，HAVING 則是在分組後篩選群組。",
    syntax: `SELECT course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY course_id;`,
    exercises: [
      {
        id: "w5-09-01",
        title: "每堂課有幾筆報名",
        description: "GROUP BY 把同一群湊在一起算。依 course_id 分組，數每組幾筆。回傳 course_id、booking_count。",
        tags: ["GROUP BY", "COUNT"],
        type: "query",
        starterSql: `SELECT course_id
FROM course_bookings;`,
        hints: {
          direction: "加 COUNT(*)::int AS booking_count，再 GROUP BY course_id。",
          skeleton: `SELECT course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY 欄位;`,
          answer: `SELECT course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY course_id
ORDER BY course_id;`
        },
        successMessage: "GROUP BY course_id ＋ COUNT(*)：每堂課多少筆報名，一行一堂。聚合的第一招。",
        referenceSql: `SELECT course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY course_id
ORDER BY course_id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "GROUP BY"]
      },
      {
        id: "w5-09-02",
        title: "每位教練開了幾堂課",
        description: "依 courses.user_id 分組數課數。回傳 user_id、course_count。",
        tags: ["GROUP BY", "COUNT"],
        type: "query",
        starterSql: `SELECT user_id
FROM courses;`,
        hints: {
          direction: "COUNT(*)::int AS course_count，GROUP BY user_id。",
          skeleton: `SELECT user_id, COUNT(*)::int AS course_count
FROM courses
GROUP BY 欄位;`,
          answer: `SELECT user_id, COUNT(*)::int AS course_count
FROM courses
GROUP BY user_id
ORDER BY user_id;`
        },
        successMessage: "換一張表、換一個欄位分組，招式一樣。每位教練的開課量一目了然。",
        referenceSql: `SELECT user_id, COUNT(*)::int AS course_count
FROM courses
GROUP BY user_id
ORDER BY user_id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "GROUP BY"]
      },
      {
        id: "w5-09-03",
        title: "每個方案賣了多少錢",
        description: "SUM 加總。依 credit_purchases.credit_package_id 分組，加總 price_paid。回傳 credit_package_id、revenue。",
        tags: ["GROUP BY", "SUM"],
        type: "query",
        starterSql: `SELECT credit_package_id
FROM credit_purchases;`,
        hints: {
          direction: "SUM(price_paid)::int AS revenue，GROUP BY credit_package_id。",
          skeleton: `SELECT credit_package_id, SUM(欄位)::int AS revenue
FROM credit_purchases
GROUP BY 欄位;`,
          answer: `SELECT credit_package_id, SUM(price_paid)::int AS revenue
FROM credit_purchases
GROUP BY credit_package_id
ORDER BY credit_package_id;`
        },
        successMessage: "COUNT 數筆數，SUM 加金額。每個方案的營收這樣就算出來了。",
        referenceSql: `SELECT credit_package_id, SUM(price_paid)::int AS revenue
FROM credit_purchases
GROUP BY credit_package_id
ORDER BY credit_package_id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "GROUP BY"]
      },
      {
        id: "w5-09-04",
        title: "誰花最多錢（分組加總＋排序）",
        description: "依 user_id 分組加總 price_paid，由大到小排，看誰是大戶。回傳 user_id、total_spent。",
        tags: ["GROUP BY", "SUM", "ORDER BY"],
        type: "query",
        starterSql: `SELECT user_id, SUM(price_paid)::int AS total_spent
FROM credit_purchases
GROUP BY user_id;`,
        hints: {
          direction: "在後面加 ORDER BY total_spent DESC。",
          skeleton: `SELECT user_id, SUM(price_paid)::int AS total_spent
FROM credit_purchases
GROUP BY user_id
ORDER BY 欄位 DESC;`,
          answer: `SELECT user_id, SUM(price_paid)::int AS total_spent
FROM credit_purchases
GROUP BY user_id
ORDER BY total_spent DESC;`
        },
        successMessage: "花最多的是 user_id=11，共 13000，遠超其他人——收入集中在少數人身上，這正是之後辦案的線索之一。",
        referenceSql: `SELECT user_id, SUM(price_paid)::int AS total_spent
FROM credit_purchases
GROUP BY user_id
ORDER BY total_spent DESC;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "GROUP BY", "ORDER BY"]
      },
      {
        id: "w5-09-05",
        title: "只留報名超過 1 筆的課（HAVING）",
        description: "分組後要篩條件，用 HAVING（不是 WHERE）。依 course_id 分組數筆數，只留 COUNT 大於 1 的。回傳 course_id、booking_count。",
        tags: ["HAVING", "GROUP BY"],
        type: "query",
        starterSql: `SELECT course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY course_id;`,
        hints: {
          direction: "在 GROUP BY 後面加 HAVING COUNT(*) > 1。",
          skeleton: `SELECT course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY course_id
HAVING COUNT(*) > 數字;`,
          answer: `SELECT course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY course_id
HAVING COUNT(*) > 1
ORDER BY course_id;`
        },
        successMessage: "WHERE 篩「分組前的每一列」，HAVING 篩「分組後的每一組」——這是聚合最容易搞混的點，你掌握了。",
        referenceSql: `SELECT course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY course_id
HAVING COUNT(*) > 1
ORDER BY course_id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "GROUP BY", "HAVING"]
      },
      {
        id: "w5-09-06",
        title: "訂單各狀態各幾筆",
        description: "依 payment_status 分組數筆數，看付款狀況分布。回傳 payment_status、order_count。",
        tags: ["GROUP BY", "COUNT"],
        type: "query",
        starterSql: `SELECT payment_status
FROM orders;`,
        hints: {
          direction: "COUNT(*)::int AS order_count，GROUP BY payment_status。",
          skeleton: `SELECT payment_status, COUNT(*)::int AS order_count
FROM orders
GROUP BY 欄位;`,
          answer: `SELECT payment_status, COUNT(*)::int AS order_count
FROM orders
GROUP BY payment_status
ORDER BY payment_status;`
        },
        successMessage: "paid 5 筆、unpaid 2 筆、failed 1 筆——一眼看出金流健康度。狀態分布是後台儀表板的常客。",
        referenceSql: `SELECT payment_status, COUNT(*)::int AS order_count
FROM orders
GROUP BY payment_status
ORDER BY payment_status;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "GROUP BY"]
      },
      {
        id: "w5-09-07",
        title: "每堂課報名數（含 0，JOIN＋GROUP BY）",
        description: "要連「0 筆報名」的課也算進來，得用 LEFT JOIN 再 GROUP BY。courses LEFT JOIN course_bookings，依課名分組數報名 id。回傳 course_name、booking_count。",
        tags: ["LEFT JOIN", "GROUP BY"],
        type: "query",
        starterSql: `SELECT c.name AS course_name, COUNT(b.id)::int AS booking_count
FROM courses c
JOIN course_bookings b ON b.course_id = c.id
GROUP BY c.name;`,
        hints: {
          direction: "把 JOIN 改成 LEFT JOIN，這樣沒人報的課也會留下、COUNT(b.id) 算 0。",
          skeleton: `SELECT c.name AS course_name, COUNT(b.id)::int AS booking_count
FROM courses c
LEFT JOIN course_bookings b ON b.course_id = c.id
GROUP BY c.name;`,
          answer: `SELECT c.name AS course_name, COUNT(b.id)::int AS booking_count
FROM courses c
LEFT JOIN course_bookings b ON b.course_id = c.id
GROUP BY c.name
ORDER BY c.name;`
        },
        successMessage: "COUNT(b.id) 不算 NULL，所以沒人報的課剛好是 0——LEFT JOIN ＋ GROUP BY 的經典組合。",
        referenceSql: `SELECT c.name AS course_name, COUNT(b.id)::int AS booking_count
FROM courses c
LEFT JOIN course_bookings b ON b.course_id = c.id
GROUP BY c.name
ORDER BY c.name;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "LEFT JOIN", "GROUP BY"]
      },
      {
        id: "w5-09-08",
        title: "教練與學員各有幾人",
        description: "依 users.role 分組數人數。回傳 role、user_count。",
        tags: ["GROUP BY", "COUNT"],
        type: "query",
        starterSql: `SELECT role
FROM users;`,
        hints: {
          direction: "COUNT(*)::int AS user_count，GROUP BY role。",
          skeleton: `SELECT role, COUNT(*)::int AS user_count
FROM users
GROUP BY 欄位;`,
          answer: `SELECT role, COUNT(*)::int AS user_count
FROM users
GROUP BY role
ORDER BY role;`
        },
        successMessage: "5 位教練、7 位學員。用 role 分組，一張 users 表就看出組成。聚合這關你很穩。",
        referenceSql: `SELECT role, COUNT(*)::int AS user_count
FROM users
GROUP BY role
ORDER BY role;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "GROUP BY"]
      }
    ]
  },
  {
    id: "subquery-practice",
    section: "子查詢",
    title: "10 子查詢：先查一段，再拿來當條件",
    label: "W5-10",
    tables: ["users", "courses", "course_bookings", "credit_packages", "credit_purchases"],
    lead:
      "子查詢就是把一段 SELECT 放進另一段 SQL 裡。先從 WHERE 子查詢開始，慢慢看懂資料庫如何分兩步回答問題。",
    mission:
      "海姐開始問比較像後台分析的問題：高於平均值、沒有報名、某堂課的報名者。你要用子查詢把答案挖出來。",
    coachLine:
      "子查詢看起來長，但可以先讀括號裡面。括號裡先算出條件，外面的查詢再使用這個條件。",
    teaching:
      "常見子查詢會出現在 WHERE 裡，例如 IN、NOT IN、= (SELECT ...)。也可以放在 SELECT 裡，幫每列資料多算一個摘要。子查詢還能放在 FROM 後面當成一張臨時表（衍生表），這時一定要給它取個別名，例如 (SELECT ...) AS t——要算「平均的最大值」這種兩層摘要時就會用到。",
    syntax: `SELECT name, price
FROM credit_packages
WHERE price > (SELECT AVG(price) FROM credit_packages);`,
    exercises: [
      {
        id: "w5-10-01",
        title: "從沒買過點數的學員（NOT IN 子查詢）",
        description: "子查詢可以當另一個查詢的條件。先用子查詢列出「有買過的 user_id」，再用 NOT IN 找出沒買過的學員（role=USER）。回傳 id、name。",
        tags: ["子查詢", "NOT IN"],
        type: "query",
        starterSql: `SELECT id, name
FROM users
WHERE role = 'USER';`,
        hints: {
          direction: "加 AND id NOT IN (SELECT user_id FROM credit_purchases)。",
          skeleton: `SELECT id, name
FROM users
WHERE role = 'USER'
  AND id NOT IN (SELECT 欄位 FROM credit_purchases);`,
          answer: `SELECT id, name
FROM users
WHERE role = 'USER'
  AND id NOT IN (SELECT user_id FROM credit_purchases)
ORDER BY id;`
        },
        successMessage: "子查詢先算出一份名單，外層再拿來比對。NOT IN 找「不在名單裡」的人——這兩位學員的 credit_purchases 裡一筆都沒有（沒成功買到點數）。",
        referenceSql: `SELECT id, name
FROM users
WHERE role = 'USER'
  AND id NOT IN (SELECT user_id FROM credit_purchases)
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "IN"],
        requiredPatterns: [{ label: "這題要用 NOT IN 找「不在名單裡」的人，別漏了 NOT。", pattern: "\\bNOT\\s+IN\\b" }]
      },
      {
        id: "w5-10-02",
        title: "買過 VIP 方案的人（IN 子查詢）",
        description: "用子查詢列出「買過 credit_package_id=4（VIP）的 user_id」，外層 IN 撈出這些人。回傳 id、name。",
        tags: ["子查詢", "IN"],
        type: "query",
        starterSql: `SELECT id, name
FROM users;`,
        hints: {
          direction: "WHERE id IN (SELECT user_id FROM credit_purchases WHERE credit_package_id = 4)。",
          skeleton: `SELECT id, name
FROM users
WHERE id IN (SELECT user_id FROM credit_purchases WHERE 條件);`,
          answer: `SELECT id, name
FROM users
WHERE id IN (SELECT user_id FROM credit_purchases WHERE credit_package_id = 4)
ORDER BY id;`
        },
        successMessage: "IN（子查詢）：外層只留下「在子查詢結果裡」的人。又是他——Jack 買過 VIP。",
        referenceSql: `SELECT id, name
FROM users
WHERE id IN (SELECT user_id FROM credit_purchases WHERE credit_package_id = 4)
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "IN"]
      },
      {
        id: "w5-10-03",
        title: "比平均貴的方案（純量子查詢）",
        description: "先從最好上手的子查詢開始：(SELECT AVG(price) FROM credit_packages) 會回傳一個數字，可以直接放在 WHERE 比大小。找出 price 高於平均的方案，回傳 name、price。",
        tags: ["純量子查詢", "AVG"],
        type: "query",
        starterSql: `SELECT name, price
FROM credit_packages;`,
        hints: {
          direction: "加 WHERE price > (SELECT AVG(price) FROM credit_packages)，再 ORDER BY price。",
          skeleton: `SELECT name, price
FROM credit_packages
WHERE price > (SELECT AVG(price) FROM credit_packages);`,
          answer: `SELECT name, price
FROM credit_packages
WHERE price > (SELECT AVG(price) FROM credit_packages)
ORDER BY price;`
        },
        successMessage: "回傳單一數字的子查詢叫「純量子查詢」，可以當成一個值直接比較——這是子查詢裡最好上手的一種。後面會練 IN／NOT IN 的子查詢，再把子查詢疊成衍生表，難度一階一階上，慢慢來。",
        referenceSql: `SELECT name, price
FROM credit_packages
WHERE price > (SELECT AVG(price) FROM credit_packages)
ORDER BY price;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "WHERE"]
      },
      {
        id: "w5-10-04",
        title: "有開課的教練（IN 子查詢）",
        description: "先用子查詢撈出「有開過課的 user_id」名單，外層再用 IN 從教練裡挑出在名單裡的人。找出 role=COACH 且 id 在那份名單裡的，回傳 id、name。",
        tags: ["子查詢", "IN"],
        type: "query",
        starterSql: `SELECT id, name
FROM users
WHERE role = 'COACH';`,
        hints: {
          direction: "加 AND id IN (SELECT user_id FROM courses)——括號裡先列出所有開過課的人。",
          skeleton: `SELECT id, name
FROM users
WHERE role = 'COACH'
  AND id IN (SELECT user_id FROM courses);`,
          answer: `SELECT id, name
FROM users
WHERE role = 'COACH'
  AND id IN (SELECT user_id FROM courses)
ORDER BY id;`
        },
        successMessage: "子查詢先撈出「有開過課的人」名單，外層 IN 再從教練裡比對。這 5 位教練都有開課。",
        referenceSql: `SELECT id, name
FROM users
WHERE role = 'COACH'
  AND id IN (SELECT user_id FROM courses)
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "IN"]
      },
      {
        id: "w5-10-05",
        title: "沒有任何人報名的課（NOT IN 子查詢）",
        description: "IN 反過來就是 NOT IN。先用子查詢列出「有被報名的 course_id」，外層再用 NOT IN 找出不在名單裡的課。回傳 id、name。",
        tags: ["子查詢", "NOT IN"],
        type: "query",
        starterSql: `SELECT id, name
FROM courses;`,
        hints: {
          direction: "加 WHERE id NOT IN (SELECT course_id FROM course_bookings)——括號裡先列出所有被報名過的課。",
          skeleton: `SELECT id, name
FROM courses
WHERE id NOT IN (SELECT course_id FROM course_bookings);`,
          answer: `SELECT id, name
FROM courses
WHERE id NOT IN (SELECT course_id FROM course_bookings)
ORDER BY id;`
        },
        successMessage: "NOT IN 找「不在名單裡」的——又找到那兩堂沒人報的課。（這跟你在第 8 關用 LEFT JOIN…IS NULL 找的，其實是同一件事的兩種寫法。）",
        referenceSql: `SELECT id, name
FROM courses
WHERE id NOT IN (SELECT course_id FROM course_bookings)
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "IN"],
        requiredPatterns: [{ label: "這題要用 NOT IN 找「不在名單裡」的課。", pattern: "\\bNOT\\s+IN\\b" }]
      },
      {
        id: "w5-10-06",
        title: "找出花最多錢的那位學員（衍生表起手）",
        description: "從這題開始把子查詢疊成「衍生表」。用子查詢算出「最高花費」，外層 HAVING 只留剛好等於它的。回傳 user_id、total。",
        tags: ["子查詢", "MAX", "衍生表"],
        type: "query",
        starterSql: `SELECT user_id, SUM(price_paid)::int AS total
FROM credit_purchases
GROUP BY user_id;`,
        hints: {
          direction: "慢慢來：先把每個人花多少（SUM）算成一張臨時表 s，再從 s 裡挑出最大那個數字當門檻。整段是 HAVING SUM(price_paid) = (SELECT MAX(s) FROM (SELECT SUM(price_paid) AS s FROM credit_purchases GROUP BY user_id) t)。",
          skeleton: `SELECT user_id, SUM(price_paid)::int AS total
FROM credit_purchases
GROUP BY user_id
HAVING SUM(price_paid) = (子查詢算最大);`,
          answer: `SELECT user_id, SUM(price_paid)::int AS total
FROM credit_purchases
GROUP BY user_id
HAVING SUM(price_paid) = (SELECT MAX(s) FROM (SELECT SUM(price_paid) AS s FROM credit_purchases GROUP BY user_id) t);`
        },
        successMessage: "「等於最大值」是找 top 1 的常見子查詢寫法。最大戶就是 user_id=11。這是本關第一次把子查詢疊成衍生表 t，後面 10-07、10-08 還會再練同一招——現在覺得繞是正常的，多做兩次就順了。",
        referenceSql: `SELECT user_id, SUM(price_paid)::int AS total
FROM credit_purchases
GROUP BY user_id
HAVING SUM(price_paid) = (SELECT MAX(s) FROM (SELECT SUM(price_paid) AS s FROM credit_purchases GROUP BY user_id) t);`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "GROUP BY", "HAVING"]
      },
      {
        id: "w5-10-07",
        title: "報名數最多的課",
        description: "用子查詢算出最大報名數，外層 HAVING 比對。回傳 course_id、booking_count。",
        tags: ["子查詢", "MAX"],
        type: "query",
        starterSql: `SELECT course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY course_id;`,
        hints: {
          direction: "加 HAVING COUNT(*) = (SELECT MAX(cnt) FROM (SELECT COUNT(*) AS cnt FROM course_bookings GROUP BY course_id) t)。",
          skeleton: `... GROUP BY course_id
HAVING COUNT(*) = (子查詢算最大報名數);`,
          answer: `SELECT course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY course_id
HAVING COUNT(*) = (SELECT MAX(cnt) FROM (SELECT COUNT(*) AS cnt FROM course_bookings GROUP BY course_id) t)
ORDER BY course_id;`
        },
        successMessage: "跟「花最多錢」同一招，換到報名數。報名數最多的是 course_id=1，共 3 筆——注意這 3 筆只有 2 個人，有一筆是重複的，那正是第 11 關要查的重複扣堂。",
        referenceSql: `SELECT course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY course_id
HAVING COUNT(*) = (SELECT MAX(cnt) FROM (SELECT COUNT(*) AS cnt FROM course_bookings GROUP BY course_id) t)
ORDER BY course_id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "GROUP BY", "HAVING"]
      },
      {
        id: "w5-10-08",
        title: "報名數高於平均的課（兩層子查詢）",
        description: "最後一題進階一階：子查詢也能算「基準值」。先算各課平均報名數當基準，外層用 HAVING 比它大。回傳 course_id、booking_count。",
        tags: ["子查詢", "HAVING", "AVG"],
        type: "query",
        starterSql: `SELECT course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY course_id;`,
        hints: {
          direction: "比前面跳一階，慢慢來。先讀最內層括號：(SELECT COUNT(*) AS cnt FROM course_bookings GROUP BY course_id) 是「各課的報名數」當成一張臨時表 t；外層再對 t 取 AVG。整段是 HAVING COUNT(*) > (SELECT AVG(cnt) FROM (...) t)。",
          skeleton: `SELECT course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY course_id
HAVING COUNT(*) > (SELECT AVG(cnt) FROM (內層先算各課的 COUNT AS cnt) t);`,
          answer: `SELECT course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY course_id
HAVING COUNT(*) > (SELECT AVG(cnt) FROM (SELECT COUNT(*) AS cnt FROM course_bookings GROUP BY course_id) t)
ORDER BY course_id;`
        },
        successMessage: "把「各課的 COUNT」當成臨時表 t、外層再對它取平均——兩層子查詢你都拆開了。子查詢這關收工，你已經能「先查一段、再拿來當條件」了。",
        referenceSql: `SELECT course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY course_id
HAVING COUNT(*) > (SELECT AVG(cnt) FROM (SELECT COUNT(*) AS cnt FROM course_bookings GROUP BY course_id) t)
ORDER BY course_id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "GROUP BY", "HAVING"]
      }
    ]
  },
  {
    id: "incident-room",
    section: "事故調查室",
    title: "11 事故調查室：LiveFit 後台資料偵查",
    label: "W5-11",
    lead:
      "最後一章，海姐把你從夜班操作員升格成查帳的人。你不是在刷語法——最近的帳對不起來，你要用 SQL 把藏在資料裡的異常一條條揪出來。",
    mission:
      "最近帳目對不起來了：有會員投訴被重複扣堂數、幾筆金流訂單卡著沒付款、收入又異常集中在少數人身上。海姐把你從昨晚的夜班操作員升格成查帳的人，把後台資料攤在你面前——「這次不是刷題，是辦案。我們用 SQL 一條一條把異常揪出來，最後寫一份結案摘要遞給主管。」",
    coachLine:
      "辦案跟健身一樣，最忌貪快硬上。先別急著寫長句，先問自己三件事：我要哪張表？要不要 JOIN？要不要 GROUP BY？想清楚動線再下手——招式拆乾淨，才不會把腰閃到。我在旁邊看著，卡住喊我。",
    caseBrief:
      "🕵 辦案室・最近帳目對不起來。三條線同時冒煙：有人被重複扣了堂、幾筆金流訂單卡著沒付款、收入又怪怪地擠在少數人身上。海姐把證物攤到你面前：「這次不是刷題，是辦案。沉住氣，跟我一條一條查。」",
    teaching:
      "事故調查題會混用 WHERE、JOIN、GROUP BY、HAVING、子查詢。每一題仍然有明確輸出欄位，先照任務把結果查出來。",
    syntax: `SELECT user_id, course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY user_id, course_id
HAVING COUNT(*) > 1;`,
    isCase: true,
    tables: [
      "course_bookings",
      "users",
      "courses",
      "orders",
      "credit_purchases"
    ],
    introScript: [
      {
        text: "來，坐。歡迎進辦案室。最近的帳對不起來了：有人被重複扣堂、幾筆金流訂單卡著沒付、收入又怪怪地集中在少數人身上。這回不是刷題，是辦案——沉住氣，我陪你一條一條查。",
        art: "normal"
      },
      {
        text: "進去前先把證物攤開——上方那塊「🗄 資料庫透視鏡」就是證物板。這案子牽連好幾張表：course_bookings（誰報了什麼課）、users（會員是誰）、courses（哪堂課）、orders（金流訂單）、credit_purchases（點數購買）。先認清楚哪張放什麼線索，等下 JOIN 才接得上、不會把人名跟課名牽錯線。",
        art: "normal"
      },
      {
        text: "喔對，有個熟面孔——Jack Pai。他買了一筆 VIP 方案，深夜 20:20 下單，金流訂單卻一直 unpaid 卡在那。錢沒進來、點數也沒給，這筆我盯很久了。等等輪到它，我們好好查清楚。",
        art: "proud"
      },
      {
        text: "好，工具擺好、證物攤開了。第一案——重複扣堂——先查，因為被多扣的是活生生的會員，他多付的錢一天沒退就一天難堪。第一條我牽著你走，後面你會越查越像個偵探。跟我來。",
        art: "praise"
      }
    ],
    exercises: [
      {
        id: "w5-11-01",
        title: "卡單與扣堂・第一案：找重複報名組合",
        description: "海姐把投訴單推到你面前：『先查重複扣堂這條。』同一個學員、同一堂課，報名卻不只一筆——沒作廢就可能被重複扣點、扣款。回傳 user_id、course_id、booking_count，找出 course_bookings 裡同組超過 1 筆的。",
        tags: ["事故調查", "GROUP BY", "HAVING"],
        type: "query",
        starterSql: `SELECT user_id, course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY user_id, course_id;`,
        hints: {
          direction: "分組後要篩條件用 HAVING：加 HAVING COUNT(*) > 1。",
          skeleton: `SELECT user_id, course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY user_id, course_id
HAVING COUNT(*) > 數字;`,
          answer: `SELECT user_id, course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY user_id, course_id
HAVING COUNT(*) > 1
ORDER BY user_id, course_id;`
        },
        successMessage: "抓到了。同一個 user_id、同一個 course_id 冒出兩筆——這就是『重複報名』的犯罪現場。數字冷冰冰，背後是同一個人在同一堂課被記了兩筆，沒抓出來作廢就可能被重複扣。先把座標釘住，下一條我們 JOIN 翻成名字，看看是誰被記重複了。",
        referenceSql: `SELECT user_id, course_id, COUNT(*)::int AS booking_count
FROM course_bookings
GROUP BY user_id, course_id
HAVING COUNT(*) > 1
ORDER BY user_id, course_id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "GROUP BY", "HAVING"]
      },
      {
        id: "w5-11-02",
        title: "把編號翻成人名",
        description: "把剛剛那組重複的編號 JOIN 回 users 和 courses，看是誰、在哪堂課被記了兩筆。回傳 member_name、course_name、booking_count（同樣只留超過 1 筆的）。",
        tags: ["事故調查", "JOIN", "HAVING"],
        type: "query",
        starterSql: `SELECT u.name AS member_name, c.name AS course_name, COUNT(*)::int AS booking_count
FROM course_bookings b
JOIN users u ON b.user_id = u.id
JOIN courses c ON b.course_id = c.id
GROUP BY u.name, c.name;`,
        hints: {
          direction: "在 GROUP BY 後面補 HAVING COUNT(*) > 1。",
          skeleton: `... GROUP BY u.name, c.name
HAVING COUNT(*) > 數字;`,
          answer: `SELECT u.name AS member_name, c.name AS course_name, COUNT(*)::int AS booking_count
FROM course_bookings b
JOIN users u ON b.user_id = u.id
JOIN courses c ON b.course_id = c.id
GROUP BY u.name, c.name
HAVING COUNT(*) > 1
ORDER BY u.name;`
        },
        successMessage: "對上人了——Leo Chen，在『肌力入門班』被記了兩筆報名。這就是 JOIN 的價值：把機器的編號翻回人聽得懂的話。名單先記下來，結案要用。",
        referenceSql: `SELECT u.name AS member_name, c.name AS course_name, COUNT(*)::int AS booking_count
FROM course_bookings b
JOIN users u ON b.user_id = u.id
JOIN courses c ON b.course_id = c.id
GROUP BY u.name, c.name
HAVING COUNT(*) > 1
ORDER BY u.name;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "JOIN", "HAVING"]
      },
      {
        id: "w5-11-03",
        title: "卡單第二案：找卡著沒付的金流訂單",
        description: "切到卡單這條。orders 是買點數方案的金流訂單，payment_status 是 unpaid 代表錢一直沒進來。把所有 unpaid 的訂單撈出來，依金額由大到小排。回傳 merchant_order_no、amount、payment_status。",
        tags: ["事故調查", "WHERE", "ORDER BY"],
        type: "query",
        starterSql: `SELECT merchant_order_no, amount, payment_status
FROM orders;`,
        hints: {
          direction: "加 WHERE payment_status = 'unpaid'，再 ORDER BY amount DESC。",
          skeleton: `SELECT merchant_order_no, amount, payment_status
FROM orders
WHERE payment_status = '狀態'
ORDER BY amount DESC;`,
          answer: `SELECT merchant_order_no, amount, payment_status
FROM orders
WHERE payment_status = 'unpaid'
ORDER BY amount DESC;`
        },
        successMessage: "出來了——錢沒進來、卻卡在系統裡的訂單。排最上面那筆 9000 沒有？就是 Jack Pai 那筆深夜 VIP。錢卡著、點數沒給，這正是我們今天要查的怪事。",
        referenceSql: `SELECT merchant_order_no, amount, payment_status
FROM orders
WHERE payment_status = 'unpaid'
ORDER BY amount DESC;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "WHERE", "ORDER BY"]
      },
      {
        id: "w5-11-04",
        title: "卡單是誰的",
        description: "把卡關訂單 JOIN 回 users，看是誰卡著。撈出 unpaid 的訂單和下單學員，依金額由大到小。回傳 member_name、merchant_order_no、amount。",
        tags: ["事故調查", "JOIN", "WHERE"],
        type: "query",
        starterSql: `SELECT u.name AS member_name, o.merchant_order_no, o.amount
FROM orders o
JOIN users u ON o.user_id = u.id;`,
        hints: {
          direction: "加 WHERE o.payment_status = 'unpaid'，再 ORDER BY o.amount DESC。",
          skeleton: `SELECT u.name AS member_name, o.merchant_order_no, o.amount
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.payment_status = '狀態'
ORDER BY o.amount DESC;`,
          answer: `SELECT u.name AS member_name, o.merchant_order_no, o.amount
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.payment_status = 'unpaid'
ORDER BY o.amount DESC;`
        },
        successMessage: "果然——排第一的就是 Jack Pai，9000 的 VIP 卡著沒付。這種單卡著，公司每多放一天都在賠帳。把這份清單交給金流組去對，第二案有底了。",
        referenceSql: `SELECT u.name AS member_name, o.merchant_order_no, o.amount
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.payment_status = 'unpaid'
ORDER BY o.amount DESC;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "JOIN", "WHERE", "ORDER BY"]
      },
      {
        id: "w5-11-05",
        title: "查空堂：沒半個人報的課",
        description: "辦案不只抓做錯的，『該有的卻沒有』也是破口。用 LEFT JOIN courses → course_bookings，篩 b.id IS NULL，找出一個人都沒報的課。回傳 c.name。",
        tags: ["事故調查", "LEFT JOIN", "IS NULL"],
        type: "query",
        starterSql: `SELECT c.name
FROM courses c
JOIN course_bookings b ON b.course_id = c.id;`,
        hints: {
          direction: "把 JOIN 改成 LEFT JOIN，再加 WHERE b.id IS NULL。",
          skeleton: `SELECT c.name
FROM courses c
LEFT JOIN course_bookings b ON b.course_id = c.id
WHERE b.id IS NULL;`,
          answer: `SELECT c.name
FROM courses c
LEFT JOIN course_bookings b ON b.course_id = c.id
WHERE b.id IS NULL
ORDER BY c.id;`
        },
        successMessage: "兩堂課開了卻一個人都沒報——LEFT JOIN 連『什麼都沒發生』的課都照得出來。行銷該知道這條線索，記著。",
        referenceSql: `SELECT c.name
FROM courses c
LEFT JOIN course_bookings b ON b.course_id = c.id
WHERE b.id IS NULL
ORDER BY c.id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "LEFT JOIN"]
      },
      {
        id: "w5-11-06",
        title: "收入第三案：誰把錢都付在這裡了",
        description: "老闆想知道收入壓在誰身上。把 credit_purchases JOIN users，依學員加總 price_paid，由大到小排。回傳 member_name、total_spent。",
        tags: ["事故調查", "JOIN", "GROUP BY"],
        type: "query",
        starterSql: `SELECT u.name AS member_name, SUM(cp.price_paid)::int AS total_spent
FROM credit_purchases cp
JOIN users u ON u.id = cp.user_id
GROUP BY u.name;`,
        hints: {
          direction: "在後面加 ORDER BY total_spent DESC。",
          skeleton: `... GROUP BY u.name
ORDER BY total_spent DESC;`,
          answer: `SELECT u.name AS member_name, SUM(cp.price_paid)::int AS total_spent
FROM credit_purchases cp
JOIN users u ON u.id = cp.user_id
GROUP BY u.name
ORDER BY total_spent DESC;`
        },
        successMessage: "算出來了——花最多的是 Jack Pai，一個人 13000，遠超其他人。開場說的『收入異常集中』就是他。這不一定是壞事，但老闆一定想知道『要是這位走了會怎樣』。",
        referenceSql: `SELECT u.name AS member_name, SUM(cp.price_paid)::int AS total_spent
FROM credit_purchases cp
JOIN users u ON u.id = cp.user_id
GROUP BY u.name
ORDER BY total_spent DESC;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "JOIN", "GROUP BY", "ORDER BY"]
      },
      {
        id: "w5-11-07",
        title: "查沉默會員：從沒買過點數的人",
        description: "有些學員進了系統，credit_purchases 裡卻一筆成交都沒有（可能下過單但沒付成功），營運想找回他們。用 NOT IN，找出 role=USER 但 id 不在「有成交購買的名單」裡的人。回傳 id、name。",
        tags: ["事故調查", "NOT IN"],
        type: "query",
        starterSql: `SELECT id, name
FROM users
WHERE role = 'USER';`,
        hints: {
          direction: "加 AND id NOT IN (SELECT user_id FROM credit_purchases)——跟第 10 關「沒買過點數」同一招。",
          skeleton: `SELECT id, name
FROM users
WHERE role = 'USER'
  AND id NOT IN (SELECT user_id FROM credit_purchases);`,
          answer: `SELECT id, name
FROM users
WHERE role = 'USER'
  AND id NOT IN (SELECT user_id FROM credit_purchases)
ORDER BY id;`
        },
        successMessage: "排除法漂亮——NOT IN 像偵探刷掉嫌疑人，把『credit_purchases 裡一筆成交都沒有』的會員揀出來（有人其實下過單卻沒付成）。這群人交給營運問一聲，說不定能請回來。查到誰『沒做什麼』，有時比查誰做錯更有用。",
        referenceSql: `SELECT id, name
FROM users
WHERE role = 'USER'
  AND id NOT IN (SELECT user_id FROM credit_purchases)
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT", "IN"],
        requiredPatterns: [{ label: "這題要用 NOT IN。", pattern: "\\bNOT\\s+IN\\b" }]
      },
      {
        id: "w5-11-08",
        title: "盤點每堂課的冷熱",
        description: "把每堂課的報名數整理出來（沒人報的算 0），給排課組看冷熱。courses LEFT JOIN course_bookings，依課名分組數報名，依報名數、課名排序。回傳 course_name、booking_count。",
        tags: ["事故調查", "LEFT JOIN", "GROUP BY"],
        type: "query",
        starterSql: `SELECT c.name AS course_name, COUNT(b.id)::int AS booking_count
FROM courses c
JOIN course_bookings b ON b.course_id = c.id
GROUP BY c.name;`,
        hints: {
          direction: "把 JOIN 改成 LEFT JOIN（沒人報的才算得到 0），再 ORDER BY booking_count, c.name。",
          skeleton: `SELECT c.name AS course_name, COUNT(b.id)::int AS booking_count
FROM courses c
LEFT JOIN course_bookings b ON b.course_id = c.id
GROUP BY c.name
ORDER BY booking_count, c.name;`,
          answer: `SELECT c.name AS course_name, COUNT(b.id)::int AS booking_count
FROM courses c
LEFT JOIN course_bookings b ON b.course_id = c.id
GROUP BY c.name
ORDER BY booking_count, c.name;`
        },
        successMessage: "冷熱一目了然：墊底兩堂掛 0、最熱『肌力入門班』3 筆（其中一筆正是 Leo 的重複報名）。LEFT JOIN ＋ GROUP BY 把冷門課也算進來。我們快收網了。",
        referenceSql: `SELECT c.name AS course_name, COUNT(b.id)::int AS booking_count
FROM courses c
LEFT JOIN course_bookings b ON b.course_id = c.id
GROUP BY c.name
ORDER BY booking_count, c.name;`,
        compare: { order: true, columns: true },
        requires: ["SELECT", "LEFT JOIN", "GROUP BY"]
      },
      {
        id: "w5-11-09",
        title: "回到第一案：撈出重複報名的原始紀錄",
        description: "知道『哪組重複』還不夠，得指出『是哪幾筆紀錄該作廢』。用子查詢框出重複的組合，外層把那幾筆原始 course_bookings 撈出來。回傳 id、user_id、course_id、booking_at。",
        tags: ["事故調查", "子查詢"],
        type: "query",
        starterSql: `SELECT id, user_id, course_id, booking_at
FROM course_bookings;`,
        hints: {
          direction: "加 WHERE (user_id, course_id) IN (子查詢：GROUP BY 後 HAVING COUNT(*) > 1)。這裡 (user_id, course_id) 是把兩欄綁成一組一起比對——只有兩欄同時都對上子查詢那一組才算數，這叫「列（欄組）比對」，是個新招、不是打錯字。",
          skeleton: `SELECT id, user_id, course_id, booking_at
FROM course_bookings
WHERE (user_id, course_id) IN (
  SELECT user_id, course_id FROM course_bookings
  GROUP BY user_id, course_id HAVING COUNT(*) > 1
);`,
          answer: `SELECT id, user_id, course_id, booking_at
FROM course_bookings
WHERE (user_id, course_id) IN (
  SELECT user_id, course_id FROM course_bookings
  GROUP BY user_id, course_id HAVING COUNT(*) > 1
)
ORDER BY id;`
        },
        successMessage: "兩筆原始紀錄都指出來了——工程師拿這份就能直接決定哪筆作廢。從發現異常到指出該動哪一筆，你走完一整條辦案動線了。",
        referenceSql: `SELECT id, user_id, course_id, booking_at
FROM course_bookings
WHERE (user_id, course_id) IN (
  SELECT user_id, course_id FROM course_bookings
  GROUP BY user_id, course_id HAVING COUNT(*) > 1
)
ORDER BY id;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"],
        requiredPatterns: [{ label: "這題要用子查詢（括號內再放一個 SELECT）。", pattern: "\\(\\s*SELECT" }]
      },
      {
        id: "w5-11-10",
        title: "結案：把事故收成一行摘要",
        description: "最後寫結案報告第一行：用兩個子查詢，一次算出『重複報名幾組』和『沒人報的課幾堂』。回傳 dup_groups、empty_courses。",
        tags: ["事故調查", "子查詢", "結案"],
        type: "query",
        starterSql: `SELECT
  0 AS dup_groups,
  0 AS empty_courses;`,
        hints: {
          direction: "兩欄各放一個子查詢：dup_groups 數重複組合、empty_courses 數沒人報的課。",
          skeleton: `SELECT
  (SELECT COUNT(*)::int FROM (重複組合子查詢) d) AS dup_groups,
  (SELECT COUNT(*)::int FROM courses WHERE id NOT IN (報名過的 course_id 子查詢)) AS empty_courses;`,
          answer: `SELECT
  (SELECT COUNT(*)::int FROM (
     SELECT user_id, course_id FROM course_bookings
     GROUP BY user_id, course_id HAVING COUNT(*) > 1
   ) d) AS dup_groups,
  (SELECT COUNT(*)::int FROM courses
     WHERE id NOT IN (SELECT course_id FROM course_bookings)
  ) AS empty_courses;`
        },
        successMessage: "收操。重複報名 1 組、沒人報的課 2 堂——整起事故濃縮成一行，這就是遞到主管桌上那份結案報告的第一行。你今天從攤證物、翻人名、追卡單、查收入，一路走到把混亂收成一句話。這陣子的帳，查清楚了。我跟你說真的——你會查案了，下次帳再亂，公司第一個想找的就是你。換口氣吧，辛苦了。",
        referenceSql: `SELECT
  (SELECT COUNT(*)::int FROM (
     SELECT user_id, course_id FROM course_bookings
     GROUP BY user_id, course_id HAVING COUNT(*) > 1
   ) d) AS dup_groups,
  (SELECT COUNT(*)::int FROM courses
     WHERE id NOT IN (SELECT course_id FROM course_bookings)
  ) AS empty_courses;`,
        compare: { order: false, columns: true },
        requires: ["SELECT"]
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
