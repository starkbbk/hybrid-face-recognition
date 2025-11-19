import React, { useState, useEffect } from 'react';
import { api, socket, getStreamUrl } from '../api';

export default function Dashboard({ events, onNavigate }) {
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
        <div className="max-w-7xl mx-auto space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard</h2>
                    <p className="text-slate-400 mt-1">Real-time monitoring and controls</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    System Online
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column (Registration) */}
                <div className="flex-1">
                    <div className="glass-card p-6 h-full relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-cyan-500/20" />

                        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">👤</span>
                            Register User
                        </h3>

                        <div className="space-y-4 relative z-10">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                                <input
                                    type="text"
                                    className="input-glass w-full"
                                    placeholder="e.g. John Doe"
                                    value={regName}
                                    onChange={(e) => setRegName(e.target.value)}
                                />
                            </div>

                            <button
                                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                                onClick={handleRegister}
                            >
                                <span>Start Registration</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </button>

                            {regStatus && (
                                <div className="p-4 bg-blue-500/10 text-blue-200 rounded-xl border border-blue-500/20 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    {regStatus}
                                </div>
                            )}

                            <p className="text-xs text-slate-500 text-center mt-4">
                                The system will pause recognition briefly to capture the face.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column (Live Feed & Stats) */}
                <div className="w-full lg:w-80 flex flex-col gap-6 flex-shrink-0">
                    {/* Live Camera Feed */}
                    <div className="glass-card p-1.5">
                        <div className="flex items-center justify-between px-2 py-2 mb-1">
                            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Feed</h3>
                            <span className="text-[10px] text-red-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                LIVE
                            </span>
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/50 aspect-video relative group">
                            <img
                                src={getStreamUrl()}
                                alt="Live Feed"
                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none" />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="glass-card p-5">
                        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">System Status</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                                <span className="text-xs text-slate-400">Events Today</span>
                                <span className="text-sm font-mono font-bold text-white">{events.length}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                                <span className="text-xs text-slate-400">Mode</span>
                                <span className="text-xs font-medium text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded">Buffalo_L</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                                <span className="text-xs text-slate-400">Backend</span>
                                <span className="text-xs font-medium text-green-400">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Events Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Recent Events</h3>
                    <button
                        onClick={() => onNavigate('logs')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        View All Logs →
                    </button>
                </div>

                {events.length === 0 ? (
                    <div className="glass-panel p-12 rounded-2xl text-center">
                        <div className="text-4xl mb-3">💤</div>
                        <p className="text-slate-400">No events detected yet...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* Filter to show only unique users (latest event per user) */}
                        {events
                            .filter((evt, index, self) => index === self.findIndex((t) => t.name === evt.name))
                            .slice(0, 6)
                            .map((evt, idx) => (
                                <div key={idx} className="glass-card p-5 group hover:-translate-y-1 transition-transform duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/20">
                                                {evt.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white leading-tight">{evt.name}</h4>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(evt.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">
                                            ID: #{idx + 1}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1.5">
                                                <span className="text-slate-400">Match Confidence</span>
                                                <span className="text-cyan-300 font-medium">{(evt.fusion_score * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.min(evt.fusion_score * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs mb-1.5">
                                                <span className="text-slate-400">Liveness Score</span>
                                                <span className="text-purple-300 font-medium">{(evt.liveness_score * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.min(evt.liveness_score * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
