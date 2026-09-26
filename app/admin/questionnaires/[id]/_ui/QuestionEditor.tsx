"use client";

import { useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUp01Icon,
  ArrowDown01Icon,
  Delete02Icon,
  PlusSignIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  QUESTION_TYPE_LABELS,
  isChoiceQuestionType,
  type AnswerOption,
  type Question,
} from "@/types/questionnaire-schema";
import { updateQuestionAction } from "@/server/actions/questions/update-question-action";
import { createAnswerOptionAction } from "@/server/actions/questions/create-answer-option-action";
import { updateAnswerOptionAction } from "@/server/actions/answer-options/update-answer-option-action";
import { deleteAnswerOptionAction } from "@/server/actions/answer-options/delete-answer-option-action";

interface QuestionEditorProps {
  question: Question;
  index: number;
  total: number;
  important?: boolean;
  onLocalChange: (next: Question) => void;
  onPersisted: (next: Question) => void;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
}

export default function QuestionEditor({
  question,
  index,
  total,
  important = false,
  onLocalChange,
  onPersisted,
  onMove,
  onDelete,
}: QuestionEditorProps) {
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [isPending, startTransition] = useTransition();
  const isChoice = isChoiceQuestionType(question.type);

  const persistQuestion = (patch: {
    question?: string;
    sortOrder?: number;
    rules?: Question["rules"];
  }) => {
    startTransition(async () => {
      const result = await updateQuestionAction(question.id, patch);
      if (!result.ok) {
        toast.add({
          title: "No se pudo actualizar la pregunta",
          description: result.msg,
          type: "error",
        });
        return;
      }
      onPersisted({
        ...question,
        ...result.data,
        options: result.data.options ?? question.options,
      });
    });
  };

  const updateOptionLocal = (optionId: AnswerOption["id"], patch: Partial<AnswerOption>) => {
    onLocalChange({
      ...question,
      options: question.options.map((o) =>
        String(o.id) === String(optionId) ? { ...o, ...patch } : o
      ),
    });
  };

  const persistOption = (option: AnswerOption) => {
    startTransition(async () => {
      const result = await updateAnswerOptionAction(option.id, {
        label: option.label,
        value: option.value ?? null,
        sortOrder: option.sortOrder,
      });
      if (!result.ok) {
        toast.add({
          title: "No se pudo actualizar la opción",
          description: result.msg,
          type: "error",
        });
        return;
      }
      onPersisted({
        ...question,
        options: question.options.map((o) =>
          String(o.id) === String(option.id) ? { ...o, ...result.data } : o
        ),
      });
    });
  };

  const removeOption = (optionId: AnswerOption["id"]) => {
    if (!window.confirm("¿Eliminar esta opción de respuesta?")) return;
    startTransition(async () => {
      const result = await deleteAnswerOptionAction(optionId);
      if (!result.ok) {
        toast.add({
          title: "No se pudo eliminar la opción",
          description: result.msg,
          type: "error",
        });
        return;
      }
      onPersisted({
        ...question,
        options: question.options
          .filter((o) => String(o.id) !== String(optionId))
          .map((o, i) => ({ ...o, sortOrder: i })),
      });
      toast.add({
        title: "Opción eliminada",
        description: "La opción se eliminó correctamente.",
        type: "success",
      });
    });
  };

  const addOption = () => {
    const label = newOptionLabel.trim();
    if (!label) return;
    startTransition(async () => {
      const result = await createAnswerOptionAction(question.id, {
        label,
        sortOrder: question.options.length,
      });
      if (!result.ok) {
        toast.add({
          title: "No se pudo añadir la opción",
          description: result.msg,
          type: "error",
        });
        return;
      }
      onPersisted({
        ...question,
        options: [...question.options, result.data],
      });
      setNewOptionLabel("");
      toast.add({
        title: "Opción añadida",
        description: `"${label}" agregada.`,
        type: "success",
      });
    });
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 sm:p-5",
        important
          ? "border-amber-500/40 bg-amber-500/[0.06]"
          : "border-border/70 bg-background/40"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-600/10 text-xs font-bold text-purple-600 dark:text-purple-400">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            {important && (
              <span className="inline-flex rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-amber-800 uppercase dark:text-amber-300">
                La más importante
              </span>
            )}
            <input
              type="text"
              value={question.question}
              disabled={isPending}
              onChange={(e) =>
                onLocalChange({ ...question, question: e.target.value })
              }
              onBlur={(e) => {
                const value = e.target.value.trim();
                if (value) persistQuestion({ question: value });
              }}
              className="h-10 w-full rounded-xl border border-border/70 bg-background/50 px-3 text-sm font-medium outline-none transition-all hover:border-foreground/30 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-60"
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {QUESTION_TYPE_LABELS[question.type]}
              </span>
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={question.rules?.required ?? false}
                  disabled={isPending}
                  onCheckedChange={(value) => {
                    const rules = {
                      ...question.rules,
                      required: !!value,
                    };
                    onLocalChange({ ...question, rules });
                    persistQuestion({ rules });
                  }}
                />
                Requerida
              </label>
              {question.rules?.allowDetails && (
                <span className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Detalles permitidos
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={index === 0 || isPending}
            onClick={() => onMove(-1)}
            className="inline-flex size-8 items-center justify-center rounded-lg border border-border/70 text-foreground transition-all hover:bg-muted disabled:opacity-40"
            title="Subir"
          >
            <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} className="size-4" />
          </button>
          <button
            type="button"
            disabled={index === total - 1 || isPending}
            onClick={() => onMove(1)}
            className="inline-flex size-8 items-center justify-center rounded-lg border border-border/70 text-foreground transition-all hover:bg-muted disabled:opacity-40"
            title="Bajar"
          >
            <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-4" />
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onDelete}
            className="inline-flex size-8 items-center justify-center rounded-lg border border-destructive/30 text-destructive transition-all hover:bg-destructive/10 disabled:opacity-40"
            title="Eliminar pregunta"
          >
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
          </button>
        </div>
      </div>

      {isChoice && (
        <div className="mt-4 space-y-2 border-t border-border/50 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Opciones de respuesta
          </p>
          <ul className="space-y-2">
            {question.options.map((option) => (
              <li
                key={String(option.id)}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-border/50 bg-muted/20 p-2 lg:flex-nowrap"
              >
                <input
                  type="text"
                  value={option.label}
                  disabled={isPending}
                  onChange={(e) =>
                    updateOptionLocal(option.id, { label: e.target.value })
                  }
                  onBlur={(e) =>
                    persistOption({ ...option, label: e.target.value.trim() || option.label })
                  }
                  placeholder="Etiqueta"
                  className="h-9 min-w-0 flex-1 rounded-lg border border-border/60 bg-background/60 px-2.5 text-xs outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-500/20 disabled:opacity-60"
                />
                <input
                  type="text"
                  value={option.value ?? ""}
                  disabled={isPending}
                  onChange={(e) =>
                    updateOptionLocal(option.id, {
                      value: e.target.value.trim() ? e.target.value : null,
                    })
                  }
                  onBlur={(e) =>
                    persistOption({
                      ...option,
                      value: e.target.value.trim() ? e.target.value.trim() : null,
                    })
                  }
                  placeholder="Valor (opcional)"
                  className="h-9 w-full min-w-0 rounded-lg border border-border/60 bg-background/60 px-2.5 font-mono text-xs outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-500/20 disabled:opacity-60 lg:w-36 lg:shrink-0"
                />
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => removeOption(option.id)}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                  title="Eliminar opción"
                >
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={newOptionLabel}
              disabled={isPending}
              onChange={(e) => setNewOptionLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOption();
                }
              }}
              placeholder="Nueva opción..."
              className="h-9 min-w-0 flex-1 rounded-lg border border-border/60 bg-background/60 px-2.5 text-xs outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-500/20 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={addOption}
              disabled={!newOptionLabel.trim() || isPending}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-lg bg-purple-600 px-3 text-xs font-semibold text-white transition-all hover:bg-purple-500 active:scale-[0.98] disabled:opacity-40"
              )}
            >
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-3.5" />
              Añadir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
