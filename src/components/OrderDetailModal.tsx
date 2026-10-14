import React, { useState } from 'react';
import {
  X,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Calendar,
  Clock,
  DollarSign,
  User,
  Phone,
  Building2,
  FileText,
  Printer,
  Edit3,
  Trash2,
  Share2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Order } from '../types';
import {
  formatRupiah,
  formatDateIndo,
  getDaysRemaining,
  generateWhatsAppMessage,
  generateAiStudioPrompt
} from '../utils/formatters';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onEdit: (order: Order) => void;
  onDelete: (orderId: string) => void;
  onOpenInAiStudio: (order: Order) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onEdit,
  onDelete,
  onOpenInAiStudio
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showInvoicePrint, setShowInvoicePrint] = useState(false);

  if (!order) return null;

  const daysInfo = getDaysRemaining(order.deadlineDate);
  const remainingPayment = order.totalPrice - order.paidAmount;
  const paymentPercentage = order.totalPrice > 0 
    ? Math.min(100, Math.round((order.paidAmount / order.totalPrice) * 100)) 
    : 0;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(order.credential.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(order.credential.password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleCopyAllCredentials = () => {
    const text = `Akses Akun Pemesan (${order.appName}):
Email: ${order.credential.email}
Password: ${order.credential.password}
${order.credential.loginUrl ? `Login: ${order.credential.loginUrl}\n` : ''}${order.credential.notes ? `Catatan: ${order.credential.notes}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = order.clientPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('0') 
      ? '62' + cleanPhone.slice(1) 
      : cleanPhone;
    const msg = generateWhatsAppMessage(order);
    window.open(`https://wa.me/${phoneWithCountry}?text=${msg}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'baru':
        return <span className="px-2.5 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-full text-xs font-semibold">Baru / Antrean</span>;
      case 'pengerjaan':
        return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-semibold">Dalam Pengerjaan</span>;
      case 'revisi':
        return <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-full text-xs font-semibold">Testing / Revisi</span>;
      case 'selesai':
        return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">Selesai / Delivered</span>;
      case 'dibatalkan':
        return <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full text-xs font-semibold">Dibatalkan</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                  {order.id}
                </span>
                {getStatusBadge(order.status)}
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-1">
                {order.appName}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => onEdit(order)}
              className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Edit pesanan"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm(`Yakin ingin menghapus pesanan "${order.appName}"?`)) {
                  onDelete(order.id);
                  onClose();
                }
              }}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Hapus pesanan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Action Banner: Open in AI Studio */}
          <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-sky-900/40 border border-indigo-700/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Kerjakan di Google AI Studio Apps
                </h4>
                <p className="text-xs text-indigo-200/80 leading-relaxed">
                  Buka tab browser Chrome terintegrasi dengan spesifikasi dan prompt pesanan {order.appName} otomatis dimuat.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onOpenInAiStudio(order);
                onClose();
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Buka di Browser AI Studio</span>
            </button>
          </div>

          {/* Credentials Card (Highlighting Email & Password Pemesan) */}
          <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Key className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Kredensial & Akun Akses Pemesan
                </h3>
              </div>
              <button
                onClick={handleCopyAllCredentials}
                className="flex items-center space-x-1 text-xs text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-colors"
                title="Salin semua informasi akun"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAll ? 'Tersalin!' : 'Salin Semua Akun'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Email Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Email Pemesan:
                  </span>
                  <span className="font-mono text-sm font-semibold text-slate-100 select-all">
                    {order.credential.email}
                  </span>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                  title="Salin Email"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                <div className="flex-1 pr-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Password Pemesan:
                  </span>
                  <span className="font-mono text-sm font-semibold text-amber-300 select-all tracking-wider">
                    {showPassword ? order.credential.password : '••••••••••••'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleCopyPassword}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                    title="Salin Password"
                  >
                    {copiedPassword ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Extra credential details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
              {order.credential.loginUrl && (
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">URL Login:</span>
                  <a
                    href={order.credential.loginUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline flex items-center space-x-1 font-mono truncate"
                  >
                    <span>{order.credential.loginUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              )}
              {order.credential.hostingProvider && (
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Platform/Hosting:</span>
                  <span className="text-slate-200 font-medium">{order.credential.hostingProvider}</span>
                </div>
              )}
              {order.credential.notes && (
                <div className="sm:col-span-2 text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 font-semibold mr-1">Catatan Akses:</span>
                  <span>{order.credential.notes}</span>
                </div>
              )}
            </div>

            {/* Direct WhatsApp Send */}
            {order.clientPhone && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleOpenWhatsApp}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Kirim Data Akun ke WhatsApp Klien</span>
                </button>
              </div>
            )}
          </div>

          {/* Client & Project Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Info */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <User className="w-4 h-4 text-sky-400" />
                <span>Data Pemesan</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Nama:</span>
                  <span className="font-semibold text-slate-100">{order.clientName}</span>
                </div>
                {order.clientCompany && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Perusahaan/Toko:</span>
                    <span className="font-medium text-slate-200">{order.clientCompany}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Kontak WA:</span>
                  <span className="font-mono text-sky-400">{order.clientPhone || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tanggal Pesan:</span>
                  <span className="text-slate-200">{formatDateIndo(order.orderDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deadline:</span>
                  <span className="font-semibold text-amber-400 flex items-center space-x-1">
                    <span>{formatDateIndo(order.deadlineDate)}</span>
                    <span className="text-[10px] text-slate-400">({daysInfo.label})</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Rincian Pembayaran</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Biaya:</span>
                  <span className="font-bold text-slate-100 font-mono">{formatRupiah(order.totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Terbayar / DP:</span>
                  <span className="font-bold text-emerald-400 font-mono">{formatRupiah(order.paidAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sisa Tagihan:</span>
                  <span className="font-bold text-rose-400 font-mono">{formatRupiah(remainingPayment)}</span>
                </div>

                {/* Progress Bar */}
                <div className="pt-1">
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        paymentPercentage === 100 ? 'bg-emerald-500' : 'bg-sky-500'
                      }`}
                      style={{ width: `${paymentPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Status: {order.paymentStatus.toUpperCase()}</span>
                    <span>{paymentPercentage}% lunas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Features */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Kebutuhan & Fitur Aplikasi</span>
            </h4>

            {order.description && (
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                {order.description}
              </p>
            )}

            {order.featureList && order.featureList.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400">Daftar Fitur yang Dikerjakan:</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {order.featureList.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-2 text-slate-200 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Dibuat: {formatDateIndo(order.orderDate)}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
