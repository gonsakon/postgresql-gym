export type SqlValue = string | number | boolean | Date | null | undefined;

export type SqlRow = Record<string, SqlValue>;

export interface CompareOptions {
  order?: boolean;
  columns?: boolean;
}

export interface ExerciseCheck {
  label: string;
  sql: string;
  expectRows: SqlRow[];
}

export interface ExerciseHints {
  direction: string;
  skeleton: string;
  answer: string;
  checklist?: string[];
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  tags: string[];
  type: "query" | "mutation";
  starterSql: string;
  hints: ExerciseHints;
  successMessage: string;
  referenceSql?: string;
  compare?: CompareOptions;
  requires?: string[];
  forbidden?: string[];
  requiredPatterns?: { label: string; pattern: string; preserveStrings?: boolean }[];
  checks?: ExerciseCheck[];
}

export interface IntroBeat {
  text: string;
  art?: "normal" | "praise" | "proud" | "confused";
}

export interface Lesson {
  id: string;
  section: string;
  title: string;
  label: string;
  lead: string;
  mission: string;
  coachLine?: string;
  teaching: string;
  syntax: string;
  isCase?: boolean;
  caseBrief?: string;
  /** 情境關卡：本關相關資料表（第一個視為主表，給透視鏡聚焦） */
  tables?: string[];
  /** 情境關卡：開場視覺小說腳本（海姐逐拍鋪情境 + 帶玩家認識 DB 狀態） */
  introScript?: IntroBeat[];
  exercises: Exercise[];
}

export interface VideoModule {
  title: string;
  count: number;
  items: string[];
}

export interface Feedback {
  type: "pass" | "fail";
  title: string;
  body: string;
  raw?: string;
}

export interface ResultState {
  rows: SqlRow[];
  message: string;
}
