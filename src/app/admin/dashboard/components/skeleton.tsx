export function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="flex justify-between items-center">
                <div>
                    <div className="h-7 bg-gray-200 rounded w-36 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-52" />
                </div>
                <div className="h-10 bg-gray-200 rounded w-52" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-200" />
                            <div className="h-4 bg-gray-100 rounded w-20" />
                        </div>
                        <div className="h-9 bg-gray-200 rounded w-16" />
                    </div>
                ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="h-5 bg-gray-200 rounded w-36 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-16 bg-gray-100 rounded-xl" />
                    <div className="h-16 bg-gray-100 rounded-xl" />
                    <div className="h-16 bg-gray-100 rounded-xl" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map(j => (
                                <div key={j} className="text-center space-y-2">
                                    <div className="h-3 bg-gray-100 rounded w-12 mx-auto" />
                                    <div className="h-8 bg-gray-200 rounded w-10 mx-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
