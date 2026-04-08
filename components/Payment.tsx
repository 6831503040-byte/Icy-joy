
import React, { useState, useEffect } from 'react';
import { CartItem, User, Address } from '../types';

interface PaymentProps {
  items: CartItem[];
  onBack: () => void;
  onPaymentSuccess: () => void;
  isLoggedIn: boolean;
  onLoginRequest: () => void;
  user: User | null;
  onSaveAddress: (address: Address) => void;
}

const Payment: React.FC<PaymentProps> = ({ items, onBack, onPaymentSuccess, isLoggedIn, onLoginRequest, user, onSaveAddress }) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qr' | 'cash'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSaveLabel, setShowSaveLabel] = useState(false);
  const [addressLabel, setAddressLabel] = useState('');
  
  // Card specific state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Address State
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    details: ''
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync with user's saved addresses if any
  const savedAddresses = user?.addresses || [];

  const handleSelectSavedAddress = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = savedAddresses.find(a => a.id === e.target.value);
    if (selected) {
      setAddress({
        name: selected.name,
        phone: selected.phone,
        details: selected.details
      });
      setShowSaveLabel(false);
    } else if (e.target.value === 'new') {
      setAddress({ name: '', phone: '', details: '' });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    const limitedValue = value.slice(0, 10); // Limit to 10
    setAddress({ ...address, phone: limitedValue });
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    const limitedValue = value.slice(0, 16); // Limit to 16 actual digits
    
    // Format with spaces: xxxx xxxx xxxx xxxx
    const formattedValue = limitedValue.match(/.{1,4}/g)?.join(' ') || limitedValue;
    setCardNumber(formattedValue);
  };

  const total = items.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

  const handlePay = () => {
    if (!address.name || !address.phone || !address.details) {
      setValidationError('Please fill in your delivery details! 🍦');
      setTimeout(() => setValidationError(null), 3000);
      return;
    }

    if (address.phone.length < 10) {
      setValidationError('Phone number must be 10 digits! 📱');
      setTimeout(() => setValidationError(null), 3000);
      return;
    }

    if (paymentMethod === 'card') {
      const plainCard = cardNumber.replace(/\s/g, '');
      if (plainCard.length < 16) {
        setValidationError('Card number must be 16 digits! 💳');
        setTimeout(() => setValidationError(null), 3000);
        return;
      }
    }

    if (showSaveLabel && addressLabel.trim()) {
      onSaveAddress({
        id: `ADDR-${Date.now()}`,
        label: addressLabel,
        ...address
      });
    }

    setIsProcessing(true);
    // Simulate payment delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onPaymentSuccess();
      }, 3000);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-6xl mx-auto mb-8">
          ✓
        </div>
        <h2 className="text-4xl font-black text-gray-800 mb-4">Payment Successful!</h2>
        <p className="text-xl text-gray-600 mb-8">Your sweet treats are on their way to you. Get ready for some icy joy! 🍦</p>
        <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-100">
          <p className="text-blue-600 font-bold">Redirecting you to track your order...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl border-4 border-dashed border-pink-200">
          <div className="text-8xl mb-8">🔒</div>
          <h2 className="text-4xl font-black text-gray-800 mb-4">Login Required</h2>
          <p className="text-xl text-gray-500 mb-10">Please login to your account to proceed with your delicious order.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onLoginRequest}
              className="px-10 py-4 bg-pink-600 text-white text-xl font-bold rounded-2xl hover:bg-pink-700 shadow-xl"
            >
              Go to Login 🍦
            </button>
            <button 
              onClick={onBack}
              className="px-10 py-4 bg-gray-100 text-gray-500 text-xl font-bold rounded-2xl hover:bg-gray-200 shadow-xl"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-gray-400 font-bold hover:text-pink-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Cart
      </button>

      {validationError && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-red-500 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3">
          <span>⚠️</span> {validationError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Delivery & Payment Details */}
        <div className="space-y-8">
          <h2 className="text-4xl font-black text-gray-800">Checkout</h2>
          
          {/* Delivery Address Section */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-blue-50 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                <span className="text-2xl">📍</span> Delivery Address
              </h3>
              {savedAddresses.length > 0 && (
                <select 
                  onChange={handleSelectSavedAddress}
                  className="bg-blue-50 text-blue-600 font-bold py-2 px-4 rounded-xl outline-none border-2 border-transparent focus:border-blue-200 text-sm"
                >
                  <option value="new">Use a New Address</option>
                  {savedAddresses.map(addr => (
                    <option key={addr.id} value={addr.id}>{addr.label}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 ml-1">Recipient Name</label>
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={address.name}
                    onChange={(e) => setAddress({...address, name: e.target.value})}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-300 outline-none text-gray-800 font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 ml-1">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="08x-xxx-xxxx" 
                    value={address.phone}
                    onChange={handlePhoneChange}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-300 outline-none text-gray-800 font-medium tracking-wider" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 ml-1">Address Details</label>
                <textarea 
                  placeholder="House No., Street, District, Province..." 
                  rows={3}
                  value={address.details}
                  onChange={(e) => setAddress({...address, details: e.target.value})}
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-300 outline-none text-gray-800 font-medium resize-none"
                />
              </div>

              {/* Save Address Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={showSaveLabel}
                    onChange={() => setShowSaveLabel(!showSaveLabel)}
                  />
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${showSaveLabel ? 'bg-blue-500 border-blue-500' : 'border-gray-200'}`}>
                    {showSaveLabel && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                  <span className="text-gray-600 font-bold text-sm">Save this address for next time</span>
                </label>
                
                {showSaveLabel && (
                  <div className="mt-4">
                    <input 
                      type="text" 
                      placeholder="e.g. My Home, Office"
                      value={addressLabel}
                      onChange={(e) => setAddressLabel(e.target.value)}
                      className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-xl outline-none focus:border-blue-300 text-blue-800 font-bold placeholder-blue-300"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-700">Select Payment Method</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'card', name: 'Credit / Debit Card', icon: '💳' },
                { id: 'qr', name: 'PromptPay / QR Code', icon: '📱' },
                { id: 'cash', name: 'Cash on Delivery', icon: '💵' }
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left ${
                    paymentMethod === method.id 
                    ? 'border-pink-500 bg-pink-50 ring-4 ring-pink-100' 
                    : 'border-gray-100 bg-white hover:border-pink-200'
                  }`}
                >
                  <span className="text-3xl">{method.icon}</span>
                  <span className={`font-bold text-lg ${paymentMethod === method.id ? 'text-pink-600' : 'text-gray-600'}`}>
                    {method.name}
                  </span>
                  {paymentMethod === method.id && (
                    <div className="ml-auto w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Form Simulation */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-pink-50">
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 ml-1">Card Number</label>
                  <input 
                    type="text" 
                    placeholder="**** **** **** ****" 
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-pink-300 outline-none text-gray-800 font-bold tracking-[0.2em]" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 ml-1">Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY" 
                      maxLength={5}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-pink-300 outline-none text-gray-800 font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 ml-1">CVV</label>
                    <input 
                      type="password" 
                      placeholder="***" 
                      maxLength={3}
                      className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-pink-300 outline-none text-gray-800 font-medium" 
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'qr' && (
              <div className="text-center space-y-4">
                <div className="bg-white p-4 inline-block border-2 border-gray-100 rounded-3xl shadow-sm">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ICYJOY_PROMPTPAY" alt="QR Code" className="w-48 h-48 mx-auto" />
                </div>
                <p className="text-gray-500 font-medium">Scan QR Code with your banking app</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider italic">Prompt Pay</span>
                </div>
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🚚</div>
                <h4 className="text-xl font-bold text-gray-800">Cash on Delivery</h4>
                <p className="text-gray-500">Please prepare ฿{total} for our delivery rider.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-pink-50 sticky top-28">
            <h3 className="text-2xl font-black text-gray-800 mb-6">Order Summary</h3>
            
            <div className="max-h-60 overflow-y-auto pr-2 space-y-4 mb-4 scrollbar-hide">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden">
                      <img src={item.iceCream.image} className="w-full h-full object-cover" alt={item.iceCream.name} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 line-clamp-1">{item.iceCream.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity} ({item.format})</p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-600">฿{item.finalPrice * item.quantity}</p>
                </div>
              ))}
            </div>

            {/* Delivery Time Badge */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-xs font-black text-yellow-800 uppercase tracking-widest">Est. Delivery Time</p>
                <p className="text-sm font-bold text-gray-700">Arrives in 25-30 minutes</p>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-100">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>฿{total}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Fee</span>
                <span className="text-green-500">FREE</span>
              </div>
              <div className="flex justify-between text-3xl font-black text-blue-600 pt-2">
                <span>Total</span>
                <span>฿{total}</span>
              </div>
            </div>

            <button 
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full mt-8 py-5 bg-pink-600 text-white text-xl font-bold rounded-2xl hover:bg-pink-700 shadow-xl shadow-pink-100 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isProcessing ? (
                <>
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full"></div>
                  Processing...
                </>
              ) : (
                <>Pay ฿{total} Now 🍦</>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              By clicking "Pay Now", you agree to our Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
