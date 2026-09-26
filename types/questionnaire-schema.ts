import z from "zod";

export const questionTypes = [
  "single_choice",
  "multiple_choice",
  "text",
  "number",
  "boolean",
] as const;

export type QuestionType = (typeof questionTypes)[number];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  single_choice: "Opción única",
  multiple_choice: "Opción múltiple",
  text: "Texto",
  number: "Número",
  boolean: "Sí / No",
};

export function isChoiceQuestionType(type: QuestionType): boolean {
  return type === "single_choice" || type === "multiple_choice";
}

/** Backend ids are numeric; coerce for form/URL convenience. */
const entityIdSchema = z.union([z.number(), z.string()]);

export const answerOptionSchema = z.object({
  id: entityIdSchema,
  label: z.string().min(1, "La etiqueta es obligatoria").max(200).trim(),
  value: z.string().max(200).trim().optional().nullable(),
  sortOrder: z.number().int().min(0),
});

export type AnswerOption = z.infer<typeof answerOptionSchema>;

export const questionRulesSchema = z.object({
  required: z.boolean().optional(),
  maxSelections: z.number().int().min(1).max(100).optional(),
  allowDetails: z.boolean().optional(),
});

export type QuestionRules = z.infer<typeof questionRulesSchema>;

export const questionSchema = z.object({
  id: entityIdSchema,
  question: z.string().min(3, "La pregunta debe tener al menos 3 caracteres").max(500).trim(),
  type: z.enum(questionTypes),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean().optional(),
  rules: questionRulesSchema.optional(),
  options: z.array(answerOptionSchema).default([]),
});

export type Question = z.infer<typeof questionSchema>;

export const questionnaireSchema = z.object({
  id: entityIdSchema,
  title: z.string().min(3, "El título debe tener al menos 3 caracteres").max(150).trim(),
  description: z.string().max(1000).trim().optional().nullable(),
  isActive: z.boolean(),
  questions: z.array(questionSchema).default([]),
});

export type Questionnaire = z.infer<typeof questionnaireSchema>;

export const createQuestionnaireSchema = z.object({
  title: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(150, "El título debe tener menos de 150 caracteres")
    .trim(),
  description: z
    .string()
    .max(1000, "La descripción debe tener menos de 1000 caracteres")
    .trim()
    .optional(),
});

export type CreateQuestionnaireSchema = z.infer<typeof createQuestionnaireSchema>;

export const draftAnswerOptionSchema = z.object({
  label: z.string().min(1, "La etiqueta es obligatoria").max(200).trim(),
  value: z.string().max(200).trim().optional(),
  sortOrder: z.number().int().min(0),
});

export const draftQuestionSchema = z.object({
  question: z
    .string()
    .min(3, "La pregunta debe tener al menos 3 caracteres")
    .max(500)
    .trim(),
  type: z.enum(questionTypes),
  sortOrder: z.number().int().min(0),
  rules: questionRulesSchema.optional(),
  options: z.array(draftAnswerOptionSchema),
  /** UI-only: highlight the most important question */
  important: z.boolean().optional(),
});

export const createQuestionnaireWithQuestionsSchema = createQuestionnaireSchema.extend({
  questions: z.array(draftQuestionSchema).min(1, "Agrega al menos una pregunta"),
});

export type CreateQuestionnaireWithQuestionsSchema = z.infer<
  typeof createQuestionnaireWithQuestionsSchema
>;

export const DEFAULT_QUESTIONNAIRE_DRAFT: CreateQuestionnaireWithQuestionsSchema = {
  title: "Perfil para tu ruta",
  description: "Tres preguntas generales para recomendarte por dónde empezar.",
  questions: [
    {
      question: "¿Qué quieres construir?",
      type: "single_choice",
      sortOrder: 0,
      important: true,
      rules: { required: true, allowDetails: true },
      options: [
        { label: "Una aplicación web", value: "web", sortOrder: 0 },
        { label: "Una API o backend", value: "api", sortOrder: 1 },
        { label: "Una app móvil", value: "mobile", sortOrder: 2 },
        { label: "Todavía no estoy seguro", value: "unsure", sortOrder: 3 },
      ],
    },
    {
      question: "¿Qué nivel tienes?",
      type: "single_choice",
      sortOrder: 1,
      rules: { required: true },
      options: [
        { label: "Principiante", value: "beginner", sortOrder: 0 },
        { label: "Intermedio", value: "intermediate", sortOrder: 1 },
        { label: "Avanzado", value: "advanced", sortOrder: 2 },
      ],
    },
    {
      question: "¿Para qué lo quieres?",
      type: "single_choice",
      sortOrder: 2,
      rules: { required: true },
      options: [
        { label: "Conseguir trabajo", value: "job", sortOrder: 0 },
        { label: "Un proyecto personal", value: "personal", sortOrder: 1 },
        { label: "Mejorar en lo que ya hago", value: "improve", sortOrder: 2 },
      ],
    },
  ],
};

export const addQuestionSchema = z.object({
  question: z
    .string()
    .min(3, "La pregunta debe tener al menos 3 caracteres")
    .max(500, "La pregunta debe tener menos de 500 caracteres")
    .trim(),
  type: z.enum(questionTypes),
  required: z.boolean(),
});

export type AddQuestionSchema = z.infer<typeof addQuestionSchema>;
