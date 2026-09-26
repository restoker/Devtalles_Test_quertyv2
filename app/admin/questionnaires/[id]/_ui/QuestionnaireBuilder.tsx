"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  File01Icon,
  CheckmarkCircle02Icon,
  PlusSignIcon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";

import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  addQuestionSchema,
  createQuestionnaireSchema,
  questionTypes,
  QUESTION_TYPE_LABELS,
  isChoiceQuestionType,
  type AddQuestionSchema,
  type CreateQuestionnaireSchema,
  type Question,
  type Questionnaire,
} from "@/types/questionnaire-schema";
import { getQuestionnaireAction } from "@/server/actions/questionnaires/get-questionnaire-action";
import { updateQuestionnaireAction } from "@/server/actions/questionnaires/update-questionnaire-action";
import { createQuestionAction } from "@/server/actions/questionnaires/create-question-action";
import { updateQuestionAction } from "@/server/actions/questions/update-question-action";
import { deleteQuestionAction } from "@/server/actions/questions/delete-question-action";
import QuestionEditor from "./QuestionEditor";

interface QuestionnaireBuilderProps {
  questionnaireId: string;
  initialQuestionnaire?: Questionnaire | null;
}

function isMostImportantQuestion(q: Question): boolean {
  const text = q.question.toLowerCase();
  return (
    q.sortOrder === 0 ||
    text.includes("qué quieres construir") ||
    text.includes("que quieres construir")
  );
}

