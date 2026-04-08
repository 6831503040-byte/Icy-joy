import React, { useState } from 'react';
import { IceCream, ServingFormat, ServingSize } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Check, HelpCircle } from 'lucide-react';

interface ProductDetailProps {
  product: IceCream;
  onBack: () => void;
  onAddToCart: (product: IceCream, format: ServingFormat, size: ServingSize, price: number) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const TOPPINGS = [
  { id: 'sprinkles', name: 'Rainbow Sprinkles', icon: '🌈', price: 5 },
  { id: 'chocolate', name: 'Chocolate Sauce', icon: '🍫', price: 10 },
  { id: 'whipped', name: 'Whipped Cream', icon: '☁️', price: 10 },
  { id: 'cherry', name: 'Maraschino Cherry', icon: '🍒', price: 5 },
  { id: 'nuts', name: 'Crushed Peanuts', icon: '🥜', price: 10 },
  { id: 'caramel', name: 'Salted Caramel', icon: '🍯', price: 10 },
];

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onAddToCart, isFavorite, onToggleFavorite }) => {
  const [step, setStep] = useState(1);
  const [format, setFormat] = useState<ServingFormat>('Scoop');
  const [size, setSize] = useState<ServingSize>('S');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

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

  const toggleTopping = (id: string) => {
    setSelectedToppings(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const toppingsPrice = selectedToppings.reduce((sum, id) => {
    const topping = TOPPINGS.find(t => t.id === id);
    return sum + (topping?.price || 0);
  }, 0);

  const finalPrice = (format === 'Quart' 
    ? product.price + getSizePriceModifier(size) 
    : product.price) + toppingsPrice;

  const steps = [
    { id: 1, name: 'Base' },
    { id: 2, name: 'Toppings' },
    { id: 3, name: 'Review' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Stepper */}
      <div className="mb-12 max-w-2xl mx-auto">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 -z-10"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-pink-500 -translate-y-1/2 -z-10 transition-all duration-500"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center">
              <button
                onClick={() => s.id < step && setStep(s.id)}
                disabled={s.id > step}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg transition-all border-4 ${
                  step === s.id 
                    ? 'bg-white border-pink-500 text-pink-500 scale-110 shadow-lg' 
                    : step > s.id 
                      ? 'bg-pink-500 border-pink-500 text-white' 
                      : 'bg-white border-gray-200 text-gray-300'
                }`}
              >
                {step > s.id ? <Check size={24} strokeWidth={3} /> : s.id}
              </button>
              <span className={`mt-2 text-xs font-bold uppercase tracking-widest ${step >= s.id ? 'text-pink-600' : 'text-gray-400'}`}>
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-pink-600 font-bold text-lg hover:underline group"
      >
        <div className="w-10 h-10 rounded-full border-2 border-pink-200 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
          <ChevronLeft size={24} />
        </div>
        Back to Menu
      </button>

      <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
        <div className={`p-12 ${product.color} flex items-center justify-center relative`}>
          <button 
            onClick={onToggleFavorite}
            className={`absolute top-8 left-8 w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 ${isFavorite ? 'bg-pink-500 text-white' : 'bg-white text-gray-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <motion.img 
            layoutId={`product-img-${product.id}`}
            src={product.image} 
            alt={product.name} 
            className="w-full max-w-sm rounded-3xl shadow-xl border-8 border-white"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="p-12 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
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
                            className={`py-3 px-2 rounded-2xl font-bold transition-all border-2 flex flex-col items-center justify-center ${size === s ? 'bg-yellow-400 border-yellow-400 text-gray-900 shadow-lg' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-yellow-200'}`}
                          >
                            <span className="text-lg">Size {s}</span>
                            <span className={`text-[10px] uppercase ${size === s ? 'text-yellow-100' : 'text-gray-400'}`}>{getSizeVolume(s)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-black text-gray-800">Add some <span className="text-pink-600">Magic</span></h2>
                <p className="text-gray-500 font-medium">Customize your scoop with our premium toppings.</p>
                
                <div className="grid grid-cols-2 gap-4">
                  {TOPPINGS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => toggleTopping(t.id)}
                      className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                        selectedToppings.includes(t.id) 
                          ? 'bg-pink-50 border-pink-500 shadow-md' 
                          : 'bg-white border-gray-100 hover:border-pink-200'
                      }`}
                    >
                      <span className="text-2xl">{t.icon}</span>
                      <div className="text-left">
                        <div className={`font-bold text-sm ${selectedToppings.includes(t.id) ? 'text-pink-600' : 'text-gray-700'}`}>{t.name}</div>
                        <div className="text-[10px] text-gray-400 font-bold">+ ฿{t.price}</div>
                      </div>
                      {selectedToppings.includes(t.id) && (
                        <div className="ml-auto text-pink-500">
                          <Check size={16} strokeWidth={4} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-black text-gray-800">Ready to <span className="text-pink-600">Enjoy?</span></h2>
                <div className="bg-gray-50 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                    <div className="font-bold text-gray-700">{product.name} ({format})</div>
                    <div className="font-black text-gray-900">฿{format === 'Quart' ? product.price + getSizePriceModifier(size) : product.price}</div>
                  </div>
                  
                  {selectedToppings.length > 0 && (
                    <div className="space-y-2 border-b border-gray-200 pb-4">
                      <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Toppings</div>
                      {selectedToppings.map(id => {
                        const t = TOPPINGS.find(x => x.id === id);
                        return (
                          <div key={id} className="flex justify-between items-center text-sm">
                            <div className="text-gray-600">{t?.icon} {t?.name}</div>
                            <div className="font-bold text-gray-800">+ ฿{t?.price}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xl font-black text-gray-800">Total</div>
                    <div className="text-3xl font-black text-blue-600">฿{finalPrice}</div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-2xl flex items-start gap-3 border border-yellow-100">
                  <HelpCircle className="text-yellow-600 shrink-0" size={20} />
                  <p className="text-xs text-yellow-800 leading-relaxed">
                    <strong>Pro Tip:</strong> Our {product.name} pairs perfectly with {TOPPINGS[Math.floor(Math.random() * TOPPINGS.length)].name}!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-4 pt-8">
            {step > 1 && (
              <button 
                onClick={() => setStep(prev => prev - 1)}
                className="p-5 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            
            <button 
              onClick={() => {
                if (step < 3) {
                  setStep(prev => prev + 1);
                } else {
                  onAddToCart(product, format, format === 'Quart' ? size : 'S', finalPrice);
                }
              }}
              className="flex-grow py-5 bg-pink-600 text-white text-xl font-bold rounded-2xl hover:bg-pink-700 transition-all shadow-xl hover:shadow-pink-200 active:scale-95 flex items-center justify-center gap-2"
            >
              {step < 3 ? (
                <>Next Step <ChevronRight size={24} /></>
              ) : (
                <>Add to Basket <Check size={24} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
