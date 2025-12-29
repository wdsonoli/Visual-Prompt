
import { PromptSettings, STYLE_TEMPLATES } from '../types';

const HF_MODEL = "Salesforce/blip-image-captioning-large";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateHuggingFacePrompt = async (
    file: File, 
    token: string,
    settings: PromptSettings
): Promise<string> => {
    if (!token) {
        throw new Error("Hugging Face Token is missing. Please add it in settings.");
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        
        let response = await fetchWithRetry(arrayBuffer, file.type, token);
        
        const result = await response.json();
        
        // Expected format: [{ generated_text: "..." }]
        if (!Array.isArray(result) || !result[0]?.generated_text) {
             // Handle generic HF error object { error: "..." }
             if (result.error) {
                 throw new Error(`Hugging Face Error: ${result.error}`);
             }
             throw new Error("Invalid response format from Hugging Face.");
        }

        const caption = result[0].generated_text;
        
        // Post-process the caption into a full prompt
        return constructPromptFromCaption(caption, settings);

    } catch (error: any) {
        console.error("Hugging Face API Error:", error);
        
        // Handle "Failed to fetch" specifically (usually CORS or Network)
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            throw new Error("Network Error: Could not connect to Hugging Face. Please check your internet connection or disable AdBlockers.");
        }
        
        throw error;
    }
};

async function fetchWithRetry(data: ArrayBuffer, mimeType: string, token: string, retries = 2): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
        try {
            const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": mimeType
                },
                body: data
            });

            if (response.status === 503) {
                // Model loading
                const errorData = await response.json().catch(() => ({}));
                const waitTime = errorData.estimated_time || 20;
                console.log(`Model loading, waiting ${waitTime}s...`);
                
                if (i < retries) {
                    await sleep(waitTime * 1000);
                    continue;
                } else {
                    throw new Error(`Hugging Face model is still loading after ${retries} retries. Please try again later.`);
                }
            }

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Invalid Hugging Face Token. Please check your settings.");
                }
                const errorText = await response.text();
                throw new Error(`API Error (${response.status}): ${errorText}`);
            }

            return response;
        } catch (err: any) {
            // If it's the last retry or a critical error, throw it
            if (i === retries || (err.message && err.message.includes("Invalid Hugging Face Token"))) throw err;
            // Otherwise wait a bit and retry (for network blips)
            await sleep(1000);
        }
    }
    throw new Error("Failed to connect to Hugging Face after retries.");
}

function constructPromptFromCaption(caption: string, settings: PromptSettings): string {
    const { style, detailLevel, lighting, composition, extraParams, targetPlatform, aspectRatio, removeBackground } = settings;
    
    // Base caption usually comes lowercase and simple
    let p = caption.charAt(0).toUpperCase() + caption.slice(1);
    
    // Add Style
    p += `, ${STYLE_TEMPLATES[style] || style}`;

    // Add Lighting
    if (lighting !== 'auto' && lighting !== 'none') {
        p += `, ${lighting.replace('_', ' ')} lighting`;
    }

    // Add Composition
    if (composition !== 'auto' && composition !== 'none') {
        p += `, ${composition.replace('_', ' ')}`;
    }

    // Resolve detail level
    const effectiveDetail = detailLevel === 'auto' ? 8 : detailLevel;

    // Details
    if (effectiveDetail >= 8) p += ", highly detailed, masterpiece, 8k, sharp focus";
    else if (effectiveDetail >= 5) p += ", detailed, high quality";

    // Background Removal
    if (removeBackground) {
        p += ", isolated on white background, simple background";
    }

    // Extras
    if (extraParams) p += ` ${extraParams}`;

    // Platform Specifics
    if (targetPlatform === 'midjourney') {
        if (!p.includes('--v')) p += " --v 6.0";
        if (aspectRatio !== 'auto' && !p.includes('--ar')) p += ` --ar ${aspectRatio}`;
    } else if (targetPlatform === 'freepik') {
        p += ", professional stock photo, commercial quality";
    } else if (targetPlatform === 'google_imagefx') {
        p += ", detailed, photorealistic, 8k";
    } else if (targetPlatform === 'whisk') {
        p += ", artistic, creative, high resolution";
    }

    return p;
}
