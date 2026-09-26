import { redirect } from "next/navigation";

export default function PanelLayout({
    children: _children,
}: {
    children: React.ReactNode;
}) {
    void _children;
    redirect("/admin");
}
