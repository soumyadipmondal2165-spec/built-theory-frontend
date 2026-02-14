
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileStack, Menu, X, ShieldCheck, Heart } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col selection:bg-red-100 selection:text-red-600">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center group-hover:bg-red-700 transition-all shadow-lg shadow-red-200">
                <FileStack className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">Built-Theory</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-bold text-gray-600 hover:text-red-600 transition-colors">ALL TOOLS</Link>
              <div className="h-4 w-px bg-gray-200"></div>
              <button className="text-sm font-bold text-gray-600 hover:text-red-600">LOG IN</button>
              <button className="px-5 py-2.5 text-sm font-black text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-lg shadow-red-100 transition-all uppercase tracking-wide">
                Join Pro
              </button>
            </nav>

            <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-gray-400">
          <div className="col-span-1 md:col-span-2">
             <div className="flex items-center gap-2 mb-6">
                <FileStack className="text-red-500" />
                <span className="text-2xl font-black text-white tracking-tighter uppercase">Built-Theory</span>
             </div>
             <p className="max-w-sm mb-8 leading-relaxed">
                The ultimate PDF suite for Civil Engineers and Students. Maintenance-free, lightweight, and completely secure.
             </p>
             <div className="flex items-center gap-4 text-sm font-bold text-white">
                <span className="flex items-center gap-1"><ShieldCheck size={16} className="text-green-400"/> SSL Secured</span>
                <span className="flex items-center gap-1"><Heart size={16} className="text-red-500"/> Made for Students</span>
             </div>
          </div>
          <div>
            <h4 className="text-white font-black mb-6 uppercase tracking-widest text-xs">Products</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/merge" className="hover:text-red-400 transition-colors">Merge PDF</Link></li>
              <li><Link to="/split" className="hover:text-red-400 transition-colors">Split PDF</Link></li>
              <li><Link to="/compress" className="hover:text-red-400 transition-colors">Compress PDF</Link></li>
              <li><Link to="/ocr" className="hover:text-red-400 transition-colors">OCR Search</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black mb-6 uppercase tracking-widest text-xs">Account</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="text-red-500 font-bold tracking-wide">UPGRADE TO PRO</li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Student Login</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-800 mt-16 pt-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs font-bold text-gray-600 gap-4">
          <p>© 2024 BUILT-THEORY. ALL RIGHTS RESERVED.</p>
          <p className="flex items-center gap-2">POWERED BY <span className="text-gray-400">GEMINI AI</span> & <span className="text-gray-400">RAZORPAY</span></p>
        </div>
      </footer>
    </div>
  );
};
