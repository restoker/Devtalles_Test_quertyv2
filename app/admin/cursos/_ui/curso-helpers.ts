import type { CourseLevel, CourseStatus, CursoItem } from "@/types/curso-schema";

export type { CatalogRef, CursoItem } from "@/types/curso-schema";

export const COURSE_LEVELS: CourseLevel[] = [
    "beginner",
    "intermediate",
    "advanced",
];

export const LEVEL_LABELS: Record<CourseLevel, string> = {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
};

export const STATUS_LABELS: Record<CourseStatus, string> = {
    published: "Publicado",
    draft: "Borrador",
    archived: "Archivado",
};

export function formatDuration(minutes: number | null): string {
    if (minutes == null) return "—";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (rest === 0) return `${hours} h`;
    return `${hours} h ${rest} min`;
}

export function toNumericId(id: string | number): number {
    return typeof id === "number" ? id : Number(id);
}

export function normalizeCursoItem(course: CursoItem): CursoItem {
    return {
        ...course,
        id: toNumericId(course.id),
        categories: (course.categories ?? []).map((c) => ({
            id: toNumericId(c.id),
            name: c.name,
        })),
        technologies: (course.technologies ?? []).map((t) => ({
            id: toNumericId(t.id),
            name: t.name,
        })),
        prerequisiteIds: (course.prerequisiteIds ?? []).map(toNumericId),
    };
}
