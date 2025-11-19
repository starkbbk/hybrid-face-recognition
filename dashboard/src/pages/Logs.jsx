import React from 'react';

export default function Logs({ events }) {
    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h2 className="text-2xl mb-6">Event Logs</h2>

            <div className="card overflow-hidden">
                <div className="overflow-y-auto" style={{ maxHeight: '75vh' }}>
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-800 sticky top-0">
                            <tr>
                                <th className="p-4 border-b border-slate-700">Time</th>
                                <th className="p-4 border-b border-slate-700">Name</th>
                                <th className="p-4 border-b border-slate-700">Score</th>
                                <th className="p-4 border-b border-slate-700">Liveness</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((evt, idx) => (
                                <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="p-4 text-gray text-sm">
                                        {new Date(evt.timestamp * 1000).toLocaleString()}
                                    </td>
                                    <td className="p-4 font-medium text-cyan-400">{evt.name}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 progress-bg h-2">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${Math.min(evt.fusion_score * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray">{(evt.fusion_score * 100).toFixed(0)}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 progress-bg h-2">
                                                <div
                                                    className="progress-fill bg-purple-500"
                                                    style={{ width: `${Math.min(evt.liveness_score * 100, 100)}%`, backgroundColor: '#8b5cf6' }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray">{(evt.liveness_score * 100).toFixed(0)}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {events.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray">No logs available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
