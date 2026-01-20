// Provider Finance Data - Kapsamlı Finansal Veriler

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'pending' | 'refund';
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'processing' | 'cancelled';
  eventId?: string;
  eventName?: string;
  organizerName?: string;
  invoiceId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  eventName: string;
  organizerName: string;
  organizerLogo: string;
  eventDate: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  tax: number;
  totalAmount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  paymentDate?: string;
  notes?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface MonthlyEarning {
  month: string;
  year: number;
  income: number;
  expenses: number;
  net: number;
  jobCount: number;
}

export interface PaymentMethod {
  id: string;
  type: 'bank' | 'card';
  name: string;
  lastFour?: string;
  bankName?: string;
  iban?: string;
  isDefault: boolean;
}

export interface FinancialSummary {
  totalEarnings: number;
  totalExpenses: number;
  netProfit: number;
  pendingPayments: number;
  averageJobValue: number;
  completedJobs: number;
  taxPaid: number;
  lastUpdated: string;
}

// Aylık kazanç verileri (son 12 ay)
export const monthlyEarnings: MonthlyEarning[] = [
  { month: 'Şubat', year: 2025, income: 1850000, expenses: 280000, net: 1570000, jobCount: 18 },
  { month: 'Mart', year: 2025, income: 2120000, expenses: 310000, net: 1810000, jobCount: 21 },
  { month: 'Nisan', year: 2025, income: 2450000, expenses: 350000, net: 2100000, jobCount: 24 },
  { month: 'Mayıs', year: 2025, income: 2680000, expenses: 380000, net: 2300000, jobCount: 26 },
  { month: 'Haziran', year: 2025, income: 3150000, expenses: 420000, net: 2730000, jobCount: 31 },
  { month: 'Temmuz', year: 2025, income: 3580000, expenses: 480000, net: 3100000, jobCount: 35 },
  { month: 'Ağustos', year: 2025, income: 3420000, expenses: 450000, net: 2970000, jobCount: 33 },
  { month: 'Eylül', year: 2025, income: 2980000, expenses: 390000, net: 2590000, jobCount: 29 },
  { month: 'Ekim', year: 2025, income: 2650000, expenses: 360000, net: 2290000, jobCount: 26 },
  { month: 'Kasım', year: 2025, income: 2380000, expenses: 330000, net: 2050000, jobCount: 23 },
  { month: 'Aralık', year: 2025, income: 2920000, expenses: 400000, net: 2520000, jobCount: 28 },
  { month: 'Ocak', year: 2026, income: 2850000, expenses: 385000, net: 2465000, jobCount: 27 },
];

// Son işlemler
export const recentTransactions: Transaction[] = [
  {
    id: 't1',
    type: 'income',
    category: 'Teknik Prodüksiyon',
    description: 'Sıla Konseri - Ses & Işık Sistemi',
    amount: 485000,
    date: '12 Ocak 2026',
    status: 'completed',
    eventId: 'pe1',
    eventName: 'Sıla & Tarkan - İstanbul',
    organizerName: 'Pozitif Live',
  },
  {
    id: 't2',
    type: 'pending',
    category: 'Sahne Prodüksiyon',
    description: 'Tarkan Konseri - Vodafone Park',
    amount: 650000,
    date: '28 Ağustos 2026',
    status: 'pending',
    eventId: 'pe2',
    eventName: 'Tarkan - İstanbul',
    organizerName: 'BKM',
  },
  {
    id: 't3',
    type: 'income',
    category: 'Işık Tasarımı',
    description: 'Fashion Week Istanbul',
    amount: 380000,
    date: '8 Ocak 2026',
    status: 'completed',
    eventId: 'pe3',
    eventName: 'Fashion Week - İstanbul',
    organizerName: 'IMG Turkey',
  },
  {
    id: 't4',
    type: 'expense',
    category: 'Ekipman Bakım',
    description: 'Ses sistemi yıllık bakım',
    amount: 45000,
    date: '5 Ocak 2026',
    status: 'completed',
  },
  {
    id: 't5',
    type: 'income',
    category: 'Ses Sistemi',
    description: 'Rock Festivali - Balıkesir',
    amount: 320000,
    date: '3 Ocak 2026',
    status: 'completed',
    eventId: 'pe4',
    eventName: 'Rock Festivali - Balıkesir',
    organizerName: 'Zeytinli Organizasyon',
  },
  {
    id: 't6',
    type: 'pending',
    category: 'Teknik Prodüksiyon',
    description: 'Garanti BBVA Gala Gecesi',
    amount: 275000,
    date: '5 Eylül 2026',
    status: 'pending',
    eventId: 'pe5',
    eventName: 'Garanti BBVA - İstanbul',
    organizerName: 'Garanti BBVA',
  },
  {
    id: 't7',
    type: 'expense',
    category: 'Personel',
    description: 'Ocak ayı personel maaşları',
    amount: 185000,
    date: '1 Ocak 2026',
    status: 'completed',
  },
  {
    id: 't8',
    type: 'income',
    category: 'Booking',
    description: 'Mabel Matiz Konseri',
    amount: 620000,
    date: '28 Aralık 2025',
    status: 'completed',
    eventName: 'Mabel Matiz - İstanbul',
    organizerName: 'Zorlu PSM',
  },
  {
    id: 't9',
    type: 'expense',
    category: 'Sigorta',
    description: 'Ekipman sigortası yenileme',
    amount: 68000,
    date: '25 Aralık 2025',
    status: 'completed',
  },
  {
    id: 't10',
    type: 'refund',
    category: 'İptal',
    description: 'Yılbaşı konseri iptali (iade)',
    amount: 125000,
    date: '20 Aralık 2025',
    status: 'completed',
    eventName: 'Yılbaşı Konseri - Ankara',
    organizerName: 'Ankara Büyükşehir',
  },
];

