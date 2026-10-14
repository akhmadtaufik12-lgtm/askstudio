import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { OrderList } from './components/OrderList';
import { ChromeBrowser } from './components/ChromeBrowser';
import { OrderFormModal } from './components/OrderFormModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AnalyticsView } from './components/AnalyticsView';
import { Order } from './types';
import { INITIAL_ORDERS } from './data/initialOrders';
import { auth, loginWithGoogle, logoutUser } from './firebase';
import { 
  subscribeToUserOrders, 
  saveOrderToFirestore, 
  deleteOrderFromFirestore, 
  batchSyncLocalOrdersToFirestore 
} from './services/orderService';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  Sparkles, 
  Globe, 
  Cloud, 
  CloudOff, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle,
  LogIn
} from 'lucide-react';

const STORAGE_KEY = 'devorder_software_orders_v1';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_ORDERS;
  });

  const [activeTab, setActiveTab] = useState<'orders' | 'browser' | 'analytics'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedOrderForPrompt, setSelectedOrderForPrompt] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      if (user) {
        showToast(`Selamat datang, ${user.displayName || user.email}! Terhubung ke Cloud.`);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore real-time updates when user is authenticated
  useEffect(() => {
    if (!currentUser) return;

    setIsSyncing(true);
    const unsubscribe = subscribeToUserOrders(
      currentUser.uid,
      (cloudOrders) => {
        setIsSyncing(false);
        // If user already has cloud orders, display them
        if (cloudOrders.length > 0) {
          setOrders(cloudOrders);
        } else {
          // If brand new account on cloud, automatically upload initial/local orders
          batchSyncLocalOrdersToFirestore(orders, currentUser.uid).then(() => {
            showToast('Pesanan berhasil disimpan ke Firebase Cloud!');
          });
        }
      },
      (error) => {
        setIsSyncing(false);
        console.error('Subscription error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Sync to localStorage as offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  }, [orders]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error: unknown) {
      console.error('Login error:', error);
      const msg = error instanceof Error ? error.message : 'Gagal login ke Google';
      showToast(`Login gagal: ${msg}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast('Berhasil logout. Beralih ke data lokal.');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSyncAllToCloud = async () => {
    if (!currentUser) {
      await handleLogin();
      return;
    }
    setIsSyncing(true);
    try {
      const count = await batchSyncLocalOrdersToFirestore(orders, currentUser.uid);
      showToast(`Berhasil menyinkronkan ${count} pesanan ke Firebase Cloud!`);
    } catch (error) {
      console.error('Sync error:', error);
      showToast('Gagal menyinkronkan data ke Cloud.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveOrder = async (newOrUpdatedOrder: Order) => {
    const isEdit = !!editingOrder;
    
    // Update local state immediately
    if (isEdit) {
      setOrders(orders.map((o) => (o.id === newOrUpdatedOrder.id ? newOrUpdatedOrder : o)));
    } else {
      setOrders([newOrUpdatedOrder, ...orders]);
    }

    // Save to Firestore if authenticated
    if (currentUser) {
      try {
        await saveOrderToFirestore(newOrUpdatedOrder, currentUser.uid);
        showToast(`Pesanan "${newOrUpdatedOrder.appName}" tersimpan di Cloud & Lokal!`);
      } catch (error) {
        console.error('Save to firestore error:', error);
        showToast(`Tersimpan lokal (Gagal sync ke cloud)`);
      }
    } else {
      showToast(`Pesanan "${newOrUpdatedOrder.appName}" berhasil disimpan secara lokal!`);
    }

    setIsFormOpen(false);
    setEditingOrder(null);
  };

  const handleDeleteOrder = async (orderId: string) => {
    setOrders(orders.filter((o) => o.id !== orderId));
    if (currentUser) {
      try {
        await deleteOrderFromFirestore(orderId);
        showToast('Pesanan dihapus dari Cloud & Lokal.');
      } catch (error) {
        console.error('Delete from firestore error:', error);
        showToast('Dihapus dari lokal.');
      }
    } else {
      showToast('Pesanan berhasil dihapus.');
    }
  };

  const handleOpenInAiStudio = (order: Order) => {
    setSelectedOrderForPrompt(order);
    setActiveTab('browser');
    showToast(`Membuka AI Studio untuk proyek "${order.appName}"...`);
  };

  const handleRestoreOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    if (currentUser) {
      batchSyncLocalOrdersToFirestore(newOrders, currentUser.uid);
    }
    showToast(`${newOrders.length} data pesanan berhasil disinkronkan!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-800 text-sky-300 border border-sky-500/40 px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddNewOrder={() => {
          setEditingOrder(null);
          setIsFormOpen(true);
        }}
        orders={orders}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isSyncing={isSyncing}
        onSyncAllToCloud={handleSyncAllToCloud}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Firebase Cloud Status Notice if NOT logged in */}
        {!currentUser && !isAuthLoading && (
          <div className="mb-6 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl shrink-0">
                <Cloud className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 flex items-center space-x-2">
                  <span>Hubungkan ke Firebase Cloud Database</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Bisa Dibuka di Mana Saja
                  </span>
                </h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Saat ini Anda dalam mode lokal. Masuk dengan akun Google untuk menyinkronkan seluruh pesanan klien dan password ke Cloud Firestore secara otomatis agar bisa dibuka dari HP, laptop, atau komputer lain.
                </p>
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center space-x-1.5 shrink-0"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk dengan Google</span>
            </button>
          </div>
        )}

        {/* TAB 1: ORDERS & CLIENTS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Top Stats Overview */}
            <StatsCards orders={orders} />

            {/* Quick Banner to Launch AI Studio */}
            <div className="bg-gradient-to-r from-sky-900/30 via-indigo-900/30 to-purple-900/30 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="p-3 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl shrink-0">
                  <Globe className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                    <span>Menu Web Browser Google Chrome Terintegrasi</span>
                    <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30">
                      https://aistudio.google.com/apps
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Buat dan edit aplikasi yang dipesan langsung melalui antarmuka browser Chrome di dalam aplikasi ini dengan prompt otomatis dari data pesanan!
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => setActiveTab('browser')}
                  className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Buka Browser AI Studio</span>
                </button>
              </div>
            </div>

            {/* Orders List Component */}
            <OrderList
              orders={orders}
              onSelectOrder={(order) => setSelectedOrder(order)}
              onEditOrder={(order) => {
                setEditingOrder(order);
                setIsFormOpen(true);
              }}
              onDeleteOrder={(order) => setDeletingOrder(order)}
              onOpenInAiStudio={handleOpenInAiStudio}
              onAddNew={() => {
                setEditingOrder(null);
                setIsFormOpen(true);
              }}
            />
          </div>
        )}

        {/* TAB 2: GOOGLE CHROME BROWSER & AI STUDIO WORKSPACE */}
        {activeTab === 'browser' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
              <div>
                <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                  <span className="text-xl">🌐</span>
                  <span>Google Chrome Workspace Browser</span>
                </h1>
                <p className="text-xs text-slate-400">
                  Halaman resmi <code className="text-sky-300 bg-slate-900 px-1 py-0.5 rounded">https://aistudio.google.com/apps</code> terbuka otomatis untuk memprogram dan membangun aplikasi klien.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href="https://aistudio.google.com/apps"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors"
                >
                  <span>Buka Tab Browser Asli</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </a>
              </div>
            </div>

            {/* The Chrome Browser Component */}
            <ChromeBrowser
              orders={orders}
              selectedOrderForPrompt={selectedOrderForPrompt}
              onSelectOrderForPrompt={(order) => setSelectedOrderForPrompt(order)}
            />
          </div>
        )}

        {/* TAB 3: ANALYTICS & STATISTIK */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            orders={orders}
            onRestoreOrders={handleRestoreOrders}
            onOpenOrder={(order) => setSelectedOrder(order)}
          />
        )}
      </main>

      {/* Form Modal (Add/Edit) */}
      <OrderFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingOrder(null);
        }}
        onSave={handleSaveOrder}
        initialData={editingOrder}
      />

      {/* Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onEdit={(order) => {
          setSelectedOrder(null);
          setEditingOrder(order);
          setIsFormOpen(true);
        }}
        onDelete={(orderId) => {
          const ord = orders.find(o => o.id === orderId);
          if (ord) setDeletingOrder(ord);
        }}
        onOpenInAiStudio={handleOpenInAiStudio}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        order={deletingOrder}
        isOpen={!!deletingOrder}
        onClose={() => setDeletingOrder(null)}
        onConfirm={handleDeleteOrder}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 mt-8 text-center text-xs text-slate-500">
        <p>DevOrder © 2026 — Terintegrasi dengan Google Firebase Cloud & Google AI Studio</p>
      </footer>
    </div>
  );
}
