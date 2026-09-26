"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { copyRoadmapAction } from "@/server/actions/roadmaps/copy-roadmap-action";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface AddToMyRoadmapsButtonProps {
    globalId: number;
    savedRoadmapId?: number;
    mineBasePath: string;
    compact?: boolean;
}

export default function AddToMyRoadmapsButton({
    globalId,
    savedRoadmapId,
    mineBasePath,
    compact = false,
}: AddToMyRoadmapsButtonProps) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const mineHref = savedRoadmapId ? `${mineBasePath}/${savedRoadmapId}` : null;

    if (mineHref) {
        return (
            <Link
                href={mineHref}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl border border-purple-500/40 bg-purple-500/10 font-medium text-purple-700 transition-all hover:bg-purple-500/15 active:scale-[0.97] dark:text-purple-300",
                    compact ? "px-3.5 py-1.5 text-xs" : "h-11 px-5 text-sm font-semibold"
                )}
            >
                Ver mi avance
            </Link>
        );
    }

    return (
        <button
            type="button"
            disabled={pending}
            onClick={() =>
                startTransition(async () => {
                    const result = await copyRoadmapAction(globalId);
                    if (!result.ok) {
                        toast.add({
                            title: "No se pudo agregar",
                            description: result.msg,
                            type: "error",
                        });
                        return;
                    }
                    toast.add({
                        title: "Agregado a mis roadmaps",
                        description: "Ahí puedes ir marcando el avance de cada curso.",
                        type: "success",
                    });
                    router.push(`${mineBasePath}/${result.data.id}`);
                    router.refresh();
                })
            }
            className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 font-semibold text-white shadow-sm transition-all hover:bg-purple-700 active:scale-[0.97] disabled:opacity-60 dark:hover:bg-purple-500",
                compact ? "px-3.5 py-1.5 text-xs" : "h-11 gap-2 px-5 text-sm"
            )}
        >
            <HugeiconsIcon
                icon={pending ? Loading03Icon : PlusSignIcon}
                strokeWidth={2}
                className={cn(compact ? "size-3.5" : "size-4", pending && "animate-spin")}
            />
            <span>{pending ? "Agregando…" : "Agregar a mis roadmaps"}</span>
        </button>
    );
}
