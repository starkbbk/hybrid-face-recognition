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

    const [policyModal, setPolicyModal] = useState(null); // { user, start, end, days, role }

    const openPolicyModal = (user) => {
        setPolicyModal({
            user,
            start: user.allowed_start || "00:00",
            end: user.allowed_end || "23:59",
            days: (user.allowed_days || "0,1,2,3,4,5,6").split(','),
            role: user.role || "USER"
        });
    };

    const savePolicy = async () => {
        if (!policyModal) return;
        try {
            await api.post('/update_access', {
                name: policyModal.user.name,
                start: policyModal.start,
                end: policyModal.end,
                days: policyModal.days.join(','),
                role: policyModal.role
            });
            setPolicyModal(null);
            fetchUsers();
        } catch (err) {
            alert("Failed to update policy");
        }
    };

    const toggleDay = (day) => {
        const days = policyModal.days.includes(day)
            ? policyModal.days.filter(d => d !== day)
            : [...policyModal.days, day];
        setPolicyModal({ ...policyModal, days });
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col relative">
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
                            <div key={idx} className={`glass-card p-6 flex flex-col items-center text-center group relative overflow-hidden ${user.role === 'BLOCKLISTED' ? 'border-red-500/30 bg-red-500/5' : ''}`}>
                                <div className={`absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity ${user.role === 'VIP' ? 'bg-yellow-500' : user.role === 'BLOCKLISTED' ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`} />

                                <div className="w-24 h-24 rounded-full mb-4 p-1 bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/20 relative">
                                    {user.thumbnail ? (
                                        <img src={user.thumbnail} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-3xl">
                                            👤
                                        </div>
                                    )}
                                    {user.role === 'VIP' && <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">VIP</div>}
                                    {user.role === 'BLOCKLISTED' && <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">BAN</div>}
                                </div>

                                <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
                                <p className="text-xs text-slate-400 mb-4 font-mono">
                                    {user.allowed_start}-{user.allowed_end}
                                </p>

                                <div className="flex gap-2 w-full mt-auto">
                                    <button
                                        onClick={() => handleEdit(user.name)}
                                        className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 transition-colors"
                                    >
                                        Rename
                                    </button>
                                    <button
                                        onClick={() => openPolicyModal(user)}
                                        className="flex-1 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-xs font-medium text-blue-400 transition-colors"
                                    >
                                        Policy
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

            {/* Policy Modal */}
            {policyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="glass-panel w-full max-w-lg p-6 rounded-2xl m-4">
                        <h3 className="text-xl font-bold text-white mb-4">Access Policy: {policyModal.user.name}</h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Start Time</label>
                                    <input type="time" value={policyModal.start} onChange={e => setPolicyModal({ ...policyModal, start: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">End Time</label>
                                    <input type="time" value={policyModal.end} onChange={e => setPolicyModal({ ...policyModal, end: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-2">Allowed Days</label>
                                <div className="flex justify-between gap-1">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                                        <button key={i}
                                            onClick={() => toggleDay(String(i))}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${policyModal.days.includes(String(i)) ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-slate-400 mb-2">Role</label>
                                <div className="flex gap-2">
                                    {['USER', 'VIP', 'BLOCKLISTED'].map(role => (
                                        <button key={role}
                                            onClick={() => setPolicyModal({ ...policyModal, role })}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${policyModal.role === role
                                                ? (role === 'BLOCKLISTED' ? 'bg-red-500 border-red-500 text-white' : role === 'VIP' ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-blue-500 border-blue-500 text-white')
                                                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}>
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setPolicyModal(null)} className="flex-1 py-3 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 transition-colors">Cancel</button>
                            <button onClick={savePolicy} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:opacity-90 transition-opacity">Save Policy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
