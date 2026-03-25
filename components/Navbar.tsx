
import React from 'react';
import { View, User } from '../types';

interface NavbarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  cartCount: number;
  isLoggedIn: boolean;
  user?: User | null;
  hasActiveOrder?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, cartCount, isLoggedIn, user, hasActiveOrder }) => {
  const isBase64 = user?.avatar && user.avatar.startsWith('data:image');

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 px-6 py-4 shadow-sm border-b border-pink-100">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer group transition-all"
          onClick={() => onNavigate('home')}
        >
          <div className="relative">
            <span className="text-3xl group-hover:rotate-12 transition-transform inline-block">🍦</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-yellow-500 italic">
              ICY JOY
            </span>
            <span className="text-[10px] font-bold text-pink-400 tracking-[0.2em] ml-0.5 hidden sm:block">PREMIUM SCOOPS</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 font-semibold text-gray-700">
          <button 
            onClick={() => onNavigate('home')}
            className={`hover:text-pink-600 transition-all border-b-2 pb-1 ${currentView === 'home' ? 'text-pink-600 border-pink-600 font-bold' : 'border-transparent'}`}
          >
            Home
          </button>
          <button 
            onClick={() => onNavigate('menu')}
            className={`hover:text-pink-600 transition-all border-b-2 pb-1 ${currentView === 'menu' || currentView === 'details' ? 'text-pink-600 border-pink-600 font-bold' : 'border-transparent'}`}
          >
            Menu
          </button>
          <button 
            onClick={() => onNavigate('ai-match')}
            className={`hover:text-pink-600 transition-all border-b-2 pb-1 ${currentView === 'ai-match' ? 'text-pink-600 border-pink-600 font-bold' : 'border-transparent'}`}
          >
            AI Finder
          </button>
        </div>

        <div className="flex items-center gap-4">
          {hasActiveOrder && currentView !== 'order-status' && (
            <button 
              onClick={() => onNavigate('order-status')}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full font-bold text-sm hover:bg-yellow-200 transition-all animate-pulse"
            >
              <span>🛵</span>
              <span className="hidden sm:inline">Track Order</span>
            </button>
          )}

          <button 
            onClick={() => onNavigate('cart')}
            className="relative p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors text-blue-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
          
          {isLoggedIn ? (
            <button 
              onClick={() => onNavigate('profile')}
              className={`w-10 h-10 rounded-full overflow-hidden bg-yellow-400 flex items-center justify-center font-bold text-gray-900 border-2 transition-all hover:scale-110 shadow-sm ${currentView === 'profile' ? 'border-pink-500 ring-2 ring-pink-200' : 'border-white'}`}
            >
              {isBase64 ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </button>
          ) : (
            <button 
              onClick={() => onNavigate('login')}
              className="px-5 py-2 bg-pink-600 text-white rounded-full font-bold hover:bg-pink-700 transition-all shadow-md active:scale-95"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