// Faturalar
export const invoices: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'EP360-2026-001',
    eventName: 'Sıla & Tarkan - İstanbul',
    organizerName: 'Pozitif Live',
    organizerLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
    eventDate: '15-17 Temmuz 2026',
    issueDate: '10 Ocak 2026',
    dueDate: '10 Şubat 2026',
    amount: 410000,
    tax: 75000,
    totalAmount: 485000,
    status: 'paid',
    paymentDate: '12 Ocak 2026',
    items: [
      { description: 'Ana Sahne Ses Sistemi (3 gün)', quantity: 3, unitPrice: 85000, total: 255000 },
      { description: 'Sahne Işık Sistemi (3 gün)', quantity: 3, unitPrice: 45000, total: 135000 },
      { description: 'Teknik Ekip (8 kişi x 3 gün)', quantity: 24, unitPrice: 3500, total: 84000 },
      { description: 'Kurulum & Söküm', quantity: 1, unitPrice: 36000, total: 36000 },
    ],
    notes: 'Ödeme onaylandı. Teşekkür ederiz.',
  },
  {
    id: 'inv2',
    invoiceNumber: 'EP360-2026-002',
    eventName: 'Tarkan - İstanbul',
    organizerName: 'BKM',
    organizerLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
    eventDate: '28 Ağustos 2026',
    issueDate: '15 Ocak 2026',
    dueDate: '15 Şubat 2026',
    amount: 551000,
    tax: 99000,
    totalAmount: 650000,
    status: 'pending',
    items: [
      { description: 'Stadium Ses Sistemi', quantity: 1, unitPrice: 285000, total: 285000 },
      { description: 'Mega LED Ekran Sistemi', quantity: 1, unitPrice: 165000, total: 165000 },
      { description: 'Işık & Lazer Show', quantity: 1, unitPrice: 95000, total: 95000 },
      { description: 'Teknik Ekip (20 kişi)', quantity: 20, unitPrice: 4500, total: 90000 },
      { description: 'Kurulum & Test (3 gün)', quantity: 1, unitPrice: 65000, total: 65000 },
    ],
    notes: 'Ön ödeme %30 - 195.000₺ alındı.',
  },
  {
    id: 'inv3',
    invoiceNumber: 'EP360-2026-003',
    eventName: 'Fashion Week - İstanbul',
    organizerName: 'IMG Turkey',
    organizerLogo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
    eventDate: '12-16 Ekim 2026',
    issueDate: '5 Ocak 2026',
    dueDate: '5 Şubat 2026',
    amount: 322000,
    tax: 58000,
    totalAmount: 380000,
    status: 'paid',
    paymentDate: '8 Ocak 2026',
    items: [
      { description: 'Podyum Işık Tasarımı', quantity: 1, unitPrice: 145000, total: 145000 },
      { description: 'Backstage Aydınlatma', quantity: 1, unitPrice: 55000, total: 55000 },
      { description: 'Işık Kurulum (5 gün)', quantity: 5, unitPrice: 18000, total: 90000 },
      { description: 'Teknik Personel', quantity: 8, unitPrice: 4000, total: 32000 },
    ],
  },
  {
    id: 'inv4',
    invoiceNumber: 'EP360-2026-004',
    eventName: 'Rock Festivali - Balıkesir',
    organizerName: 'Zeytinli Organizasyon',
    organizerLogo: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=100',
    eventDate: '24-26 Temmuz 2026',
    issueDate: '28 Aralık 2025',
    dueDate: '28 Ocak 2026',
    amount: 271000,
    tax: 49000,
    totalAmount: 320000,
    status: 'paid',
    paymentDate: '3 Ocak 2026',
    items: [
      { description: 'Festival Ses Sistemi (3 gün)', quantity: 3, unitPrice: 65000, total: 195000 },
      { description: 'Sahne Monitörleri', quantity: 1, unitPrice: 42000, total: 42000 },
      { description: 'Ses Mühendisi (3 gün)', quantity: 3, unitPrice: 8000, total: 24000 },
      { description: 'Transport & Lojistik', quantity: 1, unitPrice: 10000, total: 10000 },
    ],
  },
  {
    id: 'inv5',
    invoiceNumber: 'EP360-2026-005',
    eventName: 'Garanti BBVA - İstanbul',
    organizerName: 'Garanti BBVA',
    organizerLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
    eventDate: '5 Eylül 2026',
    issueDate: '20 Ocak 2026',
    dueDate: '20 Şubat 2026',
    amount: 233000,
    tax: 42000,
    totalAmount: 275000,
    status: 'pending',
    items: [
      { description: 'Gala Ses Sistemi', quantity: 1, unitPrice: 85000, total: 85000 },
      { description: 'Atmosfer Aydınlatma', quantity: 1, unitPrice: 65000, total: 65000 },
      { description: 'LED Backdrop', quantity: 1, unitPrice: 55000, total: 55000 },
      { description: 'Teknik Ekip', quantity: 6, unitPrice: 4500, total: 27000 },
    ],
    notes: 'Kurumsal fatura - 30 gün vade',
  },
  {
    id: 'inv6',
    invoiceNumber: 'EP360-2025-089',
    eventName: 'Mabel Matiz - İstanbul',
    organizerName: 'Zorlu PSM',
    organizerLogo: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100',
    eventDate: '28 Aralık 2025',
    issueDate: '20 Aralık 2025',
    dueDate: '20 Ocak 2026',
    amount: 525000,
    tax: 95000,
    totalAmount: 620000,
    status: 'paid',
    paymentDate: '28 Aralık 2025',
    items: [
      { description: 'Konser Ses Prodüksiyon', quantity: 1, unitPrice: 185000, total: 185000 },
      { description: 'Sahne Işık Tasarımı', quantity: 1, unitPrice: 145000, total: 145000 },
      { description: 'Video Mapping', quantity: 1, unitPrice: 95000, total: 95000 },
      { description: 'Teknik Prodüksiyon Ekibi', quantity: 12, unitPrice: 5000, total: 60000 },
      { description: 'Prova & Hazırlık (2 gün)', quantity: 2, unitPrice: 20000, total: 40000 },
    ],
  },
];

