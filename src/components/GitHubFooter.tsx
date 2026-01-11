import React, { useState } from 'react';
import { Star, Github, Sun, Moon, Linkedin, Heart, Code } from 'lucide-react';

const GitHubFooter: React.FC = () => {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
  
  const toggleTheme = (): void => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <footer className="w-full relative mt-16">
      {/* Gradient border top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      {/* Glass effect wrapper */}
      <div 
        className="backdrop-blur-xl bg-gradient-to-br from-indigo-900/60 via-purple-900/50 to-pink-900/60 border-t border-indigo-500/30"
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Main content grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mb-6">
            
            {/* Left: Developer Info */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <Code className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-indigo-300 font-medium">Developed by</p>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    Robiul Hasan Jisan
                  </h3>
                </div>
              </div>
              
              <a 
                href="https://www.linkedin.com/in/robiul-hasan-45766228b/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 hover:border-blue-400/50 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all hover:scale-105 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 w-fit"
              >
                <Linkedin size={18} className="text-blue-300 group-hover:text-blue-200" />
                <span className="font-medium text-blue-300 group-hover:text-blue-200 text-sm">
                  Connect on LinkedIn
                </span>
              </a>
            </div>
            
            {/* Center: Project Info */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="flex items-center gap-2">
                <Heart className="text-pink-400 fill-pink-400" size={20} />
                <span className="text-indigo-200 font-medium">Made with passion</span>
              </div>
              <p className="text-sm text-indigo-300 max-w-md">
                CPU Scheduling Algorithms Simulator - An interactive tool for understanding operating system concepts
              </p>
            </div>
            
            {/* Right: Actions */}
            <div className="flex flex-col md:items-end gap-3">
              <a 
                href="https://github.com/RoBiul-Hasan-Jisan/OS-Simulator"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600/40 to-purple-600/40 border border-indigo-400/30 hover:border-indigo-400/50 hover:from-indigo-600/60 hover:to-purple-600/60 transition-all hover:scale-105 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
              >
                <Github size={20} className="text-white group-hover:animate-bounce" />
                <span className="font-semibold text-white">
                  View on GitHub
                </span>
              </a>
              
              <div className="flex items-center gap-3">
                <a 
                  href="https://github.com/RoBiul-Hasan-Jisan/OS-Simulator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-400/30 hover:border-yellow-400/50 hover:from-yellow-500/30 hover:to-amber-500/30 transition-all hover:scale-105 shadow-lg shadow-yellow-500/20"
                >
                  <Star 
                    size={18} 
                    className="text-yellow-300 group-hover:fill-yellow-300 group-hover:animate-pulse transition-all"
                  />
                  <span className="text-sm font-semibold text-yellow-300 group-hover:text-yellow-200">
                    Star this repo
                  </span>
                </a>
                
                {/* Theme toggle button */}
                <button 
                  onClick={toggleTheme}
                  className="p-3 rounded-xl bg-gradient-to-br from-indigo-600/40 to-purple-600/40 border border-indigo-400/30 hover:border-indigo-400/50 transition-all hover:scale-110 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
                  aria-label="Toggle theme"
                >
                  {isDarkTheme ? 
                    <Sun size={18} className="text-yellow-300" /> : 
                    <Moon size={18} className="text-indigo-300" />
                  }
                </button>
              </div>
            </div>
          </div>
          
          {/* Bottom bar */}
          <div className="pt-6 border-t border-indigo-500/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-4 text-indigo-300">
                <span>© 2026 Robiul Hasan Jisan</span>
                <span className="text-indigo-500">•</span>
                <span>CPU Scheduling Simulator</span>
              </div>
              
              <div className="flex items-center gap-4">
                <a 
                  href="https://github.com/RoBiul-Hasan-Jisan" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-300 hover:text-white transition-colors"
                >
                  GitHub Profile
                </a>
                <span className="text-indigo-500">•</span>
                <a 
                  href="https://www.linkedin.com/in/robiul-hasan-45766228b/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-300 hover:text-white transition-colors"
                >
                  LinkedIn Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative gradient bottom */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
    </footer>
  );
};

export default GitHubFooter;