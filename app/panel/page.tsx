import type { Metadata } from "next";
import SidebarApp from "@/app/admin/_ui/Sidebar";
import UserHome, { type UserHomeData } from "./_ui/UserHome";
import { auth } from "@/server/auth";
import { getAllRoadmapsAction } from "@/server/actions/roadmaps/get-all-roadmaps-action";
import { getAssessmentsAction } from "@/server/actions/assessments/get-assessments-action";
import { getActiveQuestionnairesAction } from "@/server/actions/assessments/get-active-questionnaires-action";

export const metadata: Metadata = {
    title: "Mi panel | Devtalles",
    description: "Roadmaps globales, tus rutas y los cuestionarios que completaste.",
};

export default async function UserPanelPage() {
    const session = await auth();
    const [roadmapsRes, assessmentsRes, questionnairesRes] = await Promise.all([
        getAllRoadmapsAction(),
        getAssessmentsAction(),
        getActiveQuestionnairesAction(),
    ]);

    const roadmaps = roadmapsRes.ok && roadmapsRes.data ? roadmapsRes.data : [];
    const globals = roadmaps.filter((roadmap) => roadmap.scope === "global");
    const mine = roadmaps.filter((roadmap) => roadmap.scope === "personal");
    const assessments = assessmentsRes.ok ? assessmentsRes.data : [];
    const titles = new Map(
        (questionnairesRes.ok ? questionnairesRes.data : []).map((item) => [item.id, item.title])
    );
    const completed = assessments.filter((item) => Boolean(item.completedAt)).length;

    const errors = [
        !roadmapsRes.ok ? roadmapsRes.msg : null,
        !assessmentsRes.ok ? assessmentsRes.msg : null,
    ].filter((message): message is string => Boolean(message));

    const name =
        [session?.user?.name, session?.user?.lastname].filter(Boolean).join(" ") || "Usuario";

    const data: UserHomeData = {
        greetingName: name,
        todayLabel: new Date().toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
        }),
        errors,
        globals: {
            total: globals.length,
            recent: globals.slice(0, 5).map((roadmap) => ({
                id: roadmap.id,
                title: roadmap.title,
                courseCount: roadmap.courses.length,
            })),
        },
        mine: {
            total: mine.length,
            recent: mine.slice(0, 5).map((roadmap) => ({
                id: roadmap.id,
                title: roadmap.title,
                courseCount: roadmap.courses.length,
            })),
        },
        questionnaires: {
            total: assessments.length,
            completed,
            inProgress: assessments.length - completed,
            recent: [...assessments]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 6)
                .map((item) => ({
                    id: item.id,
                    title: titles.get(item.questionnaireId) ?? `Cuestionario #${item.questionnaireId}`,
                    completed: Boolean(item.completedAt),
                })),
        },
    };

    return (
        <SidebarApp role="user">
            <UserHome data={data} />
        </SidebarApp>
    );
}
