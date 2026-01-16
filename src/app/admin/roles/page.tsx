'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, Plus, Trash2, X } from 'lucide-react'
import { getUsers, createUser, updateUserPermissions, deleteUser } from '../actions'

interface User {
    id: string
    user_id: string
    email: string
    role: string
    can_view_dashboard: boolean
    can_view_participants: boolean
    can_view_analytics: boolean
    can_import_data: boolean
    can_manage_users: boolean
}

export default function RolesPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [creating, setCreating] = useState(false)
    const [message, setMessage] = useState('')

    // New user form
    const [newEmail, setNewEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [newRole, setNewRole] = useState('user')

    async function loadUsers() {
        setLoading(true)
        const res = await getUsers()
        if (res.success) {
            setUsers(res.users as User[])
        }
        setLoading(false)
    }

    useEffect(() => {
        loadUsers()
    }, [])

    async function handleCreateUser(e: React.FormEvent) {
        e.preventDefault()
        setCreating(true)
        setMessage('')

        const permissions = {
            role: newRole,
            can_view_dashboard: newRole === 'admin',
            can_view_participants: newRole === 'admin',
            can_view_analytics: newRole === 'admin',
            can_import_data: newRole === 'admin',
            can_manage_users: newRole === 'admin'
        }

        const res = await createUser(newEmail, newPassword, permissions)

        if (res.success) {
            setMessage('User created successfully!')
            setNewEmail('')
            setNewPassword('')
            setShowCreateForm(false)
            loadUsers()
        } else {
            setMessage(`Error: ${res.error}`)
        }

        setCreating(false)
    }

    async function handleTogglePermission(userId: string, field: string, currentValue: boolean) {
        await updateUserPermissions(userId, { [field]: !currentValue })
        loadUsers()
    }

    async function handleRoleChange(userId: string, newRole: string) {
        const updates: any = { role: newRole }
        if (newRole === 'admin') {
            updates.can_view_dashboard = true
            updates.can_view_participants = true
            updates.can_view_analytics = true
            updates.can_import_data = true
            updates.can_manage_users = true
        }
        await updateUserPermissions(userId, updates)
        loadUsers()
    }

    async function handleDeleteUser(userId: string, email: string) {
        if (!confirm(`Delete user ${email}?`)) return

        await deleteUser(userId)
        setMessage('User deleted successfully')
        loadUsers()
    }

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Role Management</h1>
                    <p className="text-gray-500 mt-1">Manage users and their permissions</p>
                </div>
                <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
                    {showCreateForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add User</>}
                </Button>
            </div>

            {message && (
                <Alert>
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            )}

            {showCreateForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create New User</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="user@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Password</label>
                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min 6 characters"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Role</label>
                                    <select
                                        className="w-full border rounded-md p-2"
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value)}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <Button type="submit" disabled={creating}>
                                {creating ? 'Creating...' : 'Create User'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Users & Permissions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-center">Dashboard</TableHead>
                                    <TableHead className="text-center">Participants</TableHead>
                                    <TableHead className="text-center">Analytics</TableHead>
                                    <TableHead className="text-center">Import</TableHead>
                                    <TableHead className="text-center">Manage Users</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.email}</TableCell>
                                        <TableCell>
                                            <select
                                                className="border rounded px-2 py-1 text-sm"
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={user.can_view_dashboard}
                                                onChange={() => handleTogglePermission(user.user_id, 'can_view_dashboard', user.can_view_dashboard)}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={user.can_view_participants}
                                                onChange={() => handleTogglePermission(user.user_id, 'can_view_participants', user.can_view_participants)}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={user.can_view_analytics}
                                                onChange={() => handleTogglePermission(user.user_id, 'can_view_analytics', user.can_view_analytics)}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={user.can_import_data}
                                                onChange={() => handleTogglePermission(user.user_id, 'can_import_data', user.can_import_data)}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={user.can_manage_users}
                                                onChange={() => handleTogglePermission(user.user_id, 'can_manage_users', user.can_manage_users)}
                                                className="w-4 h-4 cursor-pointer"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteUser(user.user_id, user.email)}
                                                className="gap-1"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                                            No users found. Create one to get started!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
