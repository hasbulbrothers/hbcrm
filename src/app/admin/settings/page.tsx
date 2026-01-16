/* eslint-disable @typescript-eslint/no-explicit-any */
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
    const [oldPassword, setOldPassword] = useState('')
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

    useEffect(() => {
        loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function handlePasswordReset(e: React.FormEvent) {
        e.preventDefault()
        setResetLoading(true)
        setResetError('')
        setResetMessage('')

        const res = await sendPasswordResetEmail(resetEmail)
        if (res.success) {
            setResetMessage('Password reset link has been sent to your email.')
        } else {
            setResetError(res.error || 'Failed to send email')
        }
        setResetLoading(false)
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault()
        setPasswordLoading(true)
        setPasswordError('')
        setPasswordMessage('')

        if (!oldPassword) {
            setPasswordError('Please enter your current password')
            setPasswordLoading(false)
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match')
            setPasswordLoading(false)
            return
        }

        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters')
            setPasswordLoading(false)
            return
        }

        const res = await updatePassword(oldPassword, newPassword)
        if (res.success) {
            setPasswordMessage('Password changed successfully!')
            setOldPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } else {
            setPasswordError(res.error || 'Failed to change password')
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
            setInviteMessage(res.message || 'Invitation sent successfully!')
            setInviteEmail('')
        } else {
            setInviteError(res.error || 'Failed to send invitation')
        }
        setInviteLoading(false)
    }

    async function handleRoleChange(userId: string, newRole: 'admin' | 'staff') {
        const res = await updateUserRole(userId, newRole)
        if (res.success) {
            loadData() // Reload users
        } else {
            alert(res.error || 'Failed to change role')
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
                    <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Current Password</label>
                            <Input
                                type="password"
                                placeholder="Enter current password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">New Password</label>
                            <Input
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Confirm Password</label>
                            <Input
                                type="password"
                                placeholder="Re-enter new password"
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
                            {passwordLoading ? 'Changing...' : 'Change Password'}
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
                            <CardTitle>Invite New User</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleInviteUser} className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        type="email"
                                        placeholder="email@example.com"
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
                                    {inviteLoading ? 'Sending...' : 'Send Invitation'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* User List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>User List</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {users.length === 0 ? (
                                <p className="text-gray-500">No users found</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b bg-gray-100">
                                                <th className="text-left p-3">Email</th>
                                                <th className="text-left p-3">Role</th>
                                                <th className="text-left p-3">Action</th>
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
                                                            <span className="text-gray-400 text-sm">You</span>
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
