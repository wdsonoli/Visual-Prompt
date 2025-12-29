import React from 'react';
import { AnalysisResult } from '../types';
import { Palette, Sun, Contrast, Maximize, LayoutTemplate } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface AnalysisResultViewProps {
    analysis: AnalysisResult;
    imageName: string;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({ analysis, imageName }) => {
    return (
        <div className="bg-slate-800/40 border border-violet-500/30 rounded-xl mt-6">
            <div className="bg-violet-500/10 px-4 py-3 border-b border-violet-500/20 flex items-center justify-between rounded-t-xl">
                <div className="flex items-center gap-2 text-violet-400 font-semibold">
                    <Palette size={18} />
                    <span>Visual Analysis Report</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">{imageName}</span>
            </div>
            
            <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Colors Section */}
                    <div className="space-y-3">
                        <Tooltip content="The most frequent colors detected in the image." position="right">
                            <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider w-fit cursor-help">Detected Palette</h4>
                        </Tooltip>
                        <div className="flex gap-2">
                            {analysis.colors.dominantColors.map((color, idx) => (
                                <Tooltip key={idx} content={color} position="bottom" width="w-auto">
                                    <div 
                                        className="w-12 h-12 rounded-lg shadow-lg border border-white/10 transition-transform hover:scale-110 hover:z-10 cursor-help"
                                        style={{ backgroundColor: color }}
                                    />
                                </Tooltip>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Tooltip content="The overall color harmony classification of the image." position="right">
                                <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300 capitalize cursor-help">
                                    {analysis.colors.paletteType} Palette
                                </span>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <Tooltip content="Average luminance of the image pixels." position="top" className="w-full">
                            <StatItem 
                                icon={<Sun size={14} />} 
                                label="Brightness" 
                                value={analysis.brightness} 
                            />
                        </Tooltip>
                        <Tooltip content="Intensity of colors present in the image." position="top" className="w-full">
                            <StatItem 
                                icon={<LayoutTemplate size={14} />} 
                                label="Saturation" 
                                value={analysis.saturation} 
                            />
                        </Tooltip>
                        <Tooltip content="Difference between the lightest and darkest areas." position="bottom" className="w-full">
                            <StatItem 
                                icon={<Contrast size={14} />} 
                                label="Contrast" 
                                value={analysis.contrast} 
                            />
                        </Tooltip>
                        <Tooltip content="Detected aspect ratio category based on dimensions." position="bottom" className="w-full">
                            <StatItem 
                                icon={<Maximize size={14} />} 
                                label="Composition" 
                                value={analysis.composition} 
                            />
                        </Tooltip>
                    </div>
                </div>

                {/* Technical Details */}
                <div className="mt-6 pt-4 border-t border-slate-700/50 flex flex-wrap gap-4 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                        Resolution: <span className="text-slate-300">{analysis.stats.width}x{analysis.stats.height}</span>
                    </span>
                    <span className="flex items-center gap-1">
                        Aspect Ratio: <span className="text-slate-300">{analysis.stats.aspectRatio}:1</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="bg-slate-900/50 rounded-lg p-2.5 flex flex-col items-center justify-center border border-slate-700/50 w-full hover:border-violet-500/30 transition-colors cursor-help">
        <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            {icon}
            <span className="text-[10px] uppercase font-bold tracking-wide">{label}</span>
        </div>
        <span className="text-slate-200 font-medium capitalize text-sm">{value}</span>
    </div>
);