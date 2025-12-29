
export interface ColorAnalysis {
    dominantColors: string[];
    paletteType: 'warm' | 'cool' | 'vibrant' | 'dark' | 'balanced';
}

export interface ImageStats {
    width: number;
    height: number;
    aspectRatio: string;
}

export interface AnalysisResult {
    colors: ColorAnalysis;
    brightness: 'high' | 'medium' | 'low';
    saturation: 'high' | 'medium' | 'low';
    contrast: 'high' | 'medium' | 'low';
    composition: 'landscape' | 'portrait' | 'square' | 'standard';
    stats: ImageStats;
    timestamp: number;
}

export interface UploadedImage {
    id: string;
    file: File;
    previewUrl: string;
    name: string;
    analysis: AnalysisResult | null;
    base64Data?: string;
    mimeType?: string;
}

export type TargetPlatform = 'midjourney' | 'dalle' | 'freepik' | 'stable_diffusion' | 'google_imagefx' | 'whisk' | 'chatgpt' | 'deepseek';

export interface PromptSettings {
    basePrompt: string;
    negativePrompt: string;
    style: string;
    detailLevel: number | 'auto';
    lighting: string;
    composition: string;
    extraParams: string;
    aspectRatio: string;
    removeBackground: boolean;
    targetPlatform: TargetPlatform;
    mode: 'general' | 'mockup';
    activeTemplateId?: string;
}

export const DETAIL_LEVEL_MAP: Record<number, { label: string; keywords: string[]; platformBoosts: Partial<Record<TargetPlatform, string>> }> = {
    1: { 
        label: "Minimalist", 
        keywords: ["simple", "minimalist", "clean lines", "uncluttered"],
        platformBoosts: { midjourney: "--stylize 50", stable_diffusion: "(minimalist:1.2)", chatgpt: "Keep it simple and clean." }
    },
    2: { 
        label: "Basic", 
        keywords: ["clear", "plain", "straightforward"],
        platformBoosts: { midjourney: "--stylize 100" }
    },
    3: { 
        label: "Standard", 
        keywords: ["standard detail", "balanced"],
        platformBoosts: { midjourney: "--stylize 250" }
    },
    4: { 
        label: "Clear", 
        keywords: ["well-defined", "sharp"],
        platformBoosts: {}
    },
    5: { 
        label: "Detailed", 
        keywords: ["detailed", "textured", "rich"],
        platformBoosts: { stable_diffusion: "highly detailed", freepik: "sharp details" }
    },
    6: { 
        label: "High Detail", 
        keywords: ["intricate", "fine textures", "elaborate"],
        platformBoosts: { midjourney: "--stylize 500" }
    },
    7: { 
        label: "Hyper Detail", 
        keywords: ["ultra detailed", "hyperrealistic", "8k resolution"],
        platformBoosts: { dalle: "extreme detail", stable_diffusion: "(masterpiece:1.2)", deepseek: "high fidelity" }
    },
    8: { 
        label: "Epic", 
        keywords: ["masterpiece", "breathtaking", "complex patterns"],
        platformBoosts: { midjourney: "--stylize 750", stable_diffusion: "(best quality:1.3)", freepik: "premium stock quality" }
    },
    9: { 
        label: "Legendary", 
        keywords: ["hyper-intricate", "unreal engine 5 render", "ray tracing"],
        platformBoosts: { midjourney: "--stylize 850", google_imagefx: "photorealistic masterpiece", chatgpt: "Describe with poetic, vivid detail." }
    },
    10: { 
        label: "Omniscient", 
        keywords: ["sub-surface scattering", "macro photography quality", "infinitely detailed", "architectural photography"],
        platformBoosts: { midjourney: "--stylize 1000", stable_diffusion: "(masterpiece:1.5), ultra-high-definition", deepseek: "maximum visual density" }
    }
};

export const STYLE_TEMPLATES: Record<string, string> = {
    photorealistic: "photorealistic, 8K resolution, detailed texture, realistic lighting, sharp focus, professional photography",
    digital_art: "digital art, vibrant colors, detailed, trending on ArtStation, fantasy art, concept art",
    ghibli: "studio ghibli style, anime, cel shaded, detailed background, hayao miyazaki style, vibrant colors, whimsical, clouds, hand drawn aesthetic",
    meme: "internet meme style, viral image aesthetic, humor, impact font style text overlay, funny, relatable, internet culture",
    claymation: "claymation, plasticine, stop motion, clay texture, handcrafted, soft lighting, aardman style",
    crochet: "crochet style, knitted wool texture, amigurumi, yarn details, soft lighting, macro photography, handmade feel",
    monochromatic: "monochromatic, single color palette, high contrast, artistic, dramatic, noir style, black and white or sepia",
    origami: "origami style, folded paper art, paper texture, geometric shapes, sharp creases, craft, 3d paper",
    pixel_art: "pixel art, 16-bit, retro game aesthetic, dithering, limited palette, sharp edges, sprite sheet style",
    pop_art: "pop art, andy warhol style, halftone dots, vibrant bold colors, comic book style, repeating patterns",
    steampunk: "steampunk aesthetic, gears, brass, copper, victorian technology, steam engine details, mechanical, clockwork",
    cartoon: "cartoon style, 2d animation, flat colors, thick clean outlines, expressive characters, saturday morning cartoon",
    cyberpunk: "cyberpunk, neon lighting, futuristic, dystopian, rainy night, cinematic, high tech low life, blade runner aesthetic",
    oil_painting: "oil painting, textured brush strokes, canvas texture, rich colors, traditional art, masterpiece",
    watercolor: "watercolor painting, soft edges, translucent layers, paper texture, artistic, delicate, wet-on-wet",
    anime: "anime style, modern japanese animation, vibrant, detailed character design, manga illustration",
    fantasy: "fantasy art, epic, magical, detailed environment, ethereal, concept art, mystical, rpg style",
    minimalist: "minimalist, simple composition, clean lines, negative space, modern art, elegant, flat design",
    impressionism: "impressionism, visible brush strokes, emphasis on light, dreamy, artistic, painted, monet style",
    surrealism: "surrealism, dreamlike, impossible scenes, symbolic, artistic, imaginative, dali style",
    "3d_render": "3d render, unreal engine 5, octane render, ray tracing, highly detailed, cgsociety, 8k, cinema4d",
    vintage: "vintage photography, film grain, retro style, 1950s aesthetic, sepia tones, polaroid style, nostalgia",
    isometric: "isometric view, 3d, vector art, clean lines, detailed, diorama, colorful, orthographic projection",
    line_art: "line art, black and white, ink drawing, clean lines, minimalist, illustration, sketch",
    noir: "film noir, black and white, dramatic shadows, high contrast, cinematic, moody, mystery, detective style",
    sticker: "sticker art, thick white outline, vector, flat color, simple background, die-cut, vinyl sticker",
    low_poly: "low poly, geometric shapes, sharp edges, minimalist, 3d art, vibrant, polygon art",
    horror: "horror theme, dark, eerie, scary, nightmare fuel, gloomy, cinematic lighting, unsettling",
    pencil_sketch: "pencil sketch, graphite, charcoal, rough lines, shading, hand drawn, artistic sketch"
};
