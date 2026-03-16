
import React, { useState } from 'react';
import { getIceCreamMatch } from '../geminiService';
import { ICE_CREAMS } from '../constants';
import { IceCream } from '../types';

interface AIMatchmakerProps {
  onBack: () => void;
  onAddToCart: (p: IceCream) => void;
}

const AIMatchmaker: React.FC<AIMatchmakerProps> = ({ onBack, onAddToCart }) => {
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ flavorName: string; reason: string; vibe: string } | null>(null);

  const handleMatch = async () => {
    if (!mood.trim()) return;
    setLoading(true);
    
    // Extract names from our menu constants to send to AI
    const availableFlavorNames = ICE_CREAMS.map(item => item.name);
    
    const recommendation = await getIceCreamMatch(mood, availableFlavorNames);
    setResult(recommendation);
    setLoading(false);
  };

  const matchedProduct = result ? ICE_CREAMS.find(p => 
    p.name.toLowerCase().includes(result.flavorName.toLowerCase()) || 
    result.flavorName.toLowerCase().includes(p.name.toLowerCase())
  ) || ICE_CREAMS[0] : null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-gray-400 font-bold hover:text-blue-500 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </button>

      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[3rem] p-12 text-white shadow-2xl overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-4">AI Flavor Matchmaker ✨</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-lg">Tell us how you're feeling, and our smart cone will suggest the perfect scoop for your soul.</p>

          {!result ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              <textarea 
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="I'm feeling a bit tired but excited for the weekend..."
                className="w-full p-8 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl focus:outline-none focus:border-white/50 text-white placeholder-blue-200 text-xl min-h-[150px]"
              />
              <button 
                onClick={handleMatch}
                disabled={loading || !mood}
                className="px-12 py-5 bg-white text-blue-600 text-xl font-black rounded-2xl hover:bg-blue-50 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    Thinking...
                  </>
                ) : 'Match Me! 🍦'}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 text-gray-800 animate-in zoom-in-95 duration-500">
              <div className="flex flex-col md:flex-row gap-10 items-center">
                {matchedProduct && (
                  <img 
                    src={matchedProduct.image} 
                    alt={matchedProduct.name} 
                    className="w-48 h-48 rounded-2xl object-cover shadow-xl border-4 border-blue-50"
                  />
                )}
                <div className="flex-grow space-y-4">
                  <div className="inline-block px-4 py-1 bg-blue-100 text-blue-600 rounded-full font-bold text-sm uppercase">{result.vibe}</div>
                  <h3 className="text-4xl font-black text-blue-600">{result.flavorName}</h3>
                  <p className="text-xl italic text-gray-600">"{result.reason}"</p>
                  <div className="flex flex-wrap gap-4 pt-4">
                    <button 
                      onClick={() => matchedProduct && onAddToCart(matchedProduct)}
                      className="px-8 py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 transition-all shadow-lg active:scale-95"
                    >
                      Add To Order
                    </button>
                    <button 
                      onClick={() => {setResult(null); setMood('');}}
                      className="px-8 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all"
                    >
                      Try Another Mood
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Decorative Floating Circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
      </div>
    </div>
  );
};

export default AIMatchmaker;
