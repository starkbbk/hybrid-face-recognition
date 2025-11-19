import React, { useState, useEffect } from 'react';
import { api, socket, getStreamUrl } from '../api';


export default function Dashboard({ events }) {
    const [regName, setRegName] = useState('');
    const [regStatus, setRegStatus] = useState('');

    const handleRegister = async () => {
        if (!regName) return;
        setRegStatus('Starting registration...');
        try {
            await api.post('/register', { name: regName });
            setRegStatus('Initializing...');
        } catch (err) {
            setRegStatus('Error starting registration');
            console.error(err);
        }
    };

    useEffect(() => {
        socket.on('registration_status', (data) => {
            if (data.status === 'success') {
                setRegStatus(`Success! Registered ${data.name}`);
                setRegName('');
                setTimeout(() => setRegStatus(''), 3000);
            } else {
                if (data.error && data.error.includes('Already registered')) {
                    alert(data.error);
                }
                setRegStatus(`Failed: ${data.error}`);
                setTimeout(() => setRegStatus(''), 5000);
            }
        });

        socket.on('registration_feedback', (data) => {
            setRegStatus(data.message);
        });

        return () => {
            socket.off('registration_status');
            socket.off('registration_feedback');
        };
    }, []);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h2 className="text-2xl mb-6">Dashboard</h2>

            <div className="dashboard-container">
                {/* Left Column (Flexible width) */}
                <div className="dashboard-main">
                    {/* Registration Card */}
                    <div className="card">
                        <h3 className="text-xl mb-4 text-accent">Register User</h3>
                        <div className="flex flex-col gap-4">
                            <input
                                type="text"
                                className="input"
                                placeholder="Enter Name"
                                value={regName}
                                onChange={(e) => setRegName(e.target.value)}
                            />
                            <button className="btn btn-primary" onClick={handleRegister}>
                                Start Registration
                            </button>
                            {regStatus && (
                                <div className="p-3 bg-blue-900/30 text-blue-200 rounded border border-blue-800">
                                    {regStatus}
                                </div>
                            )}
                            <p className="text-sm text-gray">
                                Clicking start will pause the main recognition loop for a few seconds to capture the face.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column (Tiny width) */}
                <div className="dashboard-side">
                    {/* Live Camera Feed */}
                    <div className="card p-2">
                        <h3 className="text-xs mb-1 text-accent">Live Feed</h3>
                        <div className="rounded overflow-hidden border border-slate-700 bg-black h-20 flex items-center justify-center">
                            <img
                                src={getStreamUrl()}
                                alt="Live Feed"
                                className="h-full w-full object-contain"
                            />
                        </div>
                    </div>

                    {/* Stats / Info */}
                    <div className="card p-2">
                        <h3 className="text-xs mb-1 text-accent">System Status</h3>
                        <div className="flex flex-col gap-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray">Backend</span>
                                <span className="text-green-400">On</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray">Events</span>
                                <span>{events.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray">Mode</span>
                                <span>Buffalo_L</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Events */}
            <h3 className="text-xl mt-8 mb-4">Live Events</h3>
            {events.length === 0 ? (
                <div className="text-gray italic">No events yet...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.slice(0, 6).map((evt, idx) => (
                        <div key={idx} className="card border-l-4 border-l-cyan-500">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-lg">{evt.name}</span>
                                <span className="text-xs text-gray">
                                    {new Date(evt.timestamp * 1000).toLocaleTimeString()}
                                </span>
                            </div>

                            <div className="mb-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span>Match Score</span>
                                    <span>{(evt.fusion_score * 100).toFixed(1)}%</span>
                                </div>
                                <div className="progress-bg">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${Math.min(evt.fusion_score * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span>Liveness</span>
                                    <span>{(evt.liveness_score * 100).toFixed(1)}%</span>
                                </div>
                                <div className="progress-bg">
                                    <div
                                        className="progress-fill bg-purple-500"
                                        style={{ width: `${Math.min(evt.liveness_score * 100, 100)}%`, backgroundColor: '#8b5cf6' }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
