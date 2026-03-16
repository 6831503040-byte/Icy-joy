
import React, { useState } from 'react';
import { IceCream, ServingFormat, ServingSize } from '../types';

interface ProductDetailProps {
  product: IceCream;
  onBack: () => void;
  onAddToCart: (product: IceCream, format: ServingFormat, size: ServingSize, price: number) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onAddToCart, isFavorite, onToggleFavorite }) => {
  const [format, setFormat] = useState<ServingFormat>('Scoop');
  const [size, setSize] = useState<ServingSize>('S');

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

  // Size logic only applies to Quart format
  const finalPrice = format === 'Quart' 
    ? product.price + getSizePriceModifier(size) 
    : product.price;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-in fade-in zoom-in-95 duration-500">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-pink-600 font-bold text-lg hover:underline group"
      >
        <div className="w-10 h-10 rounded-full border-2 border-pink-200 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </div>
        Back to Menu
      </button>

      <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">
        <div className={`p-12 ${product.color} flex items-center justify-center relative`}>
          <button 
            onClick={onToggleFavorite}
            className={`absolute top-8 left-8 w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 ${isFavorite ? 'bg-pink-500 text-white' : 'bg-white text-gray-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full max-w-sm rounded-3xl shadow-xl border-8 border-white animate-float"
          />
        </div>
        <div className="p-12 flex flex-col justify-center space-y-6">
          <div>
            <span className="px-4 py-1 bg-pink-100 text-pink-600 rounded-full font-bold text-sm uppercase tracking-wider">{product.category}</span>
            <h1 className="text-4xl md:text-5xl font-black text-gray-800 mt-4 mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 text-yellow-500">
              <span className="text-2xl">★★★★★</span>
              <span className="text-gray-400 font-bold">({product.rating} Rating)</span>
            </div>
          </div>

          <p className="text-lg text-gray-600 leading-relaxed">
            {product.description}
          </p>

          <div className="space-y-4 pt-4">
            <div>
              <label className="block font-bold text-gray-700 mb-2">Choose Format</label>
              <div className="flex gap-4">
                {(['Scoop', 'Quart'] as ServingFormat[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`flex-1 py-3 px-4 rounded-2xl font-bold transition-all border-2 ${format === f ? 'bg-pink-600 border-pink-600 text-white shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-pink-200'}`}
                  >
                    {f === 'Scoop' ? 'Scoop 🍦' : 'Quart 🍨'}
                  </button>
                ))}
              </div>
            </div>

            {format === 'Quart' && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block font-bold text-gray-700 mb-2">Select Quart Size</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['S', 'M', 'L'] as ServingSize[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`py-3 px-2 rounded-2xl font-bold transition-all border-2 flex flex-col items-center justify-center ${size === s ? 'bg-yellow-400 border-yellow-400 text-white shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-yellow-200'}`}
                    >
                      <span className="text-lg">Size {s}</span>
                      <span className={`text-[10px] uppercase ${size === s ? 'text-yellow-100' : 'text-gray-400'}`}>{getSizeVolume(s)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-8 pt-6">
            <div className="text-4xl font-black text-blue-600 whitespace-nowrap">฿{finalPrice}</div>
            <button 
              onClick={() => onAddToCart(product, format, format === 'Quart' ? size : 'S', finalPrice)}
              className="flex-grow py-5 bg-pink-600 text-white text-xl font-bold rounded-2xl hover:bg-pink-700 transition-all shadow-xl hover:shadow-pink-200 active:scale-95"
            >
              Add to Basket
            </button>
          </div>

          <div className="pt-6 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1"><span className="text-green-500">✔</span> In Stock</div>
            <div className="flex items-center gap-1"><span className="text-green-500">✔</span> Fast Delivery</div>
            <div className="flex items-center gap-1"><span className="text-green-500">✔</span> Organic</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
