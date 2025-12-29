

import { GoogleGenAI } from "@google/genai";
import { PromptSettings } from "../types";

export const generateGeminiPrompt = async (
    file: File, 
    settings: PromptSettings,
    preProcessedData?: { base64: string, mimeType: string }
): Promise<string> => {
    // Instantiate right before call to use the most recent process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        let base64Data: string;
        let mimeType: string;

        if (preProcessedData) {
            base64Data = preProcessedData.base64;
            mimeType = preProcessedData.mimeType;
        } else {
            // Fallback for direct calls
            base64Data = await fileToGenerativePart(file);
            mimeType = file.type;
        }

        let platformInstruction = "";
        switch (settings.targetPlatform) {
            case 'midjourney':
                platformInstruction = "Format as a comma-separated list of tags and phrases. Append Midjourney parameters like --v 6.0 --ar [ratio] --no [negative] at the end.";
                break;
            case 'dalle':
                platformInstruction = "Format as a rich, descriptive natural language paragraph. Focus on semantic coherence.";
                break;
            case 'freepik':
                platformInstruction = "Format for Freepik/Pikaso AI. Use professional stock photography keywords: 'high quality', '8k', 'professional shot', 'commercial photography', 'perfect lighting'. Mix natural language with strong keywords.";
                break;
            case 'stable_diffusion':
                platformInstruction = "Format as a list of weighted tags and keywords. Format negative prompt using 'Negative prompt: ...' format at the end if applicable.";
                break;
            case 'google_imagefx':
                platformInstruction = "Format for Google ImageFX (Imagen). Use natural language. Be concise but descriptive. Avoid technical parameters.";
                break;
            case 'whisk':
                platformInstruction = "Format as a creative, artistic prompt with focus on color and composition.";
                break;
            default:
                platformInstruction = "Format as a standard descriptive prompt.";
        }

        const detailInstruction = settings.detailLevel === 'auto' 
            ? "Auto (Infer optimal detail from image analysis)" 
            : `${settings.detailLevel}/10`;

        const isStrictMockupTemplate = ['mockup', 'tshirt', 'product', 'elements', '3d_seal'].includes(settings.activeTemplateId || '');
        
        let specialModeInstructions = "";
        if (settings.mode === 'mockup' && isStrictMockupTemplate) {
            specialModeInstructions = `
            CRITICAL MOCKUP INSTRUCTIONS:
            1. The user wants a MOCKUP template. The subject must be BLANK and UNBRANDED.
            2. STRICTLY FORBIDDEN: Do not include any text, letters, logos, brand names, or graphic designs on the object itself.
            3. The surface of the object (e.g., t-shirt, box, bottle) must be clean and solid color (usually white or neutral) to allow for design placement.
            4. Emphasize texture, lighting, and realistic shadows.
            5. If there is text in the source image, IGNORE IT. Describe the object as if the text was removed.
            `;
        }

        // Updated model to gemini-3-flash-preview for general text and multimodal tasks
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType
                        }
                    },
                    {
                        text: `Analyze this image and generate a high-quality text-to-image prompt to recreate it.
                        
                        Target Platform: ${settings.targetPlatform}
                        Formatting Rule: ${platformInstruction}
                        
                        ${specialModeInstructions}

                        User Provided Context (Incorporate this if present):
                        - Subject/Base Prompt: "${settings.basePrompt}"
                        - Negative Constraints (Exclude these): "${settings.negativePrompt}"
                        
                        Desired Style: ${settings.style}
                        Detail Level: ${detailInstruction}
                        Lighting: ${settings.lighting === 'none' ? 'Not specified (infer from image)' : settings.lighting}
                        Composition: ${settings.composition === 'none' ? 'Not specified (infer from image)' : settings.composition}
                        
                        Focus on:
                        1. Subject matter and action
                        2. Art style and Medium
                        3. Lighting and Mood
                        4. Composition
                        5. Color Palette
                        
                        Return ONLY the raw prompt text.`
                    }
                ]
            }
        });

        if (!response.text) {
             throw new Error("Gemini returned an empty response.");
        }

        return response.text.trim();
    } catch (error: any) {
        console.error("Gemini API Error Details:", error);
        
        const message = error?.message || String(error);
        if (message.includes("403") || message.includes("PERMISSION_DENIED")) {
            throw new Error("Gemini Access Denied. The environment API Key is restricted for this model in this region. Try using ChatGPT or select a personal key via the Create Image button.");
        }
        
        throw error;
    }
};

async function fileToGenerativePart(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result;
            if (typeof result !== 'string') {
                reject(new Error("Failed to read file."));
                return;
            }
            const base64String = result.split(',')[1];
            if (!base64String) {
                reject(new Error("Invalid file data."));
                return;
            }
            resolve(base64String);
        };
        reader.onerror = () => reject(new Error("FileReader error."));
        reader.readAsDataURL(file);
    });
}