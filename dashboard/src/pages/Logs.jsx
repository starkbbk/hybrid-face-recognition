import React from 'react';

export default function Logs({ events }) {
    return (
        <div className="max-w-6xl mx-auto">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">System Logs</h2>
                    <p className="text-slate-400 mt-1">History of recognition events</p>
                </div>
                <button className="btn-secondary flex items-center gap-2 text-sm">
                    <span>📥</span> Export CSV
                </button>
            </header>

            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Time</th>
                                <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Event</th>
                                <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">User</th>
                                <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Confidence</th>
                                <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Liveness</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {events.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500 italic">
                                        No logs available
                                    </td>
                                </tr>
                            ) : (
                                events.map((evt, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 text-sm text-slate-400 font-mono">
                                            {new Date(evt.timestamp * 1000).toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                                                Match Found
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">
                                                    {evt.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-white">{evt.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-cyan-500 rounded-full"
                                                        style={{ width: `${evt.fusion_score * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-cyan-300 font-mono">
                                                    {(evt.fusion_score * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-purple-500 rounded-full"
                                                        style={{ width: `${evt.liveness_score * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-purple-300 font-mono">
                                                    {(evt.liveness_score * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
