import React, { useState, useEffect } from "react";
import {
  Moon, Sun, Monitor, Lock, User, Image as ImageIcon,
  Globe, Check, Upload, Shield, Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import packageJson from '../../../../package.json';

const SettingSection = ({ title, description, children }: { title: string, description?: string, children: React.ReactNode }) => (
  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="border-b border-border/40 pb-4">
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
    <div className="grid gap-6 pt-2">
      {children}
    </div>
  </div>
);

const ThemeCard = ({ mode, current, onClick, icon: Icon }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "relative flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 transition-all duration-200 hover:scale-105",
      current === mode
        ? "border-primary bg-primary/10 text-primary shadow-sm"
        : "border-border/50 bg-background/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    )}
  >
    <Icon className="w-6 h-6" />
    <span className="text-sm font-medium capitalize">{mode}</span>
    {current === mode && (
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
    )}
  </button>
);

export const Settings = () => {
  const { mode, setMode } = useTheme();
  const [activeTab, setActiveTab] = useState("appearance");
  const [password, setPassword] = useState("");
  const [bgPreview, setBgPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [systemName, setSystemName] = useState("");
  const [initials, setInitials] = useState("GU");

  useEffect(() => {
    const storedName = localStorage.getItem("systemName");
    if (storedName) {
      setSystemName(storedName);

      const letters = storedName.trim().slice(0, 2).toUpperCase();
      setInitials(letters);
    } else {
      setSystemName("Guest");
      setInitials("GU");
    }
  }, []);

  useEffect(() => {
    const savedBg = localStorage.getItem("nexa_background");
    if (savedBg) setBgPreview(savedBg);
  }, []);

  const savePassword = async () => {
    if (!password) return;
    setIsLoading(true);

    setTimeout(async () => {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      localStorage.setItem("nexa_password", hashHex);
      setIsLoading(false);
      setPassword("");
      alert("Password secured successfully! 🔒");
    }, 800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      localStorage.setItem("nexa_background", base64);
      setBgPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const menuItems = [
    { id: "appearance", label: "Appearance", icon: Monitor },
    { id: "account", label: "Account & Security", icon: Shield },
    { id: "language", label: "Language & Region", icon: Globe },
    { id: "about", label: "About Nexa", icon: Smartphone },
  ];

  return (
    <div className="flex w-full h-full max-w-5xl mx-auto bg-background/60 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden transition-all dark:border-white/10 dark:bg-black/40">

      <div className="w-64 bg-muted/30 border-r border-border/40 flex flex-col p-4 gap-2 backdrop-blur-md">
        <div className="px-4 py-6 mb-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Nexa OS
          </h2>
          <p className="text-xs text-muted-foreground font-medium">System Preferences</p>
        </div>

        <nav className="space-y-1 flex-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === item.id
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/10 hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-border/40 flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold">{systemName}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 scroll-smooth">

        {activeTab === "appearance" && (
          <SettingSection title="Personalization" description="Customize the look and feel of your desktop">

            <div className="space-y-3">
              <Label>Theme Mode</Label>
              <div className="grid grid-cols-3 gap-4">
                <ThemeCard mode="light" icon={Sun} current={mode} onClick={() => setMode("light")} />
                <ThemeCard mode="dark" icon={Moon} current={mode} onClick={() => setMode("dark")} />
                <ThemeCard mode="auto" icon={Monitor} current={mode} onClick={() => setMode("auto")} />
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <Label>Desktop Wallpaper</Label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                <div className="col-span-3 md:col-span-3 h-48 rounded-xl overflow-hidden border border-border/50 relative group shadow-inner bg-muted/50">
                  {bgPreview ? (
                    <img src={bgPreview} alt="Current Wallpaper" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No wallpaper set
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>

                <div className="col-span-3 md:col-span-1">
                  <label className="cursor-pointer h-48 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary hover:bg-primary/5 transition-all group">
                    <div className="p-3 rounded-full bg-muted group-hover:bg-background transition-colors shadow-sm">
                      <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">Upload New</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              <Label>Accent Color</Label>
              <div className="flex gap-3">
                {['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500'].map((color, i) => (
                  <button key={i} className={`${color} w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-background ring-transparent hover:ring-border transition-all active:scale-90`} />
                ))}
              </div>
            </div>
          </SettingSection>
        )}

        {activeTab === "account" && (
          <SettingSection title="Security & Privacy" description="Manage your password and login methods">
            <div className="bg-muted/20 p-6 rounded-xl border border-border/50 space-y-6">

              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-full">
                  <Lock className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h4 className="font-medium">System Password</h4>
                  <p className="text-xs text-muted-foreground">Used for lock screen and administrative tasks</p>
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <Label htmlFor="pass">New Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="pass"
                    type="password"
                    placeholder="Enter strong password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50"
                  />
                  <Button onClick={savePassword} disabled={!password || isLoading}>
                    {isLoading ? "Saving..." : "Update"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-muted/20 p-6 rounded-xl border border-border/50 space-y-4 mt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <User className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-medium">System Name</h4>
                  <p className="text-xs text-muted-foreground">Displayed across the OS (widgets, start menu, lock screen)</p>
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <Label htmlFor="systemName">Change System Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="systemName"
                    type="text"
                    placeholder="Enter new system name..."
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    className="bg-background/50"
                  />
                  <Button
                    onClick={() => {
                      if (systemName.trim().length > 0) {
                        localStorage.setItem("systemName", systemName.trim());
                        alert("System name updated successfully!");
                      }
                    }}
                  >
                    Update
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current name: <span className="font-semibold">{localStorage.getItem("systemName") || "Guest"}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20 mt-6">
              <div className="space-y-0.5">
                <Label className="text-base">Two-Factor Authentication</Label>
                <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch />
            </div>
          </SettingSection>
        )}

        {activeTab === "language" && (
          <SettingSection title="Language & Region" description="Select your preferred system language">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <Label className="text-base">System Language</Label>
                  <p className="text-xs text-muted-foreground">Primary language for UI</p>
                </div>
              </div>
              <Select defaultValue="en">
                <SelectTrigger className="w-40 bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (US)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SettingSection>
        )}

        {activeTab === "about" && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/20 mb-4">
              <Monitor className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold">Nexa OS</h2>
            <p className="text-muted-foreground">
              Version {packageJson.version} (Beta)
            </p>
            <div className="text-xs text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border border-border/50">
              Built with React, Tailwind & Passion
            </div>
          </div>
        )}

      </div>
    </div>
  );
};