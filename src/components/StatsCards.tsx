import React from 'react';
import { 
  FolderKanban, 
  Clock, 
  CheckCircle2, 
  Wallet, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Order } from '../types';
import { formatRupiah } from '../utils/formatters';

interface StatsCardsProps {
  orders: Order[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ orders }) => {
  const totalOrders = orders.length;
  const inProgress = orders.filter(o => o.status === 'pengerjaan' || o.status === 'revisi').length;
  const completed = orders.filter(o => o.status === 'selesai').length;
  const newOrders = orders.filter(o => o.status === 'baru').length;

  const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const totalPaid = orders.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalPending = totalRevenue - totalPaid;

  const cards = [
    {
      title: 'Total Pesanan Masuk',
      value: totalOrders,
      subtitle: `${newOrders} antrean baru`,
      icon: FolderKanban,
      color: 'from-blue-500/20 to-sky-500/20 text-sky-400 border-sky-500/30',
      badge: `${newOrders} Baru`,
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
    },
    {
      title: 'Proyek Dalam Pengerjaan',
      value: inProgress,
      subtitle: 'Sedang dicoding & revisi',
      icon: Clock,
      color: 'from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30',
      badge: 'Aktif',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      title: 'Proyek Selesai & Rilis',
      value: completed,
      subtitle: `${Math.round((completed / (totalOrders || 1)) * 100)}% tingkat selesai`,
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      badge: 'Delivered',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      title: 'Total Omset Proyek',
      value: formatRupiah(totalRevenue),
      subtitle: `Sisa piutang: ${formatRupiah(totalPending)}`,
      icon: TrendingUp,
      color: 'from-indigo-500/20 to-violet-500/20 text-indigo-400 border-indigo-500/30',
      badge: `Diterima ${formatRupiah(totalPaid)}`,
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4.5 transition-all shadow-sm hover:shadow-md relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">{card.title}</span>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br border ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors">
                {card.value}
              </span>
            </div>

            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px] truncate">{card.subtitle}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
