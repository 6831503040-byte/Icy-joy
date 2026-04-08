
import React from 'react';
import { CartItem, ServingFormat, ServingSize } from '../types';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, format: ServingFormat, size: ServingSize, delta: number) => void;
  onUpdateSize: (id: string, format: ServingFormat, oldSize: ServingSize, newSize: ServingSize) => void;
  onBack: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ items, onUpdateQuantity, onUpdateSize, onBack, onCheckout }) => {
  const total = items.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

  const getSizeVolume = (s: ServingSize) => {
    switch (s) {
      case 'S': return '8 oz.';
      case 'M': return '12 oz.';
      case 'L': return '16 oz.';
      default: return '';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
       <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-gray-400 font-bold hover:text-pink-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Continue Shopping
      </button>

      <h2 className="text-4xl font-black text-gray-800 mb-10 flex items-center gap-4">
        Your Cart <span className="bg-blue-100 text-blue-600 text-xl px-4 py-1 rounded-full">{items.length} items</span>
      </h2>

      {items.length === 0 ? (
        <div className="bg-white p-20 rounded-[3rem] text-center shadow-xl border-4 border-dashed border-gray-100">
          <div className="text-8xl mb-6">🏜️</div>
          <h3 className="text-2xl font-bold text-gray-400">Your cart is empty and sad...</h3>
          <button 
            onClick={onBack}
            className="mt-8 px-10 py-4 bg-pink-600 text-white font-bold rounded-2xl hover:bg-pink-700 shadow-lg"
          >
            Let's go find some scoops!
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, idx) => (
              <div key={`${item.iceCream.id}-${item.format}-${item.size}`} className="bg-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row items-center gap-6 border border-gray-50 hover:border-pink-100">
                <img src={item.iceCream.image} alt={item.iceCream.name} className="w-24 h-24 rounded-2xl object-cover shadow-sm flex-shrink-0" />
                <div className="flex-grow text-center md:text-left">
                  <h4 className="text-lg md:text-xl font-bold text-gray-800">{item.iceCream.name}</h4>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-1 mb-2">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-500 rounded-lg text-[10px] font-bold uppercase">{item.format}</span>
                  </div>
                  
                  {item.format === 'Quart' && (
                    <div className="flex flex-col gap-1 mt-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Change Size</p>
                      <div className="flex justify-center md:justify-start gap-2">
                        {(['S', 'M', 'L'] as ServingSize[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => onUpdateSize(item.iceCream.id, item.format, item.size, s)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border-2 ${
                              item.size === s 
                                ? 'bg-yellow-400 border-yellow-400 text-gray-900 shadow-sm' 
                                : 'bg-white border-gray-100 text-gray-400 hover:border-yellow-200'
                            }`}
                          >
                            {s} <span className="text-[8px] opacity-70">({getSizeVolume(s)})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-pink-600 font-bold mt-2">฿{item.finalPrice} / unit</p>
                </div>

                <div className="flex flex-col items-center md:items-end gap-2 flex-shrink-0">
                  <div className="flex items-center bg-gray-50 rounded-2xl p-2 gap-4 border border-gray-100">
                    <button onClick={() => onUpdateQuantity(item.iceCream.id, item.format, item.size, -1)} className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-gray-600 hover:text-pink-600">-</button>
                    <span className="font-bold w-4 text-center text-blue-600">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.iceCream.id, item.format, item.size, 1)} className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center font-bold text-gray-600 hover:text-pink-600">+</button>
                  </div>
                  <p className="font-black text-gray-800">฿{item.finalPrice * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl h-fit sticky top-28 border border-gray-50">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>฿{total}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery</span>
                <span className="text-green-500">FREE</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between text-2xl font-black text-gray-800">
                <span>Total</span>
                <span>฿{total}</span>
              </div>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full py-5 bg-blue-500 text-white text-xl font-bold rounded-2xl hover:bg-blue-600 shadow-xl"
            >
              Checkout Now
            </button>
            <p className="text-center text-gray-400 mt-4 text-sm flex items-center justify-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure payment
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
