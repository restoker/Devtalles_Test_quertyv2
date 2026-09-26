'use server';

import { auth } from "@/server/auth";
import { revalidatePath } from "next/cache";
import type { RoadmapView } from "@/types/roadmap-schema";

function nestMsg(body: { message?: string | string[] }, fallback: string) {
    if (typeof body.message === "string") return body.message;
    if (Array.isArray(body.message)) return body.message.join(", ");
    return fallback;
}

export const generateRoadmapAction = async (assessmentId: number) => {
    try {
        const session = await auth();
        if (!session)
            return {
                ok: false as const,
                msg: "No tiene permisos para realizar esta operacion",
            };

        const url = process.env.ADDRESS_SERVER;
        const resp = await fetch(`${url}/api/roadmaps/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.user.tokenAuth}`,
            },
            body: JSON.stringify({ assessmentId }),
        });
        const body = await resp.json();

        if (!resp.ok) {
            return {
                ok: false as const,
                msg: nestMsg(body, "No se pudo armar la ruta"),
            };
        }

        revalidatePath("/admin/roadmaps");
        revalidatePath("/admin/roadmaps/mios");
        return {
            ok: true as const,
            data: body as RoadmapView,
            msg: "Hemos seleccionado los mejores cursos para ti",
        };
    } catch {
        return { ok: false as const, msg: "No se pudo armar la ruta" };
    }
};
