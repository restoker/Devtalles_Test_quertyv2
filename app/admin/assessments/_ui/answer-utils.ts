import type {
  Assessment,
  AssessmentAnswer,
  AssessmentAnswerRow,
  Question,
} from "@/types/assessment-schema";

const IMPORTANT_QUESTION = "¿Qué quieres construir?";

/** Group API answer rows into one UI answer per question. */
export function uiAnswersFromRows(
  rows: AssessmentAnswerRow[] | undefined,
  questions: Question[]
): AssessmentAnswer[] {
  if (!rows?.length) return [];

  const byQuestion = new Map<number, AssessmentAnswerRow[]>();
  for (const row of rows) {
    const list = byQuestion.get(row.questionId) ?? [];
    list.push(row);
    byQuestion.set(row.questionId, list);
  }

  const typeById = new Map(questions.map((q) => [q.id, q.type]));
  const result: AssessmentAnswer[] = [];

  for (const [questionId, qRows] of byQuestion) {
    const type = typeById.get(questionId);

    if (type === "multiple_choice") {
      result.push({
        questionId,
        answerOptionIds: qRows
          .map((r) => r.answerOptionId)
          .filter((id): id is number => id != null),
      });
      continue;
    }

    const first = qRows[0];
    if (type === "single_choice") {
      result.push({
        questionId,
        answerOptionId: first?.answerOptionId ?? null,
        value: first?.value ?? null,
      });
      continue;
    }

    if (type === "boolean") {
      const raw = first?.value;
      result.push({
        questionId,
        value: raw === "true" ? true : raw === "false" ? false : null,
      });
      continue;
    }

    if (type === "number") {
      const raw = first?.value;
      result.push({
        questionId,
        value: raw != null && raw !== "" ? Number(raw) : null,
      });
      continue;
    }

    result.push({
      questionId,
      value: first?.value ?? null,
    });
  }

  return result;
}

export function isAssessmentCompleted(assessment: Assessment): boolean {
  return assessment.completedAt != null;
}

/** Highlight "¿Qué quieres construir?"; if present, sortOrder 0 is that question. */
export function isMostImportantQuestion(
  question: Question,
  all: Question[] = []
): boolean {
  if (question.question.trim() === IMPORTANT_QUESTION) return true;
  if (all.length === 0) return false;
  const present = all.some((q) => q.question.trim() === IMPORTANT_QUESTION);
  return present && question.sortOrder === 0;
}

export function buildUpsertPayload(
  question: Question,
  draft: AssessmentAnswer
): {
  questionId: number;
  answerOptionId?: number;
  answerOptionIds?: number[];
  value?: string | number | boolean;
} {
  const questionId = question.id;

  if (question.type === "single_choice") {
    const payload: {
      questionId: number;
      answerOptionId?: number;
      value?: string;
    } = { questionId };
    if (draft.answerOptionId != null) {
      payload.answerOptionId = draft.answerOptionId;
    }
    if (
      question.rules?.allowDetails &&
      typeof draft.value === "string" &&
      draft.value.trim()
    ) {
      payload.value = draft.value;
    }
    return payload;
  }

  if (question.type === "multiple_choice") {
    return {
      questionId,
      answerOptionIds: draft.answerOptionIds ?? [],
    };
  }

  return {
    questionId,
    value: draft.value as string | number | boolean,
  };
}
