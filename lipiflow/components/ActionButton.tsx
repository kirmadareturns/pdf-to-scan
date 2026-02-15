import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  className?: string;
  title?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  onClick, 
  icon, 
  label, 
  variant = 'primary', 
  disabled = false,
  className = '',
  title
}) => {
  const baseStyles = "flex items-center justify-center space-x-2 transition-all duration-200 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-3 shadow-lg shadow-indigo-500/20 active:scale-95",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 border border-slate-600 active:scale-95",
    ghost: "text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-full",
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      title={title}
    >
      {icon}
      {label && <span>{label}</span>}
    </button>
  );
};