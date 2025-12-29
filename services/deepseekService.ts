
import { PromptSettings } from '../types';

export const generateDeepseekPrompt = async (
    file: File, 
    apiKey: string,
    settings: PromptSettings,
    preProcessedData?: { base64: string, mimeType: string }
): Promise<string> => {
    if (!apiKey) {
        throw new Error("Deepseek API Key is missing. Please add it in settings.");
    }

    try {
        let base64Image: string;
        if (preProcessedData) {
            base64Image = preProcessedData.base64;
        } else {
            base64Image = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
        
        // Deepseek Vision typically uses a similar schema to OpenAI for multimodal inputs
        const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-vl",
                messages: [
                    {
                        role: "user",
                        content: [
                            { 
                                type: "text", 
                                text: `Analyze this image for a prompt generation task. 
                                Target: ${settings.targetPlatform}
                                Style: ${settings.style}
                                
                                Describe the subject, composition, and lighting in detail.
                                Output ONLY the generated prompt.` 
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 500
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "Deepseek API Error");
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error("Deepseek Error:", error);
        throw error;
    }
};
