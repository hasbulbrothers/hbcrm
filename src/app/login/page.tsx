'use client'

import { useState } from 'react'
import Image from 'next/image'
import { login } from './actions'
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const result = await login(formData)

        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left side - branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-900 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-600/5 rounded-full -ml-36 -mb-36" />
                <div className="relative z-10 text-center max-w-md">
                    <Image src="/logo.png" alt="Logo" width={80} height={80} className="mx-auto mb-8 rounded-xl" />
                    <h1 className="text-3xl font-bold text-white mb-3">HB CRM</h1>
                    <p className="text-gray-400 text-base leading-relaxed">
                        Sistem pengurusan peserta dan check-in untuk seminar Hasbul Brothers
                    </p>
                </div>
            </div>

            {/* Right side - login form */}
            <div className="flex-1 flex items-center justify-center p-6 bg-white">
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <Image src="/logo.png" alt="Logo" width={56} height={56} className="mx-auto mb-4 rounded-xl" />
                        <h1 className="text-xl font-bold text-gray-900">HB CRM</h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Log Masuk</h2>
                        <p className="text-sm text-gray-500 mt-1">Masukkan email dan password anda</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="nama@email.com"
                                    required
                                    autoComplete="email"
                                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="current-password"
                                    className="w-full h-11 pl-10 pr-11 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-11 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Memproses...
                                </span>
                            ) : (
                                'Log Masuk'
                            )}
                        </button>
                    </form>

                    <p className="text-xs text-gray-400 text-center mt-8">
                        Hasbul Brothers CRM System
                    </p>
                </div>
            </div>
        </div>
    )
}
