'use server';

import { auth } from "@/server/auth";
import type { Questionnaire } from "@/types/assessment-schema";

export const getAssessmentQuestionnaireAction = async (id: number) => {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false as const, msg: "No tiene permisos para realizar esta operacion" };
    }

    const url = process.env.ADDRESS_SERVER;
    const resp = await fetch(`${url}/api/assessments/${id}/questionnaire`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.user.tokenAuth}`,
      },
      cache: "no-store",
    });

    const body = await resp.json();
    if (!resp.ok) {
      return {
        ok: false as const,
        msg: (body?.message as string) || "Error al obtener el cuestionario",
      };
    }

    return {
      ok: true as const,
      data: body as Questionnaire,
      msg: "Cuestionario obtenido exitosamente",
    };
  } catch {
    return { ok: false as const, msg: "Error al obtener el cuestionario" };
  }
};
