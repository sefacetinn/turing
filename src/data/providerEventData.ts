import { gradients } from '../theme/colors';
import { providerEvents, ProviderEvent } from './providerEventsData';

// Types
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  image: string;
  status: 'available' | 'busy' | 'off';
  assignedTasks: string[];
  checkInStatus?: {
    checkedIn: boolean;
    time?: string;
    location?: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigneeId?: string;
  assigneeName?: string;
  assigneeImage?: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  stage: string;
  duration: string;
}

export interface PaymentItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
}

export interface EventDocument {
  id: string;
  name: string;
  type: 'contract' | 'rider' | 'plan' | 'invoice' | 'other';
  fileType: 'pdf' | 'image' | 'excel' | 'word';
  size: number;
  uploadedBy: 'organizer' | 'provider';
  uploadedAt: string;
  url: string;
  version: number;
}

export interface EventDetail {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  location: string;
  image: string;
  organizerId: string;
  organizerName: string;
  organizerImage: string;
  organizerPhone: string;
  role: string;
  category: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  earnings: number;
  paidAmount: number;
  pendingAmount: number;
  description: string;
  teamSize: number;
  taskCount: number;
  completedTaskCount: number;
}

// Convert ProviderEvent to EventDetail
const convertToEventDetail = (event: ProviderEvent): EventDetail => {
  return {
    id: event.id,
    eventTitle: event.eventTitle,
    eventDate: event.eventDate,
    eventTime: event.eventTime,
    venue: event.venue,
    location: event.location,
    image: event.eventImage,
    organizerId: `org_${event.id}`,
    organizerName: event.organizerName,
    organizerImage: event.organizerImage,
    organizerPhone: '+90 532 ' + Math.floor(100 + Math.random() * 900) + ' ' + Math.floor(1000 + Math.random() * 9000),
    role: event.serviceLabel,
    category: event.serviceType,
    status: event.status === 'past' ? 'completed' : event.status,
    earnings: event.earnings,
    paidAmount: event.paidAmount,
    pendingAmount: event.earnings - event.paidAmount,
    description: `${event.eventTitle} etkinliği için ${event.serviceLabel} hizmeti sağlıyoruz. ${event.venue} mekanında ${event.eventDate} tarihlerinde gerçekleşecek.`,
    teamSize: event.teamSize,
    taskCount: event.tasks.total,
    completedTaskCount: event.tasks.completed,
  };
};

// Get event by ID (uses providerEvents from providerEventsData)
export const getProviderEventById = (eventId: string): EventDetail | undefined => {
  const event = providerEvents.find(e => e.id === eventId);
  if (event) {
    return convertToEventDetail(event);
  }
  return undefined;
};

// Legacy support - default event
export const mockEventDetail: EventDetail = getProviderEventById('pe1') || {
  id: 'pe1',
  eventTitle: 'Etkinlik',
  eventDate: '',
  eventTime: '',
  venue: '',
  location: '',
  image: '',
  organizerId: '',
  organizerName: '',
  organizerImage: '',
  organizerPhone: '',
  role: '',
  category: '',
  status: 'planned',
  earnings: 0,
  paidAmount: 0,
  pendingAmount: 0,
  description: '',
  teamSize: 0,
  taskCount: 0,
  completedTaskCount: 0,
};

