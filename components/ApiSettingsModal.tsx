
import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, ExternalLink, Bot, Brain } from 'lucide-react';

interface ApiSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (openAIKey: string, deepseekKey: string) => void;
    initialOpenAIKey: string;
    initialDeepseekKey: string;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialOpenAIKey,
    initialDeepseekKey
}) => {
    const [openAIKey, setOpenAIKey] = useState(initialOpenAIKey);
    const [deepseekKey, setDeepseekKey] = useState(initialDeepseekKey);

    useEffect(() => {
        setOpenAIKey(initialOpenAIKey);
        setDeepseekKey(initialDeepseekKey);
    }, [initialOpenAIKey, initialDeepseekKey, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(openAIKey, deepseekKey);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
                    <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                        <Key size={18} className="text-blue-400" />
                        API Configuration
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-4 flex gap-3">
                        <ShieldCheck size={24} className="text-blue-400 shrink-0" />
                        <div className="text-sm text-blue-200/80">
                            Keys are stored locally in your browser.
                        </div>
                    </div>

                    {/* OpenAI Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <Bot size={14} className="text-emerald-400"/> OpenAI API Key
                        </label>
                        <input 
                            type="password" 
                            value={openAIKey}
                            onChange={(e) => setOpenAIKey(e.target.value)}
                            placeholder="sk-..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                        />
                    </div>

                    {/* Deepseek Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <Brain size={14} className="text-blue-400"/> Deepseek API Key
                        </label>
                        <input 
                            type="password" 
                            value={deepseekKey}
                            onChange={(e) => setDeepseekKey(e.target.value)}
                            placeholder="ds-..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                        />
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-800 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};
