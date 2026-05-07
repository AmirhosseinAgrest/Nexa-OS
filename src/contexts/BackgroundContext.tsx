import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type BackgroundType = "image" | "solid" | "gradient";

export interface GradientPreset {
    name: string;
    value: string;
}

export const gradientPresets: GradientPreset[] = [
    { name: "Sunset", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { name: "Ocean", value: "linear-gradient(135deg, #00b4db 0%, #0083b0 100%)" },
    { name: "Midnight", value: "linear-gradient(135deg, #2c3e50 0%, #1a1a2e 100%)" },
    { name: "Fire", value: "linear-gradient(135deg, #f12711 0%, #f5af19 100%)" },
    { name: "Forest", value: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
];

interface BackgroundContextType {
    backgroundValue: string | null;
    backgroundType: BackgroundType;
    setImageBackground: (imageUrl: string | null) => void;
    setSolidBackground: (color: string) => void;
    setGradientBackground: (gradient: string) => void;
    resetToDefault: () => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

const DEFAULT_BACKGROUND = "/default-wallpaper.png";

export const BackgroundProvider = ({ children }: { children: ReactNode }) => {
    const [backgroundValue, setBackgroundValue] = useState<string | null>(null);
    const [backgroundType, setBackgroundType] = useState<BackgroundType>("image");

    useEffect(() => {
        const savedType = localStorage.getItem("nexa_background_type") as BackgroundType | null;
        const savedValue = localStorage.getItem("nexa_background");

        if (savedValue && savedType) {
            setBackgroundValue(savedValue);
            setBackgroundType(savedType);
        } else {
            setBackgroundValue(DEFAULT_BACKGROUND);
            setBackgroundType("image");
        }
    }, []);

    const saveBackground = (value: string | null, type: BackgroundType) => {
        if (value === null) {
            localStorage.removeItem("nexa_background");
            localStorage.removeItem("nexa_background_type");
            setBackgroundValue(DEFAULT_BACKGROUND);
            setBackgroundType("image");
        } else {
            localStorage.setItem("nexa_background", value);
            localStorage.setItem("nexa_background_type", type);
            setBackgroundValue(value);
            setBackgroundType(type);
        }

        window.dispatchEvent(new CustomEvent("nexa-background-change", {
            detail: { value, type }
        }));
    };

    const setImageBackground = (imageUrl: string | null) => {
        if (imageUrl) {
            saveBackground(imageUrl, "image");
        } else {
            resetToDefault();
        }
    };

    const setSolidBackground = (color: string) => {
        saveBackground(color, "solid");
    };

    const setGradientBackground = (gradient: string) => {
        saveBackground(gradient, "gradient");
    };

    const resetToDefault = () => {
        saveBackground(null, "image");
    };

    return (
        <BackgroundContext.Provider value={{
            backgroundValue,
            backgroundType,
            setImageBackground,
            setSolidBackground,
            setGradientBackground,
            resetToDefault,
        }}>
            {children}
        </BackgroundContext.Provider>
    );
};

export const useBackground = () => {
    const context = useContext(BackgroundContext);
    if (!context) throw new Error("useBackground must be used within BackgroundProvider");
    return context;
};