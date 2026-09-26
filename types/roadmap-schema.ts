import z from "zod";

export const createRoadmapSchema = z.object({
    title: z
        .string()
        .min(1, "El título es obligatorio")
        .max(200, "El título debe tener máximo 200 caracteres")
        .trim(),
    courseIds: z
        .array(z.number().int().positive("ID de curso inválido"))
        .min(1, "Selecciona al menos un curso"),
});

export type CreateRoadmapSchema = z.infer<typeof createRoadmapSchema>;

export const updateRoadmapSchema = z.object({
    title: z
        .string()
        .min(1, "El título es obligatorio")
        .max(200, "El título debe tener máximo 200 caracteres")
        .trim()
        .optional(),
    courseIds: z
        .array(z.number().int().positive("ID de curso inválido"))
        .min(1, "Selecciona al menos un curso")
        .optional(),
});

export type UpdateRoadmapSchema = z.infer<typeof updateRoadmapSchema>;

export const courseProgressSchema = z.object({
    progress: z
        .number()
        .int("El progreso debe ser un entero")
        .min(0, "Mínimo 0")
        .max(100, "Máximo 100"),
});

export type CourseProgressSchema = z.infer<typeof courseProgressSchema>;

/** Nested catalog course on a roadmap membership (may be missing). */
export interface RoadmapCatalogCourse {
    id: number;
    title: string;
    description?: string | null;
    url?: string | null;
    imageUrl?: string | null;
    durationMinutes?: number | null;
    instructor?: string | null;
    level?: string | null;
    status?: string;
}

export interface RoadmapCourseView {
    courseId: number;
    progress: number;
    sortOrder: number;
    course?: RoadmapCatalogCourse | null;
}

export const ROADMAP_SCOPES = ["personal", "global"] as const;
export type RoadmapScope = (typeof ROADMAP_SCOPES)[number];

export const ROADMAP_SCOPE_LABELS: Record<RoadmapScope, string> = {
    personal: "Personal",
    global: "Global",
};

/** Roadmap view returned directly by Nest (not wrapped in { data }). */
export interface RoadmapView {
    id: number;
    title: string;
    scope: RoadmapScope;
    userId: string;
    sourceRoadmapId?: number | null;
    rationale?: string | null;
    assessmentId?: number | null;
    courses: RoadmapCourseView[];
}

export function savedCopiesByGlobalId(roadmaps: RoadmapView[]): Record<number, number> {
    const saved: Record<number, number> = {};
    for (const roadmap of roadmaps) {
        if (roadmap.sourceRoadmapId != null) {
            saved[roadmap.sourceRoadmapId] = roadmap.id;
        }
    }
    return saved;
}

/** Minimal course option for the published catalog picker. */
export interface PublishedCourseOption {
    id: number;
    title: string;
    status?: string;
}

export function courseTitleFromRoadmap(
    courseId: number,
    membership?: RoadmapCourseView,
    catalog?: PublishedCourseOption[]
): string {
    if (membership?.course?.title) return membership.course.title;
    const fromCatalog = catalog?.find((c) => c.id === courseId)?.title;
    if (fromCatalog) return fromCatalog;
    return `Curso #${courseId}`;
}
