import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  DollarSign, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Globe, 
  Laptop,
  Check
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus, ProjectType } from '../types';
import { generateStrongPassword } from '../utils/formatters';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Order) => void;
  initialData?: Order | null;
}

const PROJECT_TYPES: ProjectType[] = [
  'Web Application (SaaS)',
  'Website Company Profile',
  'Toko Online / E-Commerce',
  'Aplikasi Mobile (Android/iOS)',
  'Sistem Kasir / POS',
  'Landing Page',
  'Sistem Informasi Manajemen',
  'Custom API / Backend'
];

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [appName, setAppName] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('Web Application (SaaS)');
  const [description, setDescription] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [featureList, setFeatureList] = useState<string[]>([]);
  
  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginUrl, setLoginUrl] = useState('');
  const [hostingProvider, setHostingProvider] = useState('');
  const [databaseInfo, setDatabaseInfo] = useState('');
  const [credentialNotes, setCredentialNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Financials
  const [status, setStatus] = useState<OrderStatus>('baru');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('belum_bayar');
  const [totalPrice, setTotalPrice] = useState<number>(3500000);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [deadlineDate, setDeadlineDate] = useState<string>('');
  const [demoUrl, setDemoUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [aiStudioNotes, setAiStudioNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setClientName(initialData.clientName);
      setClientPhone(initialData.clientPhone);
      setClientCompany(initialData.clientCompany || '');
      setAppName(initialData.appName);
      setProjectType(initialData.projectType);
      setDescription(initialData.description);
      setFeatureList(initialData.featureList || []);
      setEmail(initialData.credential.email);
      setPassword(initialData.credential.password);
      setLoginUrl(initialData.credential.loginUrl || '');
      setHostingProvider(initialData.credential.hostingProvider || '');
      setDatabaseInfo(initialData.credential.databaseInfo || '');
      setCredentialNotes(initialData.credential.notes || '');
      setStatus(initialData.status);
      setPaymentStatus(initialData.paymentStatus);
      setTotalPrice(initialData.totalPrice);
      setPaidAmount(initialData.paidAmount);
      setOrderDate(initialData.orderDate);
      setDeadlineDate(initialData.deadlineDate);
      setDemoUrl(initialData.demoUrl || '');
      setRepoUrl(initialData.repoUrl || '');
      setAiStudioNotes(initialData.aiStudioNotes || '');
    } else {
      // Defaults for new order
      setClientName('');
      setClientPhone('');
      setClientCompany('');
      setAppName('');
      setProjectType('Web Application (SaaS)');
      setDescription('');
      setFeatureList([
        'Dashboard Admin & Autentikasi',
        'Manajemen Data Lengkap',
        'Desain Responsif Mobile & Desktop'
      ]);
      setEmail('');
      setPassword(generateStrongPassword(12));
      setLoginUrl('');
      setHostingProvider('Vercel / Supabase');
      setDatabaseInfo('');
      setCredentialNotes('');
      setStatus('baru');
      setPaymentStatus('belum_bayar');
      setTotalPrice(3500000);
      setPaidAmount(0);
      setOrderDate(new Date().toISOString().slice(0, 10));
      
      const future = new Date();
      future.setDate(future.getDate() + 14);
      setDeadlineDate(future.toISOString().slice(0, 10));
      
      setDemoUrl('');
      setRepoUrl('');
      setAiStudioNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFeatureList([...featureList, featureInput.trim()]);
    setFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeatureList(featureList.filter((_, i) => i !== index));
  };

  const handleGeneratePassword = () => {
    const newPass = generateStrongPassword(14);
    setPassword(newPass);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !appName.trim() || !email.trim() || !password.trim()) {
      alert('Mohon lengkapi Nama Pemesan, Nama Aplikasi, Email, dan Password!');
      return;
    }

    // Determine auto payment status
    let derivedPaymentStatus = paymentStatus;
    if (paidAmount >= totalPrice && totalPrice > 0) {
      derivedPaymentStatus = 'lunas';
    } else if (paidAmount > 0 && paidAmount < totalPrice) {
      derivedPaymentStatus = 'dp';
    } else if (paidAmount === 0) {
      derivedPaymentStatus = 'belum_bayar';
    }

    const orderToSave: Order = {
      id: initialData?.id || `ORD-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientCompany: clientCompany.trim(),
      appName: appName.trim(),
      projectType,
      description: description.trim(),
      featureList,
      credential: {
        email: email.trim(),
        password: password.trim(),
        loginUrl: loginUrl.trim(),
        hostingProvider: hostingProvider.trim(),
        databaseInfo: databaseInfo.trim(),
        notes: credentialNotes.trim(),
      },
      status,
      paymentStatus: derivedPaymentStatus,
      totalPrice: Number(totalPrice) || 0,
      paidAmount: Number(paidAmount) || 0,
      orderDate,
      deadlineDate: deadlineDate || orderDate,
      demoUrl: demoUrl.trim(),
      repoUrl: repoUrl.trim(),
      aiStudioNotes: aiStudioNotes.trim(),
      createdAt: initialData?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    onSave(orderToSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {initialData ? 'Edit Data Pesanan & Kredensial' : 'Tambah Pesanan Baru'}
              </h2>
              <p className="text-xs text-slate-400">
                Input identitas pemesan, aplikasi yang dipesan, dan data login akses
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Informasi Pemesan */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center space-x-1.5">
              <User className="w-4 h-4" />
              <span>1. Identitas Pemesan (Klien)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Pemesan *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Contoh: Pak Budi Santoso"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  No. WhatsApp / Telepon
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Perusahaan / Bisnis / Usaha (Opsional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    placeholder="Contoh: CV Maju Lancar, Toko Baju Sentosa, PT Kopi Indonesia"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Informasi Aplikasi Yang Dipesan */}
          <div className="space-y-3.5 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
              <Laptop className="w-4 h-4" />
              <span>2. Aplikasi / Website Yang Dipesan</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama Aplikasi / Web *
                </label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Contoh: Sistem Kasir & Manajemen Stok"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tipe Proyek *
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value as ProjectType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                >
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Deskripsi Kebutuhan & Ringkasan Proyek
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan kebutuhan fungsional aplikasi ini secara singkat..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Fitur Utama */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Daftar Fitur Utama
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="Ketik fitur (misal: Cetak Struk Bluetooth, Login Admin) lalu tekan Tambah"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl text-xs font-medium transition-colors border border-slate-700"
                  >
                    Tambah Fitur
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {featureList.map((feature, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1.5 bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-lg border border-slate-700"
                    >
                      <span>• {feature}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Email & Password Pemesan (Kredensial Akses) */}
          <div className="space-y-3.5 pt-2 border-t border-slate-800 bg-indigo-950/20 p-4 rounded-xl border border-indigo-900/40">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <Key className="w-4 h-4" />
                <span>3. Email & Password Pemesan (Akses Akun) *</span>
              </h3>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-colors font-medium"
                title="Buat password acak yang kuat otomatis"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Password Kuat</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Akun Pemesan *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@klien.com atau email@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password Akun Pemesan *
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Link / URL Login Aplikasi
                </label>
                <input
                  type="text"
                  value={loginUrl}
                  onChange={(e) => setLoginUrl(e.target.value)}
                  placeholder="https://app.klien.com/login"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Hosting / Platform Deployment
                </label>
                <input
                  type="text"
                  value={hostingProvider}
                  onChange={(e) => setHostingProvider(e.target.value)}
                  placeholder="cPanel / Vercel / Firebase / VPS"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Catatan Kredensial Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  value={credentialNotes}
                  onChange={(e) => setCredentialNotes(e.target.value)}
                  placeholder="Contoh: Akun cPanel sama, atau pin master 123456"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Biaya & Status Pengerjaan */}
          <div className="space-y-3.5 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4" />
              <span>4. Biaya, Deadline & Status</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Total Biaya Proyek (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Jumlah Terbayar / DP (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Status Pengerjaan
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                >
                  <option value="baru">Baru / Antrean</option>
                  <option value="pengerjaan">Dalam Pengerjaan</option>
                  <option value="revisi">Testing / Revisi</option>
                  <option value="selesai">Selesai / Delivered</option>
                  <option value="dibatalkan">Dibatalkan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Deadline
                </label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Link Demo Preview Web (Opsional)
                </label>
                <input
                  type="text"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://preview-aplikasi.vercel.app"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Link Repository GitHub (Opsional)
                </label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/project-repo"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Perbarui Pesanan' : 'Simpan Pesanan Baru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
