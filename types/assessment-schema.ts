export const QUESTION_TYPES = [
  "single_choice",
  "multiple_choice",
  "text",
  "number",
  "boolean",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export type AssessmentStatus = "in_progress" | "completed";

export interface AnswerOption {
  id: number;
  label: string;
  value: string | null;
  sortOrder: number;
}

export interface QuestionRules {
  required?: boolean;
  maxSelections?: number;
  allowDetails?: boolean;
  showWhen?: unknown;
}

export interface Question {
  id: number;
  question: string;
  type: QuestionType;
  sortOrder: number;
  isActive?: boolean;
  rules?: QuestionRules;
  options?: AnswerOption[];
}

export interface QuestionnaireSummary {
  id: number;
  title: string;
  description?: string | null;
  isActive: boolean;
}

export interface Questionnaire extends QuestionnaireSummary {
  questions: Question[];
  createdAt?: string;
}

/** API answer row (multiple_choice stores one row per selected option). */
export interface AssessmentAnswerRow {
  id: number;
  questionId: number;
  answerOptionId: number | null;
  value: string | null;
}

/** Draft / UI answer for one question. */
export interface AssessmentAnswer {
  questionId: number;
  answerOptionId?: number | null;
  answerOptionIds?: number[];
  value?: string | number | boolean | null;
}

/** Assessment as returned by Nest (no { data } wrapper). */
export interface Assessment {
  id: number;
  userId: string;
  questionnaireId: number;
  createdAt: string;
  completedAt: string | null;
  answers?: AssessmentAnswerRow[];
}

/** List row enriched in the UI with questionnaire title when available. */
export interface AssessmentListItem extends Assessment {
  questionnaireTitle: string;
  status: AssessmentStatus;
}
