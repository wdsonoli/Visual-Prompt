
import { PromptSettings, STYLE_TEMPLATES } from '../types';

// Declare global types for the CDN loaded libraries
declare global {
    interface Window {
        mobilenet: any;
        tf: any;
    }
}

let model: any = null;

export const classifyImageMobileNet = async (
    file: File, 
    settings: PromptSettings
): Promise<string> => {
    return new Promise((resolve, reject) => {
        // Validate file type before processing
        if (!file.type.startsWith('image/')) {
            reject(new Error("Invalid file type. Please upload an image."));
            return;
        }

        const img = new Image();
        // Important for some browser environments to handle image data correctly
        img.crossOrigin = "anonymous"; 
        
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
        
        img.onload = async () => {
            try {
                // Load model if not already loaded
                if (!model) {
                    console.log('Loading MobileNet model...');
                    if (!window.mobilenet) {
                        reject(new Error("TensorFlow/MobileNet library not loaded. Check internet connection."));
                        return;
                    }
                    model = await window.mobilenet.load();
                }

                // Classify
                const predictions = await model.classify(img);
                console.log('TensorFlow Predictions:', predictions);

                // Construct Prompt based on predictions
                const prompt = constructPromptFromPredictions(predictions, settings);
                resolve(prompt);
            } catch (error) {
                console.error("TF Classification Error:", error);
                reject(error);
            } finally {
                // Cleanup memory
                URL.revokeObjectURL(objectUrl);
            }
        };

        img.onerror = (e) => {
            URL.revokeObjectURL(objectUrl);
            console.error("Image loading error:", e);
            reject(new Error("Failed to load image for AI classification. The file might be corrupted or unsupported."));
        };
    });
};

function constructPromptFromPredictions(predictions: Array<{className: string, probability: number}>, settings: PromptSettings): string {
    // Extract top subjects (usually the first 1-2 are relevant)
    const subjects = predictions
        .filter(p => p.probability > 0.05) // Filter low confidence
        .map(p => p.className.split(',')[0]) // Take first synonym
        .slice(0, 3)
        .join(', ');

    const mainSubject = subjects || "A detailed image";

    const { style, detailLevel, lighting, composition, extraParams, aspectRatio, removeBackground } = settings;
        
    let p = "";

    // Subject & Action
    p += `A focused shot of ${mainSubject}`;

    // Composition
    if (composition !== 'auto') {
        p += `, ${composition.replace('_', ' ')} composition`;
    }

    // Style
    p += `, ${STYLE_TEMPLATES[style] || style}`;

    // Lighting
    if (lighting !== 'auto') {
        p += `, ${lighting.replace('_', ' ')} lighting`;
    } else {
        p += `, professional lighting`;
    }

    // Resolve detail level (fallback to 8 if auto)
    const effectiveDetail = detailLevel === 'auto' ? 8 : detailLevel;

    // Details based on level
    if (effectiveDetail >= 9) p += ", award winning, masterpiece, ultra detailed, 8K, unreal engine 5 render";
    else if (effectiveDetail >= 7) p += ", highly detailed, sharp focus, high definition";
    else p += ", good quality";

    // Background Removal
    if (removeBackground) {
        p += ", isolated on white background, simple background, cutout";
    }

    // Extras
    if (extraParams) p += ` ${extraParams}`;

    // Technical Aspect Ratio
    let arValue = '';
    if (aspectRatio !== 'auto') {
        arValue = aspectRatio;
    }
    
    if (arValue && !p.includes('--ar')) {
        p += ` --ar ${arValue}`;
    }

    if (!p.includes('--v')) {
        p += " --v 6.0";
    }

    return p;
}