// Vadesi geçen faturalar
export const overdueInvoices: Invoice[] = [
  {
    id: 'inv-overdue1',
    invoiceNumber: 'EP360-2025-082',
    eventName: 'Kurumsal Yılsonu - Ankara',
    organizerName: 'THY',
    organizerLogo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100',
    eventDate: '15 Aralık 2025',
    issueDate: '10 Aralık 2025',
    dueDate: '10 Ocak 2026',
    amount: 178000,
    tax: 32000,
    totalAmount: 210000,
    status: 'overdue',
    items: [
      { description: 'Gala Ses & Işık', quantity: 1, unitPrice: 125000, total: 125000 },
      { description: 'Teknik Ekip', quantity: 6, unitPrice: 4500, total: 27000 },
      { description: 'Ekipman Kiralama', quantity: 1, unitPrice: 26000, total: 26000 },
    ],
    notes: 'Ödeme hatırlatması gönderildi - 6 gün gecikme',
  },
];

// Ödeme yöntemleri
export const paymentMethods: PaymentMethod[] = [
  {
    id: 'pm1',
    type: 'bank',
    name: 'İş Bankası Kurumsal',
    bankName: 'Türkiye İş Bankası',
    iban: 'TR12 0006 4000 0011 2345 6789 00',
    isDefault: true,
  },
  {
    id: 'pm2',
    type: 'bank',
    name: 'Garanti Ticari',
    bankName: 'Garanti BBVA',
    iban: 'TR98 0006 2000 0012 3456 7890 00',
    isDefault: false,
  },
  {
    id: 'pm3',
    type: 'card',
    name: 'Kurumsal Kart',
    lastFour: '4589',
    bankName: 'Yapı Kredi',
    isDefault: false,
  },
];

