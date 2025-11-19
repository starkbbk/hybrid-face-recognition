import React from 'react';
import { getStreamUrl } from '../api';

export default function Camera() {
    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <header className="flex items-center justify-between mb-6 flex-shrink-0">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Live Camera</h2>
                    <p className="text-slate-400 mt-1">Full screen monitoring</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <span className="text-sm font-medium text-red-400">LIVE</span>
                </div>
            </header>

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="relative w-full max-w-5xl aspect-video glass-panel rounded-3xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 group">
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-0">
                        <span className="text-slate-500">Loading Stream...</span>
                    </div>
                    <img
                        src={getStreamUrl()}
                        alt="Full Stream"
                        className="absolute inset-0 w-full h-full object-contain z-10"
                    />

                    {/* Overlay UI */}
                    <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/60 to-transparent z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex justify-between text-white/80 text-sm font-mono">
                            <span>CAM-01</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center gap-4">
                        <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all">
                            📸 Snapshot
                        </button>
                        <button className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/40 backdrop-blur-md text-red-200 transition-all">
                            🛑 Stop
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
