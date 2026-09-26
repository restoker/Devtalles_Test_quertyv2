'use server';

import { auth } from '@/server/auth';
import type { Question, QuestionType } from '@/types/questionnaire-schema';
import { revalidatePath } from 'next/cache';

function errorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const msg = (body as { message: string | string[] }).message;
    return Array.isArray(msg) ? msg.join(', ') : msg;
  }
  return fallback;
}

export async function createQuestionAction(
  questionnaireId: string | number,
  input: {
    question: string;
    type: QuestionType;
    sortOrder: number;
    rules?: {
      required?: boolean;
      maxSelections?: number;
      allowDetails?: boolean;
    };
    options?: { label: string; value?: string; sortOrder?: number }[];
  }
) {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false as const, msg: 'No tiene permisos para realizar esta operacion' };
    }

    const url = process.env.ADDRESS_SERVER;
    const resp = await fetch(
      `${url}/api/questionnaires/${questionnaireId}/questions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.user.tokenAuth}`,
        },
        body: JSON.stringify(input),
      }
    );

    const body = await resp.json().catch(() => null);
    if (!resp.ok) {
      return {
        ok: false as const,
        msg: errorMessage(body, 'Error al crear la pregunta'),
      };
    }

    revalidatePath('/admin/questionnaires');
    return {
      ok: true as const,
      data: (body as { data: Question }).data,
      msg: 'Pregunta creada exitosamente',
    };
  } catch {
    return { ok: false as const, msg: 'Error al crear la pregunta' };
  }
}
