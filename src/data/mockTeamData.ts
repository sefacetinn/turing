// Mock Team Data for RBAC System

import { organizerRoles, technicalProviderRoles } from '../config/roles';
import type { TeamMember, Invitation, Organization } from '../types/rbac';

// Organizatör Ekip Üyeleri
export const mockOrganizerTeamMembers: TeamMember[] = [
  {
    id: 'tm1',
    odilerId: 'u1',
    email: 'ahmet@etkinlikyonetimi.com',
    name: 'Ahmet Yılmaz',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    phone: '+90 532 111 2233',
    role: organizerRoles[0], // Hesap Yöneticisi
    status: 'active',
    invitedBy: 'self',
    invitedAt: '2024-01-01T10:00:00Z',
    joinedAt: '2024-01-01T10:00:00Z',
    lastActiveAt: new Date().toISOString(),
  },
  {
    id: 'tm2',
    odilerId: 'u2',
    email: 'elif@etkinlikyonetimi.com',
    name: 'Elif Kaya',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    phone: '+90 533 222 3344',
    role: organizerRoles[1], // Etkinlik Koordinatörü
    status: 'active',
    invitedBy: 'u1',
    invitedAt: '2024-01-05T14:30:00Z',
    joinedAt: '2024-01-06T09:00:00Z',
    lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 saat önce
  },
  {
    id: 'tm3',
    odilerId: 'u3',
    email: 'mehmet@etkinlikyonetimi.com',
    name: 'Mehmet Demir',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    phone: '+90 534 333 4455',
    role: organizerRoles[2], // Finans Yöneticisi
    status: 'active',
    invitedBy: 'u1',
    invitedAt: '2024-01-10T11:00:00Z',
    joinedAt: '2024-01-11T08:30:00Z',
    lastActiveAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 gün önce
  },
  {
    id: 'tm4',
    odilerId: 'u4',
    email: 'ayse@etkinlikyonetimi.com',
    name: 'Ayşe Özkan',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    phone: '+90 535 444 5566',
    role: organizerRoles[3], // Etkinlik Uzmanı
    status: 'active',
    invitedBy: 'u2',
    invitedAt: '2024-02-01T16:00:00Z',
    joinedAt: '2024-02-02T10:00:00Z',
    lastActiveAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 dk önce
  },
];

// Organizatör Bekleyen Davetler
export const mockOrganizerInvitations: Invitation[] = [
  {
    id: 'inv1',
    email: 'zeynep@etkinlikyonetimi.com',
    name: 'Zeynep Çelik',
    role: organizerRoles[4], // Asistan
    invitedBy: 'u1',
    inviterName: 'Ahmet Yılmaz',
    invitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 gün önce
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 gün sonra
    status: 'pending',
    token: 'abc123xyz',
    message: 'Merhaba Zeynep, ekibimize katılmanı bekliyoruz!',
  },
  {
    id: 'inv2',
    email: 'can@etkinlikyonetimi.com',
    name: 'Can Yılmaz',
    role: organizerRoles[1], // Etkinlik Koordinatörü
    invitedBy: 'u1',
    inviterName: 'Ahmet Yılmaz',
    invitedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 gün önce
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 gün sonra
    status: 'pending',
    token: 'def456uvw',
  },
];

// Organizatör Organizasyonu
export const mockOrganizerOrganization: Organization = {
  id: 'org1',
  name: 'Etkinlik Yönetimi A.Ş.',
  type: 'organizer',
  logo: 'https://via.placeholder.com/100',
  ownerId: 'u1',
  members: mockOrganizerTeamMembers,
  pendingInvitations: mockOrganizerInvitations,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: new Date().toISOString(),
};

// Hizmet Sağlayıcı (Teknik) Ekip Üyeleri
export const mockProviderTeamMembers: TeamMember[] = [
  {
    id: 'ptm1',
    odilerId: 'p1',
    email: 'ali@prosound.com',
    name: 'Ali Vural',
    avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
    phone: '+90 536 666 7788',
    role: technicalProviderRoles[0], // Firma Sahibi
    status: 'active',
    invitedBy: 'self',
    invitedAt: '2023-06-01T10:00:00Z',
    joinedAt: '2023-06-01T10:00:00Z',
    lastActiveAt: new Date().toISOString(),
  },
  {
    id: 'ptm2',
    odilerId: 'p2',
    email: 'burak@prosound.com',
    name: 'Burak Şahin',
    avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
    phone: '+90 537 777 8899',
    role: technicalProviderRoles[1], // Proje Yöneticisi
    status: 'active',
    invitedBy: 'p1',
    invitedAt: '2023-07-15T14:00:00Z',
    joinedAt: '2023-07-16T09:00:00Z',
    lastActiveAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ptm3',
    odilerId: 'p3',
    email: 'deniz@prosound.com',
    name: 'Deniz Akar',
    avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
    phone: '+90 538 888 9900',
    role: technicalProviderRoles[2], // Teknik Direktör
    status: 'active',
    invitedBy: 'p1',
    invitedAt: '2023-08-01T11:00:00Z',
    joinedAt: '2023-08-02T10:00:00Z',
    lastActiveAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ptm4',
    odilerId: 'p4',
    email: 'emre@prosound.com',
    name: 'Emre Koç',
    avatar: 'https://randomuser.me/api/portraits/men/13.jpg',
    phone: '+90 539 999 0011',
    role: technicalProviderRoles[3], // Saha Sorumlusu
    status: 'active',
    invitedBy: 'p2',
    invitedAt: '2023-09-10T15:00:00Z',
    joinedAt: '2023-09-11T08:00:00Z',
    lastActiveAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

// Hizmet Sağlayıcı Bekleyen Davetler
export const mockProviderInvitations: Invitation[] = [
  {
    id: 'pinv1',
    email: 'fatih@prosound.com',
    name: 'Fatih Yıldız',
    role: technicalProviderRoles[3], // Saha Sorumlusu
    invitedBy: 'p1',
    inviterName: 'Ali Vural',
    invitedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    token: 'ghi789rst',
  },
];

// Hizmet Sağlayıcı Organizasyonu
export const mockProviderOrganization: Organization = {
  id: 'prov1',
  name: 'Pro Sound Teknik',
  type: 'provider',
  category: 'technical',
  logo: 'https://via.placeholder.com/100',
  ownerId: 'p1',
  members: mockProviderTeamMembers,
  pendingInvitations: mockProviderInvitations,
  createdAt: '2023-06-01T10:00:00Z',
  updatedAt: new Date().toISOString(),
};

// Aktif kullanıcı simülasyonu (organizatör)
export const mockCurrentOrganizerUser = mockOrganizerTeamMembers[0];

// Aktif kullanıcı simülasyonu (hizmet sağlayıcı)
export const mockCurrentProviderUser = mockProviderTeamMembers[0];

// Helper: Organizasyon tipine göre mock veri getir
export function getMockOrganization(isProvider: boolean): Organization {
  return isProvider ? mockProviderOrganization : mockOrganizerOrganization;
}

// Helper: Aktif kullanıcıyı getir
export function getMockCurrentUser(isProvider: boolean): TeamMember {
  return isProvider ? mockCurrentProviderUser : mockCurrentOrganizerUser;
}

// Helper: Zaman farkını okunabilir formata çevir
export function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dk önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  return `${Math.floor(diffDays / 30)} ay önce`;
}

// Helper: Tarihi formatla
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
