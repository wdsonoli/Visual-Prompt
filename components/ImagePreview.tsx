
import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, X, Move, Scissors } from 'lucide-react';

interface ImagePreviewProps {
    src: string;
    alt: string;
    onRemove: () => void;
    onRemoveBackground: () => void;
    isRemovingBackground: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ src, alt, onRemove, onRemoveBackground, isRemovingBackground }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.5, 4));
    
    const handleZoomOut = () => {
        setScale(prev => {
            const newScale = Math.max(prev - 0.5, 1);
            if (newScale === 1) setPosition({ x: 0, y: 0 });
            return newScale;
        });
    };
    
    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const onMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            e.preventDefault();
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const onMouseUp = () => setIsDragging(false);

    return (
        <div 
            ref={containerRef}
            className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl w-full h-[500px] flex items-center justify-center bg-slate-950/50 select-none"
            onMouseLeave={onMouseUp}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
        >
            <div 
                className="w-full h-full flex items-center justify-center overflow-hidden"
                onMouseDown={onMouseDown}
                style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
                <img 
                    src={src} 
                    alt={alt} 
                    draggable={false}
                    className={`max-w-full max-h-full object-contain transition-transform duration-200 ease-out origin-center ${isRemovingBackground ? 'brightness-110 grayscale-[0.5]' : ''}`}
                    style={{ 
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` 
                    }}
                />
            </div>

            <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                    onClick={onRemoveBackground}
                    className={`p-2 rounded-lg flex items-center gap-2 text-xs font-semibold backdrop-blur-md border transition-all ${isRemovingBackground ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:bg-slate-800'}`}
                    title="Toggle Background Removal Prompt"
                >
                    <Scissors size={14} />
                    {isRemovingBackground ? 'BG Removed' : 'Remove BG'}
                </button>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
                <button onClick={handleZoomOut} disabled={scale <= 1} className="p-1.5 hover:bg-slate-700 rounded-full text-slate-300 disabled:opacity-50 transition-colors">
                    <ZoomOut size={16} />
                </button>
                <span className="text-xs font-mono text-slate-400 w-12 text-center">{Math.round(scale * 100)}%</span>
                <button onClick={handleZoomIn} disabled={scale >= 4} className="p-1.5 hover:bg-slate-700 rounded-full text-slate-300 disabled:opacity-50 transition-colors">
                    <ZoomIn size={16} />
                </button>
                <div className="w-px h-4 bg-slate-700 mx-1"></div>
                <button onClick={handleReset} className="p-1.5 hover:bg-slate-700 rounded-full text-slate-300 transition-colors">
                    <RotateCcw size={16} />
                </button>
            </div>

            <button 
                onClick={onRemove}
                className="absolute top-3 right-3 z-20 p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
            >
                <X size={16} />
            </button>
        </div>
    );
};
