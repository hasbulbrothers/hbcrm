/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, Plus, Trash2, X } from 'lucide-react'
import { getAllUsers, changeUserRole, addUserWithRole, deleteUserRole } from './actions'

interface User {
    id: string
    user_id: string
    email: string
    role: string
}

export default function RolesPage() {
    const [users, setUsers] = useState<User[]>([])
    const [currentUserId, setCurrentUserId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [creating, setCreating] = useState(false)
    const [message, setMessage] = useState('')

    // New user form
    const [newEmail, setNewEmail] = useState('')
    const [newRole, setNewRole] = useState<'admin' | 'general'>('general')

    async function loadUsers() {
        setLoading(true)
        const res = await getAllUsers()
        if (res.success) {
            setUsers(res.users as User[])
            if (res.currentUserId) {
                setCurrentUserId(res.currentUserId)
            }
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

        const res = await addUserWithRole(newEmail, newRole)

        if (res.success) {
            setMessage(res.message || 'Jemputan berjaya dihantar!')
            setNewEmail('')
            setShowCreateForm(false)
            loadUsers()
        } else {
            setMessage(`Error: ${res.error}`)
        }

        setCreating(false)
    }

    async function handleRoleChange(userId: string, newRole: string) {
        const res = await changeUserRole(userId, newRole as 'admin' | 'general')
        if (res.success) {
            loadUsers()
        } else {
            setMessage(`Error: ${res.error}`)
        }
    }

    async function handleDeleteUser(userId: string, email: string) {
        if (!confirm(`Padam akses untuk ${email}?`)) return

        const res = await deleteUserRole(userId)
        if (res.success) {
            setMessage('Akses pengguna berjaya dipadam')
            loadUsers()
        } else {
            setMessage(`Error: ${res.error}`)
        }
    }

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Role Management</h1>
                    <p className="text-gray-500 mt-1">Manage users and their roles</p>
                </div>
                <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
                    {showCreateForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Invite User</>}
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
                        <CardTitle>Invite New User</CardTitle>
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
                                    <label className="text-sm font-medium">Role</label>
                                    <select
                                        className="w-full border rounded-md p-2"
                                        value={newRole}
                                        onChange={(e) => setNewRole(e.target.value as 'admin' | 'general')}
                                    >
                                        <option value="general">General</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <Button type="submit" disabled={creating}>
                                {creating ? 'Sending...' : 'Send Invitation'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Users & Roles
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.email}</TableCell>
                                        <TableCell>
                                            {user.user_id === currentUserId ? (
                                                <span className={`px-2 py-1 rounded text-sm ${
                                                    user.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            ) : (
                                                <select
                                                    className="border rounded px-2 py-1 text-sm"
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                                                >
                                                    <option value="general">General</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {user.user_id === currentUserId ? (
                                                <span className="text-gray-400 text-sm">You</span>
                                            ) : (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteUser(user.user_id, user.email)}
                                                    className="gap-1"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                                            No users found. Invite someone to get started!
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
