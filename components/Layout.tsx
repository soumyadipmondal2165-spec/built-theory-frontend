import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileStack, Menu, X, ShieldCheck, Heart, User, LogOut, Crown } from 'lucide-react';
import { PRICING } from '../constants';

declare global {
  interface Window {
    firebase?: any;
    btFirebaseAppInitialized?: boolean;
  }
}

const firebaseConfig = {
  apiKey: 'AIzaSyAsHt4DHV71QpGss0X8cE_Ywe1nDQd3RxI',
  authDomain: 'built-theory-web.firebaseapp.com',
  projectId: 'built-theory-web',
  storageBucket: 'built-theory-web.firebasestorage.app',
  messagingSenderId: '813255172342',
  appId: '1:813255172342:web:855876d698f86da0424cd7',
  measurementId: 'G-J73YK3CKNS'
};

type SessionUser = { name: string; email: string; isPro: boolean; picture?: string };

const tryInitFirebaseAuth = () => {
  if (!window.firebase?.apps || !window.firebase?.auth) return null;
  if (!window.btFirebaseAppInitialized) {
    window.firebase.initializeApp(firebaseConfig);
    window.btFirebaseAppInitialized = true;
  }
  return window.firebase.auth();
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(
    localStorage.getItem('bt_user') ? JSON.parse(localStorage.getItem('bt_user')!) : null
  );
  const [showPricing, setShowPricing] = useState(false);
  const [auth, setAuth] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let canceled = false;
    let attempts = 0;

    const hydrate = () => {
      if (canceled) return;
      const firebaseAuth = tryInitFirebaseAuth();
      if (firebaseAuth) {
        setAuth(firebaseAuth);
        setAuthReady(true);
        return;
      }

      attempts += 1;
      if (attempts < 40) {
        window.setTimeout(hydrate, 100);
      } else {
        setAuthReady(false);
      }
    };

    hydrate();

    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    if (!auth) return;

    unsubscribeRef.current?.();
    const unsubscribe = auth.onAuthStateChanged((firebaseUser: any) => {
      if (!firebaseUser) {
        setUser(null);
        localStorage.removeItem('bt_user');
        return;
      }

      const nextUser: SessionUser = {
        name: firebaseUser.displayName || firebaseUser.email,
        email: firebaseUser.email,
        picture: firebaseUser.photoURL || undefined,
        isPro: localStorage.getItem('bt_pro') === 'true'
      };

      setUser(nextUser);
      localStorage.setItem('bt_user', JSON.stringify(nextUser));
    });

    unsubscribeRef.current = unsubscribe;
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const checkPro = () => {
      if (!user) return;
      const isPro = localStorage.getItem('bt_pro') === 'true';
      if (isPro !== user.isPro) {
        const updated = { ...user, isPro };
        setUser(updated);
        localStorage.setItem('bt_user', JSON.stringify(updated));
      }
    };

    window.addEventListener('storage', checkPro);
    const interval = setInterval(checkPro, 1000);

    return () => {
      window.removeEventListener('storage', checkPro);
      clearInterval(interval);
    };
  }, [user]);

  const handleLogin = async () => {
    if (!auth || !window.firebase?.auth?.GoogleAuthProvider) {
      alert('Firebase Auth is still loading. Please wait a second and try again.');
      return;
    }

    try {
      const provider = new window.firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await auth.signInWithPopup(provider);
    } catch (error: any) {
      if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/popup-closed-by-user') {
        try {
          await auth.signInWithRedirect(new window.firebase.auth.GoogleAuthProvider());
          return;
        } catch (redirectError: any) {
          alert(redirectError?.message || 'Google sign-in failed.');
          return;
        }
      }
      alert(error?.message || 'Google sign-in failed.');
    }
  };

  const handleLogout = async () => {
    try {
      if (auth) {
        await auth.signOut();
      }
    } finally {
      setUser(null);
      localStorage.removeItem('bt_user');
      localStorage.removeItem('bt_pro');
      window.location.reload();
    }
  };

  const handleUpgrade = (plan: string) => {
    if (!user) {
      alert('Please login with your Google account before payment.');
      void handleLogin();
      return;
    }

    const options = {
      key: 'rzp_live_SDvXBbpBeVUe5U',
      amount: plan === 'yearly' ? PRICING.yearly * 100 : plan === 'monthly' ? PRICING.monthly * 100 : PRICING.weekly * 100,
      name: 'Built-Theory Pro',
      description: `Unlock all Premium Tools (${plan})`,
      handler: () => {
        localStorage.setItem('bt_pro', 'true');
        const updated = { ...user, isPro: true };
        setUser(updated);
        localStorage.setItem('bt_user', JSON.stringify(updated));
        setShowPricing(false);
        alert('Payment Successful! All Pro features are now unlocked.');
      },
      theme: { color: '#e33b2f' }
    };

    const rzp = (window as any).Razorpay ? new (window as any).Razorpay(options) : { open: () => alert('Razorpay script not loaded.') };
    rzp.open();
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-red-100 selection:text-red-600">
      <header className="bg-white/90 backdrop-blur-lg border-b sticky top-0 z-[60]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-all shadow-lg shadow-red-200">
                <FileStack className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">Built-Theory</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-[11px] font-black text-gray-500 hover:text-red-600 uppercase tracking-widest">Tools</Link>
              <button onClick={() => setShowPricing(true)} className="text-[11px] font-black text-gray-500 hover:text-red-600 uppercase tracking-widest">Pricing</button>
              <div className="h-4 w-px bg-gray-200"></div>
              {user ? (
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${user.isPro ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'}`}>
                    {user.picture ? (
                      <img src={user.picture} className="w-6 h-6 rounded-full object-cover" alt={user.name} />
                    ) : (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${user.isPro ? 'bg-yellow-400 text-white' : 'bg-red-100 text-red-600'}`}>
                        {user.isPro ? <Crown size={14} /> : <User size={14} />}
                      </div>
                    )}
                    <span className="text-xs font-bold text-gray-700">{user.name}</span>
                  </div>
                  <button onClick={() => void handleLogout()} className="text-gray-400 hover:text-red-600 transition-colors"><LogOut size={18} /></button>
                </div>
              ) : (
                <button onClick={() => void handleLogin()} className="text-[11px] font-black text-gray-900 hover:text-red-600 uppercase tracking-widest" disabled={!authReady}>
                  {authReady ? 'Google Login' : 'Loading Auth...'}
                </button>
              )}
              {!user?.isPro && (
                <button onClick={() => setShowPricing(true)} className="px-5 py-2.5 text-[10px] font-black text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-lg shadow-red-100 transition-all uppercase tracking-widest">
                  Go Pro
                </button>
              )}
            </nav>

            <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-xs font-black text-gray-700 uppercase tracking-widest">Tools</Link>
            <button onClick={() => { setShowPricing(true); setIsMenuOpen(false); }} className="block text-xs font-black text-gray-700 uppercase tracking-widest">Pricing</button>
            {!user ? (
              <button onClick={() => { void handleLogin(); setIsMenuOpen(false); }} className="block text-xs font-black text-red-600 uppercase tracking-widest" disabled={!authReady}>
                {authReady ? 'Google Login' : 'Loading Auth...'}
              </button>
            ) : (
              <button onClick={() => { void handleLogout(); setIsMenuOpen(false); }} className="block text-xs font-black text-red-600 uppercase tracking-widest">Logout</button>
            )}
          </div>
        )}
      </header>

      <main className="flex-grow">{children}</main>

      {showPricing && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] max-w-4xl w-full p-10 relative shadow-2xl animate-in zoom-in duration-300">
            <button onClick={() => setShowPricing(false)} className="absolute top-8 right-8 text-gray-400 hover:text-red-500"><X size={32} /></button>
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-[24px] flex items-center justify-center mx-auto mb-6"><Crown size={40} /></div>
              <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-2">Built-Theory Pro</h2>
              <p className="text-gray-500 font-medium">Unlock 10GB file limits, unlimited tasks, and priority security tools.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { id: 'weekly', name: 'Weekly', price: PRICING.weekly, desc: 'Quick fixes' },
                { id: 'monthly', name: 'Monthly', price: PRICING.monthly, desc: 'Professional Choice', recommended: true },
                { id: 'yearly', name: 'Yearly', price: PRICING.yearly, desc: 'Lifetime Value' }
              ].map(plan => (
                <div key={plan.id} className={`p-8 border-4 rounded-[32px] transition-all flex flex-col relative ${plan.recommended ? 'border-red-600 shadow-2xl shadow-red-50 scale-105' : 'border-gray-100 hover:border-red-200'}`}>
                  {plan.recommended && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">Most Popular</span>}
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{plan.name}</span>
                  <div className="text-5xl font-black text-gray-900 mb-2">₹{plan.price}</div>
                  <p className="text-gray-500 text-xs font-bold mb-8">{plan.desc}</p>
                  <button onClick={() => handleUpgrade(plan.id)} className={`mt-auto w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${plan.recommended ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-900 text-white hover:bg-black'}`}>Select Plan</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-900 pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 text-gray-400">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <FileStack className="text-red-500 w-8 h-8" />
              <span className="text-3xl font-black text-white tracking-tighter uppercase">Built-Theory</span>
            </div>
            <p className="max-w-sm mb-10 leading-relaxed font-medium text-lg text-gray-300">
              The most advanced PDF engine for the modern web. 100% Client-Side encryption for Civil Engineers and Designers.
            </p>
            <div className="flex items-center gap-6 text-[10px] font-black text-white uppercase tracking-widest">
              <span className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full"><ShieldCheck size={18} className="text-green-400" /> AES-256 SECURED</span>
              <span className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full"><Heart size={18} className="text-red-500" /> OPEN SOURCE</span>
            </div>
          </div>
          <div>
            <h4 className="text-white font-black mb-8 uppercase tracking-widest text-xs">Solutions</h4>
            <ul className="space-y-5 text-xs font-bold uppercase tracking-widest">
              <li><Link to="/tool/merge" className="hover:text-red-400 transition-colors">Combine Files</Link></li>
              <li><Link to="/tool/compress" className="hover:text-red-400 transition-colors">Reduce Size</Link></li>
              <li><Link to="/tool/ocr" className="hover:text-red-400 transition-colors">Searchable OCR</Link></li>
              <li><Link to="/tool/protect" className="hover:text-red-400 transition-colors">Lock PDF</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black mb-8 uppercase tracking-widest text-xs">Company</h4>
            <ul className="space-y-5 text-xs font-bold uppercase tracking-widest">
              <li className="text-red-500 font-black cursor-pointer" onClick={() => setShowPricing(true)}>Pricing & Plans</li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Developer API</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Security Specs</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-800 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center text-[11px] font-black text-gray-500 gap-6 uppercase tracking-widest">
          <p>© 2026 BUILT-THEORY™ | ALL RIGHTS RESERVED.</p>
          <p className="flex items-center gap-3">
            VERIFIED BY <span className="text-white">RAZORPAY</span> & <span className="text-white">GOOGLE GEMINI 3.0</span>
          </p>
        </div>
      </footer>
    </div>
  );
};
