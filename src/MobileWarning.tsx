import React from "react";
import { Monitor } from "lucide-react";

interface MobileWarningProps {
  onContinue: () => void;
}

export const MobileWarning = ({ onContinue }: MobileWarningProps) => (
  <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center p-8 text-center z-[9999]">
    <div className="w-20 h-20 border-2 border-white/20 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
      <Monitor className="w-10 h-10" />
    </div>

    <h1 className="text-2xl font-bold mb-4">Nexa OS Desktop Experience</h1>

    <p className="text-gray-400 mb-8 leading-relaxed">
      This project is designed to showcase the power of web development in a desktop-like environment.
      <br />
      For the best and most complete experience, please use a <strong>computer or laptop</strong>.
    </p>

    <button
      onClick={onContinue}
      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors"
    >
      Continue Anyway
    </button>

    <div className="text-xs text-gray-600 mt-auto">
      Designed by Agrest
    </div>
  </div>
);
