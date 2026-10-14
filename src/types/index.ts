export type OrderStatus = 'baru' | 'pengerjaan' | 'revisi' | 'selesai' | 'dibatalkan';

export type PaymentStatus = 'belum_bayar' | 'dp' | 'lunas';

export type ProjectType = 
  | 'Web Application (SaaS)'
  | 'Website Company Profile'
  | 'Toko Online / E-Commerce'
  | 'Aplikasi Mobile (Android/iOS)'
  | 'Sistem Kasir / POS'
  | 'Landing Page'
  | 'Sistem Informasi Manajemen'
  | 'Custom API / Backend';

export interface ClientCredential {
  email: string;
  password: string;
  loginUrl?: string;
  hostingProvider?: string; // e.g. cPanel, Vercel, Firebase
  databaseInfo?: string;
  notes?: string;
}

export interface Order {
  id: string;
  ownerId?: string;
  clientName: string;
  clientPhone: string;
  clientCompany?: string;
  appName: string;
  projectType: ProjectType;
  description: string;
  featureList: string[];
  credential: ClientCredential;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  paidAmount: number;
  orderDate: string; // YYYY-MM-DD
  deadlineDate: string; // YYYY-MM-DD
  demoUrl?: string;
  repoUrl?: string;
  aiStudioNotes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isLoading?: boolean;
}
