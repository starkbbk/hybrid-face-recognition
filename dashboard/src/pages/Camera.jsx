import React from 'react';
import { getStreamUrl } from '../api';

export default function Camera() {
    return (
        <div className="p-6 max-w-6xl mx-auto h-screen flex flex-col">
            <h2 className="text-2xl mb-6">Live Camera</h2>
            <div className="flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden border border-slate-700 shadow-2xl">
                <img
                    src={getStreamUrl()}
                    alt="Live Stream"
                    className="max-w-full max-h-full object-contain"
                />
            </div>
        </div>
    );
}
