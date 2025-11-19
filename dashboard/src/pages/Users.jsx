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
            await api.post('/delete_user', { name });
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

    const handleSchedule = async (user) => {
        const start = prompt("Enter Allowed Start Time (HH:MM)", user.allowed_start || "00:00");
        if (start === null) return;
        const end = prompt("Enter Allowed End Time (HH:MM)", user.allowed_end || "23:59");
        if (end === null) return;

        try {
            await api.post('/update_access', { name: user.name, start, end });
            fetchUsers();
        } catch (err) {
            alert("Failed to update schedule: " + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <header className="flex items-center justify-between mb-8 flex-shrink-0">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">User Management</h2>
                    <p className="text-slate-400 mt-1">Manage registered faces and access rules</p>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 text-sm text-slate-300">
                    Total Users: <span className="text-white font-bold ml-1">{users.length}</span>
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
                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {users.map((user, idx) => (
                            <div key={idx} className="glass-card p-6 flex flex-col items-center text-center group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="w-24 h-24 rounded-full mb-4 p-1 bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/20 relative">
                                    {user.thumbnail ? (
                                        <img src={user.thumbnail} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-3xl">
                                            👤
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
                                <p className="text-xs text-slate-400 mb-4 font-mono">
                                    Access: {user.allowed_start || "00:00"} - {user.allowed_end || "23:59"}
                                </p>

                                <div className="flex gap-2 w-full mt-auto">
                                    <button
                                        onClick={() => handleEdit(user.name)}
                                        className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-colors"
                                    >
                                        Rename
                                    </button>
                                    <button
                                        onClick={() => handleSchedule(user)}
                                        className="flex-1 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-xs font-medium text-blue-400 transition-colors"
                                    >
                                        Schedule
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.name)}
                                        className="flex-1 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-medium text-red-400 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
