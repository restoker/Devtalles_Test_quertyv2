'use server';

import { auth } from '@/server/auth';
import type { Questionnaire } from '@/types/questionnaire-schema';
import { revalidatePath } from 'next/cache';

function errorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const msg = (body as { message: string | string[] }).message;
    return Array.isArray(msg) ? msg.join(', ') : msg;
  }
  return fallback;
}

export async function updateQuestionnaireAction(
  id: string | number,
  input: {
    title?: string;
    description?: string | null;
    isActive?: boolean;
  }
) {
  try {
    const session = await auth();
    if (!session) {
      return { ok: false as const, msg: 'No tiene permisos para realizar esta operacion' };
    }

    const payload: Record<string, unknown> = {};
    if (input.title !== undefined) payload.title = input.title;
    if (input.description !== undefined) {
      payload.description = input.description ?? '';
    }
    if (input.isActive !== undefined) payload.isActive = input.isActive;

    const url = process.env.ADDRESS_SERVER;
    const resp = await fetch(`${url}/api/questionnaires/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.user.tokenAuth}`,
      },
      body: JSON.stringify(payload),
    });

    const body = await resp.json().catch(() => null);
    if (!resp.ok) {
      return {
        ok: false as const,
        msg: errorMessage(body, 'Error al actualizar el cuestionario'),
      };
    }

    revalidatePath('/admin/questionnaires');
    return {
      ok: true as const,
      data: (body as { data: Questionnaire }).data,
      msg: 'Cuestionario actualizado exitosamente',
    };
  } catch {
    return { ok: false as const, msg: 'Error al actualizar el cuestionario' };
  }
}
