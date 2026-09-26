import z from "zod";

export const courseLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);
export const courseStatusSchema = z.enum(["published", "draft", "archived"]);

export type CourseLevel = z.infer<typeof courseLevelSchema>;
export type CourseStatus = z.infer<typeof courseStatusSchema>;

const optionalUrlField = z
    .string()
    .trim()
    .refine(
        (v) => v === "" || /^https?:\/\/.+/i.test(v),
        "Ingresa una URL válida (http/https)"
    )
    .max(2048, "La URL es demasiado larga");

const optionalTextField = (max: number, label: string) =>
    z
        .string()
        .trim()
        .max(max, `${label} debe tener menos de ${max} caracteres`);

export const createCursoSchema = z.object({
    id: z.number().optional(),
    title: z
        .string()
        .trim()
        .min(1, "El título es obligatorio")
        .max(200, "El título debe tener menos de 200 caracteres"),
    description: optionalTextField(10000, "La descripción"),
    url: optionalUrlField,
    imageUrl: optionalUrlField,
    durationMinutes: z
        .string()
        .trim()
        .refine(
            (v) =>
                v === "" ||
                (/^\d+$/.test(v) &&
                    Number(v) >= 1 &&
                    Number(v) <= 1_000_000),
            "La duración debe ser un entero entre 1 y 1000000"
        ),
    instructor: optionalTextField(150, "El instructor"),
    level: z.union([courseLevelSchema, z.literal("")]),
    categoryIds: z.array(z.number().int().positive()).max(100),
    technologyIds: z.array(z.number().int().positive()).max(100),
    prerequisiteIds: z.array(z.number().int().positive()).max(100),
});

export type CreateCursoSchema = z.infer<typeof createCursoSchema>;

export const updateCursoSchema = createCursoSchema.extend({
    id: z.number().int().positive(),
});

export type UpdateCursoSchema = z.infer<typeof updateCursoSchema>;

export interface CatalogRef {
    id: number;
    name: string;
}

/** Course shape returned by GET /api/admin/courses and related endpoints. */
export interface CursoItem {
    id: number;
    title: string;
    description: string | null;
    url: string | null;
    imageUrl: string | null;
    durationMinutes: number | null;
    instructor: string | null;
    level: CourseLevel | null;
    status: CourseStatus;
    categories: CatalogRef[];
    technologies: CatalogRef[];
    prerequisiteIds: number[];
}

/** Valores listos para CreateCourseDto / UpdateCourseDto (null en opcionales vacíos). */
export function toCreateCoursePayload(
    data: Omit<CreateCursoSchema, "id"> | CreateCursoSchema
) {
    return {
        title: data.title,
        description: data.description || null,
        url: data.url || null,
        imageUrl: data.imageUrl || null,
        durationMinutes: data.durationMinutes
            ? Number(data.durationMinutes)
            : null,
        instructor: data.instructor || null,
        level: data.level === "" ? null : data.level,
        categoryIds: data.categoryIds,
        technologyIds: data.technologyIds,
        prerequisiteIds: data.prerequisiteIds,
    };
}
