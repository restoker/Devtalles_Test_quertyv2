'use server';

import { auth } from "@/server/auth";
import type { Assessment } from "@/types/assessment-schema";

export type UpsertAnswerPayload = {
  questionId: number;
  answerOptionId?: number;
  answerOptionIds?: number[];
  value?: string | number | boolean;
};

export const upsertAssessmentAnswerAction = async (
  id: number,
  payload: UpsertAnswerPayload
) => {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false as const, msg: "No tiene permisos para realizar esta operacion" };
    }

    const url = process.env.ADDRESS_SERVER;
    const resp = await fetch(`${url}/api/assessments/${id}/answers`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.tokenAuth}`,
      },
      body: JSON.stringify(payload),
    });

    const body = await resp.json();
    if (!resp.ok) {
      return {
        ok: false as const,
        msg: (body?.message as string) || "Error al guardar la respuesta",
      };
    }

    return {
      ok: true as const,
      data: body as Assessment,
      msg: "Respuesta guardada exitosamente",
    };
  } catch {
    return { ok: false as const, msg: "Error al guardar la respuesta" };
  }
};
