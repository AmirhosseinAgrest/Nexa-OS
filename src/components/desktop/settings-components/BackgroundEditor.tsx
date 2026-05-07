import React, { useState, useRef } from "react";
import { Upload, RefreshCw, Palette, Image as ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useBackground, gradientPresets } from "@/contexts/BackgroundContext";

export const BackgroundEditor = () => {
    const { setImageBackground, setSolidBackground, setGradientBackground, resetToDefault, backgroundValue, backgroundType } = useBackground();
    const [activeTab, setActiveTab] = useState<"image" | "solid" | "gradient">(
        backgroundType === "image" ? "image" : backgroundType === "solid" ? "solid" : "gradient"
    );
    const [selectedColor, setSelectedColor] = useState("#6366f1");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setImageBackground(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSolidColorChange = (color: string) => {
        setSelectedColor(color);
        setSolidBackground(color);
    };

    const handleGradientSelect = (gradient: string) => {
        setGradientBackground(gradient);
    };

    const currentStyle = () => {
        if (backgroundType === "solid" && backgroundValue) {
            return { backgroundColor: backgroundValue };
        }
        if (backgroundType === "gradient" && backgroundValue) {
            return { backgroundImage: backgroundValue };
        }
        return {};
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b border-border/40">
                <button
                    onClick={() => setActiveTab("image")}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all relative",
                        activeTab === "image"
                            ? "text-primary border-b-2 border-primary"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <ImageIcon className="w-4 h-4" />
                    Image
                </button>
                <button
                    onClick={() => setActiveTab("solid")}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all relative",
                        activeTab === "solid"
                            ? "text-primary border-b-2 border-primary"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Palette className="w-4 h-4" />
                    Solid Color
                </button>
                <button
                    onClick={() => setActiveTab("gradient")}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all relative",
                        activeTab === "gradient"
                            ? "text-primary border-b-2 border-primary"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Sparkles className="w-4 h-4" />
                    Gradient
                </button>
            </div>

            <div className="space-y-4">
                <div className="relative h-48 rounded-xl overflow-hidden border border-border/50 group shadow-inner bg-muted/50">
                    {backgroundType === "solid" && backgroundValue ? (
                        <div className="w-full h-full transition-all duration-300" style={{ backgroundColor: backgroundValue }} />
                    ) : backgroundType === "gradient" && backgroundValue ? (
                        <div className="w-full h-full transition-all duration-300" style={{ backgroundImage: backgroundValue }} />
                    ) : backgroundValue ? (
                        <img
                            src={backgroundValue}
                            alt="Current Wallpaper"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No wallpaper set
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>

                {activeTab === "image" && (
                    <div className="grid grid-cols-2 gap-4">
                        <label className="cursor-pointer flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary hover:bg-primary/5 transition-all group">
                            <div className="p-3 rounded-full bg-muted group-hover:bg-background transition-colors shadow-sm">
                                <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">Upload Image</span>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>

                        <button
                            onClick={resetToDefault}
                            className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-border/50 hover:border-destructive/50 hover:bg-destructive/5 transition-all group"
                        >
                            <div className="p-3 rounded-full bg-muted group-hover:bg-destructive/10 transition-colors shadow-sm">
                                <RefreshCw className="w-5 h-5 text-muted-foreground group-hover:text-destructive" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-destructive">Reset to Default</span>
                        </button>
                    </div>
                )}

                {activeTab === "solid" && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/50">
                            <div className="flex-1 space-y-2">
                                <Label>Pick a Color</Label>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-lg border-2 border-border shadow-sm cursor-pointer transition-all hover:scale-105"
                                        style={{ backgroundColor: selectedColor }}
                                    />
                                    <input
                                        type="color"
                                        value={selectedColor}
                                        onChange={(e) => handleSolidColorChange(e.target.value)}
                                        className="flex-1 h-10 rounded-lg cursor-pointer bg-background/50 border border-border"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-5 gap-3">
                            {["#6366f1", "#ef4444", "#22c55e", "#f59e0b", "#ec4899"].map((color) => (
                                <button
                                    key={color}
                                    onClick={() => handleSolidColorChange(color)}
                                    className="w-full aspect-square rounded-lg border-2 border-border transition-all hover:scale-105 hover:shadow-lg"
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "gradient" && (
                    <div className="grid grid-cols-2 gap-4">
                        {gradientPresets.map((gradient) => (
                            <button
                                key={gradient.name}
                                onClick={() => handleGradientSelect(gradient.value)}
                                className={cn(
                                    "p-4 rounded-xl border-2 transition-all hover:scale-102 hover:shadow-lg text-left",
                                    backgroundType === "gradient" && backgroundValue === gradient.value
                                        ? "border-primary bg-primary/5"
                                        : "border-border/50 hover:border-primary/50"
                                )}
                            >
                                <div
                                    className="h-24 rounded-lg mb-3 transition-all duration-300"
                                    style={{ backgroundImage: gradient.value }}
                                />
                                <p className="text-sm font-medium">{gradient.name}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};