import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users_full');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (name) => {
        if (!window.confirm(`Delete user ${name}?`)) return;
        try {
            await api.post('/delete_user', { name });
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert('Failed to delete');
        }
    };

    const handleUpdate = async (name) => {
        alert(`Please look at the camera to update ${name}`);
        try {
            await api.post('/update_user', { name });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl">Registered Users</h2>
                <button className="btn btn-secondary" onClick={fetchUsers}>Refresh</button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : users.length === 0 ? (
                <div className="text-gray">No users found.</div>
            ) : (
                <div className="grid grid-cols-auto gap-6">
                    {users.map(user => (
                        <div key={user.name} className="card flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 bg-slate-700 border-2 border-cyan-500">
                                {user.thumbnail ? (
                                    <img src={user.thumbnail} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                                )}
                            </div>
                            <h3 className="font-bold text-lg mb-4">{user.name}</h3>
                            <div className="flex gap-2 w-full">
                                <button
                                    className="btn btn-secondary flex-1 text-sm"
                                    onClick={() => handleUpdate(user.name)}
                                >
                                    Update
                                </button>
                                <button
                                    className="btn btn-danger flex-1 text-sm"
                                    onClick={() => handleDelete(user.name)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
