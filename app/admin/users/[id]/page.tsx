import { createAdminClient } from "@/utils/supabase/admin";
import { updateUser } from "../../actions";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export default async function EditUserPage(props: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ error?: string }>
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const supabase = createAdminClient();

    // Fetch user profile
    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", params.id)
        .single();

    if (error || !profile) {
        return <div className="p-8 text-white">Usuário não encontrado.</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/users" className="text-gray-400 hover:text-white transition-colors">
                    <ArrowLeftIcon className="w-6 h-6" />
                </Link>
                <h1 className="text-3xl font-bold text-white">Editar Usuário</h1>
            </div>

            {searchParams.error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded mb-6">
                    <strong>Erro:</strong> {decodeURIComponent(searchParams.error)}
                </div>
            )}

            <div className="glass-panel p-8 rounded-xl">
                <form action={updateUser.bind(null, profile.id)} className="flex flex-col gap-6">

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">Nome Completo</label>
                            <input
                                name="fullName"
                                type="text"
                                defaultValue={profile.full_name || ''}
                                className="w-full border border-white/10 rounded p-3 bg-white/5 text-white focus:border-red-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">Apelido (Username)</label>
                            <input
                                name="username"
                                type="text"
                                defaultValue={profile.username || ''}
                                className="w-full border border-white/10 rounded p-3 bg-white/5 text-white focus:border-red-500 outline-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Email & Role */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">Email</label>
                            <input
                                name="email"
                                type="email"
                                defaultValue={profile.email || ''}
                                className="w-full border border-white/10 rounded p-3 bg-white/5 text-white focus:border-red-500 outline-none"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-300">Função (Role)</label>
                            <select
                                name="role"
                                defaultValue={profile.role || 'user'}
                                className="w-full border border-white/10 rounded p-3 bg-white/5 text-white focus:border-red-500 outline-none [&>option]:bg-gray-900"
                            >
                                <option value="user">Usuário</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                    </div>

                    {/* Points */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-300">Pontos Totais</label>
                        <input
                            name="points"
                            type="number"
                            defaultValue={profile.points || 0}
                            className="w-full border border-white/10 rounded p-3 bg-white/5 text-white focus:border-red-500 outline-none font-mono"
                        />
                        <p className="text-xs text-gray-500">Atenção: alterar os pontos manualmente pode gerar inconsistência com o cálculo automático.</p>
                    </div>

                    <div className="h-px bg-white/10 my-2" />

                    {/* Password Reset */}
                    <div className="space-y-1 bg-red-500/5 p-4 rounded-lg border border-red-500/20">
                        <label className="text-sm font-bold text-red-400">Redefinir Senha</label>
                        <p className="text-xs text-gray-400 mb-2">Deixe em branco para manter a senha atual.</p>
                        <input
                            name="password"
                            type="text"
                            placeholder="Nova senha (opcional)"
                            className="w-full border border-white/10 rounded p-3 bg-white/5 text-white focus:border-red-500 outline-none"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Link href="/admin/users" className="px-6 py-3 rounded-lg font-medium text-gray-300 hover:text-white transition-colors">
                            Cancelar
                        </Link>
                        <button className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-lg transition-colors">
                            Salvar Alterações
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
