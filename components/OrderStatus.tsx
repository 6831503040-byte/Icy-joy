
import React, { useState, useEffect } from 'react';
import { Order, OrderStage, User } from '../types';
import { db, auth } from '../firebase';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

interface OrderStatusProps {
  order: Order;
  onBack: () => void;
  onClearOrder: () => void;
  user: User | null;
}

const OrderStatus: React.FC<OrderStatusProps> = ({ order, onBack, onClearOrder, user }) => {
  const [showArrivalAlert, setShowArrivalAlert] = useState(false);
  const [deliveredAt, setDeliveredAt] = useState<string | null>(null);
  const [isReceived, setIsReceived] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [hoverRating, setHoverRating] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateCurrentStage = (): OrderStage => {
    const elapsedSeconds = (Date.now() - order.createdAt) / 1000;
    
    // Fast prototype timing for demo:
    if (elapsedSeconds < 10) return 'ordered';      
    if (elapsedSeconds < 25) return 'preparing';    
    if (elapsedSeconds < 45) return 'delivery';    
    return 'delivered';                            
  };

  const calculateTimeLeft = (): number => {
    const initialMinutes = 25;
    const elapsedMinutes = (Date.now() - order.createdAt) / 60000;
    const remaining = Math.max(0, initialMinutes - Math.floor(elapsedMinutes));
    return remaining;
  };

  const [currentStage, setCurrentStage] = useState<OrderStage>(calculateCurrentStage());
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      const nextStage = calculateCurrentStage();
      if (nextStage === 'delivered' && currentStage !== 'delivered') {
        setShowArrivalAlert(true);
        setDeliveredAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.5;
          audio.play();
        } catch(e) {}
      }
      setCurrentStage(nextStage);
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [order.createdAt, currentStage]);

  const handleRating = (itemId: string, rating: number) => {
    setRatings(prev => ({ ...prev, [itemId]: rating }));
  };

  const handleComment = (itemId: string, comment: string) => {
    setComments(prev => ({ ...prev, [itemId]: comment }));
  };

  const handleConfirmReceived = () => {
    setIsReceived(true);
  };

  const handleSubmitReview = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      for (const item of order.items) {
        const itemKey = `${item.iceCream.id}-${order.items.indexOf(item)}`;
        const rating = ratings[itemKey];
        const comment = comments[itemKey] || '';

        if (rating) {
          // 1. Add review to 'reviews' collection
          await addDoc(collection(db, 'reviews'), {
            productId: item.iceCream.id,
            userId: auth.currentUser?.uid || 'anonymous',
            userName: user?.name || 'Valued Customer',
            rating,
            comment,
            createdAt: Date.now()
          });

          // 2. Update product rating and reviewCount in Firestore
          const productRef = doc(db, 'products', item.iceCream.id);
          const productSnap = await getDoc(productRef);

          if (productSnap.exists()) {
            const data = productSnap.data();
            const currentRating = data.rating || 0;
            const currentCount = data.reviewCount || 0;

            const newCount = currentCount + 1;
            const newRating = ((currentRating * currentCount) + rating) / newCount;

            await updateDoc(productRef, {
              rating: Number(newRating.toFixed(1)),
              reviewCount: newCount
            });
          }
        }
      }

      setThankYouMessage(true);
      setTimeout(() => {
        onClearOrder();
        onBack();
      }, 2000);
    } catch (err) {
      console.error("Error submitting reviews:", err);
      setError("Failed to submit reviews. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stages: { key: OrderStage; label: string; icon: string; color: string }[] = [
    { key: 'ordered', label: 'Ordered', icon: '📝', color: 'bg-yellow-400' },
    { key: 'preparing', label: 'Preparing', icon: '🍦', color: 'bg-pink-400' },
    { key: 'delivery', label: 'On the Way', icon: '🛵', color: 'bg-blue-400' },
    { key: 'delivered', label: 'Delivered', icon: '🏠', color: 'bg-green-400' },
  ];

  const currentStageIndex = stages.findIndex(s => s.key === currentStage);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 relative">
      
      {/* DELIVERY ARRIVED NOTIFICATION */}
      {showArrivalAlert && !isReceived && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-4">
          <div className="bg-green-600 text-white p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 border-4 border-white">
            <div className="text-4xl">🎊</div>
            <div className="flex-grow">
              <h4 className="font-black text-xl">Arrived!</h4>
              <p className="text-green-50 font-bold">Your icy treats are here at {deliveredAt}!</p>
            </div>
            <button 
              onClick={() => setShowArrivalAlert(false)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {thankYouMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="text-center p-12 bg-white rounded-[3rem] shadow-2xl border-8 border-yellow-400">
            <div className="text-9xl mb-6">💖</div>
            <h2 className="text-5xl font-black text-pink-600 mb-4">Thank You!</h2>
            <p className="text-2xl text-gray-600 font-bold">Enjoy your scoops!</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-50">
        
        {/* Header Section */}
        <div className={`p-10 text-white text-center ${currentStage === 'delivered' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-pink-500 to-pink-600'}`}>
          <h2 className="text-3xl font-black mb-2 tracking-tight">Tracking Your Joy</h2>
          <p className="text-white/80 font-bold">Order ID: #{order.id}</p>
          
          <div className="mt-8 bg-white/20 backdrop-blur-md rounded-3xl p-6 inline-block min-w-[200px]">
            <p className="text-sm uppercase font-black tracking-widest opacity-80 mb-1">
              {currentStage === 'delivered' ? 'Delivery Time' : 'Estimated Delivery'}
            </p>
            <p className="text-5xl font-black">
              {currentStage === 'delivered' ? `ARRIVED!` : `${timeLeft} mins`}
            </p>
            {currentStage === 'delivered' && deliveredAt && (
              <p className="mt-2 font-bold text-green-100">Dropped off at {deliveredAt}</p>
            )}
          </div>
        </div>

        {/* Progress Bar Section */}
        {!isReceived && (
          <div className="p-12 overflow-x-auto">
            <div className="relative flex justify-between min-w-[500px]">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 -z-10 rounded-full overflow-hidden">
                 <div 
                  className={`h-full ${currentStage === 'delivered' ? 'bg-green-500' : 'bg-pink-500'}`} 
                  style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
                 />
              </div>

              {stages.map((stage, idx) => {
                const isActive = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div key={stage.key} className="flex flex-col items-center">
                    <div 
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-xl border-4 ${
                        isActive 
                          ? `${stage.color} border-white text-white scale-110` 
                          : 'bg-white border-gray-100 text-gray-300'
                      }`}
                    >
                      {stage.icon}
                    </div>
                    <p className={`mt-4 font-black text-sm uppercase tracking-wider ${isActive ? 'text-gray-800' : 'text-gray-300'}`}>
                      {stage.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Details or Rating Section */}
        <div className="px-12 pb-12">
          {currentStage === 'delivered' && isReceived ? (
            <div className="">
              <h3 className="text-3xl font-black text-gray-800 mb-8 text-center">How was your <span className="text-pink-600">Icy Joy</span>? 🍦</h3>
              <div className="space-y-6">
                {order.items.map((item, idx) => {
                  const itemKey = `${item.iceCream.id}-${idx}`;
                  const currentRating = ratings[itemKey] || 0;
                  const currentHover = hoverRating[itemKey] || 0;

                  return (
                    <div key={itemKey} className="bg-yellow-50 p-6 rounded-[2.5rem] flex flex-col gap-6 border-2 border-yellow-100">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <img src={item.iceCream.image} className="w-20 h-20 rounded-2xl object-cover shadow-md" alt={item.iceCream.name} />
                          <div>
                            <h4 className="text-xl font-bold text-gray-800">{item.iceCream.name}</h4>
                            <p className="text-sm text-gray-500 font-bold">{item.size} {item.format}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onMouseEnter={() => setHoverRating({ ...hoverRating, [itemKey]: star })}
                              onMouseLeave={() => setHoverRating({ ...hoverRating, [itemKey]: 0 })}
                              onClick={() => handleRating(itemKey, star)}
                              className="text-4xl"
                            >
                              <span className={star <= (currentHover || currentRating) ? 'text-yellow-400' : 'text-gray-200'}>
                                ★
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {currentRating > 0 && (
                        <div className="">
                          <textarea
                            placeholder="Tell us more about your experience (optional)..."
                            value={comments[itemKey] || ''}
                            onChange={(e) => handleComment(itemKey, e.target.value)}
                            className="w-full p-4 bg-white border-2 border-yellow-200 rounded-2xl focus:outline-none focus:border-pink-400 text-gray-700 font-medium resize-none"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {error && (
                <p className="mt-4 text-red-500 text-center font-bold">{error}</p>
              )}

              <button 
                onClick={handleSubmitReview}
                disabled={isSubmitting || Object.keys(ratings).length === 0}
                className={`w-full mt-10 py-5 text-white text-xl font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 ${isSubmitting || Object.keys(ratings).length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit My Review 🌟'
                )}
              </button>
              <button 
                onClick={() => { onClearOrder(); onBack(); }}
                className="w-full mt-4 py-2 text-gray-400 font-bold hover:text-gray-600"
              >
                Skip Review & Clear Tracking
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                <h3 className="text-xl font-black text-gray-800 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-bold">
                        <span className="text-pink-500">{item.quantity}x</span> {item.iceCream.name} ({item.size})
                      </span>
                      <span className="font-black text-gray-800">฿{item.finalPrice * item.quantity}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-gray-200 flex justify-between font-black text-lg text-blue-600">
                    <span>Total</span>
                    <span>฿{order.total}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-4">
                 <div className={`${currentStage === 'delivered' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border-2 p-6 rounded-[2rem] flex items-center gap-4`}>
                  <div className="text-4xl">
                    {currentStage === 'delivered' ? '🥳' : currentStage === 'delivery' ? '🛵' : '🧑‍🍳'}
                  </div>
                  <div>
                    <p className={`font-black uppercase text-xs tracking-widest ${currentStage === 'delivered' ? 'text-green-800' : 'text-yellow-800'}`}>
                      {currentStage === 'delivered' ? 'Order Complete' : currentStage === 'delivery' ? 'Rider nearby' : 'Master Chef'}
                    </p>
                    <p className="text-gray-700 font-bold">
                      {currentStage === 'delivered' 
                        ? 'Your icy treats have been delivered! Don\'t let them melt! Enjoy! 🍦' 
                        : currentStage === 'delivery' 
                        ? 'Our rider is just a few blocks away from your location!' 
                        : 'Chef Somchai is hand-scooping your order now!'}
                    </p>
                  </div>
                </div>
                
                {currentStage === 'delivered' ? (
                  <button 
                    onClick={handleConfirmReceived}
                    className="w-full py-5 bg-green-500 text-white text-xl font-bold rounded-2xl hover:bg-green-600 shadow-xl"
                  >
                    Confirm Received ✅
                  </button>
                ) : (
                  <button 
                    onClick={onBack}
                    className="w-full py-5 bg-pink-600 text-white text-xl font-bold rounded-2xl hover:bg-pink-700 shadow-xl"
                  >
                    Back to Home 🏠
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-gray-400 font-medium italic">
        "Icy Joy: Cold scoops, warm hearts."
      </div>
    </div>
  );
};

export default OrderStatus;
