
import React from 'react';
import { Download, Maximize2, Sparkles, Loader2, X } from 'lucide-react';

interface GeneratedImageDisplayProps {
    imageUrl: string | null;
    isGenerating: boolean;
    onUpscale: () => void;
    onClose: () => void;
    isUpscaling: boolean;
}

export const GeneratedImageDisplay: React.FC<GeneratedImageDisplayProps> = ({ 
    imageUrl, 
    isGenerating, 
    onUpscale, 
    onClose,
    isUpscaling 
}) => {
    if (!imageUrl && !isGenerating) return null;

    return (
        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-xl flex flex-col mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-900/60 px-5 py-3 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <Sparkles size={18} className="text-yellow-400" />
                    Visual Result
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </div>

            <div className="relative min-h-[300px] flex items-center justify-center bg-slate-950/50 p-4">
                {isGenerating || isUpscaling ? (
                    <div className="flex flex-col items-center gap-4 py-20">
                        <Loader2 size={40} className="text-blue-500 animate-spin" />
                        <div className="text-center">
                            <p className="text-slate-200 font-medium">{isUpscaling ? 'Upscaling to 2K...' : 'Generating Image...'}</p>
                            <p className="text-slate-500 text-xs mt-1">Bringing your prompt to life with Gemini</p>
                        </div>
                    </div>
                ) : (
                    <div className="relative group">
                        <img 
                            src={imageUrl!} 
                            alt="Generated content" 
                            className="max-w-full rounded-lg shadow-2xl border border-slate-700"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <button 
                                onClick={onUpscale}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full font-medium transition-all transform translate-y-2 group-hover:translate-y-0"
                            >
                                <Maximize2 size={16} />
                                Upscale to 2K
                            </button>
                            <a 
                                href={imageUrl!} 
                                download="generated-image.png"
                                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-full font-medium transition-all transform translate-y-2 group-hover:translate-y-0"
                            >
                                <Download size={16} />
                                Download
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
