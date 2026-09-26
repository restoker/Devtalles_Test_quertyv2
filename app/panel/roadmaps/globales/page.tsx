import type { Metadata } from "next";
import SidebarApp from "@/app/admin/_ui/Sidebar";
import RoadmapsTable from "@/app/admin/roadmaps/_ui/RoadmapsTable";
import { getAllRoadmapsAction } from "@/server/actions/roadmaps/get-all-roadmaps-action";
import { savedCopiesByGlobalId } from "@/types/roadmap-schema";

export const metadata: Metadata = {
    title: "Roadmaps globales | Devtalles",
    description: "Rutas de aprendizaje compartidas.",
};

export default async function GlobalRoadmapsPage() {
    const response = await getAllRoadmapsAction();
    const all = response.ok && response.data ? response.data : [];
    const roadmaps = all.filter((roadmap) => roadmap.scope === "global");

    return (
        <SidebarApp role="user">
            <RoadmapsTable
                initialRoadmaps={roadmaps}
                errorMessage={!response.ok ? response.msg : undefined}
                title="Roadmaps globales"
                description="Rutas compartidas. Agrégalas a tus roadmaps para registrar y completar el avance de cada curso."
                detailBasePath="/panel/roadmaps"
                createHref={null}
                saveToMine={{
                    mineBasePath: "/panel/roadmaps",
                    savedByGlobalId: savedCopiesByGlobalId(all),
                }}
            />
        </SidebarApp>
    );
}
