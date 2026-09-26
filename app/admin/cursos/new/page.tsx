import { Suspense } from "react";
import type { Metadata } from "next";
import SidebarApp from "../../_ui/Sidebar";
import { getAllCategoriesAction } from "@/server/actions/categorias/get-all-categorias-action";
import { getAllTechnologiesAction } from "@/server/actions/technologies/get-all-technologies-action";
import { getCursosAction } from "@/server/actions/cursos/get-cursos-action";
import { getLevelsAction } from "@/server/actions/cursos/get-levels-action";
import {
    COURSE_LEVELS,
    normalizeCursoItem,
    toNumericId,
    type CatalogRef,
} from "../_ui/curso-helpers";
import type { CourseLevel } from "@/types/curso-schema";
import FormNewCurso from "./_ui/FormNewCurso";

export const metadata: Metadata = {
    title: "Nuevo curso | Admin Devtalles",
    description: "Crear o editar un curso del catálogo Devtalles.",
};

function toCatalogOptions(
    items: Array<{ id: string | number; name: string }> | undefined
): CatalogRef[] {
    if (!items) return [];
    return items
        .map((item) => ({
            id: toNumericId(item.id),
            name: item.name,
        }))
        .filter((item) => Number.isFinite(item.id));
}

export default async function NewCursoPage() {
    const [categoriesRes, technologiesRes, coursesRes, levelsRes] =
        await Promise.all([
            getAllCategoriesAction(),
            getAllTechnologiesAction(),
            getCursosAction({ limit: 100, offset: 0 }),
            getLevelsAction(),
        ]);

    const categories = toCatalogOptions(
        categoriesRes.ok ? categoriesRes.data : undefined
    );
    const technologies = toCatalogOptions(
        technologiesRes.ok ? technologiesRes.data : undefined
    );
    const courses =
        coursesRes.ok && coursesRes.data
            ? coursesRes.data.map(normalizeCursoItem)
            : [];

    const levelsFromApi =
        levelsRes.ok && levelsRes.data
            ? (levelsRes.data.filter((l): l is CourseLevel =>
                  COURSE_LEVELS.includes(l as CourseLevel)
              ) as CourseLevel[])
            : [];
    const levels = levelsFromApi.length > 0 ? levelsFromApi : COURSE_LEVELS;

    return (
        <SidebarApp>
            <Suspense
                fallback={
                    <div className="p-8 text-center text-xs text-muted-foreground">
                        Cargando formulario...
                    </div>
                }
            >
                <FormNewCurso
                    categories={categories}
                    technologies={technologies}
                    courses={courses}
                    levels={levels}
                />
            </Suspense>
        </SidebarApp>
    );
}
