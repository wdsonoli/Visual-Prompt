
import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Zap } from 'lucide-react';

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startCamera = async () => {
        try {
            setError(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, 
                audio: false 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setIsReady(true);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Could not access camera. Please ensure permissions are granted.");
        }
    };

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (context) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    onCapture(file);
                }
            }, 'image/jpeg', 0.9);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <button 
                        onClick={onClose}
                        className="p-2 bg-slate-800/80 hover:bg-red-500 text-white rounded-full transition-colors shadow-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="relative aspect-video bg-black flex items-center justify-center">
                    {!isReady && !error && (
                        <div className="flex flex-col items-center gap-3">
                            <RefreshCw size={40} className="text-blue-500 animate-spin" />
                            <p className="text-slate-400 text-sm">Initializing camera...</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="text-center p-8">
                            <p className="text-red-400 mb-4">{error}</p>
                            <button 
                                onClick={startCamera}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className={`w-full h-full object-cover ${isReady ? 'opacity-100' : 'opacity-0'} transition-opacity`}
                    />
                    <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="p-6 bg-slate-900 border-t border-slate-800 flex items-center justify-center">
                    <button 
                        onClick={handleCapture}
                        disabled={!isReady}
                        className="group flex items-center justify-center w-16 h-16 bg-white rounded-full border-4 border-slate-700 hover:border-blue-500 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-xl"
                    >
                        <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                            <Camera size={24} className="text-white" />
                        </div>
                    </button>
                    
                    <div className="absolute left-8 text-slate-400 flex flex-col items-center gap-1 opacity-50">
                        <Zap size={16} className="text-yellow-500" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Snapshot</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
