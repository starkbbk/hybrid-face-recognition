import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users_full');
            if (Array.isArray(res.data)) {
                setUsers(res.data);
            } else {
                console.error("Expected array from /users_full but got:", res.data);
                setUsers([]);
            }
        } catch (err) {
            console.error(err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
        try {
            await api.delete(`/users/${name}`);
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert('Failed to delete user');
        }
    };

    const handleEdit = async (oldName) => {
        const newName = window.prompt("Enter new name:", oldName);
        if (!newName || newName === oldName) return;

        try {
            await api.post('/rename_user', { old_name: oldName, new_name: newName });
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert('Failed to rename user. Name might already exist.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Registered Users</h2>
                    <p className="text-slate-400 mt-1">Manage face database</p>
                </div>
                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300">
                    Total: <span className="text-white font-bold">{users.length}</span>
                </div>
            </header>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                </div>
            ) : users.length === 0 ? (
                <div className="glass-panel p-12 rounded-2xl text-center">
                    <div className="text-4xl mb-3">👥</div>
                    <p className="text-slate-400">No users registered yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((user) => (
                        <div key={user.name} className="glass-card p-6 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-2xl -mr-8 -mt-8 transition-all duration-500 group-hover:scale-150" />

                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-inner ring-1 ring-white/10 overflow-hidden">
                                    {user.thumbnail ? (
                                        <img
                                            src={user.thumbnail}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl">👤</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{user.name}</h3>
                                    <span className="text-xs text-slate-400 px-2 py-1 rounded-md bg-white/5 border border-white/5">
                                        Registered
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3 relative z-10">
                                <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                    <span className="text-slate-400">Created</span>
                                    <span className="text-slate-200 font-mono text-xs">
                                        {new Date().toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm py-2 border-b border-white/5">
                                    <span className="text-slate-400">Embeddings</span>
                                    <span className="text-green-400 text-xs flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        Active
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => handleDelete(user.name)}
                                    className="flex-1 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors text-sm font-medium"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => handleEdit(user.name)}
                                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
