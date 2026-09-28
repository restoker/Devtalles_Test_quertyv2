import z from "zod";


export const crearCursoSchema = z.object({
    id: z.number().optional(),
    title: z.string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre debe tener menos de 100 caracteres")
        .trim(),
    description: z.string()
        .min(3, "La descripción debe tener al menos 3 caracteres")
        .max(100, "La descripción debe tener menos de 100 caracteres")
        .trim(),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    imageUrl: z.string().optional(),
    instructor: z.string().optional(),
    durationMinutes: z.string().optional(),
    prerequisiteIds: z.array(z.number()).optional(),
    categoryIds: z.array(z.number()).optional(),
    technologyIds: z.array(z.number()).optional(),
    url: z.string().optional(),
});

export type CrearCursoSchema = z.infer<typeof crearCursoSchema>;