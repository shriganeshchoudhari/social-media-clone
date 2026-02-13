import React from 'react';
import { useCall } from '../context/CallContext';

export default function CallOverlay() {
    const { callState, targetUser, isCaller, acceptCall, endCall, localVideoRef, remoteVideoRef } = useCall();

    if (callState === 'IDLE') return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            {/* Incoming Call Modal */}
            {callState === 'INCOMING' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl text-center animate-bounce-in">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">📞</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Incoming Call</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{targetUser} is calling you...</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={endCall}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-medium transition-colors"
                        >
                            Decline
                        </button>
                        <button
                            onClick={acceptCall}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-medium transition-colors animate-pulse"
                        >
                            Accept
                        </button>
                    </div>
                </div>
            )}

            {/* Active Call UI */}
            {(callState === 'CALLING' || callState === 'CONNECTED') && (
                <div className="relative w-full h-full max-w-5xl max-h-[90vh] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                    <div className="absolute top-4 left-4 z-10 bg-black/40 px-3 py-1 rounded-full text-white text-sm backdrop-blur">
                        {callState === 'CALLING' ? 'Calling...' : 'Connected'} • {targetUser}
                    </div>

                    {/* Remote Video (Full) */}
                    <div className="flex-1 relative bg-black flex items-center justify-center">
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain"
                        />
                        {!remoteVideoRef.current?.srcObject && callState === 'CONNECTED' && (
                            <div className="absolute text-white opacity-50">Waiting for video...</div>
                        )}
                    </div>

                    {/* Local Video (PiP) */}
                    <div className="absolute bottom-24 right-4 w-32 h-48 bg-gray-800 rounded-xl overflow-hidden shadow-lg border-2 border-white/10">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Controls */}
                    <div className="h-20 bg-gray-900/90 backdrop-blur flex items-center justify-center gap-6">
                        <button className="p-4 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors">
                            🎤
                        </button>
                        <button
                            onClick={() => endCall(true)}
                            className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg scale-100 hover:scale-105"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75L18 6m0 0l2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 015.25 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 00-.38 1.21 12.035 12.035 0 007.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293c.271-.363.734-.527 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 01-2.25 2.25h-2.25z" />
                            </svg>
                        </button>
                        <button className="p-4 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors">
                            📷
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
