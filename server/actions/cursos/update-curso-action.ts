'use server';

import { actionClient } from "@/lib/action-client";
import { auth } from "@/server/auth";
import {
    toCreateCoursePayload,
    updateCursoSchema,
} from "@/types/curso-schema";
import { revalidatePath } from "next/cache";

function nestMsg(body: { message?: string | string[] }, fallback: string) {
    if (typeof body.message === "string") return body.message;
    if (Array.isArray(body.message)) return body.message.join(", ");
    return fallback;
}

export const updateCursoAction = actionClient
    .inputSchema(updateCursoSchema)
    .action(async ({ parsedInput }) => {
        try {
            const session = await auth();
            if (!session)
                return {
                    ok: false,
                    msg: "No tiene permisos para realizar esta operacion",
                };

            const { id, ...rest } = parsedInput;
            const url = process.env.ADDRESS_SERVER;
            const resp = await fetch(`${url}/api/admin/courses/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.user.tokenAuth}`,
                },
                body: JSON.stringify(toCreateCoursePayload(rest)),
            });
            const body = await resp.json();

            if (!resp.ok) {
                return {
                    ok: false,
                    msg: nestMsg(body, "Error al actualizar el curso"),
                };
            }

            revalidatePath("/admin/cursos");
            return {
                ok: true,
                data: body.data,
                msg: "Curso actualizado exitosamente",
            };
        } catch {
            return { ok: false, msg: "Error al actualizar el curso" };
        }
    });
