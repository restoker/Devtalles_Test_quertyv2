'use server';

import { auth } from "@/server/auth";
import type { Assessment } from "@/types/assessment-schema";

export const deleteAssessmentAnswerAction = async (
  id: number,
  questionId: number
) => {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false as const, msg: "No tiene permisos para realizar esta operacion" };
    }

    const url = process.env.ADDRESS_SERVER;
    const resp = await fetch(
      `${url}/api/assessments/${id}/answers/${questionId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.tokenAuth}`,
        },
      }
    );

    const body = await resp.json();
    if (!resp.ok) {
      return {
        ok: false as const,
        msg: (body?.message as string) || "Error al quitar la respuesta",
      };
    }

    return {
      ok: true as const,
      data: body as Assessment,
      msg: "Respuesta eliminada exitosamente",
    };
  } catch {
    return { ok: false as const, msg: "Error al quitar la respuesta" };
  }
};
