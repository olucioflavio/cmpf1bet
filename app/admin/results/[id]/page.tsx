import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import { submitRaceResults } from "./actions";

export default async function RaceResultsPage(props: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ error?: string }>
}) {
    const params = await props.params
    const searchParams = await props.searchParams
    const supabase = createAdminClient();
    const raceId = parseInt(params.id);

    // Fetch race details
    const { data: race } = await supabase
        .from("races")
        .select("*, variable_driver:drivers!variable_driver_id(*)")
        .eq("id", raceId)
        .single();

    if (!race) {
        redirect("/admin");
    }

    // Fetch all drivers
    const { data: drivers } = await supabase
        .from("drivers")
        .select("*")
        .order("name");

    // Fetch existing results if any
    const { data: existingResults } = await supabase
        .from("race_results")
        .select("*")
        .eq("race_id", raceId)
        .single();

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">
                Resultados - {race.name}
            </h2>

            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-lg mb-6 text-slate-100">
                <p className="text-sm"><strong className="text-amber-400">Circuito:</strong> {race.track}</p>
                <p className="text-sm"><strong className="text-amber-400">Data:</strong> {new Date(race.date).toLocaleDateString()}</p>
                {race.variable_driver && (
                    <p className="text-sm"><strong className="text-amber-400">Piloto Variável:</strong> {race.variable_driver.name}</p>
                )}
            </div>

            {searchParams.error && (
                <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
                    {decodeURIComponent(searchParams.error)}
                </div>
            )}

            <form action={submitRaceResults} className="space-y-6">
                <input type="hidden" name="raceId" value={raceId} />

                {/* Pole Position */}
                <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-lg">
                    <label className="block text-lg font-semibold mb-3 text-red-400">
                        Pole Position
                    </label>
                    <select
                        name="pole"
                        defaultValue={existingResults?.pole_driver_id || ""}
                        className="w-full p-3 rounded-md bg-slate-900 border border-slate-600 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                        required
                    >
                        <option value="" className="bg-slate-900 text-slate-400">Selecione o piloto</option>
                        {drivers?.map((d) => (
                            <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                                {d.name} ({d.team})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Top 5 */}
                <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-blue-400">
                        Top 5 Chegada
                    </h3>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((pos) => (
                            <div key={pos} className="flex gap-4 items-center">
                                <span className="w-8 font-bold text-slate-300">
                                    P{pos}
                                </span>
                                <select
                                    name={`p${pos}`}
                                    defaultValue={existingResults?.[`p${pos}_driver_id`] || ""}
                                    className="flex-1 p-2 rounded-md bg-slate-900 border border-slate-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                    required
                                >
                                    <option value="" className="bg-slate-900 text-slate-400">Selecione o piloto</option>
                                    {drivers?.map((d) => (
                                        <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                                            {d.name} ({d.team})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Special Positions */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Bortoleto */}
                    <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-lg">
                        <label className="block text-lg font-semibold mb-3 text-yellow-400">
                            Posição Bortoleto
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            name="bortoleto"
                            defaultValue={existingResults?.bortoleto_pos || ""}
                            className="w-full p-3 rounded-md bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
                            placeholder="1-20"
                            required
                        />
                    </div>

                    {/* Variable Driver */}
                    {race.variable_driver && (
                        <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-lg">
                            <label className="block text-lg font-semibold mb-3 text-orange-400">
                                Posição {race.variable_driver.name}
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                name="variable"
                                defaultValue={existingResults?.variable_driver_pos || ""}
                                className="w-full p-3 rounded-md bg-slate-900 border border-slate-600 text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                                placeholder="1-20"
                                required
                            />
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition"
                >
                    {existingResults ? "Atualizar Resultados" : "Salvar Resultados"}
                </button>
            </form>
        </div>
    );
}
