import React from 'react';
import { Languages, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-8 px-4 flex flex-col items-center justify-center space-y-4 text-center">
      <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-xl">
        <Languages className="text-pink-400 w-6 h-6" />
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400">
          LipiFlow
        </span>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
        Hindi <span className="text-white/40 mx-2">to</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Hinglish</span>
      </h1>
      <p className="text-slate-400 max-w-lg text-sm md:text-base">
        Transform Devanagari script into Roman Latin instantly using AI. Perfect for messaging and social media.
      </p>
    </header>
  );
};