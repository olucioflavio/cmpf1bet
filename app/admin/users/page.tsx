import { createAdminClient } from "@/utils/supabase/admin";
import { createUser, deleteUser } from "../actions";
import { UserPlus, Users, Pencil, Trash2, Mail, User as UserIcon, Shield, Trophy } from "lucide-react";

export default async function AdminUsersPage(props: {
    searchParams: Promise<{ error?: string; success?: string }>
}) {
    const searchParams = await props.searchParams
    const supabase = createAdminClient();

    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("username");

    if (error) {
        return <div className="p-10 text-center text-red-400">Erro ao carregar usuários: {error.message}</div>;
    }

    return (
        <div className="flex-1 w-full flex flex-col items-center py-6 md:py-10 px-4 md:px-8">
            <div className="w-full max-w-7xl flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">

                {/* Header Responsivo */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2 text-f1-red font-black uppercase tracking-widest text-[10px] mb-2">
                            <Users size={14} /> Administração
                        </div>
                        <h1 className="text-[clamp(1.75rem,5vw,2.5rem)] font-bold tracking-tighter text-white leading-none">
                            Controle de Usuários
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm">Gerencie competidores, permissões e contas do sistema.</p>
                    </div>
                </header>

                {searchParams.error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                        <span className="text-xl">⚠️</span>
                        <span className="font-bold text-sm">{decodeURIComponent(searchParams.error)}</span>
                    </div>
                )}

                {(searchParams.success === 'true' || searchParams.success === 'updated' || searchParams.success === 'deleted') && (
                    <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                        <span className="text-xl">✅</span>
                        <span className="font-bold text-sm">
                            {searchParams.success === 'true' ? 'Usuário criado com sucesso!' :
                                searchParams.success === 'updated' ? 'Usuário atualizado com sucesso!' :
                                    'Usuário deletado com sucesso!'}
                        </span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Card - Left Column on Desktop */}
                    <div className="lg:col-span-1">
                        <div className="glass-panel p-6 md:p-8 rounded-[2rem] border border-white/5 relative overflow-hidden h-fit sticky top-8">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-f1-red/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />

                            <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-3">
                                <div className="p-2 bg-f1-red/20 rounded-lg text-f1-red">
                                    <UserPlus size={18} />
                                </div>
                                Cadastrar Novo
                            </h3>

                            <form action={createUser} className="flex flex-col gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Nome Completo</label>
                                    <input
                                        name="fullName"
                                        type="text"
                                        placeholder="Nome do competidor"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-f1-red/50 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Apelido (Login)</label>
                                    <input
                                        name="username"
                                        type="text"
                                        placeholder="username"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-f1-red/50 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">E-mail</label>
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="email@exemplo.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-f1-red/50 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Senha Inicial</label>
                                    <input
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-f1-red/50 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <button className="bg-f1-red hover:bg-red-700 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl w-full transition-all active:scale-[0.98] shadow-lg shadow-red-900/20 mt-2">
                                    Criar Competidor
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Users List - Right Column on Desktop */}
                    <div className="lg:col-span-2">
                        {/* Desktop Table View */}
                        <div className="hidden md:block glass-panel rounded-[2rem] overflow-hidden border border-white/5">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                        <th className="p-5">Competidor / E-mail</th>
                                        <th className="p-5">Permissão</th>
                                        <th className="p-5 text-right">Pontos</th>
                                        <th className="p-5 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {profiles.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white group-hover:text-f1-red transition-colors">{user.full_name || user.username}</span>
                                                    <span className="text-xs text-gray-500">@{user.username} • {user.email || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${user.role === 'admin' ? 'bg-f1-red/10 text-f1-red border border-f1-red/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                                    {user.role === 'admin' ? <Shield size={10} /> : <UserIcon size={10} />}
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <span className="text-white font-mono font-bold">{user.points}</span>
                                                <span className="text-[10px] text-gray-600 ml-1">pts</span>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center justify-center gap-2">
                                                    <a href={`/admin/users/${user.id}`} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-blue-400 transition-colors" title="Editar">
                                                        <Pencil size={14} />
                                                    </a>
                                                    {user.role !== 'admin' && (
                                                        <form action={deleteUser.bind(null, user.id)}>
                                                            <button className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg text-gray-500 hover:text-red-400 transition-colors" title="Deletar">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </form>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden flex flex-col gap-4">
                            {profiles.map((user) => (
                                <div key={user.id} className="glass-panel p-5 rounded-2xl border border-white/5 relative group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col gap-1">
                                            <h4 className="font-bold text-white group-hover:text-f1-red transition-colors">
                                                {user.full_name || user.username}
                                            </h4>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <UserIcon size={12} />
                                                @{user.username}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <Mail size={12} />
                                                {user.email || 'Nenhum e-mail'}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider flex items-center gap-1 ${user.role === 'admin' ? 'bg-f1-red/10 text-f1-red border border-f1-red/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                                {user.role}
                                            </span>
                                            <div className="flex items-center gap-1 text-white font-mono font-bold text-sm">
                                                <Trophy size={12} className="text-yellow-500" />
                                                {user.points}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 border-t border-white/5 pt-4 mt-2">
                                        <a href={`/admin/users/${user.id}`} className="flex-1 flex items-center justify-center gap-2 bg-white/5 py-2.5 rounded-xl text-xs font-bold text-blue-400">
                                            <Pencil size={14} /> Editar
                                        </a>
                                        {user.role !== 'admin' && (
                                            <form action={deleteUser.bind(null, user.id)} className="flex-1">
                                                <button className="w-full flex items-center justify-center gap-2 bg-white/5 py-2.5 rounded-xl text-xs font-bold text-red-400">
                                                    <Trash2 size={14} /> Deletar
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
