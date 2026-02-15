import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 text-center text-slate-500 text-sm">
      <p>© {new Date().getFullYear()} LipiFlow. Powered by Gemini.</p>
    </footer>
  );
};