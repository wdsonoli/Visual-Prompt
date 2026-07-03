
import React, { useState, useEffect } from 'react';
import { DropZone } from './components/DropZone';
import { ControlPanel } from './components/ControlPanel';
import { PromptDisplay } from './components/PromptDisplay';
import { AnalysisResultView } from './components/AnalysisResultView';
import { ImagePreview } from './components/ImagePreview';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { GeneratedImageDisplay } from './components/GeneratedImageDisplay';
import { HistoryPanel } from './components/HistoryPanel';
import { UploadedImage, PromptSettings, STYLE_TEMPLATES, DETAIL_LEVEL_MAP, HistoryItem } from './types';
import { analyzeImage } from './utils/analysis';
import { generateGeminiPrompt } from './services/geminiService';
import { generateOpenAIPrompt } from './services/openaiService';
import { generateDeepseekPrompt } from './services/deepseekService';
import { generateImage } from './services/imageGenService';
import { classifyImageMobileNet } from './services/tfService';
import { AlertCircle, Brain, Bot, Zap, Globe, History } from 'lucide-react';

const convertAvifToJpeg = (file: File): Promise<{ file: File, previewUrl: string, base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            return reject(new Error('Canvas toBlob failed'));
                        }
                        const newFileName = file.name.replace(/\.avif$/i, '.jpeg');
                        const newFile = new File([blob], newFileName, { type: 'image/jpeg' });
                        const newPreviewUrl = URL.createObjectURL(newFile);
                        
                        const base64Reader = new FileReader();
                        base64Reader.onloadend = () => {
                            const base64 = (base64Reader.result as string).split(',')[1];
                            resolve({
                                file: newFile,
                                previewUrl: newPreviewUrl,
                                base64,
                                mimeType: 'image/jpeg'
                            });
                        };
                        base64Reader.onerror = (err) => reject(err);
                        base64Reader.readAsDataURL(newFile);

                    },
                    'image/jpeg',
                    0.95 // quality
                );
            };
            img.onerror = (err) => reject(new Error(`Image load error: ${err}`));
            if (e.target?.result) {
                img.src = e.target.result as string;
            } else {
                reject(new Error("FileReader result is null"));
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
};

const base64StringToFile = (base64String: string, filename: string, mimeType: string): File => {
    const byteCharacters = atob(base64String);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, { type: mimeType });
    return new File([blob], filename, { type: mimeType });
};


