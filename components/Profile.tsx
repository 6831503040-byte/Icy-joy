
import React, { useState, useRef } from 'react';
import { User, IceCream, Order, Address } from '../types';
import { ICE_CREAMS } from '../constants';

interface ProfileProps {
  user: User | null;
  onLogout: () => void;
  onBack: () => void;
  onSelectProduct: (product: IceCream) => void;
  onUpdateName: (newName: string) => void;
  onUpdateAvatar: (newAvatar: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  orders: Order[];
  onDeleteAddress: (id: string) => void;
  onSaveAddress: (address: Address) => void;
}

const Profile: React.FC<ProfileProps> = ({ 
  user, 
  onLogout, 
  onBack, 
  onSelectProduct, 
  onUpdateName, 
  onUpdateAvatar,
  favorites, 
  onToggleFavorite, 
  orders, 
  onDeleteAddress,
  onSaveAddress
}) => {
  if (!user) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editAddressData, setEditAddressData] = useState<Address | null>(null);
  
  // New state for adding address
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddressData, setNewAddressData] = useState<Address>({
    id: '',
    label: '',
    name: '',
    phone: '',
    details: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use actual favorites from global state
  const favoriteItems = ICE_CREAMS.filter(item => favorites.includes(item.id));

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateName(tempName);
      setIsEditing(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large! Please choose a file smaller than 2MB. 🍦");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setEditAddressData({ ...addr });
  };

  const handleCancelEditAddress = () => {
    setEditingAddressId(null);
    setEditAddressData(null);
  };

  const handleSaveEditedAddress = () => {
    if (editAddressData && editAddressData.label && editAddressData.name && editAddressData.phone && editAddressData.details) {
      if (editAddressData.phone.replace(/\D/g, '').length < 10) {
        alert("Phone number must be at least 10 digits!");
        return;
      }
      onSaveAddress(editAddressData);
      setEditingAddressId(null);
      setEditAddressData(null);
    } else {
      alert("Please fill in all address fields!");
    }
  };

  const handleAddNewAddress = () => {
    if (newAddressData.label && newAddressData.name && newAddressData.phone && newAddressData.details) {
      if (newAddressData.phone.replace(/\D/g, '').length < 10) {
        alert("Phone number must be at least 10 digits!");
        return;
      }
      const finalNewAddress = {
        ...newAddressData,
        id: `ADDR-${Date.now()}`
      };
      onSaveAddress(finalNewAddress);
      setIsAddingAddress(false);
      setNewAddressData({ id: '', label: '', name: '', phone: '', details: '' });
    } else {
      alert("Please fill in all fields to add a new address! 🍦");
    }
  };

  const isBase64Avatar = user.avatar && user.avatar.startsWith('data:image');

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-gray-400 font-bold hover:text-pink-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl text-center border border-pink-50 relative">
            {/* Avatar Section */}
            <div className="relative group w-24 h-24 mx-auto mb-4">
              <div 
                onClick={handleAvatarClick}
                className="w-full h-full bg-yellow-400 rounded-full flex items-center justify-center text-4xl text-gray-900 font-bold border-4 border-white shadow-lg overflow-hidden cursor-pointer group-hover:brightness-90 transition-all"
              >
                {isBase64Avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              
              {/* Camera Icon Overlay */}
              <div 
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 w-8 h-8 bg-pink-500 rounded-full border-2 border-white flex items-center justify-center text-white cursor-pointer shadow-md hover:scale-110 transition-transform"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            
            <div className="mb-10 space-y-2">
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <input 
                    type="text" 
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full p-2 border-2 border-yellow-200 rounded-xl text-center font-bold focus:border-yellow-400 outline-none"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-center">
                    <button onClick={handleSaveName} className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg font-bold">Save</button>
                    <button onClick={() => { setIsEditing(false); setTempName(user.name); }} className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-lg">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-2xl font-black text-gray-800">{user.name}</h2>
                  <button onClick={() => setIsEditing(true)} className="text-pink-400 hover:text-pink-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
              )}
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
            
            <button 
              onClick={onLogout}
              className="w-full py-3 border-2 border-red-100 text-red-400 font-bold rounded-xl hover:bg-red-50 hover:border-red-200 transition-all active:scale-95"
            >
              Log Out
            </button>
          </div>

          {/* Saved Addresses Section */}
          <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-blue-50 overflow-hidden">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <span className="text-blue-500 text-lg">📍</span> Addresses
               </h3>
               {!isAddingAddress && (
                 <button 
                  onClick={() => setIsAddingAddress(true)}
                  className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold shadow-md hover:bg-pink-600 transition-colors"
                  title="Add New Address"
                 >
                   +
                 </button>
               )}
             </div>

            {/* Add New Address Form */}
            {isAddingAddress && (
              <div className="mb-6 p-4 bg-pink-50 rounded-2xl border-2 border-pink-200 space-y-3 animate-in slide-in-from-top-4 duration-300">
                <h4 className="text-xs font-black text-pink-600 uppercase tracking-widest text-center">New Address 🍦</h4>
                <input 
                  type="text" 
                  placeholder="Label (e.g. Home, Work)"
                  value={newAddressData.label}
                  onChange={(e) => setNewAddressData({ ...newAddressData, label: e.target.value })}
                  className="w-full text-xs font-bold p-2 rounded-lg border focus:outline-none focus:border-pink-400"
                />
                <input 
                  type="text" 
                  placeholder="Recipient Name"
                  value={newAddressData.name}
                  onChange={(e) => setNewAddressData({ ...newAddressData, name: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border focus:outline-none focus:border-pink-400"
                />
                <input 
                  type="tel" 
                  placeholder="Phone"
                  value={newAddressData.phone}
                  onChange={(e) => setNewAddressData({ ...newAddressData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="w-full text-xs p-2 rounded-lg border focus:outline-none focus:border-pink-400"
                />
                <textarea 
                  placeholder="Address Details"
                  value={newAddressData.details}
                  onChange={(e) => setNewAddressData({ ...newAddressData, details: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border focus:outline-none focus:border-pink-400 resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button onClick={handleAddNewAddress} className="flex-grow bg-pink-500 text-white py-2 rounded-xl text-[10px] font-bold shadow-md">Add Now</button>
                  <button onClick={() => setIsAddingAddress(false)} className="bg-white text-gray-400 px-3 py-2 rounded-xl text-[10px] font-bold border border-gray-100">Cancel</button>
                </div>
              </div>
            )}

            {user.addresses && user.addresses.length > 0 ? (
              <div className="space-y-4">
                {user.addresses.map(addr => (
                  <div key={addr.id} className="relative group">
                    {editingAddressId === addr.id && editAddressData ? (
                      <div className="p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-200 space-y-3 animate-in zoom-in-95 duration-200">
                        <input 
                          type="text" 
                          placeholder="Label (e.g. Home)"
                          value={editAddressData.label}
                          onChange={(e) => setEditAddressData({ ...editAddressData, label: e.target.value })}
                          className="w-full text-xs font-bold p-2 rounded-lg border focus:outline-none focus:border-blue-400"
                        />
                        <input 
                          type="text" 
                          placeholder="Recipient Name"
                          value={editAddressData.name}
                          onChange={(e) => setEditAddressData({ ...editAddressData, name: e.target.value })}
                          className="w-full text-xs p-2 rounded-lg border focus:outline-none focus:border-blue-400"
                        />
                        <input 
                          type="tel" 
                          placeholder="Phone"
                          value={editAddressData.phone}
                          onChange={(e) => setEditAddressData({ ...editAddressData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          className="w-full text-xs p-2 rounded-lg border focus:outline-none focus:border-blue-400"
                        />
                        <textarea 
                          placeholder="Address Details"
                          value={editAddressData.details}
                          onChange={(e) => setEditAddressData({ ...editAddressData, details: e.target.value })}
                          className="w-full text-xs p-2 rounded-lg border focus:outline-none focus:border-blue-400 resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button onClick={handleSaveEditedAddress} className="flex-grow bg-blue-500 text-white py-2 rounded-xl text-[10px] font-bold shadow-md">Update</button>
                          <button onClick={handleCancelEditAddress} className="bg-gray-100 text-gray-400 px-3 py-2 rounded-xl text-[10px] font-bold">✕</button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 hover:border-pink-200 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-blue-700 text-sm">{addr.label}</p>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleStartEditAddress(addr)}
                              className="text-blue-400 hover:text-blue-600 p-1"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => onDeleteAddress(addr.id)}
                              className="text-red-300 hover:text-red-500 p-1"
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-600 font-bold">{addr.name} | {addr.phone}</p>
                        <p className="text-[10px] text-gray-500 line-clamp-2 mt-1 italic">{addr.details}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              !isAddingAddress && <p className="text-gray-400 text-sm italic py-4">No saved addresses yet.</p>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Favorite Flavors */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-pink-50">
            <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-pink-500">❤️</span> My Favorite Scoops
            </h3>
            
            {favoriteItems.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 font-medium italic">No favorites yet... go give some hearts! 🍦</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoriteItems.map(flavor => (
                  <div 
                    key={flavor.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-pink-50 group border border-transparent hover:border-pink-100 relative transition-all"
                  >
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(flavor.id);
                      }}
                      className="absolute top-2 right-2 p-1 text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                    <img 
                      src={flavor.image} 
                      onClick={() => onSelectProduct(flavor)}
                      className="w-16 h-16 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform cursor-pointer" 
                      alt={flavor.name} 
                    />
                    <div onClick={() => onSelectProduct(flavor)} className="cursor-pointer">
                      <h4 className="font-bold text-gray-800">{flavor.name}</h4>
                      <p className="text-xs text-gray-400">{flavor.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-pink-50">
            <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-yellow-500">🕒</span> Recent Orders
            </h3>
            
            {orders.length === 0 ? (
               <div className="text-center py-10">
                <p className="text-gray-400 font-medium italic">You haven't ordered any scoops yet! 🍦</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="p-5 border border-gray-100 rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="font-bold text-gray-800">Order #{order.id}</p>
                        <p className="text-sm text-gray-400 italic">Delivered on {order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-blue-600 text-xl">฿{order.total}</p>
                        <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold uppercase">Success</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-xs text-gray-600 border border-gray-100">
                          <span className="font-bold text-pink-500">{item.quantity}x</span> {item.iceCream.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {orders.length > 3 && (
              <button className="w-full mt-6 py-3 text-pink-600 font-bold hover:underline">View All History</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
