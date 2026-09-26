"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  File01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";

import {
  createQuestionnaireWithQuestionsSchema,
  DEFAULT_QUESTIONNAIRE_DRAFT,
  type CreateQuestionnaireWithQuestionsSchema,
} from "@/types/questionnaire-schema";
import { createQuestionnaireAction } from "@/server/actions/questionnaires/create-questionnaire-action";
import { createQuestionAction } from "@/server/actions/questionnaires/create-question-action";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function FormNewQuestionnaire() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateQuestionnaireWithQuestionsSchema>({
    resolver: zodResolver(createQuestionnaireWithQuestionsSchema),
    defaultValues: structuredClone(DEFAULT_QUESTIONNAIRE_DRAFT),
    mode: "onChange",
  });

  const { fields, update } = useFieldArray({
    control,
    name: "questions",
  });

  const titleValue = watch("title") || "";
  const descriptionValue = watch("description") || "";

  const onSubmit = async (data: CreateQuestionnaireWithQuestionsSchema) => {
    setSaving(true);
    try {
      const created = await createQuestionnaireAction({
        title: data.title,
        description: data.description || undefined,
      });

      if (!created.ok) {
        toast.add({
          title: "No se pudo crear el cuestionario",
          description: created.msg,
          type: "error",
        });
        return;
      }

      for (const q of data.questions) {
        const result = await createQuestionAction(created.data.id, {
          question: q.question,
          type: q.type,
          sortOrder: q.sortOrder,
          rules: q.rules,
          options: q.options.map((o) => ({
            label: o.label,
            value: o.value || undefined,
            sortOrder: o.sortOrder,
          })),
        });

        if (!result.ok) {
          toast.add({
            title: "Cuestionario creado, pero falló una pregunta",
            description: result.msg,
            type: "error",
          });
          router.push(`/admin/questionnaires/${created.data.id}`);
          return;
        }
      }

      toast.add({
        title: "Cuestionario creado",
        description: `"${data.title}" con ${data.questions.length} preguntas.`,
        type: "success",
      });
      router.push(`/admin/questionnaires/${created.data.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      data-lenis-prevent
      className="mx-auto h-[calc(100dvh-7.5rem)] min-h-0 w-full max-w-2xl overflow-y-auto overscroll-y-contain py-2 sm:py-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex flex-col gap-2"
      >
        <div className="flex items-center gap-2">
          <Link
            href="/admin/questionnaires"
            className="group inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-border hover:bg-accent hover:text-foreground active:scale-[0.98]"
          >
            <HugeiconsIcon
              icon={ArrowLeft02Icon}
              strokeWidth={2}
              className="size-3.5 transition-transform group-hover:-translate-x-0.5"
            />
            <span>Cuestionarios</span>
          </Link>
          <span className="text-xs text-muted-foreground/40">/</span>
          <span className="text-xs font-semibold text-foreground">Nuevo cuestionario</span>
        </div>

        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Crear cuestionario
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Parte de tres preguntas generales. Puedes editar el texto antes de guardar.
            </p>
          </div>
          <div className="hidden size-11 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-600 shadow-xs sm:flex dark:text-purple-400">
            <HugeiconsIcon icon={File01Icon} strokeWidth={2} className="size-5" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xs sm:p-8 dark:border-white/10 dark:bg-zinc-950/60 dark:shadow-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="questionnaire-title"
                className="text-xs font-semibold uppercase tracking-wider text-foreground/80"
              >
                Título <span className="text-purple-600 dark:text-purple-400">*</span>
              </label>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {titleValue.length}/150
              </span>
            </div>
            <input
              id="questionnaire-title"
              type="text"
              placeholder="Ej. Perfil para tu ruta..."
              autoComplete="off"
              aria-invalid={!!errors.title}
              className={cn(
                "h-12 w-full rounded-xl border bg-background/50 px-4 text-sm font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/50",
                "focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 dark:focus:border-purple-500",
                errors.title
                  ? "border-destructive text-destructive focus:border-destructive focus:ring-destructive/20"
                  : "border-border hover:border-foreground/30"
              )}
              {...register("title")}
            />
            <AnimatePresence mode="wait">
              {errors.title ? (
                <motion.p
                  role="alert"
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  className="flex items-center gap-1.5 pt-1 text-xs font-medium text-destructive"
                >
                  <span className="size-1 rounded-full bg-destructive" />
                  {errors.title.message}
                </motion.p>
              ) : (
                <p className="text-xs leading-relaxed text-muted-foreground/80">
                  Nombre claro del cuestionario (mínimo 3 caracteres).
                </p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="questionnaire-description"
                className="text-xs font-semibold uppercase tracking-wider text-foreground/80"
              >
                Descripción
              </label>
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {descriptionValue.length}/1000
              </span>
            </div>
            <textarea
              id="questionnaire-description"
              rows={3}
              placeholder="Describe el propósito del cuestionario..."
              className={cn(
                "w-full resize-y rounded-xl border bg-background/50 px-4 py-3 text-sm font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/50",
                "focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 dark:focus:border-purple-500",
                errors.description
                  ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                  : "border-border hover:border-foreground/30"
              )}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs font-medium text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold tracking-tight text-foreground">
              Preguntas iniciales ({fields.length})
            </h2>

            {fields.map((field, qIndex) => {
              const isImportant = field.important || qIndex === 0;
              const options = watch(`questions.${qIndex}.options`) ?? [];

              return (
                <div
                  key={field.id}
                  className={cn(
                    "space-y-3 rounded-2xl border p-4 sm:p-5",
                    isImportant
                      ? "border-amber-500/40 bg-amber-500/[0.06]"
                      : "border-border/70 bg-background/40"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-purple-600/10 text-xs font-bold text-purple-600 dark:text-purple-400">
                      {qIndex + 1}
                    </span>
                    {isImportant && (
                      <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-amber-800 uppercase dark:text-amber-300">
                        La más importante
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                      Pregunta
                    </label>
                    <input
                      type="text"
                      className="h-11 w-full rounded-xl border border-border bg-background/50 px-3 text-sm outline-none transition-all hover:border-foreground/30 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20"
                      {...register(`questions.${qIndex}.question`)}
                    />
                    {errors.questions?.[qIndex]?.question && (
                      <p className="text-xs text-destructive">
                        {errors.questions[qIndex]?.question?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Opciones
                    </p>
                    <ul className="space-y-2">
                      {options.map((_, oIndex) => (
                        <li key={`${field.id}-opt-${oIndex}`} className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
                          <input
                            type="text"
                            placeholder="Etiqueta"
                            className="h-9 min-w-0 w-full flex-1 rounded-lg border border-border/60 bg-background/60 px-2.5 text-xs outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-500/20 lg:w-auto"
                            {...register(`questions.${qIndex}.options.${oIndex}.label`)}
                          />
                          <input
                            type="text"
                            placeholder="Valor"
                            className="h-9 w-full min-w-0 rounded-lg border border-border/60 bg-background/60 px-2.5 font-mono text-xs outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-500/20 lg:w-32 lg:shrink-0"
                            {...register(`questions.${qIndex}.options.${oIndex}.value`)}
                          />
                          <button
                            type="button"
                            disabled={options.length <= 2}
                            onClick={() => {
                              const next = options
                                .filter((_, i) => i !== oIndex)
                                .map((o, i) => ({ ...o, sortOrder: i }));
                              update(qIndex, {
                                ...watch(`questions.${qIndex}`),
                                options: next,
                              });
                            }}
                            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                            title="Quitar opción"
                          >
                            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        update(qIndex, {
                          ...watch(`questions.${qIndex}`),
                          options: [
                            ...options,
                            {
                              label: "Nueva opción",
                              value: "",
                              sortOrder: options.length,
                            },
                          ],
                        });
                      }}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/60 px-2.5 text-[11px] font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                    >
                      <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-3" />
                      Añadir opción
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href="/admin/questionnaires"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border/80 bg-background/50 px-5 text-sm font-medium text-foreground transition-all hover:border-border hover:bg-muted active:scale-[0.98]"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="group relative inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-700 hover:shadow-purple-500/25 active:scale-[0.98] disabled:opacity-60 dark:hover:bg-purple-500"
            >
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                strokeWidth={2}
                className="size-4 transition-transform group-hover:scale-110"
              />
              <span>{saving ? "Guardando…" : "Guardar cuestionario"}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
