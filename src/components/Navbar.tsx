import { 
  Laptop, 
  Globe, 
  FolderKanban, 
  Plus, 
  Download, 
  Sparkles,
  BarChart3,
  Cloud,
  CloudOff,
  LogIn,
  LogOut,
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';
import { exportOrdersToCSV } from '../utils/formatters';
import { Order } from '../types';
import { User } from 'firebase/auth';

interface NavbarProps {
  activeTab: 'orders' | 'browser' | 'analytics';
  setActiveTab: (tab: 'orders' | 'browser' | 'analytics') => void;
  onAddNewOrder: () => void;
  orders: Order[];
  currentUser: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isSyncing: boolean;
  onSyncAllToCloud?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onAddNewOrder,
  orders,
  currentUser,
  onLogin,
  onLogout,
  isSyncing,
  onSyncAllToCloud
}) => {
  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-amber-400 p-0.5 flex items-center justify-center shadow-lg shadow-sky-500/10">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Laptop className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-400 bg-clip-text text-transparent">
                  DevOrder
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded">
                  Studio Pro
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                {currentUser ? (
                  <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                    <Cloud className="w-3 h-3 animate-pulse" />
                    <span>Firebase Cloud Terhubung</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-amber-400/90">
                    <CloudOff className="w-3 h-3" />
                    <span>Mode Lokal (Belum Login Cloud)</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Menus */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
            {/* Orders Tab */}
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Pesanan</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'orders'
                    ? 'bg-sky-700 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {orders.length}
              </span>
            </button>

            {/* Google Chrome & AI Studio Tab */}
            <button
              onClick={() => setActiveTab('browser')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'browser'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Browser (AI Studio)</span>
              <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Chrome UI
              </span>
            </button>

            {/* Analytics Tab */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-slate-800 text-sky-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Statistik</span>
            </button>
          </nav>

          {/* Action Buttons & Firebase Cloud Login */}
          <div className="flex items-center space-x-2">
            {/* Firebase Auth Button */}
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl p-1 pr-2.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-7 h-7 rounded-lg border border-emerald-500/50"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden xl:block text-left text-xs leading-tight">
                  <span className="font-semibold text-slate-200 block truncate max-w-[120px]">
                    {currentUser.displayName || 'Developer'}
                  </span>
                  <span className="text-[10px] text-emerald-400 block">
                    Cloud Firestore
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors ml-1"
                  title="Logout dari Firebase"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center space-x-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-all"
                title="Login dengan Google agar pesanan tersimpan di Firebase Cloud dan bisa dibuka di mana saja!"
              >
                <Cloud className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span className="hidden sm:inline">Konek ke Firebase</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}

            <button
              onClick={onAddNewOrder}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pesanan</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
