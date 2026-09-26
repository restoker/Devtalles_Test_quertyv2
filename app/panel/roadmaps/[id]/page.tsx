import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SidebarApp from "@/app/admin/_ui/Sidebar";
import RoadmapProgress from "../../_ui/RoadmapProgress";
import { getAllRoadmapsAction } from "@/server/actions/roadmaps/get-all-roadmaps-action";
import { getRoadmapAction } from "@/server/actions/roadmaps/get-roadmap-action";
import { savedCopiesByGlobalId } from "@/types/roadmap-schema";

export const metadata: Metadata = {
    title: "Roadmap | Devtalles",
    description: "Detalle de una ruta de aprendizaje.",
};

interface RoadmapDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function PanelRoadmapPage({ params }: RoadmapDetailPageProps) {
    const { id: rawId } = await params;
    const id = Number(rawId);
    if (!Number.isInteger(id) || id < 1) notFound();

    const [response, list] = await Promise.all([
        getRoadmapAction(id),
        getAllRoadmapsAction(),
    ]);
    if (!response.ok || !response.data) notFound();

    const roadmap = response.data;
    const backHref = roadmap.scope === "global" ? "/panel/roadmaps/globales" : "/panel/roadmaps";
    const savedRoadmapId =
        roadmap.scope === "global" && list.ok && list.data
            ? savedCopiesByGlobalId(list.data)[roadmap.id]
            : undefined;

    return (
        <SidebarApp role="user">
            <RoadmapProgress
                roadmap={roadmap}
                canEdit={roadmap.scope === "personal"}
                backHref={backHref}
                backLabel={roadmap.scope === "global" ? "Roadmaps globales" : "Mis roadmaps"}
                saveToMine={
                    roadmap.scope === "global"
                        ? { mineBasePath: "/panel/roadmaps", savedRoadmapId }
                        : undefined
                }
            />
        </SidebarApp>
    );
}
