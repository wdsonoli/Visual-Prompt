
import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface DropZoneProps {
    onFilesSelected: (files: File[]) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = (Array.from(e.dataTransfer.files) as File[]).filter(file => file.type.startsWith('image/'));
        if (files.length > 0) {
            onFilesSelected(files);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(Array.from(e.target.files));
        }
    };

    return (
        <div 
            className={`
                relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 group
                ${isDragOver 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-slate-600 hover:border-blue-400 hover:bg-slate-800/50 bg-slate-800/20'
                }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*" 
                multiple
                onChange={handleFileChange}
            />
            
            <div className="flex flex-col items-center justify-center space-y-4">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-4 rounded-full bg-slate-800 transition-transform duration-300 cursor-pointer ${isDragOver ? 'scale-110 text-blue-400' : 'text-slate-400 group-hover:text-blue-400'}`}
                >
                    {isDragOver ? <Upload size={40} /> : <ImageIcon size={40} />}
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-1">
                        {isDragOver ? 'Drop images here' : 'Drag & drop images here'}
                    </h3>
                    <p className="text-slate-400 text-sm">
                        Supports JPEG, PNG, WebP • Max 5MB per file
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors flex items-center gap-2"
                    >
                        <Upload size={16} />
                        Select Files
                    </button>
                </div>
            </div>
        </div>
    );
};
