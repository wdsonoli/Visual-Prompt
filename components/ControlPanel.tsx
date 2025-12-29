
import React from 'react';
import { PromptSettings, TargetPlatform, STYLE_TEMPLATES, DETAIL_LEVEL_MAP } from '../types';
import { 
    Settings, Zap, Cog, Type, 
    User, Mountain, Smile, Package, Hexagon, Cpu, 
    BookTemplate, Box, Shirt, Smartphone, PenTool, Users, 
    Activity, Sun, Maximize, Target, Aperture, Monitor, Instagram, Camera,
    Ban, PlusCircle, Brain, Sparkles, Globe, Layout, Bot, Eye, Loader2
} from 'lucide-react';

interface ControlPanelProps {
    settings: PromptSettings;
    onSettingsChange: (settings: PromptSettings) => void;
    onGenerate: () => void;
    onAnalyzeGemini: () => void;
    onAnalyzeTF: () => void;
    onAnalyzeOpenAI: () => void;
    onAnalyzeDeepseek: () => void;
    onAnalyzeGoogleVision: () => void;
    onAnalyzeImageFX: () => void;
    onOpenSettings: () => void;
    isGeneratingGemini: boolean;
    isGeneratingTF: boolean;
    isGeneratingOpenAI: boolean;
    isGeneratingDeepseek: boolean;
    isGeneratingGoogleVision: boolean;
    isGeneratingImageFX: boolean;
    hasImage: boolean;
}

const LIGHTING_OPTIONS = [
    { id: 'auto', label: 'Auto', icon: Zap },
    { id: 'studio', label: 'Studio', icon: Aperture },
    { id: 'cinematic', label: 'Cinematic', icon: Camera },
    { id: 'golden_hour', label: 'Golden Hour', icon: Sun },
    { id: 'neon', label: 'Neon/Cyber', icon: Cpu },
    { id: 'moody', label: 'Moody', icon: Hexagon },
    { id: 'natural', label: 'Natural', icon: Mountain },
];

const ASPECT_RATIOS = [
    { id: '1:1', label: '1:1 Square', icon: Instagram },
    { id: '9:16', label: '9:16 Stories', icon: Smartphone },
    { id: '16:9', label: '16:9 YouTube', icon: Monitor },
    { id: '4:5', label: '4:5 Portrait', icon: Layout },
    { id: '3:2', label: '3:2 Classic', icon: Box },
];

const COMPOSITIONS = [
    { id: 'auto', label: 'Auto', icon: Target },
    { id: 'macro', label: 'Macro', icon: Aperture },
    { id: 'wide_angle', label: 'Wide Angle', icon: Maximize },
    { id: 'close_up', label: 'Close-up', icon: User },
    { id: 'aerial', label: 'Aerial/Drone', icon: Mountain },
    { id: 'eye_level', label: 'Eye Level', icon: Smile },
];

