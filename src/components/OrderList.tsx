import React, { useState } from 'react';
import {
  Search,
  Filter,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Sparkles,
  Calendar,
  Clock,
  Laptop,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Plus,
  ArrowUpDown,
  LayoutGrid,
  List,
  User,
  ShieldCheck
} from 'lucide-react';
import { Order, OrderStatus, ProjectType } from '../types';
import { formatRupiah, formatDateIndo, getDaysRemaining } from '../utils/formatters';

interface OrderListProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onOpenInAiStudio: (order: Order) => void;
  onAddNew: () => void;
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  onSelectOrder,
  onEditOrder,
  onDeleteOrder,
  onOpenInAiStudio,
  onAddNew
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const togglePasswordVisibility = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedPasswords(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleCopyCredentials = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Email: ${order.credential.email} | Password: ${order.credential.password}`;
    navigator.clipboard.writeText(text);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.credential.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.clientCompany && order.clientCompany.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.clientPhone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'baru':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>Baru</span>
          </span>
        );
      case 'pengerjaan':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Pengerjaan</span>
          </span>
        );
      case 'revisi':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>Revisi</span>
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Selesai</span>
          </span>
        );
      case 'dibatalkan':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <span>Batal</span>
          </span>
        );
    }
  };

  const getPaymentBadge = (paymentStatus: Order['paymentStatus']) => {
    switch (paymentStatus) {
      case 'lunas':
        return (
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded text-[10px] font-medium">
            Lunas
          </span>
        );
      case 'dp':
        return (
          <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded text-[10px] font-medium">
            DP Masuk
          </span>
        );
      case 'belum_bayar':
        return (
          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded text-[10px] font-medium">
            Belum Bayar
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pemesan, nama aplikasi, email akun, atau WA..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'baru', label: 'Baru' },
            { id: 'pengerjaan', label: 'Pengerjaan' },
            { id: 'revisi', label: 'Revisi' },
            { id: 'selesai', label: 'Selesai' },
          ].map((status) => (
            <button
              key={status.id}
              onClick={() => setStatusFilter(status.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === status.id
                  ? 'bg-sky-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {status.label}
            </button>
          ))}

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 ml-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Orders Container */}
      {filteredOrders.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-slate-800 rounded-2xl text-slate-400">
            <Laptop className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">Tidak ada pesanan ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {searchQuery
              ? `Tidak ada hasil pencarian untuk "${searchQuery}". Coba kata kunci lain.`
              : 'Belum ada pesanan klien terdaftar. Mulai tambahkan pesanan pembuatan aplikasi pertama Anda!'}
          </p>
          <button
            onClick={onAddNew}
            className="mt-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pesanan Klien</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const isPasswordRevealed = revealedPasswords[order.id];
            const isCopied = copiedId === order.id;
            const daysInfo = getDaysRemaining(order.deadlineDate);

            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4.5 flex flex-col justify-between transition-all hover:shadow-xl hover:-translate-y-0.5 cursor-pointer group relative overflow-hidden"
              >
                {/* Top: App Name & Status */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <span className="text-[10px] font-mono text-slate-500 block mb-0.5">
                        {order.id}
                      </span>
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-1">
                        {order.appName}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        {order.projectType}
                      </p>
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  {/* Client Info Pill */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 mb-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 truncate pr-2">
                      <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {order.clientName.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-slate-200 block truncate">
                          {order.clientName}
                        </span>
                        {order.clientCompany && (
                          <span className="text-[10px] text-slate-500 block truncate">
                            {order.clientCompany}
                          </span>
                        )}
                      </div>
                    </div>
                    {order.clientPhone && (
                      <span className="text-[11px] font-mono text-slate-400 shrink-0">
                        {order.clientPhone}
                      </span>
                    )}
                  </div>

                  {/* Dedicated Credentials Box (Email & Password Pemesan) */}
                  <div className="bg-gradient-to-br from-emerald-950/20 to-slate-950/80 border border-emerald-500/30 rounded-xl p-2.5 mb-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      <span className="flex items-center space-x-1">
                        <Key className="w-3 h-3" />
                        <span>Akun Login Pemesan</span>
                      </span>
                      <button
                        onClick={(e) => handleCopyCredentials(order, e)}
                        className="text-[10px] flex items-center space-x-1 text-emerald-300 hover:text-emerald-100 bg-emerald-500/10 hover:bg-emerald-500/20 px-1.5 py-0.5 rounded transition-colors"
                        title="Salin email & password"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'Tersalin' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 text-[10px]">Email:</span>
                      <span className="font-mono text-slate-200 select-all truncate max-w-[190px]">
                        {order.credential.email}
                      </span>
                    </div>

                    {/* Password */}
                    <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-slate-800/80">
                      <span className="text-slate-500 text-[10px]">Password:</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-amber-300 select-all font-medium">
                          {isPasswordRevealed ? order.credential.password : '••••••••••'}
                        </span>
                        <button
                          onClick={(e) => togglePasswordVisibility(order.id, e)}
                          className="text-slate-500 hover:text-slate-300 p-0.5"
                          title={isPasswordRevealed ? 'Sembunyikan' : 'Lihat password'}
                        >
                          {isPasswordRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Deadline & Payment Info */}
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px]">
                        Deadline: <strong className="text-slate-300">{formatDateIndo(order.deadlineDate)}</strong>
                      </span>
                    </div>
                    <div>{getPaymentBadge(order.paymentStatus)}</div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="font-mono font-bold text-slate-100 text-xs">
                    {formatRupiah(order.totalPrice)}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenInAiStudio(order);
                      }}
                      className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-indigo-100 border border-indigo-500/40 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                      title="Buka pesanan ini di workspace AI Studio"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>AI Studio</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOrder(order);
                      }}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Nama Aplikasi</th>
                  <th className="px-4 py-3">Pemesan</th>
                  <th className="px-4 py-3">Email & Password Akun</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Biaya & Pembayaran</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredOrders.map((order) => {
                  const isPasswordRevealed = revealedPasswords[order.id];
                  const isCopied = copiedId === order.id;

                  return (
                    <tr
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className="hover:bg-slate-850/60 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                          {order.appName}
                        </div>
                        <div className="text-[10px] text-slate-500">{order.projectType}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-200">{order.clientName}</div>
                        <div className="text-[10px] text-slate-400">{order.clientPhone || order.clientCompany || '-'}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-1.5 inline-block space-y-0.5">
                          <div className="font-mono text-[11px] text-emerald-400 flex items-center space-x-1">
                            <span>{order.credential.email}</span>
                          </div>
                          <div className="font-mono text-[11px] text-amber-300 flex items-center space-x-1.5">
                            <span>{isPasswordRevealed ? order.credential.password : '••••••••'}</span>
                            <button
                              onClick={(e) => togglePasswordVisibility(order.id, e)}
                              className="text-slate-500 hover:text-slate-300"
                            >
                              {isPasswordRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={(e) => handleCopyCredentials(order, e)}
                              className="text-slate-500 hover:text-emerald-400"
                              title="Salin kredensial"
                            >
                              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">{getStatusBadge(order.status)}</td>

                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-slate-100">{formatRupiah(order.totalPrice)}</div>
                        <div>{getPaymentBadge(order.paymentStatus)}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-slate-200 font-medium">{formatDateIndo(order.deadlineDate)}</div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenInAiStudio(order);
                            }}
                            className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg transition-colors"
                            title="Buka di AI Studio"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectOrder(order);
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium"
                          >
                            Buka
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
