import type { Metadata } from "next";
import SidebarApp from "../../_ui/Sidebar";
import FormNewRoadmap from "./_ui/FormNewRoadmap";
import { auth } from "@/server/auth";
import { getPublishedCoursesAction } from "@/server/actions/roadmaps/get-published-courses-action";

export const metadata: Metadata = {
    title: "Nuevo Roadmap | Admin Devtalles",
    description: "Crear una nueva ruta de aprendizaje con cursos ordenados.",
};

export default async function NewRoadmapPage() {
    const session = await auth();
    const isAdmin = session?.user.role?.toLowerCase() === "admin";

    const coursesRes = await getPublishedCoursesAction();
    const catalog = coursesRes.ok && coursesRes.data ? coursesRes.data : [];

    return (
        <SidebarApp role={isAdmin ? "admin" : "user"}>
            <FormNewRoadmap
                catalog={catalog}
                returnHref={isAdmin ? "/admin/roadmaps" : "/admin/roadmaps/mios"}
            />
        </SidebarApp>
    );
}
