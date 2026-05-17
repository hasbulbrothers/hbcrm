export function BreakdownCard({ title, data }: { title: string, data: Record<string, number> }) {
    const entries = Object.entries(data).sort(([, a], [, b]) => b - a)
    const total = entries.reduce((sum, [, val]) => sum + val, 0)

    return (
        <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
            </div>
            <div className="p-5">
                {entries.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">Tiada data</p>
                ) : (
                    <div className="space-y-3">
                        {entries.slice(0, 10).map(([key, val]) => {
                            const percent = total > 0 ? (val / total) * 100 : 0
                            return (
                                <div key={key}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 truncate mr-2">{key}</span>
                                        <span className="font-semibold text-gray-900 shrink-0">{val}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div
                                            className="bg-gray-900 h-1.5 rounded-full transition-all"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
