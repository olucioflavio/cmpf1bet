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

            {searchParams.success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Usuário criado com sucesso!
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-lg font-semibold mb-4">Criar Novo Usuário</h3>
                <form action={createUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Nome Completo</label>
                        <input
                            name="fullName"
                            type="text"
                            placeholder="ex: João Silva"
                            className="border rounded p-2 bg-inherit"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Apelido</label>
                        <input
                            name="username"
                            type="text"
                            placeholder="ex: joao"
                            className="border rounded p-2 bg-inherit"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="ex: joao@email.com"
                            className="border rounded p-2 bg-inherit"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Senha</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="senha"
                            className="border rounded p-2 bg-inherit"
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full">
                            Criar Usuário
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                        <tr>
                            <th className="p-4">Nome</th>
                            <th className="p-4">Apelido</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Pontos</th>
                            <th className="p-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.map((user) => (
                            <tr key={user.id} className="border-t border-slate-200 dark:border-slate-800">
                                <td className="p-4 font-medium">{user.full_name || '-'}</td>
                                <td className="p-4">{user.username}</td>
                                <td className="p-4 text-sm text-gray-600">{user.email || '-'}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">{user.points}</td>
                                <td className="p-4">
                                    {user.role !== 'admin' && (
                                        <form action={deleteUser.bind(null, user.id)}>
                                            <button className="text-red-500 hover:text-red-700 text-sm font-semibold">
                                                Deletar
                                            </button>
                                        </form>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
