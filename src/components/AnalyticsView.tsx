import React, { useRef } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Calendar,
  AlertTriangle,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Code
} from 'lucide-react';
import { Order } from '../types';
import { formatRupiah, formatDateIndo, getDaysRemaining, exportOrdersToCSV } from '../utils/formatters';
import { INITIAL_ORDERS } from '../data/initialOrders';

interface AnalyticsViewProps {
  orders: Order[];
  onRestoreOrders: (orders: Order[]) => void;
  onOpenOrder: (order: Order) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  orders,
  onRestoreOrders,
  onOpenOrder
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalPaid = orders.reduce((sum, o) => sum + o.paidAmount, 0);
  const totalPending = totalRevenue - totalPaid;

  // Breakdown by Project Type
  const typeMap: Record<string, number> = {};
  orders.forEach((o) => {
    typeMap[o.projectType] = (typeMap[o.projectType] || 0) + 1;
  });

  // Upcoming deadlines (sorted)
  const sortedByDeadline = [...orders]
    .filter((o) => o.status !== 'selesai' && o.status !== 'dibatalkan')
    .sort((a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime());

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(orders, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `DevOrder_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            onRestoreOrders(parsed);
            alert(`Berhasil memulihkan ${parsed.length} data pesanan!`);
          } else {
            alert('Format file JSON tidak valid!');
          }
        } catch {
          alert('Gagal membaca file JSON!');
        }
      };
    }
  };

  const handleResetSampleData = () => {
    if (confirm('Kembalikan ke data contoh pesanan awal?')) {
      onRestoreOrders(INITIAL_ORDERS);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-950/60 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <span>Statistik Bisnis Pembuatan Software & Web</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Analisis arus kas pesanan klien, distribusi tipe proyek, dan tenggat waktu pengerjaan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportOrdersToCSV(orders)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Backup JSON</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Import JSON</span>
          </button>
          <button
            onClick={handleResetSampleData}
            className="px-3 py-2 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-medium flex items-center space-x-1 transition-colors"
            title="Reset ke data awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Financial Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-medium text-slate-400">Total Nilai Kontrak Proyek</span>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {formatRupiah(totalRevenue)}
          </div>
          <p className="text-[11px] text-slate-500">
            Akumulasi dari {orders.length} pesanan aplikasi & website
          </p>
        </div>

        <div className="bg-slate-900 border border-emerald-900/40 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-medium text-emerald-400">Pembayaran Diterima (DP + Lunas)</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {formatRupiah(totalPaid)}
          </div>
          <p className="text-[11px] text-slate-400">
            {totalRevenue > 0 ? Math.round((totalPaid / totalRevenue) * 100) : 0}% dari seluruh omset telah tertagih
          </p>
        </div>

        <div className="bg-slate-900 border border-rose-900/40 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-medium text-rose-400">Sisa Tagihan / Piutang Klien</span>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {formatRupiah(totalPending)}
          </div>
          <p className="text-[11px] text-slate-400">
            Akan dibayarkan saat serah terima aplikasi selesai
          </p>
        </div>
      </div>

      {/* Project Types & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Types Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-sky-400" />
            <span>Kategori Aplikasi Yang Dipesan</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(typeMap).map(([type, count]) => {
              const percentage = Math.round((count / orders.length) * 100);
              return (
                <div key={type} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{type}</span>
                    <span className="font-mono text-slate-400">
                      {count} proyek ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Deadlines */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Target Deadline Proyek Aktif</span>
          </h3>

          {sortedByDeadline.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Semua proyek aktif telah selesai!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {sortedByDeadline.map((order) => {
                const daysInfo = getDaysRemaining(order.deadlineDate);
                return (
                  <div
                    key={order.id}
                    onClick={() => onOpenOrder(order)}
                    className="p-3 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between cursor-pointer transition-colors group"
                  >
                    <div className="truncate pr-2">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-sky-300 transition-colors block truncate">
                        {order.appName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Klien: {order.clientName}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          daysInfo.isOverdue
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : daysInfo.days <= 3
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {daysInfo.label}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {formatDateIndo(order.deadlineDate)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
