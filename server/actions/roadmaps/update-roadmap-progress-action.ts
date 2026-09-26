'use server';

import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import type { RoadmapView } from "@/types/roadmap-schema";

function nestMsg(body: { message?: string | string[] }, fallback: string) {
    if (typeof body.message === "string") return body.message;
    if (Array.isArray(body.message)) return body.message.join(", ");
    return fallback;
}

export const updateRoadmapProgressAction = async (
    roadmapId: number,
    courseId: number,
    progress: number
) => {
    try {
        const session = await auth();
        if (!session)
            return {
                ok: false as const,
                msg: "No tiene permisos para realizar esta operacion",
            };

        const url = process.env.ADDRESS_SERVER;
        const resp = await fetch(
            `${url}/api/roadmaps/${roadmapId}/courses/${courseId}/progress`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.user.tokenAuth}`,
                },
                body: JSON.stringify({ progress: Math.round(progress) }),
            }
        );
        const body = await resp.json();

        if (!resp.ok) {
            return {
                ok: false as const,
                msg: nestMsg(body, "Error al actualizar el progreso"),
            };
        }

        revalidatePath("/admin/roadmaps");
        revalidatePath("/panel/roadmaps");
        revalidatePath("/roadmaps");
        return {
            ok: true as const,
            data: body as RoadmapView,
            msg: "Progreso actualizado exitosamente",
        };
    } catch {
        return { ok: false as const, msg: "Error al actualizar el progreso" };
    }
};
