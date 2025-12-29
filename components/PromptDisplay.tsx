
import React, { useState } from 'react';
import { Copy, Check, Terminal, Edit3, ImagePlus } from 'lucide-react';

interface PromptDisplayProps {
    prompt: string;
    onUpdatePrompt: (newPrompt: string) => void;
    onCreateImage: () => void;
    isGeneratingImage: boolean;
}

export const PromptDisplay: React.FC<PromptDisplayProps> = ({ prompt, onUpdatePrompt, onCreateImage, isGeneratingImage }) => {
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [localPrompt, setLocalPrompt] = useState(prompt);

    // Sync local state when prop changes
    React.useEffect(() => {
        setLocalPrompt(prompt);
    }, [prompt]);

    const handleCopy = async () => {
        if (!localPrompt) return;
        try {
            await navigator.clipboard.writeText(localPrompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleSave = () => {
        onUpdatePrompt(localPrompt);
        setIsEditing(false);
    };

    return (
        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-xl flex flex-col h-full min-h-[300px]">
            <div className="bg-slate-900/60 px-5 py-3 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <Terminal size={18} className="text-blue-400" />
                    Generated Prompt
                </div>
                
                <div className="flex items-center gap-2">
                     <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className={`p-1.5 rounded-lg transition-colors ${isEditing ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-blue-400 hover:bg-slate-700'}`}
                        title="Edit Prompt"
                    >
                        <Edit3 size={16} />
                    </button>
                    <button 
                        onClick={handleCopy}
                        disabled={!localPrompt}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-colors disabled:opacity-50"
                    >
                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>

            <div className="relative flex-1 p-0">
                {!localPrompt ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                            <Terminal size={32} className="opacity-50" />
                        </div>
                        <p>Analysis complete. Generated prompt will appear here.</p>
                        <p className="text-xs mt-2 text-slate-600">Click "Generate" or "AI Enhanced" to start.</p>
                    </div>
                ) : (
                    isEditing ? (
                         <div className="h-full flex flex-col">
                             <textarea 
                                value={localPrompt}
                                onChange={(e) => setLocalPrompt(e.target.value)}
                                className="flex-1 w-full bg-slate-900 p-5 text-slate-200 font-mono text-sm outline-none resize-none border-none focus:ring-0 leading-relaxed"
                                spellCheck={false}
                            />
                            <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-end">
                                <button onClick={handleSave} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-500">Save Changes</button>
                            </div>
                         </div>
                    ) : (
                        <div className="h-full w-full bg-slate-900 p-6 overflow-auto relative">
                             <p className="font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                                {localPrompt}
                            </p>
                             {/* Floating Create Image Button */}
                             <div className="sticky bottom-0 mt-4 flex justify-center">
                                <button 
                                    onClick={onCreateImage}
                                    disabled={isGeneratingImage}
                                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-6 py-2.5 rounded-full font-bold shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                >
                                    {isGeneratingImage ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <ImagePlus size={18} />
                                    )}
                                    Create Image
                                </button>
                             </div>
                        </div>
                    )
                )}
            </div>
            
            {localPrompt && !isEditing && (
                <div className="bg-slate-900 border-t border-slate-800 px-5 py-3 text-xs text-slate-500 font-mono flex justify-between">
                    <span>{localPrompt.length} chars</span>
                    <span>{localPrompt.split(/\s+/).filter(Boolean).length} words</span>
                </div>
            )}
        </div>
    );
};