// Finansal özet
export const financialSummary: FinancialSummary = {
  totalEarnings: 32030000, // Son 12 ay toplam
  totalExpenses: 4535000,
  netProfit: 27495000,
  pendingPayments: 1135000, // inv2 + inv5 + overdue
  averageJobValue: 121780,
  completedJobs: 234,
  taxPaid: 4850000,
  lastUpdated: '16 Ocak 2026',
};

// Yıllık karşılaştırma
export const yearlyComparison = {
  currentYear: {
    year: 2026,
    totalIncome: 2850000,
    totalExpenses: 385000,
    netProfit: 2465000,
    jobCount: 27,
    avgJobValue: 105556,
  },
  previousYear: {
    year: 2025,
    totalIncome: 30180000,
    totalExpenses: 4150000,
    netProfit: 26030000,
    jobCount: 294,
    avgJobValue: 102653,
  },
  growth: {
    incomeGrowth: 23, // %23 artış (bu ay geçen yılın aynı ayına göre)
    jobGrowth: 18,
    avgValueGrowth: 12,
  },
};

// Hizmet bazlı gelir dağılımı
export const incomeByService = [
  { service: 'Ses Sistemi', amount: 8450000, percentage: 26, color: '#4b30b8' },
  { service: 'Işık & LED', amount: 7200000, percentage: 22, color: '#7c3aed' },
  { service: 'Sahne Prodüksiyon', amount: 6100000, percentage: 19, color: '#a855f7' },
  { service: 'Booking', amount: 5800000, percentage: 18, color: '#c084fc' },
  { service: 'Video & Mapping', amount: 2900000, percentage: 9, color: '#d8b4fe' },
  { service: 'Diğer', amount: 1580000, percentage: 6, color: '#e9d5ff' },
];

// Müşteri bazlı gelir (Top 5)
export const topClients = [
  {
    id: 'c1',
    name: 'Pozitif Live',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
    totalRevenue: 4850000,
    jobCount: 12,
    lastJob: '12 Ocak 2026',
  },
  {
    id: 'c2',
    name: 'BKM',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100',
    totalRevenue: 3920000,
    jobCount: 8,
    lastJob: '28 Ağustos 2026',
  },
  {
    id: 'c3',
    name: 'Zorlu PSM',
    logo: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100',
    totalRevenue: 3150000,
    jobCount: 15,
    lastJob: '28 Aralık 2025',
  },
  {
    id: 'c4',
    name: 'IMG Turkey',
    logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100',
    totalRevenue: 2480000,
    jobCount: 6,
    lastJob: '8 Ocak 2026',
  },
  {
    id: 'c5',
    name: 'Garanti BBVA',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100',
    totalRevenue: 1850000,
    jobCount: 4,
    lastJob: '5 Eylül 2026',
  },
];

// Bekleyen ödemeler detayı
export const pendingPaymentsDetail = [
  {
    id: 'pp1',
    invoiceId: 'inv2',
    eventName: 'Tarkan - İstanbul',
    organizerName: 'BKM',
    amount: 455000, // 650000 - 195000 ön ödeme
    dueDate: '15 Şubat 2026',
    daysUntilDue: 30,
    status: 'on_track',
  },
  {
    id: 'pp2',
    invoiceId: 'inv5',
    eventName: 'Garanti BBVA - İstanbul',
    organizerName: 'Garanti BBVA',
    amount: 275000,
    dueDate: '20 Şubat 2026',
    daysUntilDue: 35,
    status: 'on_track',
  },
  {
    id: 'pp3',
    invoiceId: 'inv-overdue1',
    eventName: 'Kurumsal Yılsonu - Ankara',
    organizerName: 'THY',
    amount: 210000,
    dueDate: '10 Ocak 2026',
    daysUntilDue: -6,
    status: 'overdue',
  },
];

// Gider kategorileri
export const expenseCategories = [
  { category: 'Personel', amount: 2220000, percentage: 49, color: '#ef4444' },
  { category: 'Ekipman Bakım', amount: 680000, percentage: 15, color: '#f97316' },
  { category: 'Sigorta', amount: 545000, percentage: 12, color: '#eab308' },
  { category: 'Transport', amount: 450000, percentage: 10, color: '#22c55e' },
  { category: 'Ofis & Depo', amount: 365000, percentage: 8, color: '#3b82f6' },
  { category: 'Diğer', amount: 275000, percentage: 6, color: '#8b5cf6' },
];
