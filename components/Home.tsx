
import React from 'react';

interface HomeProps {
  onShopNow: () => void;
  onTryAI: () => void;
}

const Home: React.FC<HomeProps> = ({ onShopNow, onTryAI }) => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] py-20 flex items-center overflow-hidden bg-gradient-to-br from-yellow-100 via-pink-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8 text-center md:text-left">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-pink-600 leading-tight break-words">
              Summer is better with <span className="text-yellow-500">Icy Joy</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 max-w-lg mx-auto md:mx-0">
              Handcrafted ice cream made with organic ingredients and a lot of imagination.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={onShopNow}
                className="px-10 py-5 bg-pink-600 text-white text-xl font-bold rounded-full hover:bg-pink-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95"
              >
                Order Now 🍦
              </button>
              <button 
                onClick={onTryAI}
                className="px-10 py-5 bg-blue-500 text-white text-xl font-bold rounded-full hover:bg-blue-600 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95"
              >
                AI Flavor Finder ✨
              </button>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1576506295286-5cda18df43e7?q=80&w=800&auto=format&fit=crop" 
              alt="Delicious Ice Cream"
              className="rounded-3xl shadow-2xl animate-float border-[12px] border-white"
            />
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-400 rounded-full blur-3xl opacity-50"></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-16 text-gray-800 underline decoration-yellow-400 decoration-8 underline-offset-8 px-4 break-words">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              { icon: '🥛', title: '100% Organic', desc: 'Fresh milk from happy cows on our local farm.' },
              { icon: '🍓', title: 'Real Fruit', desc: 'No artificial flavors, just pure nature in every scoop.' },
              { icon: '🚀', title: 'Fast Delivery', desc: 'Frozen and fresh to your door in under 30 minutes.' }
            ].map((feature, idx) => (
              <div key={idx} className="p-10 rounded-3xl bg-pink-50 hover:bg-pink-100 transition-all hover:scale-105 group border-2 border-transparent hover:border-pink-200 flex flex-col items-center">
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-pink-600 break-words">{feature.title}</h3>
                <p className="text-gray-600 break-words">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