export default function QuestionnaireBuilder({
  questionnaireId,
  initialQuestionnaire = null,
}: QuestionnaireBuilderProps) {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(
    initialQuestionnaire
  );
  const [loading, setLoading] = useState(!initialQuestionnaire);
  const [notFound, setNotFound] = useState(false);
  const [isPending, startTransition] = useTransition();

  const metaForm = useForm<CreateQuestionnaireSchema>({
    resolver: zodResolver(createQuestionnaireSchema),
    defaultValues: {
      title: initialQuestionnaire?.title ?? "",
      description: initialQuestionnaire?.description ?? "",
    },
    mode: "onChange",
  });

  const addForm = useForm<AddQuestionSchema>({
    resolver: zodResolver(addQuestionSchema),
    defaultValues: {
      question: "",
      type: "single_choice",
      required: true,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (initialQuestionnaire) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await getQuestionnaireAction(questionnaireId);
      if (cancelled) return;
      if (!result.ok || !result.data) {
        setNotFound(true);
        setQuestionnaire(null);
        toast.add({
          title: "No se pudo cargar el cuestionario",
          description: result.ok ? "Sin datos" : result.msg,
          type: "error",
        });
      } else {
        setQuestionnaire(result.data);
        metaForm.reset({
          title: result.data.title,
          description: result.data.description ?? "",
        });
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [questionnaireId, initialQuestionnaire, metaForm]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl py-16 text-center text-sm text-muted-foreground">
        Cargando cuestionario…
      </div>
    );
  }

  if (notFound || !questionnaire) {
    return (
      <div className="mx-auto w-full max-w-3xl py-10">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-center">
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-8 text-destructive" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">Cuestionario no encontrado</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              No existe un cuestionario con id &quot;{questionnaireId}&quot;.
            </p>
          </div>
          <Link
            href="/admin/questionnaires"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-background px-4 py-2 text-xs font-semibold transition-all hover:bg-muted"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} strokeWidth={2} className="size-3.5" />
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  const sortedQuestions = [...(questionnaire.questions ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  const saveMeta = metaForm.handleSubmit((data) => {
    startTransition(async () => {
      const result = await updateQuestionnaireAction(questionnaire.id, {
        title: data.title,
        description: data.description || null,
      });
      if (!result.ok) {
        toast.add({
          title: "No se pudieron guardar los datos",
          description: result.msg,
          type: "error",
        });
        return;
      }
      setQuestionnaire((prev) =>
        prev
          ? {
              ...prev,
              title: result.data.title,
              description: result.data.description,
            }
          : prev
      );
      toast.add({
        title: "Datos actualizados",
        description: "Título y descripción guardados.",
        type: "success",
      });
    });
  });

  const addQuestion = addForm.handleSubmit((data) => {
    startTransition(async () => {
      const options = isChoiceQuestionType(data.type)
        ? [
            { label: "Opción A", value: "a", sortOrder: 0 },
            { label: "Opción B", value: "b", sortOrder: 1 },
          ]
        : undefined;

      const result = await createQuestionAction(questionnaire.id, {
        question: data.question,
        type: data.type,
        sortOrder: questionnaire.questions?.length ?? 0,
        rules: { required: data.required },
        options,
      });

      if (!result.ok) {
        toast.add({
          title: "No se pudo añadir la pregunta",
          description: result.msg,
          type: "error",
        });
        return;
      }

      setQuestionnaire((prev) =>
        prev
          ? { ...prev, questions: [...(prev.questions ?? []), result.data] }
          : prev
      );
      addForm.reset({ question: "", type: data.type, required: true });
      toast.add({
        title: "Pregunta añadida",
        description: "Se creó correctamente en el servidor.",
        type: "success",
      });
    });
  });

  const replaceQuestion = (id: Question["id"], next: Question) => {
    setQuestionnaire((prev) =>
      prev
        ? {
            ...prev,
            questions: (prev.questions ?? []).map((q) =>
              String(q.id) === String(id) ? next : q
            ),
          }
        : prev
    );
  };

  const moveQuestion = (id: Question["id"], direction: -1 | 1) => {
    const ordered = [...(questionnaire.questions ?? [])].sort(
      (a, b) => a.sortOrder - b.sortOrder
    );
    const index = ordered.findIndex((q) => String(q.id) === String(id));
    const target = index + direction;
    if (index < 0 || target < 0 || target >= ordered.length) return;

    const a = ordered[index];
    const b = ordered[target];
    const aOrder = a.sortOrder;
    const bOrder = b.sortOrder;

    startTransition(async () => {
      const [resA, resB] = await Promise.all([
        updateQuestionAction(a.id, { sortOrder: bOrder }),
        updateQuestionAction(b.id, { sortOrder: aOrder }),
      ]);
      if (!resA.ok || !resB.ok) {
        toast.add({
          title: "No se pudo reordenar",
          description: !resA.ok ? resA.msg : resB.msg,
          type: "error",
        });
        return;
      }
      setQuestionnaire((prev) => {
        if (!prev) return prev;
        const next = (prev.questions ?? []).map((q) => {
          if (String(q.id) === String(a.id)) return { ...q, sortOrder: bOrder };
          if (String(q.id) === String(b.id)) return { ...q, sortOrder: aOrder };
          return q;
        });
        return { ...prev, questions: next };
      });
    });
  };

  const deleteQuestion = (id: Question["id"]) => {
    if (!window.confirm("¿Eliminar esta pregunta y sus opciones?")) return;
    startTransition(async () => {
      const result = await deleteQuestionAction(id);
      if (!result.ok) {
        toast.add({
          title: "No se pudo eliminar la pregunta",
          description: result.msg,
          type: "error",
        });
        return;
      }
      setQuestionnaire((prev) => {
        if (!prev) return prev;
        const remaining = (prev.questions ?? [])
          .filter((q) => String(q.id) !== String(id))
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((q, i) => ({ ...q, sortOrder: i }));
        return { ...prev, questions: remaining };
      });
      toast.add({
        title: "Pregunta eliminada",
        description: "Se eliminó correctamente.",
        type: "success",
      });
    });
  };

  return (
    <div
      data-lenis-prevent
      className="mx-auto h-[calc(100dvh-7.5rem)] min-h-0 w-full max-w-3xl space-y-6 overflow-y-auto overscroll-y-contain py-2 sm:py-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-2"
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
          <span className="truncate text-xs font-semibold text-foreground">
            {questionnaire.title}
          </span>
        </div>

        <div className="mt-2 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Editar cuestionario
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Modifica metadatos, reordena preguntas y gestiona opciones.
            </p>
          </div>
          <div className="hidden size-11 shrink-0 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-600 shadow-xs sm:flex dark:text-purple-400">
            <HugeiconsIcon icon={File01Icon} strokeWidth={2} className="size-5" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs sm:p-6 dark:border-white/10 dark:bg-zinc-950/60"
      >
        <form onSubmit={saveMeta} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
              Título <span className="text-purple-600">*</span>
            </label>
            <input
              type="text"
              className={cn(
                "h-11 w-full rounded-xl border bg-background/50 px-4 text-sm font-medium outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20",
                metaForm.formState.errors.title
                  ? "border-destructive"
                  : "border-border hover:border-foreground/30"
              )}
              {...metaForm.register("title")}
            />
            <AnimatePresence>
              {metaForm.formState.errors.title && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-destructive"
                >
                  {metaForm.formState.errors.title.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
              Descripción
            </label>
            <textarea
              rows={3}
              className="w-full resize-y rounded-xl border border-border bg-background/50 px-4 py-3 text-sm outline-none transition-all hover:border-foreground/30 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20"
              {...metaForm.register("description")}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-purple-600 px-4 text-xs font-semibold text-white transition-all hover:bg-purple-500 active:scale-[0.98] disabled:opacity-60"
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-3.5" />
              Guardar datos
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Preguntas ({sortedQuestions.length})
          </h2>
        </div>

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {sortedQuestions.map((question, index) => (
              <motion.div
                key={String(question.id)}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
              >
                <QuestionEditor
                  question={question}
                  index={index}
                  total={sortedQuestions.length}
                  important={isMostImportantQuestion(question)}
                  onLocalChange={(next) => replaceQuestion(question.id, next)}
                  onPersisted={(next) => replaceQuestion(question.id, next)}
                  onMove={(dir) => moveQuestion(question.id, dir)}
                  onDelete={() => deleteQuestion(question.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {sortedQuestions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
              Aún no hay preguntas. Añade la primera debajo.
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.14 }}
        className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs sm:p-6 dark:border-white/10 dark:bg-zinc-950/60"
      >
        <h3 className="mb-4 text-sm font-bold tracking-tight text-foreground">
          Añadir pregunta
        </h3>
        <form onSubmit={addQuestion} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
              Texto de la pregunta
            </label>
            <input
              type="text"
              placeholder="Escribe la pregunta..."
              className={cn(
                "h-11 w-full rounded-xl border bg-background/50 px-4 text-sm outline-none transition-all focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20",
                addForm.formState.errors.question
                  ? "border-destructive"
                  : "border-border hover:border-foreground/30"
              )}
              {...addForm.register("question")}
            />
            {addForm.formState.errors.question && (
              <p className="text-xs text-destructive">
                {addForm.formState.errors.question.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                Tipo
              </label>
              <select
                className="h-11 w-full rounded-xl border border-border bg-background/50 px-3 text-sm outline-none transition-all hover:border-foreground/30 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20"
                {...addForm.register("type")}
              >
                {questionTypes.map((type) => (
                  <option key={type} value={type}>
                    {QUESTION_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={addForm.watch("required")}
                  onCheckedChange={(value) =>
                    addForm.setValue("required", !!value, { shouldValidate: true })
                  }
                />
                Pregunta requerida
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-purple-600 px-4 text-xs font-semibold text-white transition-all hover:bg-purple-500 active:scale-[0.98] disabled:opacity-60"
            >
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-3.5" />
              Añadir pregunta
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
