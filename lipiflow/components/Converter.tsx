import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Copy, Check, RotateCcw, X, Sparkles, Loader2 } from 'lucide-react';
import { transliterateHindiToHinglish } from '../services/transliterationService';
import { TransliterationState, CopyStatus } from '../types';
import { ActionButton } from './ActionButton';

export const Converter: React.FC = () => {
  const [state, setState] = useState<TransliterationState>({
    input: '',
    output: '',
    isLoading: false,
    error: null,
  });

  const [inputCopyStatus, setInputCopyStatus] = useState<CopyStatus>(CopyStatus.Idle);
  const [outputCopyStatus, setOutputCopyStatus] = useState<CopyStatus>(CopyStatus.Idle);
  
  const outputRef = useRef<HTMLTextAreaElement>(null);

  const handleTransliterate = () => {
    if (!state.input.trim()) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = transliterateHindiToHinglish(state.input);
      setState(prev => ({ ...prev, output: result, isLoading: false }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: err.message || "Something went wrong" 
      }));
    }
  };

  const handleClear = () => {
    setState({
      input: '',
      output: '',
      isLoading: false,
      error: null,
    });
  };

  const copyToClipboard = async (text: string, isInput: boolean) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (isInput) {
        setInputCopyStatus(CopyStatus.Copied);
        setTimeout(() => setInputCopyStatus(CopyStatus.Idle), 2000);
      } else {
        setOutputCopyStatus(CopyStatus.Copied);
        setTimeout(() => setOutputCopyStatus(CopyStatus.Idle), 2000);
      }
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  // Keyboard shortcut (Ctrl/Cmd + Enter) to trigger conversion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleTransliterate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.input]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 relative z-10">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-900/20 blur-[100px] -z-10 rounded-full pointer-events-none" />

      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* Input Section */}
        <div className="flex-1 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col group focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all duration-300">
          <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-700/50 flex justify-between items-center">
            <h2 className="text-slate-200 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              Hindi (Devanagari)
            </h2>
            <div className="flex items-center gap-1">
              {state.input && (
                <ActionButton 
                  onClick={() => copyToClipboard(state.input, true)} 
                  icon={inputCopyStatus === CopyStatus.Copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  variant="ghost"
                  title="Copy text"
                />
              )}
              {state.input && (
                <ActionButton 
                  onClick={handleClear} 
                  icon={<X className="w-4 h-4" />}
                  variant="ghost"
                  title="Clear all"
                />
              )}
            </div>
          </div>
          <div className="relative flex-1 min-h-[300px]">
            <textarea
              className="w-full h-full bg-transparent text-white p-6 text-xl md:text-2xl font-hindi resize-none focus:outline-none placeholder-slate-600 leading-relaxed"
              placeholder="यहाँ टाइप करें... (Type here...)"
              value={state.input}
              onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
            />
          </div>
          <div className="px-4 py-3 bg-slate-900/30 text-xs text-slate-500 border-t border-slate-700/30 flex justify-between items-center">
            <span>{state.input.length} characters</span>
            <span className="hidden md:inline">Press Ctrl + Enter to convert</span>
          </div>
        </div>

        {/* Action Button Section (Desktop: Center Vertical, Mobile: Center Horizontal) */}
        <div className="flex lg:flex-col items-center justify-center gap-4">
          <button
            onClick={handleTransliterate}
            disabled={state.isLoading || !state.input.trim()}
            className={`
              group relative flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 rounded-full 
              bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30
              hover:scale-105 active:scale-95 transition-all duration-300
              disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed
            `}
          >
            {state.isLoading ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <ArrowRight className="w-8 h-8 text-white lg:rotate-0 rotate-90 transition-transform group-hover:translate-x-1 lg:group-hover:translate-x-1 lg:group-hover:translate-y-0 group-hover:translate-y-1" />
            )}
            
            {/* Tooltip for the button */}
            <span className="absolute -bottom-10 lg:bottom-auto lg:left-24 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Convert
            </span>
          </button>
        </div>

        {/* Output Section */}
        <div className="flex-1 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-purple-500/50 transition-all duration-300">
          <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-700/50 flex justify-between items-center">
            <h2 className="text-slate-200 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Hinglish (Roman)
            </h2>
            <div className="flex items-center gap-1">
              {state.output && (
                <ActionButton 
                  onClick={() => copyToClipboard(state.output, false)} 
                  icon={outputCopyStatus === CopyStatus.Copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  variant="ghost"
                  title="Copy result"
                />
              )}
            </div>
          </div>
          <div className="relative flex-1 min-h-[300px] bg-black/20">
            {state.isLoading ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-3">
                 <Sparkles className="w-8 h-8 animate-pulse text-indigo-400" />
                 <p className="animate-pulse">Transliterating...</p>
               </div>
            ) : state.output ? (
              <textarea
                ref={outputRef}
                className="w-full h-full bg-transparent text-indigo-100 p-6 text-xl md:text-2xl font-sans resize-none focus:outline-none leading-relaxed"
                value={state.output}
                readOnly
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-600 pointer-events-none p-6 text-center">
                <p>Result will appear here...</p>
              </div>
            )}
          </div>
           {/* Error Display */}
           {state.error && (
            <div className="bg-red-900/20 border-t border-red-500/20 p-3 text-red-200 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {state.error}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};