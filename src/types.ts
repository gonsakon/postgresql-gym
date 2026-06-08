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
