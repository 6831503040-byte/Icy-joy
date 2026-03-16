
import React, { useState, useEffect } from 'react';
import { View, IceCream, CartItem, User, Order, Address, ServingFormat, ServingSize } from './types';
import { ICE_CREAMS } from './constants';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Menu from './components/Menu';
import ProductDetail from './components/ProductDetail';
import Login from './components/Login';
import Cart from './components/Cart';
import AIMatchmaker from './components/AIMatchmaker';
import Profile from './components/Profile';
import Payment from './components/Payment';
import OrderStatus from './components/OrderStatus';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedProduct, setSelectedProduct] = useState<IceCream | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [showGlobalArrivalNotify, setShowGlobalArrivalNotify] = useState(false);
  
  // State for persistent data across sessions - Added password field
  const [userRegistry, setUserRegistry] = useState<Record<string, { favorites: string[], orders: Order[], profile: User, password?: string }>>({});
  const [rememberedEmail, setRememberedEmail] = useState('');

  // Initial Load
  useEffect(() => {
    const savedCart = localStorage.getItem('icy-joy-cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    const savedRegistry = localStorage.getItem('icy-joy-user-registry');
    if (savedRegistry) setUserRegistry(JSON.parse(savedRegistry));

    const savedRememberedEmail = localStorage.getItem('icy-joy-remembered-email');
    if (savedRememberedEmail) setRememberedEmail(savedRememberedEmail);

    const savedAuth = localStorage.getItem('icy-joy-auth');
    if (savedAuth) {
      const authUser = JSON.parse(savedAuth);
      setIsLoggedIn(true);
      setUser(authUser);
    }

    const savedActiveOrder = localStorage.getItem('icy-joy-active-order');
    if (savedActiveOrder) setActiveOrder(JSON.parse(savedActiveOrder));
  }, []);

  // Save Cart
  useEffect(() => {
    localStorage.setItem('icy-joy-cart', JSON.stringify(cart));
  }, [cart]);

  // Save Active Order
  useEffect(() => {
    if (activeOrder) {
      localStorage.setItem('icy-joy-active-order', JSON.stringify(activeOrder));
    } else {
      localStorage.removeItem('icy-joy-active-order');
    }
  }, [activeOrder]);

  // Global Delivery Tracker Logic
  useEffect(() => {
    if (!activeOrder) {
      setShowGlobalArrivalNotify(false);
      return;
    }

    const checkInterval = setInterval(() => {
      const elapsedSeconds = (Date.now() - activeOrder.createdAt) / 1000;
      // In this prototype, 45 seconds = Delivery arrived
      if (elapsedSeconds >= 45 && currentView !== 'order-status' && !showGlobalArrivalNotify) {
        setShowGlobalArrivalNotify(true);
        // Play notification sound
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.3;
          audio.play();
        } catch(e) {}
      }
    }, 2000);

    return () => clearInterval(checkInterval);
  }, [activeOrder, currentView, showGlobalArrivalNotify]);

  // Sync Current User Data to Registry
  useEffect(() => {
    if (user && isLoggedIn) {
      localStorage.setItem('icy-joy-auth', JSON.stringify(user));
      
      setUserRegistry(prev => {
        const currentUserEntry = prev[user.email];
        const updated = {
          ...prev,
          [user.email]: {
            ...currentUserEntry,
            profile: user
          }
        };
        localStorage.setItem('icy-joy-user-registry', JSON.stringify(updated));
        return updated;
      });
    } else {
      localStorage.removeItem('icy-joy-auth');
    }
  }, [user, isLoggedIn]);

  const navigateTo = (view: View, product: IceCream | null = null) => {
    if (product) setSelectedProduct(product);
    setCurrentView(view);
    if (view === 'order-status') setShowGlobalArrivalNotify(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSizePriceModifier = (s: ServingSize) => {
    switch (s) {
      case 'M': return 15;
      case 'L': return 35;
      default: return 0;
    }
  };

  const addToCart = (product: IceCream, format: ServingFormat = 'Scoop', size: ServingSize = 'S', price: number) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.iceCream.id === product.id && 
        item.format === format && 
        item.size === size
      );
      if (existing) {
        return prev.map(item => 
          (item.iceCream.id === product.id && item.format === format && item.size === size)
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { iceCream: product, quantity: 1, format, size, finalPrice: price }];
    });
  };

  const toggleFavorite = (id: string) => {
    if (!user) {
        navigateTo('login');
        return;
    }
    setUserRegistry(prev => {
      const userEntry = prev[user.email] || { favorites: [], orders: [], profile: user };
      const currentFavs = userEntry.favorites;
      const newFavs = currentFavs.includes(id) 
        ? currentFavs.filter(fid => fid !== id) 
        : [...currentFavs, id];
      
      const updated = {
        ...prev,
        [user.email]: { ...userEntry, favorites: newFavs }
      };
      localStorage.setItem('icy-joy-user-registry', JSON.stringify(updated));
      return updated;
    });
  };

  const updateCartQuantity = (id: string, format: ServingFormat, size: ServingSize, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.iceCream.id === id && item.format === format && item.size === size) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const updateCartSize = (id: string, format: ServingFormat, oldSize: ServingSize, newSize: ServingSize) => {
    if (format !== 'Quart' || oldSize === newSize) return;

    setCart(prev => {
      const targetItemIndex = prev.findIndex(item => item.iceCream.id === id && item.format === format && item.size === oldSize);
      if (targetItemIndex === -1) return prev;

      const targetItem = prev[targetItemIndex];
      const newPrice = targetItem.iceCream.price + getSizePriceModifier(newSize);
      const existingItemIndex = prev.findIndex(item => item.iceCream.id === id && item.format === format && item.size === newSize);

      if (existingItemIndex !== -1) {
        return prev.map((item, idx) => {
          if (idx === existingItemIndex) {
            return { ...item, quantity: item.quantity + targetItem.quantity };
          }
          return item;
        }).filter((_, idx) => idx !== targetItemIndex);
      } else {
        return prev.map((item, idx) => {
          if (idx === targetItemIndex) {
            return { ...item, size: newSize, finalPrice: newPrice };
          }
          return item;
        });
      }
    });
  };

  const handleLogin = (email: string, password: string, isSignUp: boolean, name?: string): { success: boolean, error?: string } => {
    const existingEntry = userRegistry[email];
    
    if (!isSignUp) {
      if (!existingEntry) {
        return { success: false, error: 'USER_NOT_FOUND' };
      }
      // Password verification
      if (existingEntry.password && existingEntry.password !== password) {
        return { success: false, error: 'WRONG_PASSWORD' };
      }
      
      setUser(existingEntry.profile);
    } else {
      // Handle Sign Up
      const newUser: User = {
        name: name || email.split('@')[0],
        email: email,
        avatar: (name || email).charAt(0).toUpperCase(),
        points: 0,
        addresses: []
      };
      setUser(newUser);
      setUserRegistry(prev => {
        const updated = {
          ...prev,
          [email]: { favorites: [], orders: [], profile: newUser, password: password }
        };
        localStorage.setItem('icy-joy-user-registry', JSON.stringify(updated));
        return updated;
      });
    }
    
    setIsLoggedIn(true);
    setRememberedEmail(email);
    localStorage.setItem('icy-joy-remembered-email', email);
    navigateTo('profile');
    return { success: true };
  };

  const handleResetPassword = (email: string, newPassword: string): { success: boolean, error?: string } => {
    if (!userRegistry[email]) {
      return { success: false, error: 'USER_NOT_FOUND' };
    }

    setUserRegistry(prev => {
      const userEntry = prev[email];
      const updated = {
        ...prev,
        [email]: { ...userEntry, password: newPassword }
      };
      localStorage.setItem('icy-joy-user-registry', JSON.stringify(updated));
      return updated;
    });

    return { success: true };
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    navigateTo('home');
  };

  const updateUserName = (newName: string) => {
    if (user) setUser({ ...user, name: newName });
  };

  const updateUserAvatar = (newAvatar: string) => {
    if (user) setUser({ ...user, avatar: newAvatar });
  };

  const handleSaveAddress = (newAddress: Address) => {
    if (user) {
      const currentAddresses = user.addresses || [];
      const exists = currentAddresses.find(a => a.id === newAddress.id);
      let updated;
      if (exists) {
        updated = currentAddresses.map(a => a.id === newAddress.id ? newAddress : a);
      } else {
        updated = [...currentAddresses, newAddress];
      }
      setUser({ ...user, addresses: updated });
    }
  };

  const handleDeleteAddress = (id: string) => {
    if (user) {
      const updated = (user.addresses || []).filter(a => a.id !== id);
      setUser({ ...user, addresses: updated });
    }
  };

  const handlePaymentSuccess = () => {
    if (!user) return;
    const total = cart.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    const newOrder: Order = {
      id: `JOY-${Math.floor(Math.random() * 90000) + 10000}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      createdAt: Date.now(),
      items: [...cart],
      total: total,
      status: 'ordered'
    };

    setUserRegistry(prev => {
      const userEntry = prev[user.email];
      const updated = {
        ...prev,
        [user.email]: { ...userEntry, orders: [newOrder, ...userEntry.orders] }
      };
      localStorage.setItem('icy-joy-user-registry', JSON.stringify(updated));
      return updated;
    });

    setActiveOrder(newOrder);
    setCart([]);
    navigateTo('order-status');
  };

  const handleClearActiveOrder = () => {
    setActiveOrder(null);
    setShowGlobalArrivalNotify(false);
  };

  const currentFavorites = user ? (userRegistry[user.email]?.favorites || []) : [];
  const currentOrders = user ? (userRegistry[user.email]?.orders || []) : [];

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onShopNow={() => navigateTo('menu')} onTryAI={() => navigateTo('ai-match')} />;
      case 'menu':
        return (
          <Menu 
            onSelectProduct={(p) => navigateTo('details', p)} 
            onAddToCart={addToCart}
            favorites={currentFavorites}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'details':
        return selectedProduct ? (
          <ProductDetail 
            product={selectedProduct} 
            onBack={() => navigateTo('menu')} 
            onAddToCart={addToCart}
            isFavorite={currentFavorites.includes(selectedProduct.id)}
            onToggleFavorite={() => toggleFavorite(selectedProduct.id)}
          />
        ) : <Home onShopNow={() => navigateTo('menu')} onTryAI={() => navigateTo('ai-match')} />;
      case 'login':
        return (
          <Login 
            onLogin={handleLogin} 
            onResetPassword={handleResetPassword}
            onBack={() => navigateTo('home')} 
            initialEmail={rememberedEmail} 
            userRegistry={userRegistry} 
          />
        );
      case 'cart':
        return <Cart items={cart} onUpdateQuantity={updateCartQuantity} onUpdateSize={updateCartSize} onBack={() => navigateTo('menu')} onCheckout={() => navigateTo('payment')} />;
      case 'payment':
        return (
          <Payment 
            items={cart} 
            onBack={() => navigateTo('cart')} 
            onPaymentSuccess={handlePaymentSuccess} 
            isLoggedIn={isLoggedIn}
            onLoginRequest={() => navigateTo('login')}
            user={user}
            onSaveAddress={handleSaveAddress}
          />
        );
      case 'ai-match':
        return <AIMatchmaker onBack={() => navigateTo('home')} onAddToCart={(p) => addToCart(p, 'Scoop', 'S', p.price)} />;
      case 'profile':
        return (
          <Profile 
            user={user} 
            onLogout={handleLogout} 
            onBack={() => navigateTo('home')} 
            onSelectProduct={(p) => navigateTo('details', p)}
            onUpdateName={updateUserName}
            onUpdateAvatar={updateUserAvatar}
            favorites={currentFavorites}
            onToggleFavorite={toggleFavorite}
            orders={currentOrders}
            onDeleteAddress={handleDeleteAddress}
            onSaveAddress={handleSaveAddress}
          />
        );
      case 'order-status':
        return activeOrder ? (
          <OrderStatus order={activeOrder} onBack={() => navigateTo('home')} onClearOrder={handleClearActiveOrder} />
        ) : <Home onShopNow={() => navigateTo('menu')} onTryAI={() => navigateTo('ai-match')} />;
      default:
        return <Home onShopNow={() => navigateTo('menu')} onTryAI={() => navigateTo('ai-match')} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        currentView={currentView} 
        onNavigate={navigateTo} 
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        isLoggedIn={isLoggedIn}
        user={user}
        hasActiveOrder={!!activeOrder}
      />
      
      {/* GLOBAL DELIVERY ARRIVAL NOTIFICATION */}
      {showGlobalArrivalNotify && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg">
          <div className="bg-pink-600 text-white p-6 rounded-[2rem] shadow-2xl flex items-center justify-between gap-4 border-4 border-white animate-in slide-in-from-bottom-10 duration-500">
            <div className="flex items-center gap-4">
              <div className="text-4xl animate-bounce">🛵</div>
              <div>
                <h4 className="font-black text-xl leading-tight">Delivery Arrived!</h4>
                <p className="text-pink-100 font-bold text-sm">ไอศครีมของคุณมาถึงแล้วน้าาา 🍦</p>
              </div>
            </div>
            <button 
              onClick={() => navigateTo('order-status')}
              className="px-6 py-3 bg-white text-pink-600 font-black rounded-xl hover:bg-yellow-100 transition-all shadow-sm whitespace-nowrap active:scale-95"
            >
              ดูเลย! ✨
            </button>
            <button 
              onClick={() => setShowGlobalArrivalNotify(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold border-2 border-white text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="flex-grow pt-20">
        {renderView()}
      </main>
      <footer className="bg-pink-600 text-white py-12 px-6 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Icy Joy 🍦</h3>
            <p className="text-pink-100">Delivering smiles one scoop at a time. The brightest ice cream shop in town!</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-pink-100">
              <li className="cursor-pointer hover:text-yellow-300" onClick={() => navigateTo('menu')}>Our Menu</li>
              <li className="cursor-pointer hover:text-yellow-300" onClick={() => navigateTo('ai-match')}>Flavor Finder</li>
              <li className="cursor-pointer hover:text-yellow-300" onClick={() => navigateTo(isLoggedIn ? 'profile' : 'login')}>My Account</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center hover:bg-yellow-400 cursor-pointer transition-colors">FB</div>
              <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center hover:bg-yellow-400 cursor-pointer transition-colors">IG</div>
              <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center hover:bg-yellow-400 cursor-pointer transition-colors">TW</div>
            </div>
          </div>
        </div>
        <div className="text-center mt-12 pt-8 border-t border-pink-500 text-pink-200 text-sm">
          © 2024 Icy Joy. Created with Love & Sprinkles.
        </div>
      </footer>
    </div>
  );
};

export default App;
