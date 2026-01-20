// Mock Team Data for RBAC System

import { organizerRoles, technicalProviderRoles } from '../config/roles';
import type { TeamMember, Invitation, Organization } from '../types/rbac';

// Organizatör Ekip Üyeleri
// TODO: Fetch from Firebase
export const mockOrganizerTeamMembers: TeamMember[] = [];

// Organizatör Bekleyen Davetler
// TODO: Fetch from Firebase
export const mockOrganizerInvitations: Invitation[] = [];

// Organizatör Organizasyonu
// TODO: Fetch from Firebase
export const mockOrganizerOrganization: Organization = {
  id: '',
  name: '',
  type: 'organizer',
  logo: '',
  ownerId: '',
  members: mockOrganizerTeamMembers,
  pendingInvitations: mockOrganizerInvitations,
  createdAt: '',
  updatedAt: '',
};

// Hizmet Sağlayıcı (Teknik) Ekip Üyeleri
// TODO: Fetch from Firebase
export const mockProviderTeamMembers: TeamMember[] = [];

// Hizmet Sağlayıcı Bekleyen Davetler
// TODO: Fetch from Firebase
export const mockProviderInvitations: Invitation[] = [];

// Hizmet Sağlayıcı Organizasyonu
// TODO: Fetch from Firebase
export const mockProviderOrganization: Organization = {
  id: '',
  name: '',
  type: 'provider',
  category: 'technical',
  logo: '',
  ownerId: '',
  members: mockProviderTeamMembers,
  pendingInvitations: mockProviderInvitations,
  createdAt: '',
  updatedAt: '',
};

// Aktif kullanıcı simülasyonu (organizatör)
// TODO: Get from Firebase auth
export const mockCurrentOrganizerUser = mockOrganizerTeamMembers[0] || null;

// Aktif kullanıcı simülasyonu (hizmet sağlayıcı)
// TODO: Get from Firebase auth
export const mockCurrentProviderUser = mockProviderTeamMembers[0] || null;

// Helper: Organizasyon tipine göre mock veri getir
export function getMockOrganization(isProvider: boolean): Organization {
  return isProvider ? mockProviderOrganization : mockOrganizerOrganization;
}

// Helper: Aktif kullanıcıyı getir
export function getMockCurrentUser(isProvider: boolean): TeamMember | null {
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
