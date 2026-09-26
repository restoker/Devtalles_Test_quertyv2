import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/app/(home)/_ui/navbar";
import { auth } from "@/server/auth";
import { getAllRoadmapsAction } from "@/server/actions/roadmaps/get-all-roadmaps-action";
import { courseTitleFromRoadmap } from "@/types/roadmap-schema";

export default async function UserRoadmapsPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const response = await getAllRoadmapsAction();
    const roadmaps = (response.ok && response.data ? response.data : []).filter(
        (roadmap) => roadmap.scope === "personal"
    );

    return (
        <div className="min-h-dvh bg-white dark:bg-gray-900">
            <Navbar />
            <main className="mx-auto max-w-3xl px-6 pt-28 pb-20">
                <p className="text-sm font-medium text-purple-600">Tus rutas</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 dark:text-white">
                    Roadmaps
                </h1>
                <p className="mt-3 text-neutral-600 dark:text-neutral-400">
                    Las rutas de aprendizaje asociadas a tu cuenta.
                </p>

                <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-purple-200 bg-purple-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-purple-500/30 dark:bg-purple-500/10">
                    <div>
                        <p className="text-sm font-semibold text-neutral-950 dark:text-white">
                            ¿Quieres una ruta a tu medida?
                        </p>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            Responde un cuestionario y armamos tu roadmap con IA. Si ya sabes qué cursos quieres, créala tú.
                        </p>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                        <Link
                            href="/admin/assessments"
                            className="text-sm font-semibold text-purple-700 hover:text-purple-800 dark:text-purple-300"
                        >
                            Ir a cuestionarios
                        </Link>
                        <Link
                            href="/roadmaps/new"
                            className="text-sm font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                        >
                            Crear la mía
                        </Link>
                    </div>
                </div>

                {!response.ok && (
                    <p className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {response.msg}
                    </p>
                )}

                {response.ok && roadmaps.length === 0 && (
                    <div className="mt-10 rounded-2xl border border-neutral-200 px-5 py-8 dark:border-neutral-800">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Todavía no tienes roadmaps.
                        </p>
                        <Link
                            href="/roadmaps/new"
                            className="mt-4 inline-flex text-sm font-semibold text-purple-600 hover:text-purple-700"
                        >
                            Crear la mía
                        </Link>
                    </div>
                )}

                <ul className="mt-10 flex flex-col gap-4">
                    {roadmaps.map((roadmap) => {
                        const courses = [...roadmap.courses].sort((a, b) => a.sortOrder - b.sortOrder);
                        return (
                            <li
                                key={roadmap.id}
                                className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800"
                            >
                                <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
                                    {roadmap.title}
                                </h2>
                                {courses.length === 0 ? (
                                    <p className="mt-3 text-sm text-neutral-500">Sin cursos en esta ruta.</p>
                                ) : (
                                    <ol className="mt-4 flex flex-col gap-3">
                                        {courses.map((course, index) => (
                                            <li key={course.courseId} className="flex items-center gap-3">
                                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-purple-600/10 text-xs font-semibold text-purple-700">
                                                    {index + 1}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                                        {courseTitleFromRoadmap(course.courseId, course)}
                                                    </p>
                                                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                                        <div
                                                            className="h-full rounded-full bg-purple-600"
                                                            style={{ width: `${Math.min(100, Math.max(0, course.progress))}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-xs tabular-nums text-neutral-500">
                                                    {course.progress}%
                                                </span>
                                            </li>
                                        ))}
                                    </ol>
                                )}
                            </li>
                        );
                    })}
                </ul>

                <Link
                    href="/"
                    className="mt-10 inline-flex text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                    Volver al inicio
                </Link>
            </main>
        </div>
    );
}
