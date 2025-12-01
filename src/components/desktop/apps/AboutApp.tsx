import React, { useState } from "react";
import {
    Info, User, Code2, History, Download,
    CheckCircle2, Github, Linkedin, Globe, Cpu, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import packageJson from '../../../../package.json';

export const AboutApp = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'developer' | 'tech' | 'story'>('overview');
    const [checkingUpdate, setCheckingUpdate] = useState(false);
    const [updateStatus, setUpdateStatus] = useState("Check for Updates");

    const handleUpdateCheck = () => {
        setCheckingUpdate(true);
        setUpdateStatus("Checking...");
        setTimeout(() => {
            setCheckingUpdate(false);
            setUpdateStatus(`Nexa is up to date ( v${packageJson.version})`);
        }, 2000);
    };

    interface SocialButtonProps {
        icon: React.ElementType;
        label: string;
        href: string;
    }

    const SocialButton = ({ icon: Icon, label, href }: SocialButtonProps) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </a>
    );

    return (
        <div className="flex h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-none overflow-hidden">
            <div className="w-64 bg-slate-100 dark:bg-slate-900 border-r border-border/50 flex flex-col p-4 gap-2">
                <div className="px-2 mb-6 mt-2">
                    <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center shadow-lg mb-3">
                        <span className="font-bold text-white dark:text-black text-xl">N</span>
                    </div>
                    <h2 className="font-bold text-lg tracking-tight">About Nexa</h2>
                    <p className="text-xs text-muted-foreground">System Information</p>
                </div>

                <NavButton
                    active={activeTab === 'overview'}
                    onClick={() => setActiveTab('overview')}
                    icon={Info}
                    label="Overview"
                />
                <NavButton
                    active={activeTab === 'developer'}
                    onClick={() => setActiveTab('developer')}
                    icon={User}
                    label="The Developer"
                />
                <NavButton
                    active={activeTab === 'tech'}
                    onClick={() => setActiveTab('tech')}
                    icon={Code2}
                    label="Tech Stack"
                />
                <NavButton
                    active={activeTab === 'story'}
                    onClick={() => setActiveTab('story')}
                    icon={History}
                    label="The Journey"
                />

            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12 scroll-smooth">

                {activeTab === 'overview' && (
                    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-purple-500/20 animate-pulse-slow">
                                <Cpu className="w-12 h-12 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight mb-1">Nexa OS</h1>
                                <p className="text-xl text-muted-foreground font-light">
                                    Version {packageJson.version} (Beta)
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b border-border/50 pb-2">System Status</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <InfoCard label="Processor" value="React 18 Virtual Core" />
                                <InfoCard label="Memory" value="IndexedDB & LocalStorage" />
                                <InfoCard label="Graphics" value="Tailwind CSS Engine" />
                                <InfoCard label="Build" value="Vite Bundler" />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button variant="outline" onClick={handleUpdateCheck} disabled={checkingUpdate} className="min-w-[200px]">
                                {checkingUpdate ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />}
                                {updateStatus}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2 ml-1">
                                © 2025 Agrest. All rights reserved.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'developer' && (
                    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-start gap-6 mb-8">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
                                <img src="AgrestProfile.png" alt="Agrest" className="w-full h-full object-cover bg-blue-100" />
                            </div>
                            <div className="mt-2">
                                <h1 className="text-3xl font-bold">Amirhossein Agrest</h1>
                                <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">Full-Stack Developer</p>
                                <p className="text-muted-foreground mt-2 leading-relaxed max-w-md">
                                    Web developer focused on designing and implementing modern, user‑friendly interfaces.
                                    Passionate about solving technical challenges and transforming complex ideas into simple, optimized, and maintainable solutions.
                                    Committed to delivering clean, standard code with special attention to user experience and visual details.
                                </p>

                                <div className="flex gap-3 mt-4">
                                    <SocialButton
                                        icon={Github}
                                        label="GitHub"
                                        href="https://github.com/amirhosseinagrest"
                                    />
                                    <SocialButton
                                        icon={Linkedin}
                                        label="LinkedIn"
                                        href="https://www.linkedin.com/in/amirhosseinagrest"
                                    />
                                    <SocialButton
                                        icon={Send}
                                        label="Telegram"
                                        href="https://t.me/amirhosseinagrest"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Contact Information</h3>
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-border/50 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Email</span>
                                    <span className="font-medium select-all">amirhosseinagrest@gmail.com</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'tech' && (
                    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-bold mb-6">Technologies Used</h2>
                        <p className="text-muted-foreground mb-8">
                            Nexa OS has been built using the latest and most powerful tools of the web ecosystem to deliver optimal performance.
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <TechCard name="React.js" desc="UI Library" color="bg-blue-500/10 text-blue-500" />
                            <TechCard name="TypeScript" desc="Type Safety" color="bg-blue-600/10 text-blue-600" />
                            <TechCard name="Tailwind CSS" desc="Styling Engine" color="bg-cyan-500/10 text-cyan-500" />
                            <TechCard name="Framer Motion" desc="Animations" color="bg-purple-500/10 text-purple-500" />
                            <TechCard name="Vite" desc="Build Tool" color="bg-yellow-500/10 text-yellow-500" />
                            <TechCard name="Lucide Icons" desc="Iconography" color="bg-red-500/10 text-red-500" />
                            <TechCard name="IndexedDB" desc="Local Database" color="bg-green-500/10 text-green-500" />
                            <TechCard name="Zustand / Context" desc="State Management" color="bg-slate-500/10 text-slate-500" />
                        </div>
                    </div>
                )}

                {activeTab === 'story' && (
                    <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">The Story Behind Nexa</h2>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                The idea of Nexa OS began with a simple question:
                                <span className="italic text-foreground">
                                    "Can websites feel like a real operating system?"
                                </span>
                            </p>
                        </div>

                        <div className="relative border-l-2 border-border/50 ml-3 space-y-8 pb-4">
                            <StoryItem
                                title="The Beginning"
                                date="Day 1"
                                text="Designing the initial structure and the window management system (Window Manager). The main challenge was achieving smooth window dragging without lag."
                            />
                            <StoryItem
                                title="Core Apps"
                                date="Week 1"
                                text="Adding core applications such as Notes and Settings. Implementing dark and light themes with persistence using LocalStorage."
                            />
                            <StoryItem
                                title="Complexity"
                                date="Week 2"
                                text="Building a virtual file system and a media player using IndexedDB. This was the hardest part of the project, ensuring large files could be stored without performance issues."
                            />
                            <StoryItem
                                title="The Polish"
                                date="Final Days"
                                text="Focusing on details, animations, the Start Menu, and overall user experience (UX). The goal was to make the user forget they were inside a browser."
                            />
                        </div>

                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-xl border border-blue-500/20">
                            <h3 className="font-bold text-lg mb-2">Why This Matters?</h3>
                            <p className="text-sm text-muted-foreground">
                                This project is not just a demo; it represents my ability to solve complex problems, manage large application states, and pay meticulous attention to user interface details.
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
            active ? "bg-white dark:bg-white/10 text-foreground shadow-sm" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
        )}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
);

const InfoCard = ({ label, value }: any) => (
    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
    </div>
);

const SocialButton = ({ icon: Icon, label }: any) => (
    <Button variant="outline" size="sm" className="gap-2">
        <Icon className="w-4 h-4" /> {label}
    </Button>
);

const TechCard = ({ name, desc, color }: any) => (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-white dark:bg-slate-900 hover:border-primary/50 transition-colors cursor-default">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
            <Code2 className="w-5 h-5" />
        </div>
        <div>
            <p className="font-bold text-sm">{name}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
    </div>
);

const StoryItem = ({ title, date, text }: any) => (
    <div className="relative pl-6">
        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-background border-2 border-primary" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mb-1">
            <h3 className="font-bold text-lg">{title}</h3>
            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">{date}</span>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">{text}</p>
    </div>
);