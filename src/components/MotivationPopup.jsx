import React, { useState, useEffect } from 'react';
import { MOTIVATION_DATA } from '../lib/quotes';
import { X } from 'lucide-react';

const MotivationPopup = () => {
  const [quote, setQuote] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Check if we already showed it this session
    const hasSeen = sessionStorage.getItem('hasSeenQuote');
    
    if (!hasSeen) {
      // 2. RANDOM SELECTION LOGIC
      // Math.random() gives 0 to 0.99. Multiply by length and floor it to get a random index.
      const randomIndex = Math.floor(Math.random() * MOTIVATION_DATA.length);
      setQuote(MOTIVATION_DATA[randomIndex]);
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Mark as seen so it doesn't pop up on every page reload (optional)
    // Remove this line if you WANT it to show on every single refresh
    sessionStorage.setItem('hasSeenQuote', 'true'); 
  };

  if (!isVisible || !quote) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 transform transition-all scale-100">
        
        {/* Image Section */}
        <div className="h-48 sm:h-64 relative">
            <img 
                src={quote.image} 
                alt="Motivation" 
                className="w-full h-full object-cover brightness-75"
                onError={(e) => {
                    // Fallback if offline or image fails
                    e.target.style.display = 'none'; 
                    e.target.parentElement.style.backgroundColor = '#3e5636'; // Army Green
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-xs font-bold uppercase tracking-widest text-army-500 mb-1">Daily Motivation</h3>
                <div className="h-1 w-12 bg-army-500 rounded"></div>
            </div>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 text-center space-y-6">
          <blockquote className="text-xl sm:text-2xl font-serif italic text-gray-800 dark:text-gray-100 leading-relaxed">
            "{quote.text}"
          </blockquote>
          
          <p className="text-sm font-bold text-army-700 dark:text-army-500 uppercase tracking-wide">
            — {quote.author}
          </p>

          <button 
            onClick={handleClose}
            className="w-full py-3 bg-army-500 hover:bg-army-700 text-white font-semibold rounded-lg transition-all active:scale-95 shadow-lg shadow-army-500/30"
          >
            Jai Hind! 
            <img 
              src="https://flagcdn.com/w40/in.png" 
              alt="Indian Flag" 
              className="w-6 h-auto rounded-sm shadow-sm" 
            />
          </button>
        </div>

      </div>
    </div>
  );
};

export default MotivationPopup;
