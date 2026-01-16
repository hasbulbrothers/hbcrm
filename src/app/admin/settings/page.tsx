'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    sendPasswordResetEmail,
    updatePassword,
    getUsers,
    updateUserRole,
    inviteUser,
    getCurrentUser
} from './actions'

export default function SettingsPage() {
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Password reset states
    const [resetEmail, setResetEmail] = useState('')
    const [resetMessage, setResetMessage] = useState('')
    const [resetError, setResetError] = useState('')
    const [resetLoading, setResetLoading] = useState(false)

    // Change password states
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordMessage, setPasswordMessage] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [passwordLoading, setPasswordLoading] = useState(false)

    // Invite user states
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState<'admin' | 'staff'>('staff')
    const [inviteMessage, setInviteMessage] = useState('')
    const [inviteError, setInviteError] = useState('')
    const [inviteLoading, setInviteLoading] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)

        const userRes = await getCurrentUser()
        if (userRes.success && userRes.user) {
            setCurrentUser(userRes.user)
            setResetEmail(userRes.user.email || '')

            if (userRes.user.role === 'admin') {
                const usersRes = await getUsers()
                if (usersRes.success && usersRes.users) {
                    setUsers(usersRes.users)
                }
            }
        }

        setLoading(false)
    }

    async function handlePasswordReset(e: React.FormEvent) {
        e.preventDefault()
        setResetLoading(true)
        setResetError('')
        setResetMessage('')

        const res = await sendPasswordResetEmail(resetEmail)
        if (res.success) {
            setResetMessage('Link reset password telah dihantar ke email anda.')
        } else {
            setResetError(res.error || 'Gagal menghantar email')
        }
        setResetLoading(false)
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault()
        setPasswordLoading(true)
        setPasswordError('')
        setPasswordMessage('')

        if (newPassword !== confirmPassword) {
            setPasswordError('Password tidak sama')
            setPasswordLoading(false)
            return
        }

        if (newPassword.length < 6) {
            setPasswordError('Password mesti sekurang-kurangnya 6 aksara')
            setPasswordLoading(false)
            return
        }

        const res = await updatePassword(newPassword)
        if (res.success) {
            setPasswordMessage('Password berjaya ditukar!')
            setNewPassword('')
            setConfirmPassword('')
        } else {
            setPasswordError(res.error || 'Gagal menukar password')
        }
        setPasswordLoading(false)
    }

    async function handleInviteUser(e: React.FormEvent) {
        e.preventDefault()
        setInviteLoading(true)
        setInviteError('')
        setInviteMessage('')

        const res = await inviteUser(inviteEmail, inviteRole)
        if (res.success) {
            setInviteMessage(res.message || 'Jemputan berjaya dihantar!')
            setInviteEmail('')
        } else {
            setInviteError(res.error || 'Gagal menghantar jemputan')
        }
        setInviteLoading(false)
    }

    async function handleRoleChange(userId: string, newRole: 'admin' | 'staff') {
        const res = await updateUserRole(userId, newRole)
        if (res.success) {
            loadData() // Reload users
        } else {
            alert(res.error || 'Gagal menukar role')
        }
    }

    if (loading) {
        return <div className="p-8">Loading...</div>
    }

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold">Settings</h1>

            {/* Change Password Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Tukar Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password Baru</label>
                            <Input
                                type="password"
                                placeholder="Masukkan password baru"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sahkan Password</label>
                            <Input
                                type="password"
                                placeholder="Masukkan semula password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        {passwordError && (
                            <Alert variant="destructive">
                                <AlertDescription>{passwordError}</AlertDescription>
                            </Alert>
                        )}
                        {passwordMessage && (
                            <Alert>
                                <AlertDescription className="text-green-600">{passwordMessage}</AlertDescription>
                            </Alert>
                        )}
                        <Button type="submit" disabled={passwordLoading}>
                            {passwordLoading ? 'Menukar...' : 'Tukar Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Forgot Password Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Lupa Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordReset} className="space-y-4 max-w-md">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                placeholder="Masukkan email anda"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                            />
                        </div>
                        {resetError && (
                            <Alert variant="destructive">
                                <AlertDescription>{resetError}</AlertDescription>
                            </Alert>
                        )}
                        {resetMessage && (
                            <Alert>
                                <AlertDescription className="text-green-600">{resetMessage}</AlertDescription>
                            </Alert>
                        )}
                        <Button type="submit" disabled={resetLoading}>
                            {resetLoading ? 'Menghantar...' : 'Hantar Link Reset'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Admin Only: User Management */}
            {currentUser?.role === 'admin' && (
                <>
                    {/* Invite New User */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Jemput Pengguna Baru</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleInviteUser} className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        type="email"
                                        placeholder="email@contoh.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Role</label>
                                    <select
                                        className="w-full border rounded-md p-2"
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value as 'admin' | 'staff')}
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                {inviteError && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{inviteError}</AlertDescription>
                                    </Alert>
                                )}
                                {inviteMessage && (
                                    <Alert>
                                        <AlertDescription className="text-green-600">{inviteMessage}</AlertDescription>
                                    </Alert>
                                )}
                                <Button type="submit" disabled={inviteLoading}>
                                    {inviteLoading ? 'Menghantar...' : 'Hantar Jemputan'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* User List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Senarai Pengguna</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {users.length === 0 ? (
                                <p className="text-gray-500">Tiada pengguna dijumpai</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b bg-gray-100">
                                                <th className="text-left p-3">Email</th>
                                                <th className="text-left p-3">Role</th>
                                                <th className="text-left p-3">Tindakan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.user_id} className="border-b hover:bg-gray-50">
                                                    <td className="p-3">{user.email}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 rounded text-sm ${user.role === 'admin'
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        {user.user_id !== currentUser?.id && (
                                                            <select
                                                                className="border rounded p-1 text-sm"
                                                                value={user.role}
                                                                onChange={(e) => handleRoleChange(user.user_id, e.target.value as 'admin' | 'staff')}
                                                            >
                                                                <option value="staff">Staff</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                        )}
                                                        {user.user_id === currentUser?.id && (
                                                            <span className="text-gray-400 text-sm">Anda</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
