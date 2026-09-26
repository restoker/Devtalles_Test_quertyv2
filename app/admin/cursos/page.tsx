import type { Metadata } from "next";
import SidebarApp from "../_ui/Sidebar";
import { getCursosAction } from "@/server/actions/cursos/get-cursos-action";
import { normalizeCursoItem } from "./_ui/curso-helpers";
import CursosTable from "./_ui/CursosTable";

export const metadata: Metadata = {
    title: "Cursos | Admin Devtalles",
    description: "Gestión y administración del catálogo de cursos en Devtalles.",
};

export default async function CoursesPage() {
    const response = await getCursosAction({ limit: 100, offset: 0 });
    const initialCourses =
        response.ok && response.data
            ? response.data.map(normalizeCursoItem)
            : [];
    const errorMessage = !response.ok ? response.msg : undefined;

    return (
        <SidebarApp>
            <CursosTable
                initialCourses={initialCourses}
                errorMessage={errorMessage}
            />
        </SidebarApp>
    );
}
