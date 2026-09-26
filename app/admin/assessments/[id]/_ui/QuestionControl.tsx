"use client";

import React, { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AssessmentAnswer, Question } from "@/types/assessment-schema";

interface QuestionControlProps {
  question: Question;
  draft: AssessmentAnswer;
  disabled?: boolean;
  onChange: (next: AssessmentAnswer) => void;
}

export default function QuestionControl({
  question,
  draft,
  disabled,
  onChange,
}: QuestionControlProps) {
  const options = useMemo(
    () => [...(question.options ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [question.options]
  );

  if (question.type === "single_choice") {
    return (
      <div className="space-y-2">
        {options.map((opt) => {
          const selected = draft.answerOptionId === opt.id;
          return (
            <label
              key={opt.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-all",
                selected
                  ? "border-purple-500/50 bg-purple-500/10"
                  : "border-border/60 bg-background/50 hover:border-purple-500/30",
                disabled && "pointer-events-none opacity-60"
              )}
            >
              <input
                type="radio"
                name={`q-${question.id}`}
                className="mt-1 size-4 accent-purple-600"
                checked={selected}
                disabled={disabled}
                onChange={() =>
                  onChange({
                    questionId: question.id,
                    answerOptionId: opt.id,
                    value: draft.value ?? null,
                  })
                }
              />
              <span className="min-w-0 text-sm font-medium text-foreground">{opt.label}</span>
            </label>
          );
        })}
        {question.rules?.allowDetails && (
          <textarea
            disabled={disabled}
            value={typeof draft.value === "string" ? draft.value : ""}
            onChange={(e) =>
              onChange({
                ...draft,
                questionId: question.id,
                value: e.target.value,
              })
            }
            placeholder="Detalle opcional…"
            rows={3}
            className="mt-2 w-full rounded-2xl border border-border/70 bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-60"
          />
        )}
      </div>
    );
  }

  if (question.type === "multiple_choice") {
    const selectedIds = draft.answerOptionIds ?? [];
    const max = question.rules?.maxSelections;

    return (
      <div className="space-y-2">
        {options.map((opt) => {
          const checked = selectedIds.includes(opt.id);
          return (
            <label
              key={opt.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-all",
                checked
                  ? "border-purple-500/50 bg-purple-500/10"
                  : "border-border/60 bg-background/50 hover:border-purple-500/30",
                disabled && "pointer-events-none opacity-60"
              )}
            >
              <Checkbox
                checked={checked}
                disabled={disabled}
                onCheckedChange={(value) => {
                  const on = !!value;
                  let next = selectedIds;
                  if (on) {
                    if (max && selectedIds.length >= max && !checked) return;
                    next = [...selectedIds, opt.id];
                  } else {
                    next = selectedIds.filter((id) => id !== opt.id);
                  }
                  onChange({
                    questionId: question.id,
                    answerOptionIds: next,
                  });
                }}
              />
              <span className="min-w-0 text-sm font-medium text-foreground">{opt.label}</span>
            </label>
          );
        })}
        {max != null && (
          <p className="text-[11px] text-muted-foreground">
            Máximo {max} selección{max === 1 ? "" : "es"} ({selectedIds.length}/{max})
          </p>
        )}
      </div>
    );
  }

  if (question.type === "text") {
    return (
      <textarea
        disabled={disabled}
        value={typeof draft.value === "string" ? draft.value : ""}
        onChange={(e) =>
          onChange({ questionId: question.id, value: e.target.value })
        }
        placeholder="Escribe tu respuesta…"
        rows={4}
        className="w-full rounded-2xl border border-border/70 bg-background/50 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-60"
      />
    );
  }

  if (question.type === "number") {
    return (
      <Input
        type="number"
        disabled={disabled}
        value={draft.value === null || draft.value === undefined ? "" : String(draft.value)}
        onChange={(e) => {
          const raw = e.target.value;
          onChange({
            questionId: question.id,
            value: raw === "" ? null : Number(raw),
          });
        }}
        placeholder="Número"
        className="max-w-xs rounded-2xl"
      />
    );
  }

  // boolean
  const boolValue = draft.value === true ? true : draft.value === false ? false : null;
  return (
    <div className="flex flex-wrap gap-2">
      {(
        [
          { label: "Sí", value: true },
          { label: "No", value: false },
        ] as const
      ).map((opt) => {
        const selected = boolValue === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            disabled={disabled}
            onClick={() => onChange({ questionId: question.id, value: opt.value })}
            className={cn(
              "rounded-full border px-5 py-2 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60",
              selected
                ? "border-purple-500/50 bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "border-border/70 bg-background/60 text-foreground hover:border-purple-500/30 hover:bg-purple-500/5"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
