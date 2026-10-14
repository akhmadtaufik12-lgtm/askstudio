import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Order } from '../types';

interface DeleteConfirmModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderId: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  order,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-rose-500/30 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
        {/* Header Icon */}
        <div className="flex items-start justify-between">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Details */}
        <div>
          <h3 className="text-base font-bold text-slate-100">
            Hapus Pesanan Ini?
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Apakah Anda yakin ingin menghapus pesanan pembuatan aplikasi ini? Tindakan ini tidak dapat dibatalkan dan data akan dihapus permanen dari Firebase Cloud & lokal.
          </p>
        </div>

        {/* Order Preview Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>ID Pesanan:</span>
            <span className="font-mono text-slate-300">{order.id}</span>
          </div>
          <div className="flex items-center justify-between text-slate-200 font-semibold">
            <span>Aplikasi:</span>
            <span className="text-rose-300 truncate max-w-[200px]">{order.appName}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Klien:</span>
            <span className="text-slate-300">{order.clientName}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
            <span>Email Akun:</span>
            <span className="font-mono text-emerald-400">{order.credential.email}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onConfirm(order.id);
              onClose();
            }}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/30 flex items-center space-x-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Permanen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