const TEMPLATES = [
    { id: 'character', label: 'Character', icon: User, prompt: 'Full body character design of [subject], detailed costume, dynamic pose, concept art', category: 'general' },
    { id: 'multi_pose', label: 'Studio Multi-Pose', icon: Users, prompt: 'Create a professional studio photo of [subject] with 100% facial fidelity and a dynamic pose. Shot from the hip up with a neutral gray studio background.', category: 'general' },
    { id: 'landscape', label: 'Landscape', icon: Mountain, prompt: 'Breathtaking landscape of [location], golden hour, wide shot, highly detailed environment, cinematic', category: 'general' },
    { id: 'portrait', label: 'Portrait', icon: Smile, prompt: 'Close-up portrait of [subject], highly detailed facial features, soft studio lighting, bokeh', category: 'general' },
    { id: 'logo', label: 'Logo', icon: PenTool, prompt: 'Minimalist vector logo design of [subject], flat colors, geometric shapes, professional brand identity', category: 'general' },
    { id: 'product', label: 'Product', icon: Package, prompt: 'Professional product photography of [product], studio lighting, clean background, 8k, sharp focus', category: 'mockup' },
    { id: 'mockup', label: 'White Box', icon: Box, prompt: 'Blank white [subject] mockup, matte finish, clean surface, isolated on white background, studio lighting', category: 'mockup' },
    { id: 'tshirt', label: 'T-Shirt', icon: Shirt, prompt: 'Blank t-shirt mockup, flat lay, high quality fabric texture, studio lighting', category: 'mockup' },
    { id: 'app_ui', label: 'App UI', icon: Smartphone, prompt: 'Modern mobile app UI design for [subject], clean interface, user experience, figma style', category: 'mockup' },
];

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
    settings, 
    onSettingsChange, 
    onGenerate,
    onAnalyzeGemini,
    onAnalyzeTF,
    onAnalyzeOpenAI,
    onAnalyzeDeepseek,
    onAnalyzeGoogleVision,
    onAnalyzeImageFX,
    onOpenSettings,
    isGeneratingGemini,
    isGeneratingTF,
    isGeneratingOpenAI,
    isGeneratingDeepseek,
    isGeneratingGoogleVision,
    isGeneratingImageFX,
    hasImage
}) => {
    const activeTab = settings.mode;

    const handleChange = (key: keyof PromptSettings, value: any) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    const handleModeChange = (mode: 'general' | 'mockup') => {
        onSettingsChange({ ...settings, mode });
    };

    const applyTemplate = (templateId: string, templatePrompt: string) => {
        onSettingsChange({
            ...settings,
            basePrompt: templatePrompt,
            activeTemplateId: templateId
        });
    };

    const isAutoDetail = settings.detailLevel === 'auto';
    const currentDetailValue = isAutoDetail ? 5 : settings.detailLevel as number;
    const currentDetailInfo = DETAIL_LEVEL_MAP[currentDetailValue];

    return (
        <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 backdrop-blur-sm h-full flex flex-col relative shadow-2xl">
            <button 
                onClick={onOpenSettings} 
                className="absolute top-6 right-6 text-slate-500 hover:text-blue-400 transition-colors p-1"
                title="Configurações de API"
            >
                <Cog size={20} />
            </button>

            <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
                <Settings size={20} />
                <span>Configuração Profissional</span>
            </h2>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                
                {/* AI Engines Vision Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                        <Sparkles size={14} className="text-violet-400"/>
                        <span>Motores de IA (Visão)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <button 
                            disabled={!hasImage || isGeneratingGemini}
                            onClick={onAnalyzeGemini}
                            className="flex flex-col items-center gap-1.5 px-2 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[8px] font-bold text-violet-300 hover:border-violet-500 hover:bg-violet-500/10 transition-all disabled:opacity-50 group"
                        >
                            {isGeneratingGemini ? <Loader2 size={14} className="animate-spin text-violet-400" /> : <Bot size={14} className="text-violet-400 group-hover:scale-110 transition-transform"/>}
                            GEMINI 3.0
                        </button>
                        <button 
                            disabled={!hasImage || isGeneratingOpenAI}
                            onClick={onAnalyzeOpenAI}
                            className="flex flex-col items-center gap-1.5 px-2 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[8px] font-bold text-emerald-300 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all disabled:opacity-50 group"
                        >
                            {isGeneratingOpenAI ? <Loader2 size={14} className="animate-spin text-emerald-400" /> : <Globe size={14} className="text-emerald-400 group-hover:scale-110 transition-transform"/>}
                            GPT-4O
                        </button>
                        <button 
                            disabled={!hasImage || isGeneratingDeepseek}
                            onClick={onAnalyzeDeepseek}
                            className="flex flex-col items-center gap-1.5 px-2 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[8px] font-bold text-blue-300 hover:border-blue-500 hover:bg-blue-500/10 transition-all disabled:opacity-50 group"
                        >
                            {isGeneratingDeepseek ? <Loader2 size={14} className="animate-spin text-blue-400" /> : <Brain size={14} className="text-blue-400 group-hover:scale-110 transition-transform"/>}
                            DEEPSEEK
                        </button>
                    </div>
                </div>

                {/* Quick Templates Section */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                        <BookTemplate size={14} className="text-blue-400"/>
                        <span>Templates Rápidos</span>
                    </div>
                    <div className="bg-slate-900/50 p-1 rounded-lg flex gap-1">
                        {['general', 'mockup'].map((m) => (
                            <button 
                                key={m}
                                onClick={() => handleModeChange(m as any)}
                                className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all uppercase ${
                                    activeTab === m ? 'bg-slate-700 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                                }`}
                            >
                                {m === 'general' ? 'Geral' : 'Mockups'}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {TEMPLATES.filter(t => t.category === activeTab).map(t => (
                            <button
                                key={t.id}
                                onClick={() => applyTemplate(t.id, t.prompt)}
                                className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border transition-all ${settings.activeTemplateId === t.id ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                            >
                                <t.icon size={14} />
                                <span className="text-[8px] font-bold uppercase truncate w-full text-center leading-tight">{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Prompts Block (Base, Negativo, Extras) */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                            <Type size={14} className="text-blue-400"/>
                            <span>Prompt Principal</span>
                        </div>
                        <textarea
                            value={settings.basePrompt}
                            onChange={(e) => handleChange('basePrompt', e.target.value)}
                            placeholder="Descreva o assunto principal..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-blue-500 outline-none resize-none h-20 transition-all custom-scrollbar"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                            <Ban size={14} className="text-red-400"/>
                            <span>Prompt Negativo</span>
                        </div>
                        <textarea
                            value={settings.negativePrompt}
                            onChange={(e) => handleChange('negativePrompt', e.target.value)}
                            placeholder="O que excluir (ex: text, low quality)..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-red-200/70 focus:ring-1 focus:ring-red-500 outline-none resize-none h-16 transition-all custom-scrollbar"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                            <PlusCircle size={14} className="text-emerald-400"/>
                            <span>Parâmetros Extras</span>
                        </div>
                        <input
                            type="text"
                            value={settings.extraParams}
                            onChange={(e) => handleChange('extraParams', e.target.value)}
                            placeholder="Tags adicionais ou parâmetros técnicos..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Formato / Social Media */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                        <Maximize size={14} className="text-blue-400"/>
                        <span>Formato / Social Media</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                        {ASPECT_RATIOS.map((ratio) => (
                            <button
                                key={ratio.id}
                                onClick={() => handleChange('aspectRatio', ratio.id)}
                                className={`flex flex-col items-center p-2 rounded-lg border transition-all ${settings.aspectRatio === ratio.id ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                                title={ratio.label}
                            >
                                <ratio.icon size={14} />
                                <span className="text-[8px] mt-1 font-mono">{ratio.id}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Iluminação Profissional */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                        <Sun size={14} className="text-blue-400"/>
                        <span>Iluminação Profissional</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {LIGHTING_OPTIONS.map((light) => (
                            <button
                                key={light.id}
                                onClick={() => handleChange('lighting', light.id)}
                                className={`flex flex-col items-center p-2 rounded-lg border transition-all ${settings.lighting === light.id ? 'bg-orange-500/10 border-orange-500 text-orange-400' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                            >
                                <light.icon size={14} />
                                <span className="text-[8px] mt-1 font-bold uppercase text-center leading-tight">{light.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Estilo de Enquadramento */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                        <Aperture size={14} className="text-blue-400"/>
                        <span>Estilo de Enquadramento</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {COMPOSITIONS.map((comp) => (
                            <button
                                key={comp.id}
                                onClick={() => handleChange('composition', comp.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${settings.composition === comp.id ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                            >
                                <comp.icon size={12} />
                                <span className="text-[9px] font-bold uppercase truncate">{comp.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Plataforma Alvo */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px] uppercase tracking-widest">
                        <Monitor size={14} className="text-blue-400"/>
                        <span>Plataforma Alvo</span>
                    </div>
                    <select 
                        value={settings.targetPlatform} 
                        onChange={(e) => handleChange('targetPlatform', e.target.value as TargetPlatform)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none hover:border-slate-500 transition-colors"
                    >
                        <option value="midjourney">Midjourney</option>
                        <option value="dalle">DALL-E 3</option>
                        <option value="freepik">Freepik / Pikaso</option>
                        <option value="stable_diffusion">Stable Diffusion</option>
                        <option value="google_imagefx">Google ImageFX</option>
                        <option value="whisk">Whisk</option>
                        <option value="chatgpt">ChatGPT DALL-E</option>
                        <option value="deepseek">Deepseek Art</option>
                    </select>
                </div>

                {/* Detalhamento Slider */}
                <div className="space-y-4 bg-slate-900/30 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-300 font-bold uppercase flex items-center gap-2"><Activity size={14} className="text-blue-400"/> Detalhamento</span>
                        <span className="text-blue-400 font-black">{isAutoDetail ? 'DYNAMIC' : currentDetailInfo.label.toUpperCase()}</span>
                    </div>
                    <input 
                        type="range" min="1" max="10" step="1" 
                        value={currentDetailValue} disabled={isAutoDetail}
                        onChange={(e) => handleChange('detailLevel', parseInt(e.target.value))}
                        className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${isAutoDetail ? 'bg-slate-800' : 'bg-slate-700 accent-blue-500'}`}
                    />
                </div>

                {/* Estética Base */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estética Base</label>
                    <select 
                        value={settings.style} onChange={(e) => handleChange('style', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none hover:border-slate-500 transition-colors"
                    >
                        {Object.keys(STYLE_TEMPLATES).map(s => <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>)}
                    </select>
                </div>
            </div>

            <div className="pt-4 mt-auto space-y-3">
                <button 
                    onClick={onGenerate} 
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-bold shadow-xl transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
                >
                    <Zap size={18} className="group-hover:animate-pulse" /> Gerar Prompt Técnico
                </button>
                
                <button 
                    disabled={!hasImage || isGeneratingGoogleVision}
                    onClick={onAnalyzeGoogleVision} 
                    className="w-full py-3 bg-blue-500/10 border border-blue-500/50 hover:bg-blue-500/20 text-blue-400 rounded-lg font-bold flex items-center justify-center gap-2 transition-all group active:scale-[0.98] disabled:opacity-50"
                >
                    {isGeneratingGoogleVision ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Eye size={18} className="group-hover:scale-110 transition-transform" />
                    )}
                    Google Vision Creator
                </button>
            </div>
        </div>
    );
};
