
import React, { useState, useEffect } from 'react';

interface LoginProps {
  onLogin: (email: string, password: string, isSignUp: boolean, name?: string) => { success: boolean, error?: string };
  onResetPassword: (email: string, newPassword: string) => { success: boolean, error?: string };
  onBack: () => void;
  initialEmail?: string;
  userRegistry: Record<string, any>;
}

const Login: React.FC<LoginProps> = ({ onLogin, onResetPassword, onBack, initialEmail = '', userRegistry }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Real-time check if user exists when in Sign In mode
  const isEmailTaken = email.includes('@') && userRegistry[email];
  const showUserNotFoundWarning = !isSignUp && !isForgotPassword && email.includes('@') && email.length > 5 && !userRegistry[email];

  // Update email if initialEmail changes
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  // Clear error when switching modes or typing
  useEffect(() => {
    setLoginError(null);
    setResetSuccess(false);
  }, [isSignUp, isForgotPassword, email, password, newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isForgotPassword) {
      if (newPassword !== confirmPassword) {
        setLoginError("Passwords do not match. 🍦");
        return;
      }
      const result = await onResetPassword(email, newPassword);
      if (result.success) {
        setResetSuccess(true);
        setIsForgotPassword(false);
        setPassword(newPassword);
        setLoginError(null);
      } else {
        setLoginError("Could not reset password. Please try again.");
      }
      return;
    }

    const result = await onLogin(email, password, isSignUp, isSignUp ? name : undefined);
    
    if (!result.success) {
      if (result.error === 'USER_NOT_FOUND') {
        setLoginError("Account not found. Please create a new account.🍦");
      } else if (result.error === 'WRONG_PASSWORD') {
        setLoginError("Incorrect password. Please check again.🍭");
      } else {
        setLoginError(result.error || "Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12 flex flex-col items-center">
      {/* CLEAR BACK BUTTON */}
      <button 
        onClick={onBack}
        className="self-start mb-8 flex items-center gap-2 text-gray-400 font-bold hover:text-pink-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Go Back
      </button>

      <div className="w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border-4 border-yellow-100 relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className={`absolute top-0 right-0 w-24 h-24 ${isSignUp ? 'bg-pink-100' : 'bg-yellow-100'} -mr-12 -mt-12 rounded-full`}></div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="text-6xl mb-4">
            {isForgotPassword ? '🔑' : (isSignUp ? '🍦' : '👋')}
          </div>
          <h2 className="text-3xl font-black text-gray-800">
            {isForgotPassword ? 'Reset Password' : (isSignUp ? 'Join Icy Joy!' : 'Welcome Back!')}
          </h2>
          <p className="text-gray-500 mt-2">
            {isForgotPassword ? 'Set a new sweet password' : (isSignUp ? 'Start your sweet journey with us' : 'Login to your sweet account')}
          </p>
        </div>

        {loginError && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-100 text-red-500 rounded-2xl text-sm font-bold flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span>⚠️</span> {loginError}
            </div>
            {loginError.includes('Incorrect password') && (
              <button 
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-xs text-red-600 underline hover:text-red-800 mt-1 text-left ml-7"
              >
                Forgot Password? Click here to reset.
              </button>
            )}
          </div>
        )}

        {resetSuccess && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-100 text-green-600 rounded-2xl text-sm font-bold flex items-center gap-2">
            <span>✅</span> Password reset successfully! You can now sign in.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {isSignUp && (
            <div className="space-y-2">
              <label className="block font-bold text-gray-700 ml-2 text-sm uppercase tracking-wide">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Scoop Master"
                className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-blue-300 text-gray-600 font-medium"
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block font-bold text-gray-700 ml-2 text-sm uppercase tracking-wide">Email Address</label>
              {isEmailTaken && !isSignUp && !isForgotPassword && (
                <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">ACCOUNT FOUND!</span>
              )}
            </div>
            <input 
              type="email" 
              required
              value={email}
              readOnly={isForgotPassword}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              placeholder="hello@example.com"
              className={`w-full px-6 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none text-gray-600 font-medium ${isForgotPassword ? 'opacity-70 cursor-not-allowed' : ''} ${showUserNotFoundWarning ? 'border-yellow-400 bg-yellow-50' : 'border-gray-100 focus:border-yellow-400'}`}
            />
            {showUserNotFoundWarning && (
              <p className="text-[11px] text-yellow-600 font-bold ml-2">
                ✨ This account does not exist in the system. Please switch and click to create a new account. <span className="underline cursor-pointer" onClick={() => setIsSignUp(true)}>Create One</span>
              </p>
            )}
          </div>

          {!isForgotPassword ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block font-bold text-gray-700 ml-2 text-sm uppercase tracking-wide">Password</label>
                {!isSignUp && (
                   <button 
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-[10px] text-gray-400 hover:text-pink-500 font-bold uppercase tracking-wider"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-6 py-4 bg-gray-50 border-2 rounded-2xl focus:outline-none text-gray-600 font-medium pr-14 ${loginError && loginError.includes('Incorrect password') ? 'border-red-300' : 'border-gray-100 focus:border-pink-300'}`}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-pink-500"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block font-bold text-gray-700 ml-2 text-sm uppercase tracking-wide">New Password</label>
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-pink-300 text-gray-600 font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="block font-bold text-gray-700 ml-2 text-sm uppercase tracking-wide">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-pink-300 text-gray-600 font-medium"
                />
              </div>
            </div>
          )}
          
          <button 
            type="submit"
            className={`w-full py-5 ${
              isForgotPassword || isSignUp 
                ? 'bg-pink-600 hover:bg-pink-700 shadow-pink-100 text-white' 
                : 'bg-yellow-400 hover:bg-yellow-500 shadow-yellow-100 text-gray-900'
            } text-xl font-black rounded-2xl shadow-lg`}
          >
            {isForgotPassword ? 'Reset Password ✨' : (isSignUp ? 'Create Account' : 'Sign In 🍦')}
          </button>

          {isForgotPassword && (
            <button 
              type="button"
              onClick={() => setIsForgotPassword(false)}
              className="w-full text-center text-gray-400 font-bold text-sm hover:text-gray-600"
            >
              Cancel
            </button>
          )}
        </form>

        {!isForgotPassword && (
          <div className="mt-8 text-center text-gray-500 relative z-10">
            {isSignUp ? (
              <>Already have an account? <span onClick={() => setIsSignUp(false)} className="text-yellow-500 font-bold cursor-pointer hover:underline">Sign In</span></>
            ) : (
              <>Don't have an account? <span onClick={() => setIsSignUp(true)} className="text-pink-600 font-bold cursor-pointer hover:underline">Create One</span></>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-12 flex gap-4">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-50 font-bold text-gray-400">G</div>
        <div className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-50 font-bold text-gray-400">f</div>
        <div className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-50 font-bold text-gray-400"></div>
      </div>
    </div>
  );
};

export default Login;
