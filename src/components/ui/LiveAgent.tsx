// src/components/LiveAgent.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { SYSTEM_INSTRUCTION, ARCHITECT_TOOLS } from '../../lib/geminiConfig';
import { useStore } from '../../store/useStore';
import { ASSET_REGISTRY } from '../../lib/assetRegistry';

export default function LiveAgent() {
    const [isConnected, setIsConnected] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [showLogs, setShowLogs] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const visionIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const {
        setTimeOfDay, setFloorMaterial, setWallColor,
        setLeftWindow, setBackWindow,
        setInteriorLighting, addFurniture, updateFurniture,
        removeFurniture, setAssetBaseUrl, geminiApiKey, assetBaseUrl
    } = useStore();
    const nextPlayTimeRef = useRef<number>(0);

    const addLog = (msg: string) => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 15));
        console.log("LiveAgent Log:", msg);
    };

    // NEW: A dedicated function to handle all AI commands
    const handleToolCall = (fc: any) => {
        // Log the exact payload to debug
        addLog(`🛠️ Tool Call: ${fc.name}`);
        addLog(`📦 Args: ${JSON.stringify(fc.args)}`);

        try {
            switch (fc.name) {
                case 'change_environment':
                    const envArgs = fc.args || {};

                    if (envArgs.timeOfDay !== undefined) setTimeOfDay(Number(envArgs.timeOfDay));
                    if (envArgs.floorMaterial) setFloorMaterial(envArgs.floorMaterial);
                    if (envArgs.wallColor) setWallColor(envArgs.wallColor);
                    return { result: "Environment updated." };

                case 'adjust_interior_lighting':
                    const { brightness, color, isOn } = fc.args;
                    setInteriorLighting({
                        ...(brightness !== undefined && { intensity: brightness }),
                        ...(color !== undefined && { color }),
                        ...(isOn !== undefined && { isOn })
                    });
                    return { result: "Lighting adjusted." };

                case 'place_furniture':
                    const { item_type, x, z, rotation: r } = fc.args;
                    const isClamping = Math.abs(x) > 4.5 || Math.abs(z) > 4.5;
                    const newId = addFurniture({
                        type: item_type,
                        position: [x || 0, 0, z || 0],
                        rotation: r || 0
                    });
                    addLog(`✅ Placed ${item_type} with ID: ${newId}`);
                    return {
                        result: isClamping
                            ? `Placed ${item_type}, but it was moved slightly to fit. The unique ID is ${newId}.`
                            : `Placed ${item_type} successfully. The unique ID is ${newId}.`,
                        id: newId
                    };

                case 'update_furniture':
                    const { id: uid, x: ux, z: uz, rotation: ur } = fc.args;
                    updateFurniture(uid, {
                        ...(ux !== undefined && uz !== undefined && { position: [ux, 0, uz] }),
                        ...(ur !== undefined && { rotation: ur })
                    });
                    addLog(`🔄 Updated item ${uid}`);
                    return { result: "Item updated successfully." };

                case 'remove_furniture':
                    const { id: rid } = fc.args;
                    removeFurniture(rid);
                    addLog(`🗑️ Removed ${rid}`);
                    return { result: "Item removed." };

                case 'clear_all_furniture':
                    useStore.getState().clearAllFurniture();
                    addLog(`🧹 Room cleared.`);
                    return { result: "The room is now empty." };

                case 'modify_architecture':
                    const { hasLeftWindow, hasBackWindow } = fc.args;
                    if (hasLeftWindow !== undefined) setLeftWindow(hasLeftWindow);
                    if (hasBackWindow !== undefined) setBackWindow(hasBackWindow);
                    return { result: "Architecture updated." };

                case 'check_spatial_safety':
                    const items = useStore.getState().activeFurniture;
                    const violations: string[] = [];

                    for (let i = 0; i < items.length; i++) {
                        for (let j = i + 1; j < items.length; j++) {
                            const itemA = items[i];
                            const itemB = items[j];

                            const dx = itemA.position[0] - itemB.position[0];
                            const dz = itemA.position[2] - itemB.position[2];
                            const distance = Math.sqrt(dx * dx + dz * dz);

                            const defA = ASSET_REGISTRY[itemA.type];
                            const defB = ASSET_REGISTRY[itemB.type];

                            const minDistance = (defA?.clearanceRequired || 0.5) + (defB?.clearanceRequired || 0.5);

                            if (distance < minDistance) {
                                violations.push(`⚠️ SAFETY WARNING: ${itemA.type} (${itemA.id}) and ${itemB.type} (${itemB.id}) are too close (${distance.toFixed(2)}m). Minimum required: ${minDistance}m.`);
                            }
                        }
                    }

                    if (violations.length === 0) {
                        return { result: "Spatial safety check passed. All items have adequate clearance." };
                    } else {
                        return { result: violations.join('\n') };
                    }

                default:
                    return { error: "Unknown tool" };
            }

        } catch (err) {
            addLog(`❌ Tool Execution Error: ${err}`);
            return { error: String(err) };
        }
    };

    useEffect(() => {
        return () => {
            wsRef.current?.close();
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            if (visionIntervalRef.current) clearInterval(visionIntervalRef.current);
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    const connectToGemini = async () => {
        setError(null);
        setLogs([]);
        addLog("Connecting to Gemini Live...");

        try {
            // Keys and URLs are now auto-fetched by the root page on mount
            if (!geminiApiKey) {
                setError('Gemini API Key is not loaded yet. Please wait a moment.');
                return;
            }

            const apiKey = geminiApiKey;
            const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;

            if (wsRef.current) wsRef.current.close();
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            // Debugging timer: If nothing happens for 10 seconds, log a warning
            const timeout = setTimeout(() => {
                if (ws.readyState === WebSocket.CONNECTING) {
                    addLog("⚠️ Connection taking longer than expected... Check your network or API Key.");
                }
            }, 10000);

            ws.onopen = () => {
                clearTimeout(timeout);
                addLog("✅ Socket Open! Handshaking with Gemini...");
                setIsConnected(true);

                const setupMsg = {
                    setup: {
                        model: "models/gemini-2.0-flash-exp",
                        generationConfig: {
                            responseModalities: ["AUDIO"],
                            speechConfig: {
                                voiceConfig: {
                                    prebuiltVoiceConfig: {
                                        voiceName: "Puck"
                                    }
                                }
                            }
                        },
                        systemInstruction: {
                            parts: [{ text: SYSTEM_INSTRUCTION }]
                        },
                        tools: ARCHITECT_TOOLS
                    }
                };

                ws.send(JSON.stringify(setupMsg));
                addLog("📡 Setup Sent. Waiting for 'setupComplete'...");

                if (isCameraOn) {
                    startVisionStream();
                }
            };

            ws.onmessage = async (event) => {
                const textData = event.data instanceof Blob ? await event.data.text() : event.data;
                const response = JSON.parse(textData);
                console.log("Raw Gemini Response:", response);

                if (response.setupComplete) {
                    addLog("✨ AI READY! You can start talking now.");
                }

                if (response.serverContent) {
                    console.log("🧠 Gemini is responding...");
                    if (response.serverContent.modelTurn) {
                        addLog("🧠 Gemini is responding...");
                    }
                }

                // Handle Audio Output
                const parts = response.serverContent?.modelTurn?.parts;
                if (parts) {
                    for (const part of parts) {
                        if (part.inlineData?.data) {
                            playAudioBase64(part.inlineData.data);
                        }
                    }
                }

                // --- BATCHING TOOL CALLS (The "Lumi Recovery" Fix) ---
                const toolCall = response.toolCall || response.serverContent?.toolCall;
                if (toolCall?.functionCalls) {
                    const responses = [];
                    for (const fc of toolCall.functionCalls) {
                        const result = handleToolCall(fc);
                        responses.push({
                            id: fc.id,
                            name: fc.name,
                            response: result
                        });
                    }

                    // Send ALL responses in one single message
                    ws.send(JSON.stringify({
                        toolResponse: {
                            functionResponses: responses
                        }
                    }));
                }
            };

            ws.onclose = (e) => {
                clearTimeout(timeout);
                setIsConnected(false);
                addLog(`❌ Connection Closed (Code: ${e.code}). Reason: ${e.reason || "No reason provided"}`);

                if (e.code === 1008) {
                    setError("Security/Policy Violation. This usually means the API key is restricted or the model name is incorrect.");
                } else if (e.code === 1006) {
                    setError("Abnormal Closure. Check if you have an active internet connection or if a firewall is blocking WSS.");
                }
            };

            ws.onerror = (e) => {
                clearTimeout(timeout);
                addLog("🛑 WebSocket Error detected.");
                setError("Connection failed. Check browser console (F12) for network details.");
                setIsConnected(false);
            };

        } catch (e: any) {
            setError(e.message);
        }
    };

    const startMicrophone = async () => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        if (!window.isSecureContext) {
            setError("MIC BLOCKED: Browsers only allow microphone access on 'localhost' or via HTTPS. If you are on a PC, use http://localhost:3000 instead of your IP. If you are on a phone, you must use an HTTPS tunnel (like ngrok).");
            return;
        }

        try {
            const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
            if (!audioCtxRef.current) {
                audioCtxRef.current = new AudioContext({ sampleRate: 16000 });
            }
            const ctx = audioCtxRef.current!;
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const source = ctx.createMediaStreamSource(stream);
            const processor = ctx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            let chunkCount = 0;
            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcm16 = new DataView(new ArrayBuffer(inputData.length * 2));
                for (let i = 0; i < inputData.length; i++) {
                    let s = Math.max(-1, Math.min(1, inputData[i]));
                    pcm16.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                }
                // Safer Base64 conversion for all browsers
                const bytes = new Uint8Array(pcm16.buffer);
                let binary = '';
                for (let j = 0; j < bytes.byteLength; j++) {
                    binary += String.fromCharCode(bytes[j]);
                }
                const base64Audio = btoa(binary);

                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({
                        realtimeInput: {
                            mediaChunks: [{ mimeType: "audio/pcm", data: base64Audio }]
                        }
                    }));

                    chunkCount++;
                    if (chunkCount % 50 === 0) {
                        console.log(`📡 Sent ${chunkCount} audio chunks...`);
                    }
                }
            };
            source.connect(processor);
            processor.connect(ctx.destination);
            setIsRecording(true);
            addLog("🎤 Recording... (Speak now)");
        } catch (e) {
            setError("Microphone error: " + e);
        }
    };

    const stopMicrophone = () => {
        processorRef.current?.disconnect();
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
        }
        setIsRecording(false);
        addLog("Stopped.");
    };

    const playAudioBase64 = (base64: string) => {
        if (!audioCtxRef.current) {
            const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
            audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
        }
        try {
            const ctx = audioCtxRef.current!;
            const binaryStr = atob(base64);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
            const float32 = new Float32Array(new Int16Array(bytes.buffer).length);
            const int16 = new Int16Array(bytes.buffer);
            for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;
            const buffer = ctx.createBuffer(1, float32.length, 24000);
            buffer.getChannelData(0).set(float32);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);

            const currentTime = ctx.currentTime;
            if (nextPlayTimeRef.current < currentTime) nextPlayTimeRef.current = currentTime;
            source.start(nextPlayTimeRef.current);
            nextPlayTimeRef.current += buffer.duration;
        } catch (e) { }
    };

    // --- VISION HANDLING UTILS ---

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        if (visionIntervalRef.current) clearInterval(visionIntervalRef.current);
        setIsCameraOn(false);
        addLog("Camera disabled.");
    };

    const startCamera = async (mode: "user" | "environment") => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraOn(true);
            setFacingMode(mode);
            addLog(`Camera enabled (${mode === 'user' ? 'Front' : 'Back'}).`);

            // Start sending frames to Gemini if socket is open
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                startVisionStream();
            }
        } catch (err) {
            setError("Failed to access webcam. If you are on a phone, try the switch button.");
            console.error(err);
        }
    };

    const toggleCamera = async () => {
        if (isCameraOn) {
            stopCamera();
        } else {
            await startCamera(facingMode);
        }
    };

    const switchCamera = async () => {
        const nextMode = facingMode === "user" ? "environment" : "user";
        if (isCameraOn) {
            stopCamera();
            await startCamera(nextMode);
        } else {
            setFacingMode(nextMode);
            addLog(`Switching target to ${nextMode === 'user' ? 'Front' : 'Back'} camera.`);
        }
    };

    const startVisionStream = () => {
        // Send a frame every 1 second (1000ms) to save bandwidth
        visionIntervalRef.current = setInterval(() => {
            if (!videoRef.current || !canvasRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Ensure video is playing
            if (video.videoWidth === 0) return;

            // Downscale the image to 640x360 for faster processing
            canvas.width = 640;
            canvas.height = 360;
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Compress to JPEG
            const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
            const base64Image = dataUrl.split(',')[1];

            // Stream frame to Gemini
            wsRef.current.send(JSON.stringify({
                realtimeInput: { mediaChunks: [{ mimeType: "image/jpeg", data: base64Image }] }
            }));
        }, 1000);
    };

    return (
        <div className="p-6 bg-white/10 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] mt-8 border border-white/20 relative overflow-hidden group transition-all duration-500 hover:shadow-blue-500/10 hover:border-blue-500/20">
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full shadow-[0_0_15px_currentColor] transition-all duration-500 ${isConnected ? 'bg-green-400 text-green-400' : 'bg-blue-500 text-blue-500 animate-pulse'}`}></div>
                        LUMISAI
                    </h2>
                    <button
                        onClick={() => setShowLogs(!showLogs)}
                        className="text-[10px] font-bold text-white/30 hover:text-white/60 uppercase tracking-widest transition-colors"
                    >
                        {showLogs ? "Hide Logs" : "Show Logs"}
                    </button>
                </div>

                {showLogs && (
                    <div className="bg-black/60 backdrop-blur-md p-3 rounded-2xl mb-6 h-32 overflow-y-auto font-mono text-[10px] text-blue-300 border border-white/5 scrollbar-hide">
                        {logs.map((L, i) => <div key={i} className="mb-1 border-b border-white/5 pb-1 last:border-0">{L}</div>)}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-200 text-xs font-medium leading-relaxed shadow-lg">
                        <span className="font-bold text-red-400 mr-2">!</span> {error}
                    </div>
                )}

                {!isConnected ? (
                    <button
                        onClick={connectToGemini}
                        className="w-full py-5 bg-white text-black font-black text-sm rounded-2xl shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-widest"
                    >
                        Initialize Vision
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center p-8 bg-black/20 rounded-3xl border border-white/5 relative overflow-hidden">
                            {/* Visualizer Placeholder/Effect */}
                            {isRecording && (
                                <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-40">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="w-1 h-12 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                                    ))}
                                </div>
                            )}

                            <button
                                onMouseDown={startMicrophone}
                                onMouseUp={stopMicrophone}
                                onMouseLeave={stopMicrophone}
                                onTouchStart={startMicrophone}
                                onTouchEnd={stopMicrophone}
                                className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${isRecording ? 'bg-red-500 scale-110 shadow-[0_0_40px_rgba(239,68,68,0.5)]' : 'bg-white text-black shadow-2xl hover:scale-105'}`}
                            >
                                {isRecording ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6.75 6.75 0 1 0 0-13.5 6.75 6.75 0 0 0 0 13.5zM12 12V9m0 6v-3" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6.75 6.75 0 1 0 0-13.5 6.75 6.75 0 0 0 0 13.5zM12 12V9m0 6v-3" />
                                    </svg>
                                )}
                            </button>
                            <p className="mt-4 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                                {isRecording ? "Listening..." : "Hold to command"}
                            </p>
                        </div>

                        {/* --- VISION UI --- */}
                        <div className="mt-6 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Vision System</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={switchCamera}
                                        className="px-3 py-1 text-[10px] font-bold rounded-full bg-white/5 text-white/40 hover:bg-white/10 transition-all border border-white/5"
                                    >
                                        SWITCH
                                    </button>
                                    <button
                                        onClick={toggleCamera}
                                        className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${isCameraOn ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
                                    >
                                        {isCameraOn ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                            </div>

                            {/* The Video Feed Container */}
                            <div className={`relative w-full aspect-video bg-black/40 rounded-xl overflow-hidden border transition-all duration-500 ${isCameraOn ? 'border-blue-500/50 shadow-xl shadow-blue-500/10' : 'border-white/5'}`}>
                                {!isCameraOn && (
                                    <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs font-bold uppercase tracking-widest">
                                        Camera Disabled
                                    </div>
                                )}
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={`w-full h-full object-cover transition-opacity duration-500 ${isCameraOn ? 'opacity-100' : 'opacity-0'}`}
                                />
                                {/* Hidden canvas for capturing frames */}
                                <canvas ref={canvasRef} style={{ display: 'none' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