const App: React.FC = () => {
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [isGeneratingGemini, setIsGeneratingGemini] = useState(false);
    const [isGeneratingDeepseek, setIsGeneratingDeepseek] = useState(false);
    const [isGeneratingOpenAI, setIsGeneratingOpenAI] = useState(false);
    const [isGeneratingGoogleVision, setIsGeneratingGoogleVision] = useState(false);
    const [isGeneratingImageFX, setIsGeneratingImageFX] = useState(false);
    const [isGeneratingTF, setIsGeneratingTF] = useState(false);
    const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
    const [isUpscalingVisual, setIsUpscalingVisual] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    
    const [openAIKey, setOpenAIKey] = useState<string>(localStorage.getItem('openai_api_key') || '');
    const [deepseekKey, setDeepseekKey] = useState<string>(localStorage.getItem('deepseek_api_key') || '');
    
    const [settings, setSettings] = useState<PromptSettings>({
        basePrompt: '',
        negativePrompt: '',
        style: 'photorealistic',
        detailLevel: 5,
        lighting: 'auto',
        composition: 'auto',
        aspectRatio: '1:1',
        removeBackground: false,
        targetPlatform: 'midjourney',
        extraParams: '',
        mode: 'general',
        activeTemplateId: '',
        shadowOpacity: 100
    });

    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('promptHistory');
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (error) {
            console.error("Failed to load history from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('promptHistory', JSON.stringify(history));
        } catch (error) {
            console.error("Failed to save history to localStorage", error);
        }
    }, [history]);

    const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
        const newItem: HistoryItem = {
            ...item,
            id: Date.now().toString(),
            timestamp: Date.now()
        };
        setHistory(prev => [newItem, ...prev].slice(0, 50)); // Keep max 50 items
    };

    const handleRevisitHistory = async (id: string) => {
        const item = history.find(h => h.id === id);
        if (!item) return;

        const file = base64StringToFile(item.baseImage.base64Data, item.baseImage.name, item.baseImage.mimeType);
        const previewUrl = URL.createObjectURL(file);
        
        const newImage: UploadedImage = {
            id: `history-${item.id}`, file, previewUrl, name: file.name, analysis: null,
            base64Data: item.baseImage.base64Data, mimeType: item.baseImage.mimeType,
        };
        setImages([newImage]);
        setSelectedImageId(newImage.id);

        try {
            const analysis = await analyzeImage(file);
            setImages(prev => prev.map(img => img.id === newImage.id ? { ...img, analysis } : img));
        } catch (err) {
            console.error("Failed to re-analyze history image", err);
        }

        setSettings(item.settings);
        setPrompt(item.prompt);
        setGeneratedImageUrl(item.generatedImageUrl);
        setIsHistoryOpen(false);
    };

    const handleDeleteHistory = (id: string) => {
        setHistory(prev => prev.filter(item => item.id !== id));
    };

    const handleClearHistory = () => {
        setHistory([]);
    };


    const saveApiKeys = (newOpenAIKey: string, newDeepseekKey: string) => {
        setOpenAIKey(newOpenAIKey);
        setDeepseekKey(newDeepseekKey);
        localStorage.setItem('openai_api_key', newOpenAIKey);
        localStorage.setItem('deepseek_api_key', newDeepseekKey);
        setError(null);
    };

    const activeImage = images.find(img => img.id === selectedImageId) || null;

    const handleFilesSelected = async (files: File[]) => {
        setError(null);
        let originalFile = files[0];
        if (!originalFile) return;

        const MAX_SIZE_MB = 20;
        if (originalFile.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
            return;
        }

        // Handle JIFF files that might not have a correct MIME type by treating them as JPEG
        if (originalFile.name.toLowerCase().endsWith('.jiff') && !originalFile.type.startsWith('image/')) {
            originalFile = new File([originalFile], originalFile.name, { type: 'image/jpeg' });
        }

        if (activeImage) {
            URL.revokeObjectURL(activeImage.previewUrl);
        }

        let fileToProcess = originalFile;
        let previewUrl: string;
        let base64Data: string | undefined;
        let mimeType: string | undefined;

        if (originalFile.type === 'image/avif') {
            try {
                const converted = await convertAvifToJpeg(originalFile);
                fileToProcess = converted.file;
                previewUrl = converted.previewUrl;
                base64Data = converted.base64;
                mimeType = converted.mimeType;
            } catch (err) {
                console.error("AVIF conversion failed:", err);
                setError("Failed to convert AVIF image. It might be corrupted or in an unsupported format.");
                return;
            }
        } else {
            previewUrl = URL.createObjectURL(originalFile);
        }

        const tempId = Date.now().toString();
        const newImage: UploadedImage = { id: tempId, file: fileToProcess, previewUrl, name: fileToProcess.name, analysis: null };
        setImages([newImage]);
        setSelectedImageId(tempId);

        try {
            const analysis = await analyzeImage(fileToProcess);
            
            if (base64Data && mimeType) {
                 setImages(prev => prev.map(img => img.id === tempId ? { ...img, analysis, base64Data, mimeType } : img));
            } else {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    setImages(prev => prev.map(img => img.id === tempId ? { ...img, analysis, base64Data: base64, mimeType: fileToProcess.type } : img));
                };
                reader.readAsDataURL(fileToProcess);
            }
        } catch (err) {
            setError("Falha no processamento da imagem.");
        }
    };

    const handleDeepseekAnalysis = async () => {
        if (!activeImage) return;
        if (!deepseekKey) { setError("Adicione a chave Deepseek nas configurações."); return; }
        setIsGeneratingDeepseek(true);
        try {
            const result = await generateDeepseekPrompt(activeImage.file, deepseekKey, settings, activeImage.base64Data ? { base64: activeImage.base64Data, mimeType: activeImage.mimeType! } : undefined);
            setPrompt(result);
        } catch (err: any) {
            setError(err.message || "Falha na análise Deepseek.");
        } finally {
            setIsGeneratingDeepseek(false);
        }
    };

    const handleGeminiAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingGemini(true); 
        try { 
            const result = await generateGeminiPrompt(activeImage.file, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
        } catch (err: any) {
            setError(err.message || "Falha na análise Gemini.");
        } finally { 
            setIsGeneratingGemini(false); 
        } 
    };

    const handleGoogleVisionAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingGoogleVision(true);
        try {
            // Reutiliza Gemini mas forçando contexto de análise técnica visual
            const result = await generateGeminiPrompt(activeImage.file, { ...settings, targetPlatform: 'google_imagefx' }, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
        } catch (err: any) {
            setError(err.message || "Falha na análise Google Vision.");
        } finally {
            setIsGeneratingGoogleVision(false);
        }
    };

    const handleImageFXAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingImageFX(true);
        try {
            // Otimizado para o motor ImageFX do Google
            const result = await generateGeminiPrompt(activeImage.file, { ...settings, targetPlatform: 'google_imagefx' }, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
        } catch (err: any) {
            setError(err.message || "Falha na análise ImageFX.");
        } finally {
            setIsGeneratingImageFX(false);
        }
    };

    const handleOpenAIAnalysis = async () => {
        if (!activeImage) return;
        if (!openAIKey) { setError("Adicione a chave OpenAI nas configurações."); return; }
        setIsGeneratingOpenAI(true); 
        try { 
            const result = await generateOpenAIPrompt(activeImage.file, openAIKey, settings, { base64: activeImage.base64Data!, mimeType: activeImage.mimeType! });
            setPrompt(result);
        } catch (err: any) {
            setError(err.message || "Falha na análise OpenAI.");
        } finally { 
            setIsGeneratingOpenAI(false); 
        } 
    };

    const handleTFAnalysis = async () => {
        if (!activeImage) return;
        setIsGeneratingTF(true);
        try {
            const result = await classifyImageMobileNet(activeImage.file, settings);
            setPrompt(result);
        } catch (err: any) {
            setError(err.message || "Falha na análise TensorFlow.");
        } finally {
            setIsGeneratingTF(false);
        }
    };

    const handleCreateVisual = async () => {
        if (!prompt) return;
        setIsGeneratingVisual(true);
        try {
            const imageContext = activeImage?.base64Data ? { base64: activeImage.base64Data, mimeType: activeImage.mimeType! } : undefined;
            const url = await generateImage(prompt, false, imageContext);
            setGeneratedImageUrl(url);
            
            if (activeImage?.base64Data && activeImage.mimeType) {
                addToHistory({
                    prompt,
                    generatedImageUrl: url,
                    baseImage: {
                        base64Data: activeImage.base64Data,
                        mimeType: activeImage.mimeType,
                        name: activeImage.name,
                    },
                    settings,
                });
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGeneratingVisual(false);
        }
    };

    const handleGeneratePrompt = () => {
        let p = settings.basePrompt || "A high quality visual";
        const analysis = activeImage?.analysis;

        if (analysis) {
            const subjectType = analysis.composition === 'portrait' ? 'person' : 'subject';
            p = p.replace(/\[subject\]/gi, subjectType);
            p = p.replace(/\[product\]/gi, 'product');
            p = p.replace(/\[location\]/gi, 'landscape');
            if (analysis.colors.dominantColors.length > 0) {
                p += `, ${analysis.colors.paletteType} color scheme`;
            }
        }
        
        p += `, ${STYLE_TEMPLATES[settings.style]}`;
        if (settings.lighting !== 'auto') p += `, ${settings.lighting.replace('_', ' ')} lighting`;
        if (settings.composition !== 'auto') p += `, ${settings.composition.replace('_', ' ')} shot`;
        
        const detailInfo = DETAIL_LEVEL_MAP[settings.detailLevel === 'auto' ? 5 : settings.detailLevel];
        p += `, ${detailInfo.keywords.join(", ")}`;

        // Shadow settings
        if (settings.shadowOpacity !== 100) {
            p += `, shadow intensity ${settings.shadowOpacity}%`;
        }
        
        if (settings.removeBackground || settings.mode === 'mockup') {
            p += ", clean isolated background";
            if (settings.mode === 'mockup') p += ", professional mockup, no text, no branding";
        }

        if (settings.extraParams) p += `, ${settings.extraParams}`;

        if (settings.negativePrompt) {
            if (settings.targetPlatform === 'midjourney') p += ` --no ${settings.negativePrompt}`;
            else p += `, without: ${settings.negativePrompt}`;
        }
        
        setPrompt(p);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-500 to-violet-600 p-2 rounded-lg"><Zap size={24} /></div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">Visual Prompt Architect</h1>
                    </div>
                    <button 
                        onClick={() => setIsHistoryOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
                        title="View History"
                    >
                        <History size={16} />
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
                {error && <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg flex items-center justify-between"><span className="text-sm">{error}</span></div>}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-5 space-y-6">
                        {!activeImage ? (
                            <DropZone 
                                onFilesSelected={handleFilesSelected} 
                            />
                        ) : (
                            <div className="space-y-4">
                                <ImagePreview 
                                    src={activeImage.previewUrl} 
                                    alt={activeImage.name} 
                                    onRemove={() => { 
                                        if (activeImage) {
                                            URL.revokeObjectURL(activeImage.previewUrl);
                                        }
                                        setImages([]); 
                                        setPrompt(''); 
                                    }} 
                                    onRemoveBackground={() => setSettings(s => ({ ...s, removeBackground: !s.removeBackground }))}
                                    isRemovingBackground={settings.removeBackground}
                                />
                                {activeImage.analysis && <AnalysisResultView analysis={activeImage.analysis} imageName={activeImage.name} />}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ControlPanel 
                                settings={settings} 
                                onSettingsChange={setSettings} 
                                onGenerate={handleGeneratePrompt}
                                onAnalyzeGemini={handleGeminiAnalysis}
                                onAnalyzeOpenAI={handleOpenAIAnalysis}
                                onAnalyzeDeepseek={handleDeepseekAnalysis}
                                onAnalyzeGoogleVision={handleGoogleVisionAnalysis}
                                onAnalyzeImageFX={handleImageFXAnalysis}
                                onAnalyzeTF={handleTFAnalysis}
                                onOpenSettings={() => setIsSettingsOpen(true)}
                                isGeneratingGemini={isGeneratingGemini}
                                isGeneratingOpenAI={isGeneratingOpenAI}
                                isGeneratingDeepseek={isGeneratingDeepseek}
                                isGeneratingGoogleVision={isGeneratingGoogleVision}
                                isGeneratingImageFX={isGeneratingImageFX}
                                isGeneratingTF={isGeneratingTF}
                                hasImage={!!activeImage}
                            />
                            <div className="flex flex-col gap-6">
                                <PromptDisplay prompt={prompt} onUpdatePrompt={setPrompt} onCreateImage={handleCreateVisual} isGeneratingImage={isGeneratingVisual} />
                                <GeneratedImageDisplay imageUrl={generatedImageUrl} isGenerating={isGeneratingVisual} onUpscale={() => {}} onClose={() => setGeneratedImageUrl(null)} isUpscaling={isUpscalingVisual} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            <ApiSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSave={saveApiKeys} initialOpenAIKey={openAIKey} initialDeepseekKey={deepseekKey} />
            <HistoryPanel 
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                history={history}
                onRevisit={handleRevisitHistory}
                onDelete={handleDeleteHistory}
                onClear={handleClearHistory}
            />
        </div>
    );
};

export default App;
