
import React, { useState } from 'react';
import { ICE_CREAMS } from '../constants';
import { IceCream, ServingFormat, ServingSize } from '../types';

interface MenuProps {
  onSelectProduct: (product: IceCream) => void;
  onAddToCart: (product: IceCream, format: ServingFormat, size: ServingSize, price: number) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

const Menu: React.FC<MenuProps> = ({ onSelectProduct, onAddToCart, favorites, onToggleFavorite }) => {
  const [filter, setFilter] = useState<'All' | 'Classic' | 'Special' | 'Fruity'>('All');
  const [quickAddId, setQuickAddId] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ServingFormat>('Scoop');
  const [selectedSize, setSelectedSize] = useState<ServingSize>('S');

  const filteredItems = filter === 'All' 
    ? ICE_CREAMS 
    : ICE_CREAMS.filter(item => item.category === filter);

  const getSizePriceModifier = (s: ServingSize) => {
    switch (s) {
      case 'M': return 15;
      case 'L': return 35;
      default: return 0;
    }
  };

  const getSizeVolume = (s: ServingSize) => {
    switch (s) {
      case 'S': return '8 oz.';
      case 'M': return '12 oz.';
      case 'L': return '16 oz.';
      default: return '';
    }
  };

  const handleQuickAddClick = (e: React.MouseEvent, item: IceCream) => {
    e.stopPropagation();
    if (quickAddId === item.id) {
      const finalPrice = selectedFormat === 'Quart' 
        ? item.price + getSizePriceModifier(selectedSize) 
        : item.price;
      onAddToCart(item, selectedFormat, selectedFormat === 'Quart' ? selectedSize : 'S', finalPrice);
      setQuickAddId(null);
    } else {
      setQuickAddId(item.id);
      setSelectedFormat('Scoop');
      setSelectedSize('S');
    }
  };

  const handleCancelQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickAddId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
        <h2 className="text-4xl md:text-5xl font-black text-gray-800">Explore Our <span className="text-pink-600">Scoops</span></h2>
        
        <div className="flex flex-wrap justify-center gap-3">
          {['All', 'Classic', 'Fruity', 'Special'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`px-6 py-2 rounded-full font-bold transition-all border-2 ${
                filter === cat 
                ? 'bg-yellow-400 border-yellow-400 text-white shadow-lg' 
                : 'bg-white border-pink-200 text-gray-600 hover:border-pink-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredItems.map((item) => {
          const isFav = favorites.includes(item.id);
          const isQuickAdding = quickAddId === item.id;
          const currentPrice = isQuickAdding && selectedFormat === 'Quart' 
            ? item.price + getSizePriceModifier(selectedSize) 
            : item.price;

          return (
            <div 
              key={item.id} 
              className={`${item.color} rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer border-2 border-transparent hover:border-white/50 relative flex flex-col`}
              onClick={() => onSelectProduct(item)}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(item.id);
                }}
                className={`absolute top-4 left-4 z-30 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90 ${isFav ? 'bg-pink-500 text-white' : 'bg-white/90 backdrop-blur-sm text-gray-400 hover:text-pink-500'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isFav ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              <div className="relative overflow-hidden h-64 flex-shrink-0">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className={`w-full h-full object-cover transition-transform duration-500 ${isQuickAdding ? 'scale-105 blur-[2px]' : 'group-hover:scale-110'}`}
                />
                
                {isQuickAdding && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-md z-10 flex flex-col justify-center p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <p className="text-xs font-black text-pink-600 uppercase tracking-widest mb-2 text-center">Select Style</p>
                      <div className="flex gap-2">
                        {['Scoop', 'Quart'].map((f) => (
                          <button
                            key={f}
                            onClick={() => setSelectedFormat(f as ServingFormat)}
                            className={`flex-1 py-3 text-2xl font-black rounded-2xl transition-all border-2 ${selectedFormat === f ? 'bg-pink-600 border-pink-600 text-white shadow-lg' : 'bg-white border-white text-gray-400'}`}
                          >
                            {f === 'Scoop' ? '🍦' : '🍨'}
                            <div className="text-[10px] uppercase tracking-tighter">{f}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedFormat === 'Quart' && (
                      <div className="animate-in slide-in-from-top-2 duration-200">
                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 text-center">Quart Size</p>
                        <div className="flex gap-2">
                          {['S', 'M', 'L'].map((s) => (
                            <button
                              key={s}
                              onClick={() => setSelectedSize(s as ServingSize)}
                              className={`flex-1 py-2 text-xl font-black rounded-2xl transition-all border-2 flex flex-col items-center justify-center ${selectedSize === s ? 'bg-yellow-400 border-yellow-400 text-white shadow-lg' : 'bg-white border-white text-gray-400'}`}
                            >
                              <span>{s}</span>
                              <span className={`text-[8px] font-bold ${selectedSize === s ? 'text-yellow-100' : 'text-gray-400'}`}>{getSizeVolume(s as ServingSize)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full font-bold text-pink-600 shadow-sm z-20">
                  ★ {item.rating}
                </div>
              </div>

              <div className="p-8 space-y-4 flex-grow flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{item.name}</h3>
                    <p className="text-gray-500 text-sm">{item.category}</p>
                  </div>
                  <p className="text-2xl font-black text-blue-600">฿{currentPrice}</p>
                </div>
                
                <p className="text-gray-600 line-clamp-2">{item.description}</p>
                
                <div className="flex gap-3 pt-2">
                  {isQuickAdding ? (
                    <div className="flex w-full gap-2">
                      <button 
                        onClick={handleCancelQuickAdd}
                        className="w-1/3 py-4 font-black text-lg rounded-2xl bg-white text-gray-400 border-2 border-gray-100 hover:bg-gray-50 hover:text-red-400 transition-all active:scale-95 flex items-center justify-center"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={(e) => handleQuickAddClick(e, item)}
                        className="flex-grow py-4 font-black text-lg rounded-2xl bg-blue-500 text-white border-2 border-blue-500 hover:bg-blue-600 shadow-blue-100 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        Confirm
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => handleQuickAddClick(e, item)}
                      className="w-full py-4 font-black text-lg rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 border-2 bg-white text-pink-600 border-pink-200 hover:bg-pink-600 hover:text-white hover:border-pink-600 shadow-md"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Menu;
