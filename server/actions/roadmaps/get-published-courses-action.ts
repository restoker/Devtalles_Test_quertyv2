'use server';

import { auth } from "@/server/auth";
import type { PublishedCourseOption } from "@/types/roadmap-schema";

function nestMsg(body: { message?: string | string[] }, fallback: string) {
    if (typeof body.message === "string") return body.message;
    if (Array.isArray(body.message)) return body.message.join(", ");
    return fallback;
}

export const getPublishedCoursesAction = async () => {
    try {
        const session = await auth();
        if (!session)
            return {
                ok: false as const,
                msg: "No tiene permisos para realizar esta operacion",
            };

        const url = process.env.ADDRESS_SERVER;
        const resp = await fetch(`${url}/api/courses?limit=100`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.user.tokenAuth}`,
            },
        });
        const body = await resp.json();

        if (!resp.ok) {
            return {
                ok: false as const,
                msg: nestMsg(body, "Error al obtener los cursos publicados"),
            };
        }

        const courses = (Array.isArray(body.data) ? body.data : []) as Array<{
            id: number;
            title: string;
            status?: string;
        }>;

        const published: PublishedCourseOption[] = courses
            .filter((c) => !c.status || c.status === "published")
            .map((c) => ({
                id: Number(c.id),
                title: c.title,
                status: c.status,
            }));

        return {
            ok: true as const,
            data: published,
            msg: "Cursos publicados obtenidos exitosamente",
        };
    } catch {
        return {
            ok: false as const,
            msg: "Error al obtener los cursos publicados",
        };
    }
};
