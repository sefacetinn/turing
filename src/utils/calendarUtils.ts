/**
 * Calendar Utilities
 * Turkce tarih parsing ve event donusum fonksiyonlari
 */

import type { ProviderEvent } from '../data/providerEventsData';

// Turkce ay isimleri
const TURKISH_MONTHS: Record<string, number> = {
  'Ocak': 0,
  'Şubat': 1,
  'Mart': 2,
  'Nisan': 3,
  'Mayıs': 4,
  'Haziran': 5,
  'Temmuz': 6,
  'Ağustos': 7,
  'Eylül': 8,
  'Ekim': 9,
  'Kasım': 10,
  'Aralık': 11,
};

// Gun isimleri
export const DAY_NAMES_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
export const DAY_NAMES_FULL = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// Calendar Event tipi
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  time: string;
  category: string;
  status: string;
  venue: string;
  location: string;
  earnings?: number;
  isMultiDay?: boolean;
}

/**
 * Turkce tarih string'ini Date objesine cevirir
 * Desteklenen formatlar:
 * - "28 Ağustos 2026" -> tek gun
 * - "10-12 Temmuz 2026" -> coklu gun (start ve end date doner)
 * - "12-16 Ekim 2026" -> coklu gun
 */
export function parseTurkishDate(dateStr: string): { start: Date; end?: Date } {
  // "10-12 Temmuz 2026" formatini isle
  const rangeMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})\s+(\w+)\s+(\d{4})$/);
  if (rangeMatch) {
    const [, startDay, endDay, month, year] = rangeMatch;
    const monthIndex = TURKISH_MONTHS[month];
    if (monthIndex !== undefined) {
      return {
        start: new Date(parseInt(year), monthIndex, parseInt(startDay)),
        end: new Date(parseInt(year), monthIndex, parseInt(endDay)),
      };
    }
  }

  // "28 Ağustos 2026" formatini isle
  const singleMatch = dateStr.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/);
  if (singleMatch) {
    const [, day, month, year] = singleMatch;
    const monthIndex = TURKISH_MONTHS[month];
    if (monthIndex !== undefined) {
      return {
        start: new Date(parseInt(year), monthIndex, parseInt(day)),
      };
    }
  }

  // Parse edemediyse bugunun tarihini don
  console.warn(`Could not parse date: ${dateStr}`);
  return { start: new Date() };
}

/**
 * Turkce tarih string'inden bugune kalan gun sayisini hesaplar
 * Gecmis tarihler icin negatif deger doner
 * Coklu gun etkinlikler icin baslangic tarihini kullanir
 */
export function calculateDaysUntil(dateStr: string): number {
  const { start } = parseTurkishDate(dateStr);
  const today = new Date();

  // Sadece gun farki icin saat/dakika/saniye sifirla
  const eventDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diffTime = eventDate.getTime() - todayDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Iki tarihin ayni gun olup olmadigini kontrol eder
 */
export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

/**
 * Tarihin belirli bir aralikta olup olmadigini kontrol eder
 */
export function isDateInRange(date: Date, start: Date, end?: Date): boolean {
  if (!end) {
    return isSameDay(date, start);
  }

  const dateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();

  return dateTime >= startTime && dateTime <= endTime;
}

/**
 * ProviderEvent array'ini CalendarEvent array'ine donusturur
 */
export function transformProviderEvents(events: ProviderEvent[]): CalendarEvent[] {
  return events.map((event) => {
    const { start, end } = parseTurkishDate(event.eventDate);

    return {
      id: event.id,
      title: event.eventTitle,
      date: start,
      endDate: end,
      time: event.eventTime || '',
      category: event.serviceType,
      status: event.status,
      venue: event.venue,
      location: event.location,
      earnings: event.earnings,
      isMultiDay: !!end,
    };
  });
}

/**
 * Organizer events (mockData.ts) icin donusum
 */
export function transformOrganizerEvents(events: any[]): CalendarEvent[] {
  return events.map((event) => {
    const { start, end } = parseTurkishDate(event.date || '');

    return {
      id: event.id,
      title: event.title,
      date: start,
      endDate: end,
      time: event.time || '',
      category: event.category || 'booking',
      status: event.status || 'planning',
      venue: event.venue || '',
      location: event.location || '',
      isMultiDay: !!end,
    };
  });
}

/**
 * Bir ayin tum gunlerini dondurur (grid icin onceki/sonraki ay gunleri dahil)
 */
export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Pazartesi'den basla (0 = Pzt, 6 = Paz)
  const startDay = firstDay.getDay() || 7;
  for (let i = startDay - 1; i > 0; i--) {
    days.push(new Date(year, month, 1 - i));
  }

  // Ayin gunleri
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // Sonraki ayin gunleri (6 hafta = 42 gun)
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

/**
 * Bir haftanin gunlerini dondurur
 */
export function getWeekDays(date: Date): Date[] {
  const days: Date[] = [];
  const day = date.getDay() || 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - day + 1);

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }

  return days;
}

/**
 * Sonraki N gunu dondurur
 */
export function getNextDays(count: number, startDate: Date = new Date()): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(d);
  }
  return days;
}

/**
 * Belirli bir gun icin etkinlikleri filtreler
 */
export function getEventsForDate(date: Date, events: CalendarEvent[]): CalendarEvent[] {
  return events.filter((event) => isDateInRange(date, event.date, event.endDate));
}

/**
 * Kategori rengini dondurur
 */
export function getCategoryColor(category: string): string {
  const categoryColors: Record<string, string> = {
    booking: '#4b30b8',
    technical: '#059669',
    venue: '#2563eb',
    accommodation: '#db2777',
    transport: '#dc2626',
    flight: '#475569',
    security: '#7c3aed',
    catering: '#d97706',
    operation: '#ea580c',
    generator: '#0891b2',
    beverage: '#4f46e5',
    medical: '#e11d48',
    sanitation: '#0d9488',
    media: '#6366f1',
    barrier: '#78716c',
    tent: '#84cc16',
    ticketing: '#f59e0b',
    decoration: '#ec4899',
  };
  return categoryColors[category] || '#4b30b8';
}

/**
 * Kategori labelini dondurur
 */
export function getCategoryLabel(category: string): string {
  const categoryLabels: Record<string, string> = {
    booking: 'Booking',
    technical: 'Teknik',
    venue: 'Mekan',
    accommodation: 'Konaklama',
    transport: 'Ulaşım',
    flight: 'Uçuş',
    security: 'Güvenlik',
    catering: 'Catering',
    operation: 'Operasyon',
  };
  return categoryLabels[category] || category;
}
