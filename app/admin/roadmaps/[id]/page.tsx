import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SidebarApp from "../../_ui/Sidebar";
import FormEditRoadmap from "./_ui/FormEditRoadmap";
import RoadmapProgress from "@/app/panel/_ui/RoadmapProgress";
import { auth } from "@/server/auth";
import { getAllRoadmapsAction } from "@/server/actions/roadmaps/get-all-roadmaps-action";
import { getRoadmapAction } from "@/server/actions/roadmaps/get-roadmap-action";
import { getPublishedCoursesAction } from "@/server/actions/roadmaps/get-published-courses-action";
import { savedCopiesByGlobalId } from "@/types/roadmap-schema";

export const metadata: Metadata = {
    title: "Editar Roadmap | Admin Devtalles",
    description: "Editar título y orden de cursos de un roadmap.",
};

interface EditRoadmapPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditRoadmapPage({ params }: EditRoadmapPageProps) {
    const { id: rawId } = await params;
    const id = Number(rawId);
    if (!Number.isInteger(id) || id < 1) notFound();

    const [roadmapRes, coursesRes, listRes] = await Promise.all([
        getRoadmapAction(id),
        getPublishedCoursesAction(),
        getAllRoadmapsAction(),
    ]);

    if (!roadmapRes.ok || !roadmapRes.data) notFound();

    const roadmap = roadmapRes.data;
    const session = await auth();
    const isAdmin = session?.user.role?.toLowerCase() === "admin";
    const savedRoadmapId =
        !isAdmin && roadmap.scope === "global" && listRes.ok && listRes.data
            ? savedCopiesByGlobalId(listRes.data)[roadmap.id]
            : undefined;
    const catalog = coursesRes.ok && coursesRes.data ? coursesRes.data : [];
    const listHref = isAdmin
        ? "/admin/roadmaps"
        : roadmap.scope === "global"
          ? "/admin/roadmaps/globales"
          : "/admin/roadmaps/mios";

    if (!isAdmin && roadmap.scope === "global") {
        return (
            <SidebarApp role="user">
                <RoadmapProgress
                    roadmap={roadmap}
                    canEdit={false}
                    backHref={listHref}
                    backLabel="Roadmaps globales"
                    saveToMine={{
                        mineBasePath: "/admin/roadmaps",
                        savedRoadmapId,
                    }}
                />
            </SidebarApp>
        );
    }

    return (
        <SidebarApp role={isAdmin ? "admin" : "user"}>
            <FormEditRoadmap
                roadmap={roadmap}
                catalog={catalog}
                listHref={listHref}
                canEditProgress={!isAdmin}
            />
        </SidebarApp>
    );
}
