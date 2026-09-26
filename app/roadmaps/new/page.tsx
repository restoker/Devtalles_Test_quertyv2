import { redirect } from "next/navigation";
import Navbar from "@/app/(home)/_ui/navbar";
import FormNewRoadmap from "@/app/admin/roadmaps/new/_ui/FormNewRoadmap";
import { auth } from "@/server/auth";
import { getPublishedCoursesAction } from "@/server/actions/roadmaps/get-published-courses-action";

export default async function NewUserRoadmapPage() {
    const session = await auth();
    if (!session) redirect("/login?callbackUrl=/roadmaps/new");

    const coursesRes = await getPublishedCoursesAction();
    const catalog = coursesRes.ok && coursesRes.data ? coursesRes.data : [];

    return (
        <div className="min-h-dvh bg-white dark:bg-gray-900">
            <Navbar />
            <main className="mx-auto max-w-3xl px-6 pt-28 pb-20">
                <FormNewRoadmap catalog={catalog} returnHref="/roadmaps" />
            </main>
        </div>
    );
}
