import React from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Converter } from './components/Converter';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] animate-gradient-x flex flex-col relative overflow-x-hidden">
      
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow flex items-center justify-center py-8">
          <Converter />
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default App;