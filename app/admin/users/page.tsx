import { createAdminClient } from "@/utils/supabase/admin";
import { createUser, deleteUser } from "../actions";

export default async function AdminUsersPage() {
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

            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-lg font-semibold mb-4">Create New User</h3>
                <form action={createUser} className="flex gap-4 items-end flex-wrap">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Username</label>
                        <input
                            name="username"
                            type="text"
                            placeholder="username"
                            className="border rounded p-2 bg-inherit"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Password</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="password"
                            className="border rounded p-2 bg-inherit"
                            required
                        />
                    </div>
                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        Create User
                    </button>
                </form>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                        <tr>
                            <th className="p-4">Username</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Points</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.map((user) => (
                            <tr key={user.id} className="border-t border-slate-200 dark:border-slate-800">
                                <td className="p-4 font-medium">{user.username}</td>
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
                                                Delete
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