// Mock team data (per event - generate based on teamSize)
const teamMembersPool: TeamMember[] = [
  { id: 't1', name: 'Ahmet Yılmaz', role: 'Teknik Müdür', phone: '+90 532 111 2233', email: 'ahmet@company.com', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', status: 'available', assignedTasks: [], checkInStatus: { checkedIn: false } },
  { id: 't2', name: 'Mehmet Kaya', role: 'Sahne Sorumlusu', phone: '+90 533 222 3344', email: 'mehmet@company.com', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', status: 'available', assignedTasks: [], checkInStatus: { checkedIn: false } },
  { id: 't3', name: 'Ayşe Demir', role: 'Koordinatör', phone: '+90 534 333 4455', email: 'ayse@company.com', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', status: 'busy', assignedTasks: [], checkInStatus: { checkedIn: false } },
  { id: 't4', name: 'Ali Özkan', role: 'Ses Mühendisi', phone: '+90 535 444 5566', email: 'ali@company.com', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200', status: 'available', assignedTasks: [], checkInStatus: { checkedIn: false } },
  { id: 't5', name: 'Fatma Şahin', role: 'Işık Tasarımcı', phone: '+90 536 555 6677', email: 'fatma@company.com', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200', status: 'available', assignedTasks: [], checkInStatus: { checkedIn: false } },
  { id: 't6', name: 'Emre Çelik', role: 'Teknisyen', phone: '+90 537 666 7788', email: 'emre@company.com', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', status: 'available', assignedTasks: [], checkInStatus: { checkedIn: false } },
  { id: 't7', name: 'Zeynep Aydın', role: 'Lojistik', phone: '+90 538 777 8899', email: 'zeynep@company.com', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200', status: 'busy', assignedTasks: [], checkInStatus: { checkedIn: false } },
  { id: 't8', name: 'Burak Yıldız', role: 'Güvenlik Şefi', phone: '+90 539 888 9900', email: 'burak@company.com', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200', status: 'available', assignedTasks: [], checkInStatus: { checkedIn: false } },
];

// Get team by event ID
export const getTeamByEventId = (eventId: string): TeamMember[] => {
  const event = providerEvents.find(e => e.id === eventId);
  if (!event) return [];
  const teamSize = Math.min(event.teamSize, teamMembersPool.length);
  return teamMembersPool.slice(0, teamSize);
};

// Legacy support
export const mockTeam: TeamMember[] = getTeamByEventId('pe1');

// Generate tasks for an event
const generateTasksForEvent = (event: ProviderEvent): Task[] => {
  const baseTasks: Omit<Task, 'id' | 'status'>[] = [
    { title: 'Ekipman Listesi Hazırla', description: 'Gerekli tüm ekipmanları listele', dueDate: event.eventDate, priority: 'high', createdAt: '1 Temmuz 2025' },
    { title: 'Ekip Toplantısı', description: 'Tüm ekip ile koordinasyon toplantısı', dueDate: event.eventDate, priority: 'medium', createdAt: '1 Temmuz 2025' },
    { title: 'Mekan Keşfi', description: 'Mekanı ziyaret et ve teknik değerlendirme yap', dueDate: event.eventDate, priority: 'high', createdAt: '1 Temmuz 2025' },
    { title: 'Araç Organizasyonu', description: 'Ekipman taşıma araçlarını ayarla', dueDate: event.eventDate, priority: 'medium', createdAt: '1 Temmuz 2025' },
    { title: 'Kurulum Planı', description: 'Detaylı kurulum planı hazırla', dueDate: event.eventDate, priority: 'high', createdAt: '1 Temmuz 2025' },
    { title: 'Test ve Kontrol', description: 'Tüm sistemlerin testini yap', dueDate: event.eventDate, priority: 'high', createdAt: '1 Temmuz 2025' },
    { title: 'Yedek Ekipman', description: 'Yedek ekipmanları hazırla', dueDate: event.eventDate, priority: 'low', createdAt: '1 Temmuz 2025' },
    { title: 'İletişim Kontrolü', description: 'Telsiz ve iletişim sistemlerini test et', dueDate: event.eventDate, priority: 'medium', createdAt: '1 Temmuz 2025' },
  ];

  const totalTasks = event.tasks.total;
  const completedTasks = event.tasks.completed;

  return baseTasks.slice(0, totalTasks).map((task, index) => ({
    ...task,
    id: `task_${event.id}_${index + 1}`,
    status: index < completedTasks ? 'completed' as const :
            index === completedTasks ? 'in_progress' as const : 'pending' as const,
    completedAt: index < completedTasks ? '10 Temmuz 2025' : undefined,
  }));
};

// Get tasks by event ID
export const getTasksByEventId = (eventId: string): Task[] => {
  const event = providerEvents.find(e => e.id === eventId);
  if (!event) return [];
  return generateTasksForEvent(event);
};

// Legacy support
export const mockTasks: Task[] = getTasksByEventId('pe1');

// Mock schedule data
export const mockSchedule: ScheduleItem[] = [
  { id: 's1', time: '08:00', title: 'Ekip Toplanma', stage: 'Backstage', duration: '1 saat' },
  { id: 's2', time: '09:00', title: 'Kurulum Başlangıcı', stage: 'Ana Sahne', duration: '4 saat' },
  { id: 's3', time: '13:00', title: 'Öğle Molası', stage: 'Catering', duration: '1 saat' },
  { id: 's4', time: '14:00', title: 'Ses Kontrolü', stage: 'Ana Sahne', duration: '2 saat' },
  { id: 's5', time: '16:00', title: 'Final Kontrol', stage: 'Tüm Alanlar', duration: '1 saat' },
  { id: 's6', time: '17:00', title: 'Etkinlik Başlangıcı', stage: 'Ana Sahne', duration: '' },
];

// Generate payments for an event
const generatePaymentsForEvent = (event: ProviderEvent): PaymentItem[] => {
  const halfAmount = event.earnings / 2;
  const payments: PaymentItem[] = [];

  if (event.paidAmount > 0) {
    payments.push({
      id: `pay_${event.id}_1`,
      title: 'Ön Ödeme (%50)',
      amount: halfAmount,
      dueDate: '1 Temmuz 2025',
      status: 'paid',
      paidDate: '28 Haziran 2025',
    });
  }

  if (event.paidAmount < event.earnings) {
    const remainingAmount = event.earnings - event.paidAmount;
    payments.push({
      id: `pay_${event.id}_2`,
      title: event.paidAmount > 0 ? 'Kalan Ödeme' : 'Toplam Ödeme',
      amount: remainingAmount,
      dueDate: event.eventDate,
      status: 'pending',
    });
  }

  return payments;
};

// Get payments by event ID
export const getPaymentsByEventId = (eventId: string): PaymentItem[] => {
  const event = providerEvents.find(e => e.id === eventId);
  if (!event) return [];
  return generatePaymentsForEvent(event);
};

// Legacy support
export const mockPayments: PaymentItem[] = getPaymentsByEventId('pe1');

// Mock documents data (per event)
const baseDocuments: Omit<EventDocument, 'id'>[] = [
  { name: 'Sözleşme.pdf', type: 'contract', fileType: 'pdf', size: 2400000, uploadedBy: 'organizer', uploadedAt: '28 Haziran 2025', url: '#', version: 1 },
  { name: 'Sahne_Plani.pdf', type: 'plan', fileType: 'pdf', size: 5100000, uploadedBy: 'organizer', uploadedAt: '5 Temmuz 2025', url: '#', version: 2 },
  { name: 'Teknik_Rider.pdf', type: 'rider', fileType: 'pdf', size: 890000, uploadedBy: 'provider', uploadedAt: '8 Temmuz 2025', url: '#', version: 1 },
  { name: 'Ekipman_Listesi.xlsx', type: 'other', fileType: 'excel', size: 156000, uploadedBy: 'provider', uploadedAt: '10 Temmuz 2025', url: '#', version: 1 },
];

// Get documents by event ID
export const getDocumentsByEventId = (eventId: string): EventDocument[] => {
  const event = providerEvents.find(e => e.id === eventId);
  if (!event) return [];
  return baseDocuments.map((doc, index) => ({
    ...doc,
    id: `doc_${eventId}_${index + 1}`,
  }));
};

// Helper functions
export const getStatusColor = (status: string, colors: any) => {
  switch (status) {
    case 'completed': return colors.success;
    case 'in_progress': return colors.warning;
    case 'pending': return colors.textMuted;
    default: return colors.textMuted;
  }
};

export const getPriorityColor = (priority: string, colors: any) => {
  switch (priority) {
    case 'high': return colors.error;
    case 'medium': return colors.warning;
    case 'low': return colors.success;
    default: return colors.textMuted;
  }
};

export const getPaymentStatusInfo = (status: string, colors: any) => {
  switch (status) {
    case 'paid': return { label: 'Ödendi', color: colors.success, icon: 'checkmark-circle' as const };
    case 'pending': return { label: 'Bekliyor', color: colors.warning, icon: 'time' as const };
    case 'overdue': return { label: 'Gecikmiş', color: colors.error, icon: 'alert-circle' as const };
    default: return { label: status, color: colors.textMuted, icon: 'help-circle' as const };
  }
};

export const getDocumentIcon = (fileType: string) => {
  switch (fileType) {
    case 'pdf': return 'document-text';
    case 'image': return 'image';
    case 'excel': return 'grid';
    case 'word': return 'document';
    default: return 'document';
  }
};

export const getDocumentTypeLabel = (type: string) => {
  switch (type) {
    case 'contract': return 'Sözleşme';
    case 'rider': return 'Teknik Rider';
    case 'plan': return 'Plan';
    case 'invoice': return 'Fatura';
    default: return 'Döküman';
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
