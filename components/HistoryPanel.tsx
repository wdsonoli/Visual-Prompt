
import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { History, X, Trash2, Eye, Trash, ChevronDown } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface HistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryItem[];
    onRevisit: (id: string) => void;
    onDelete: (id: string) => void;
    onClear: () => void;
}

const HistoryItemCard: React.FC<{ item: HistoryItem, onRevisit: (id: string) => void, onDelete: (id: string) => void }> = ({ item, onRevisit, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    const baseImageUrl = `data:${item.baseImage.mimeType};base64,${item.baseImage.base64Data}`;

    return (
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
            <div className="p-3 flex items-start gap-3">
                <img src={baseImageUrl} alt="Base image" className="w-12 h-12 rounded-md object-cover flex-shrink-0 bg-slate-700" />
                <div className="flex-1 min-w-0">
                    <p className={`text-xs text-slate-300 font-mono transition-all duration-300 ${isExpanded ? 'line-clamp-none' : 'line-clamp-2'}`}>
                        {item.prompt}
                    </p>
                     <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-400 text-[10px] font-bold mt-1 flex items-center gap-1">
                        {isExpanded ? 'Show Less' : 'Show More'} <ChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
                <img src={item.generatedImageUrl} alt="Generated image" className="w-12 h-12 rounded-md object-cover flex-shrink-0 bg-slate-700" />
            </div>
            <div className="bg-slate-900/50 px-3 py-2 border-t border-slate-700 flex justify-between items-center">
                <span className="text-slate-500 text-[10px] font-mono">{timeAgo(item.timestamp)}</span>
                <div className="flex items-center gap-1">
                    <Tooltip content="Revisit this state">
                        <button onClick={() => onRevisit(item.id)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-md transition-colors"><Eye size={14} /></button>
                    </Tooltip>
                     <Tooltip content="Delete this item">
                        <button onClick={() => onDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-md transition-colors"><Trash size={14} /></button>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};


export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onRevisit, onDelete, onClear }) => {
    const [isClearing, setIsClearing] = useState(false);

    const handleClear = () => {
        setIsClearing(true);
        setTimeout(() => {
            onClear();
            setIsClearing(false);
        }, 300); // Animation delay
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[90] flex justify-end" onClick={onClose}>
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            />
            <div
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-md h-full bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ animation: isOpen ? 'slide-in-from-right 0.3s ease-out' : 'slide-out-to-right 0.3s ease-in' }}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                        <History size={18} className="text-blue-400" />
                        Generation History
                    </h3>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleClear} 
                            disabled={history.length === 0}
                            className="text-xs text-red-400/80 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                            <Trash2 size={14} /> Clear All
                        </button>
                        <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {history.length > 0 ? (
                        history.map(item => (
                            <HistoryItemCard key={item.id} item={item} onRevisit={onRevisit} onDelete={onDelete} />
                        ))
                    ) : (
                         <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center p-8">
                            <History size={40} className="mb-4 opacity-50" />
                            <p className="font-medium">No history yet.</p>
                            <p className="text-sm mt-1">Generated images will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
