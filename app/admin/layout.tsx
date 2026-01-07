import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    // Check profile role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        return redirect("/");
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-slate-900 text-white p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold">Admin Dashboard</h1>
                    <nav className="flex gap-4">
                        <Link href="/admin" className="hover:text-green-400">Races</Link>
                        <Link href="/admin/users" className="hover:text-green-400">Users</Link>
                        <Link href="/" className="hover:text-green-400">Back to Site</Link>
                    </nav>
                </div>
            </header>
            <main className="flex-1 p-8 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
                {children}
            </main>
        </div>
    );
}
