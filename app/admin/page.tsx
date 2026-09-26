import type { Metadata } from "next";
import SidebarApp from "./_ui/Sidebar";
import UserPanelPage from "@/app/panel/page";
import AdminDashboard, {
    type AdminDashboardData,
    type DashboardCourse,
} from "./_ui/AdminDashboard";
import { auth } from "@/server/auth";
import { getAllUsersAction } from "@/server/actions/users/get-all-users-action";
import { getCursosAction } from "@/server/actions/cursos/get-cursos-action";
import { getAllRoadmapsAction } from "@/server/actions/roadmaps/get-all-roadmaps-action";
import { getQuestionnairesAction } from "@/server/actions/questionnaires/get-questionnaires-action";
import { getAllAssessmentsAction } from "@/server/actions/assessments/get-assessments-action";
import { getAllTechnologiesAction } from "@/server/actions/technologies/get-all-technologies-action";
import { getAllCategoriesAction } from "@/server/actions/categorias/get-all-categorias-action";
import { normalizeCursoItem } from "./cursos/_ui/curso-helpers";
import type { CourseStatus } from "@/types/curso-schema";
import type { UserRole } from "@/types/user-admin-schema";

export const metadata: Metadata = {
    title: "Dashboard | Admin Devtalles",
    description: "Resumen de usuarios, catálogo, roadmaps y evaluaciones de Devtalles.",
};

const COURSE_STATUSES: CourseStatus[] = ["published", "draft", "archived"];
const USER_ROLES: UserRole[] = ["admin", "client", "user"];

export default async function AdminPage() {
    const session = await auth();
    if (session?.user.role?.toLowerCase() !== "admin") {
        return <UserPanelPage />;
    }

    const [
        usersRes,
        coursesRes,
        roadmapsRes,
        questionnairesRes,
        assessmentsRes,
        technologiesRes,
        categoriesRes,
    ] = await Promise.all([
        getAllUsersAction({ limit: 100, offset: 0 }),
        getCursosAction({ limit: 100, offset: 0 }),
        getAllRoadmapsAction(),
        getQuestionnairesAction(100),
        getAllAssessmentsAction(),
        getAllTechnologiesAction(),
        getAllCategoriesAction(),
    ]);

    const errors = [
        !usersRes.ok ? usersRes.msg : null,
        !coursesRes.ok ? coursesRes.msg : null,
        !roadmapsRes.ok ? roadmapsRes.msg : null,
        !questionnairesRes.ok ? questionnairesRes.msg : null,
        !assessmentsRes.ok ? assessmentsRes.msg : null,
        !technologiesRes.ok ? technologiesRes.msg : null,
        !categoriesRes.ok ? categoriesRes.msg : null,
    ].filter((message): message is string => Boolean(message));

    const users = usersRes.ok ? usersRes.data : [];
    const courses = coursesRes.ok
        ? coursesRes.data.map(normalizeCursoItem)
        : [];
    const roadmaps = roadmapsRes.ok ? roadmapsRes.data : [];
    const questionnaires = questionnairesRes.ok ? questionnairesRes.data ?? [] : [];
    const assessments = assessmentsRes.ok ? assessmentsRes.data : [];

    const byRole = Object.fromEntries(
        USER_ROLES.map((role) => [role, users.filter((user) => user.role === role).length])
    ) as Record<UserRole, number>;

    const recentCourses: DashboardCourse[] = courses.slice(0, 5).map((course) => ({
        id: course.id,
        title: course.title,
        status: COURSE_STATUSES.includes(course.status) ? course.status : "draft",
        level: course.level,
    }));

    const greetingName =
        [session?.user?.name, session?.user?.lastname].filter(Boolean).join(" ") ||
        "Administrador";

    const data: AdminDashboardData = {
        greetingName,
        todayLabel: new Date().toLocaleDateString("es-MX", {
            weekday: "long",
            day: "numeric",
            month: "long",
        }),
        errors,
        users: {
            total: usersRes.ok ? (usersRes.meta?.total ?? users.length) : null,
            active: users.filter((user) => user.isActive).length,
            byRole,
        },
        courses: {
            total: coursesRes.ok ? courses.length : null,
            published: courses.filter((course) => course.status === "published").length,
            draft: courses.filter((course) => course.status === "draft").length,
            archived: courses.filter((course) => course.status === "archived").length,
            recent: recentCourses,
        },
        roadmaps: {
            total: roadmapsRes.ok ? roadmaps.length : null,
            recent: roadmaps.slice(0, 5).map((roadmap) => ({
                id: roadmap.id,
                title: roadmap.title,
                scope: roadmap.scope,
                courseCount: roadmap.courses?.length ?? 0,
            })),
        },
        questionnaires: {
            total: questionnairesRes.ok
                ? (questionnairesRes.meta?.total ?? questionnaires.length)
                : null,
            active: questionnaires.filter((item) => item.isActive).length,
            recent: questionnaires.slice(0, 4).map((item) => ({
                id: String(item.id),
                title: item.title,
                isActive: item.isActive,
                questionCount: item.questions?.length ?? 0,
            })),
        },
        assessments: {
            total: assessmentsRes.ok ? assessments.length : null,
            completed: assessments.filter((item) => item.completedAt).length,
            inProgress: assessments.filter((item) => !item.completedAt).length,
        },
        technologies: technologiesRes.ok ? (technologiesRes.data?.length ?? 0) : null,
        categories: categoriesRes.ok ? (categoriesRes.data?.length ?? 0) : null,
    };

    return (
        <SidebarApp role="admin">
            <AdminDashboard data={data} />
        </SidebarApp>
    );
}
