
import { GoogleGenAI } from "@google/genai";

// As per guidelines, window.aistudio is assumed to be pre-configured and valid in the execution context.

/**
 * Generates an image using Gemini models.
 * Uses gemini-2.5-flash-image for standard requests and gemini-3-pro-image-preview for high-quality/upscale.
 */
export const generateImage = async (
    prompt: string, 
    isHighQuality: boolean = false,
    imageContext?: { base64: string, mimeType: string }
): Promise<string> => {
    const modelName = isHighQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    
    // Rule: When using high-quality models (Nano Banana Pro series), users must select their own paid API key.
    if (isHighQuality) {
        // Use type assertion to access aistudio which is injected by the environment to avoid TS compilation errors.
        const aistudio = (window as any).aistudio;
        const hasKey = await aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await aistudio.openSelectKey();
            // Per instructions: "assume the key selection was successful after triggering openSelectKey() and proceed"
        }
    }

    // Rule: Create a new GoogleGenAI instance right before making an API call to ensure it uses the latest key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const parts: any[] = [];
        
        // If an image is provided, send it first as context for the generation/edit
        if (imageContext) {
            parts.push({
                inlineData: {
                    data: imageContext.base64,
                    mimeType: imageContext.mimeType
                }
            });
        }
        
        parts.push({ text: prompt });

        const response = await ai.models.generateContent({
            model: modelName,
            contents: {
                parts: parts,
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1",
                    // imageSize is ONLY supported for gemini-3-pro-image-preview.
                    ...(isHighQuality ? { imageSize: "2K" } : {})
                }
            },
        });

        // Handle case where no candidates are returned (usually due to safety blocks)
        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("The request was blocked by the model's safety filters. Please try a different prompt.");
        }

        const candidate = response.candidates[0];
        
        // Find the image part in the response
        if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    const base64EncodeString: string = part.inlineData.data;
                    return `data:image/png;base64,${base64EncodeString}`;
                }
            }
            
            // If no image but text is present, the model might be explaining a refusal
            for (const part of candidate.content.parts) {
                if (part.text) {
                    throw new Error(`Model Refusal: ${part.text}`);
                }
            }
        }
        
        throw new Error("No image data returned from model. The prompt might be too restrictive or the model returned text only.");
    } catch (error: any) {
        console.error("Image generation failed:", error);
        
        const errorMsg = error?.message || String(error);
        
        // Rule: If the request fails with "Requested entity was not found.", prompt for key selection again.
        if (isHighQuality && (errorMsg.includes("Requested entity was not found") || errorMsg.includes("403") || errorMsg.includes("permission"))) {
             await (window as any).aistudio.openSelectKey();
             throw new Error("Permission Error: Please ensure you have selected a valid paid API key in the dialog.");
        }
        
        throw error;
    }
};
