import { Order } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function getDaysRemaining(deadlineStr: string): { days: number; isOverdue: boolean; label: string } {
  if (!deadlineStr) return { days: 0, isOverdue: false, label: '-' };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineStr);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: Math.abs(diffDays), isOverdue: true, label: `Terlambat ${Math.abs(diffDays)} hari` };
  } else if (diffDays === 0) {
    return { days: 0, isOverdue: false, label: 'Hari ini deadline!' };
  } else if (diffDays === 1) {
    return { days: 1, isOverdue: false, label: 'Besok deadline' };
  } else {
    return { days: diffDays, isOverdue: false, label: `${diffDays} hari lagi` };
  }
}

export function generateStrongPassword(length = 12): string {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
  let password = '';
  const cryptoObj = window.crypto || (window as unknown as { msCrypto: Crypto }).msCrypto;
  const values = new Uint32Array(length);
  cryptoObj.getRandomValues(values);
  for (let i = 0; i < length; i++) {
    password += chars[values[i] % chars.length];
  }
  return password;
}

export function generateWhatsAppMessage(order: Order): string {
  const remaining = order.totalPrice - order.paidAmount;
  const featuresText = order.featureList.length > 0 
    ? `\n*Fitur Utama:*\n${order.featureList.map(f => `• ${f}`).join('\n')}` 
    : '';

  return encodeURIComponent(
`Halo kak *${order.clientName}*, salam kenal dari tim developer! 🚀

Berikut adalah rangkuman pesanan pembuatan *${order.appName}*:

📋 *Tipe:* ${order.projectType}
📅 *Target Selesai:* ${formatDateIndo(order.deadlineDate)}
💰 *Total Biaya:* ${formatRupiah(order.totalPrice)}
💳 *Status Bayar:* ${order.paymentStatus === 'lunas' ? 'LUNAS' : `DP Masuk: ${formatRupiah(order.paidAmount)} (Sisa: ${formatRupiah(remaining)})`}
${featuresText}

🔐 *Akses Akun Pemesan:*
• Email: ${order.credential.email}
• Password: ${order.credential.password}
${order.credential.loginUrl ? `• Link Login: ${order.credential.loginUrl}` : ''}
${order.demoUrl ? `\n🌐 *Link Demo:* ${order.demoUrl}` : ''}

Terima kasih atas kepercayaannya! Mohon simpan password ini dengan aman ya kak.`
  );
}

export function generateAiStudioPrompt(order: Order): string {
  const features = order.featureList.length > 0 
    ? order.featureList.map((f, i) => `${i + 1}. ${f}`).join('\n')
    : '1. Antarmuka dashboard responsif dan modern\n2. Manajemen data lengkap (CRUD)\n3. Fitur export/filter data\n4. Halaman otentikasi login pemesan';

  return `Buatkan aplikasi web lengkap dan siap pakai untuk:
Nama Aplikasi: "${order.appName}"
Tipe Proyek: ${order.projectType}
Klien Pemesan: ${order.clientName} ${order.clientCompany ? `(${order.clientCompany})` : ''}

Deskripsi Kebutuhan:
${order.description || 'Aplikasi modern dengan performa tinggi dan tampilan profesional.'}

Daftar Fitur Wajib:
${features}

Spesifikasi Akun Pengguna / Admin Default:
- Email Admin/Klien: ${order.credential.email}
- Password Akses: ${order.credential.password}
${order.credential.notes ? `- Catatan Akses: ${order.credential.notes}` : ''}

Desain & Teknologi yang diinginkan:
- Modern, clean, professional dark/light UI dengan Tailwind CSS
- Gunakan React & TypeScript dengan arsitektur komponen modular
- Navigasi responsif untuk desktop dan mobile
- Notifikasi toast, validasi form, serta visualisasi data/grafik jika relevan
- Semua fitur interaktif dapat langsung dicoba dan berfungsi penuh tanpa error.`;
}

export function exportOrdersToCSV(orders: Order[]): void {
  const headers = [
    'ID',
    'Nama Pemesan',
    'No Telepon/WA',
    'Perusahaan',
    'Nama Aplikasi',
    'Tipe Proyek',
    'Email Akun Pemesan',
    'Password Akun Pemesan',
    'Status Pengerjaan',
    'Status Pembayaran',
    'Total Biaya (IDR)',
    'Terbayar (IDR)',
    'Sisa Bayar (IDR)',
    'Tanggal Pesan',
    'Deadline',
    'Link Demo',
    'Deskripsi'
  ];

  const rows = orders.map(order => [
    `"${order.id}"`,
    `"${order.clientName.replace(/"/g, '""')}"`,
    `"${order.clientPhone.replace(/"/g, '""')}"`,
    `"${(order.clientCompany || '').replace(/"/g, '""')}"`,
    `"${order.appName.replace(/"/g, '""')}"`,
    `"${order.projectType.replace(/"/g, '""')}"`,
    `"${order.credential.email.replace(/"/g, '""')}"`,
    `"${order.credential.password.replace(/"/g, '""')}"`,
    `"${order.status}"`,
    `"${order.paymentStatus}"`,
    order.totalPrice,
    order.paidAmount,
    order.totalPrice - order.paidAmount,
    `"${order.orderDate}"`,
    `"${order.deadlineDate}"`,
    `"${(order.demoUrl || '').replace(/"/g, '""')}"`,
    `"${order.description.replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `DevOrder_Daftar_Pesanan_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
