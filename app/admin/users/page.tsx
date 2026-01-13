import { createAdminClient } from "@/utils/supabase/admin";
import { createUser, deleteUser } from "../actions";

export default async function AdminUsersPage(props: {
    searchParams: Promise<{ error?: string; success?: string }>
}) {
    const searchParams = await props.searchParams
    const supabase = createAdminClient();

    // Fetch all profiles (assuming profiles list is enough, or fetch auth users)
    // Using profiles since we want to see usernames
    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("username");

    if (error) {
        return <div>Error loading users: {error.message}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">User Management</h2>

            {searchParams.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <strong>Erro:</strong> {decodeURIComponent(searchParams.error)}
                </div>
            )}

            {searchParams.success === 'true' && (
                <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded mb-4">
                    Usuário criado com sucesso!
                </div>
            )}
            {searchParams.success === 'updated' && (
                <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded mb-4">
                    Usuário atualizado com sucesso!
                </div>
            )}
            {searchParams.success === 'deleted' && (
                <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded mb-4">
                    Usuário deletado com sucesso!
                </div>
            )}

            <div className="glass-panel p-6 rounded-lg mb-8">
                <h3 className="text-lg font-semibold mb-4 text-white">Criar Novo Usuário</h3>
                <form action={createUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-300">Nome Completo</label>
                        <input
                            name="fullName"
                            type="text"
                            placeholder="ex: João Silva"
                            className="border border-white/10 rounded p-2 bg-white/5 text-white placeholder:text-gray-600 focus:border-red-500 outline-none"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-300">Apelido</label>
                        <input
                            name="username"
                            type="text"
                            placeholder="ex: joao"
                            className="border border-white/10 rounded p-2 bg-white/5 text-white placeholder:text-gray-600 focus:border-red-500 outline-none"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-300">Email</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="ex: joao@email.com"
                            className="border border-white/10 rounded p-2 bg-white/5 text-white placeholder:text-gray-600 focus:border-red-500 outline-none"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-300">Senha</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="senha"
                            className="border border-white/10 rounded p-2 bg-white/5 text-white placeholder:text-gray-600 focus:border-red-500 outline-none"
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <button className="bg-red-600 text-white font-bold uppercase tracking-wider text-xs px-4 py-3 rounded hover:bg-red-700 w-full transition-colors">
                            Criar Usuário
                        </button>
                    </div>
                </form>
            </div>

            <div className="glass-panel rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-300">
                        <tr>
                            <th className="p-4">Nome</th>
                            <th className="p-4">Apelido</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Pontos</th>
                            <th className="p-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {profiles.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 font-medium text-white">{user.full_name || '-'}</td>
                                <td className="p-4 text-gray-300">{user.username}</td>
                                <td className="p-4 text-sm text-gray-400">{user.email || '-'}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-white font-mono">{user.points}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <a href={`/admin/users/${user.id}`} className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors">
                                            Editar
                                        </a>
                                        {user.role !== 'admin' && (
                                            <form action={deleteUser.bind(null, user.id)}>
                                                <button className="text-red-400 hover:text-red-300 text-sm font-semibold transition-colors">
                                                    Deletar
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
        </div>
    );
}
