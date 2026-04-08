
import React, { useState, useEffect, useRef } from 'react';
import { ICE_CREAMS } from '../constants';
import { IceCream, ServingFormat, ServingSize } from '../types';

interface MenuProps {
  onSelectProduct: (product: IceCream) => void;
  onAddToCart: (product: IceCream, format: ServingFormat, size: ServingSize, price: number) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating-desc' | 'name-asc';

const Menu: React.FC<MenuProps> = ({ onSelectProduct, onAddToCart, favorites, onToggleFavorite }) => {
  const [filter, setFilter] = useState<'All' | 'Classic' | 'Special' | 'Fruity'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredAndSortedItems = (() => {
    let items = [...ICE_CREAMS];

    // Category Filter
    if (filter !== 'All') {
      items = items.filter(item => item.category === filter);
    }

    // Search Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(term) || 
        item.description.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        items.sort((a, b) => b.rating - a.rating);
        break;
      case 'name-asc':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep original order
        break;
    }

    return items;
  })();

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

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col space-y-8 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <h2 className="text-4xl md:text-5xl font-black text-gray-800">Explore Our <span className="text-pink-600">Scoops</span></h2>
          
          <div className="flex flex-wrap justify-center gap-3">
            {['All', 'Classic', 'Fruity', 'Special'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat as any)}
                className={`px-6 py-2 rounded-full font-bold transition-all border-2 ${
                  filter === cat 
                  ? 'bg-yellow-400 border-yellow-400 text-gray-900 shadow-lg' 
                  : 'bg-white border-pink-200 text-gray-600 hover:border-pink-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-3xl shadow-sm border border-pink-50">
          <div className="relative flex-grow w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search flavors... (Press '/' to focus)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-pink-300 transition-all text-gray-700 font-medium"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Sort by</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="flex-grow sm:flex-grow-0 px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-pink-300 transition-all text-gray-700 font-bold appearance-none cursor-pointer pr-10 relative"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239CA3AF\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5rem' }}
            >
              <option value="default">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Top Rated</option>
              <option value="name-asc">Name: A-Z</option>
            </select>
          </div>
        </div>

        {searchTerm && (
          <p className="text-gray-500 font-medium animate-in fade-in slide-in-from-left-2">
            Found <span className="text-pink-600 font-black">{filteredAndSortedItems.length}</span> results for "{searchTerm}"
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredAndSortedItems.length > 0 ? (
          filteredAndSortedItems.map((item) => {
          const isFav = favorites.includes(item.id);

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
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
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
                  <p className="text-2xl font-black text-blue-600">฿{item.price}</p>
                </div>
                
                <p className="text-gray-600 line-clamp-2">{item.description}</p>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProduct(item);
                    }}
                    className="w-full py-4 font-black text-lg rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 border-2 bg-white text-pink-600 border-pink-200 hover:bg-pink-600 hover:text-white hover:border-pink-600 shadow-md"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="col-span-full py-20 text-center bg-white rounded-[3rem] shadow-sm border-4 border-dashed border-gray-100">
            <div className="text-8xl mb-6">🍦❓</div>
            <h3 className="text-2xl font-bold text-gray-400">No scoops found matching your search...</h3>
            <button 
              onClick={() => { setSearchTerm(''); setFilter('All'); }}
              className="mt-8 px-10 py-4 bg-pink-600 text-white font-bold rounded-2xl hover:bg-pink-700 transition-all shadow-lg"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
