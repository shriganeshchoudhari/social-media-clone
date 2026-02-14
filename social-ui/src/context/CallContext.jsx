import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useWebSocket } from './WebSocketContext';

const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
    const { stompClient, sendCallSignal } = useWebSocket();
    const [callState, setCallState] = useState('IDLE'); // IDLE, INCOMING, CALLING, CONNECTED
    const [targetUser, setTargetUser] = useState(null); // Username
    const [isCaller, setIsCaller] = useState(false);
    const [remoteStream, setRemoteStream] = useState(null);
    const [localStream, setLocalStream] = useState(null);

    const pcRef = useRef(null);


    // ICE Servers (STUN only for dev/demo)
    const rtcConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
        ]
    };

    useEffect(() => {
        if (stompClient && stompClient.connected) {
            const subscription = stompClient.subscribe('/user/queue/call', (message) => {
                const signal = JSON.parse(message.body);
                handleSignal(signal);
            });
            return () => subscription.unsubscribe();
        }
    }, [stompClient]);

    const audioCtxRef = useRef(null);
    const intervalRef = useRef(null);

    // Audio Synthesis for Ringtone
    const playRingtone = (type) => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;

        if (ctx.state === 'suspended') {
            ctx.resume().catch(err => console.error("Failed to resume audio context", err));
        }

        stopRingtone(false); // Stop any existing interval, but keep context open

        const playTone = (freq, type, duration) => {
            if (!ctx || ctx.state === 'closed') return;
            try {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
                osc.stop(ctx.currentTime + duration);
            } catch (e) {
                console.error("Audio generation error", e);
            }
        };

        if (type === 'incoming') {
            const ring = () => {
                playTone(800, 'sine', 1.5);
                setTimeout(() => playTone(650, 'sine', 1.5), 50);
            };
            ring();
            intervalRef.current = setInterval(ring, 3000);
        } else if (type === 'calling') {
            const beep = () => {
                playTone(440, 'sine', 1.0);
            };
            beep();
            intervalRef.current = setInterval(beep, 2500);
        }
    };

    const stopRingtone = (closeContext = false) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (closeContext && audioCtxRef.current) {
            audioCtxRef.current.close().then(() => {
                audioCtxRef.current = null;
            }).catch(e => console.error("Error closing audio context", e));
        }
    };

    useEffect(() => {
        return () => stopRingtone(true);
    }, []);

    const createPeerConnection = () => {
        if (pcRef.current) return pcRef.current;

        const pc = new RTCPeerConnection(rtcConfig);

        pc.onicecandidate = (event) => {
            if (event.candidate && targetUser) {
                sendCallSignal({
                    type: 'ICE',
                    targetUsername: targetUser,
                    candidate: event.candidate
                });
            }
        };

        pc.ontrack = (event) => {
            console.log("Remote track received", event.streams[0]);
            setRemoteStream(event.streams[0]);
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                endCall(false);
            }
        };

        pcRef.current = pc;
        return pc;
    };

    const handleSignal = async (signal) => {
        console.log("Received signal:", signal.type);

        if (signal.type === 'OFFER') {
            setTargetUser(signal.senderUsername);
            setCallState('INCOMING');
            playRingtone('incoming');

            pcRef.current = createPeerConnection();
            await pcRef.current.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: signal.sdp }));
        } else if (signal.type === 'ANSWER') {
            stopRingtone();
            if (pcRef.current) {
                await pcRef.current.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: signal.sdp }));
                setCallState('CONNECTED');
            }
        } else if (signal.type === 'ICE') {
            if (pcRef.current && signal.candidate) {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
        } else if (signal.type === 'END') {
            endCall(false);
        }
    };

    const startCall = async (username) => {
        setTargetUser(username);
        setIsCaller(true);
        setCallState('CALLING');
        playRingtone('calling');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            const pc = createPeerConnection();
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            sendCallSignal({
                type: 'OFFER',
                targetUsername: username,
                sdp: offer.sdp
            });

        } catch (err) {
            console.error("Failed to start call", err);
            endCall();
        }
    };

    const acceptCall = async () => {
        stopRingtone();
        setCallState('CONNECTED');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            const pc = pcRef.current;
            if (!pc) return;

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            sendCallSignal({
                type: 'ANSWER',
                targetUsername: targetUser,
                sdp: answer.sdp
            });

        } catch (err) {
            console.error("Failed to accept call", err);
            endCall();
        }
    };

    const endCall = (notify = true) => {
        stopRingtone();
        if (notify && targetUser) {
            sendCallSignal({ type: 'END', targetUsername: targetUser });
        }

        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }

        if (localStream) {
            localStream.getTracks().forEach(t => {
                t.stop();
                t.enabled = false;
            });
            setLocalStream(null);
        }



        setCallState('IDLE');
        setTargetUser(null);
        setRemoteStream(null);
        setIsCaller(false);
    };

    return (
        <CallContext.Provider value={{
            callState,
            targetUser,
            isCaller,
            startCall,
            acceptCall,
            endCall,
            localStream,
            remoteStream
        }}>
            {children}
        </CallContext.Provider>
    );
};

export const useCall = () => useContext(CallContext);
