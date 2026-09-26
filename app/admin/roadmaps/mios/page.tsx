import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SidebarApp from "../../_ui/Sidebar";
import RoadmapsTable from "../_ui/RoadmapsTable";
import { auth } from "@/server/auth";
import { getAllRoadmapsAction } from "@/server/actions/roadmaps/get-all-roadmaps-action";

export const metadata: Metadata = {
    title: "Mis roadmaps | Devtalles",
    description: "Rutas de aprendizaje de tu cuenta.",
};

export default async function MyRoadmapsPage() {
    const session = await auth();
    if (session?.user.role?.toLowerCase() === "admin") {
        redirect("/admin/roadmaps");
    }

    const response = await getAllRoadmapsAction();
    const roadmaps = (response.ok && response.data ? response.data : []).filter(
        (roadmap) => roadmap.scope === "personal"
    );

    return (
        <SidebarApp role="user">
            <RoadmapsTable
                initialRoadmaps={roadmaps}
                errorMessage={!response.ok ? response.msg : undefined}
                title="Mis roadmaps"
                description="Las rutas de tu cuenta. Créala tú eligiendo los cursos, o responde un cuestionario y la armamos con IA."
                detailBasePath="/admin/roadmaps"
                createHref="/admin/roadmaps/new"
                personalizeHref="/admin/assessments"
            />
        </SidebarApp>
    );
}
