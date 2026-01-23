import { useState, useEffect, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import {
  getDocuments,
  updateDocument,
  Collections,
  where,
  orderBy,
} from '../services/firebase/firestore';

// ============================================
// TYPES
// ============================================

export type RevisionType = 'date' | 'venue' | 'budget' | 'other';
export type RevisionStatus = 'pending_approval' | 'approved' | 'rejected' | 'partially_approved';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ProviderApproval {
  status: ApprovalStatus;
  respondedAt?: Timestamp;
  comment?: string;
}

export interface EventRevision {
  id: string;
  eventId: string;
  eventTitle: string;
  type: RevisionType;
  title: string;
  description: string;
  oldValue: string | null;
  newValue: string | null;
  requestedAt: Timestamp;
  status: RevisionStatus;
  providerApprovals: Record<string, ProviderApproval>;
  totalProviders: number;
  approvedCount: number;
  rejectedCount: number;
  appliedAt?: Timestamp;
}

export interface UseEventRevisionsResult {
  revisions: EventRevision[];
  pendingRevisions: EventRevision[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  approveRevision: (revisionId: string, providerId: string, comment?: string) => Promise<boolean>;
  rejectRevision: (revisionId: string, providerId: string, comment?: string) => Promise<boolean>;
}

export interface UseProviderPendingRevisionsResult {
  pendingRevisions: EventRevision[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  approveRevision: (revisionId: string, comment?: string) => Promise<boolean>;
  rejectRevision: (revisionId: string, comment?: string) => Promise<boolean>;
}

// ============================================
// HOOK: useEventRevisions
// For organizers to view all revisions for an event
// ============================================

export function useEventRevisions(eventId: string | undefined): UseEventRevisionsResult {
  const [revisions, setRevisions] = useState<EventRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevisions = useCallback(async () => {
    if (!eventId) {
      setRevisions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const docs = await getDocuments<EventRevision>(
        Collections.EVENT_REVISIONS,
        [
          where('eventId', '==', eventId),
          orderBy('requestedAt', 'desc'),
        ]
      );
      setRevisions(docs);
    } catch (err: any) {
      console.warn('[useEventRevisions] Error fetching revisions:', err);
      setError(err.message || 'Revizyon geçmişi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchRevisions();
  }, [fetchRevisions]);

  const pendingRevisions = revisions.filter(r => r.status === 'pending_approval');

  const approveRevision = useCallback(async (
    revisionId: string,
    providerId: string,
    comment?: string
  ): Promise<boolean> => {
    try {
      const revision = revisions.find(r => r.id === revisionId);
      if (!revision) return false;

      const updatedApprovals = {
        ...revision.providerApprovals,
        [providerId]: {
          status: 'approved' as ApprovalStatus,
          respondedAt: Timestamp.now(),
          comment: comment || undefined,
        },
      };

      const newApprovedCount = Object.values(updatedApprovals).filter(
        a => a.status === 'approved'
      ).length;

      // Check if all providers have approved
      const allApproved = newApprovedCount === revision.totalProviders;

      await updateDocument(Collections.EVENT_REVISIONS, revisionId, {
        providerApprovals: updatedApprovals,
        approvedCount: newApprovedCount,
        status: allApproved ? 'approved' : 'pending_approval',
        ...(allApproved && { appliedAt: Timestamp.now() }),
      });

      // If all approved, apply the change to the event
      if (allApproved && revision.newValue) {
        await applyRevisionToEvent(revision);
      }

      await fetchRevisions();
      return true;
    } catch (err: any) {
      console.warn('[useEventRevisions] Error approving revision:', err);
      return false;
    }
  }, [revisions, fetchRevisions]);

  const rejectRevision = useCallback(async (
    revisionId: string,
    providerId: string,
    comment?: string
  ): Promise<boolean> => {
    try {
      const revision = revisions.find(r => r.id === revisionId);
      if (!revision) return false;

      const updatedApprovals = {
        ...revision.providerApprovals,
        [providerId]: {
          status: 'rejected' as ApprovalStatus,
          respondedAt: Timestamp.now(),
          comment: comment || undefined,
        },
      };

      const newRejectedCount = Object.values(updatedApprovals).filter(
        a => a.status === 'rejected'
      ).length;

      await updateDocument(Collections.EVENT_REVISIONS, revisionId, {
        providerApprovals: updatedApprovals,
        rejectedCount: newRejectedCount,
        status: 'rejected', // Any rejection marks the whole revision as rejected
      });

      await fetchRevisions();
      return true;
    } catch (err: any) {
      console.warn('[useEventRevisions] Error rejecting revision:', err);
      return false;
    }
  }, [revisions, fetchRevisions]);

  return {
    revisions,
    pendingRevisions,
    loading,
    error,
    refetch: fetchRevisions,
    approveRevision,
    rejectRevision,
  };
}

// ============================================
// HOOK: useProviderPendingRevisions
// For providers to see revisions that need their approval
// ============================================

export function useProviderPendingRevisions(
  providerId: string | undefined
): UseProviderPendingRevisionsResult {
  const [pendingRevisions, setPendingRevisions] = useState<EventRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingRevisions = useCallback(async () => {
    if (!providerId) {
      setPendingRevisions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get all pending revisions
      const docs = await getDocuments<EventRevision>(
        Collections.EVENT_REVISIONS,
        [
          where('status', '==', 'pending_approval'),
          orderBy('requestedAt', 'desc'),
        ]
      );

      // Filter to only include revisions where this provider has a pending approval
      const providerPending = docs.filter(revision => {
        const approval = revision.providerApprovals?.[providerId];
        return approval && approval.status === 'pending';
      });

      setPendingRevisions(providerPending);
    } catch (err: any) {
      console.warn('[useProviderPendingRevisions] Error fetching revisions:', err);
      setError(err.message || 'Bekleyen revizyonlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchPendingRevisions();
  }, [fetchPendingRevisions]);

  const approveRevision = useCallback(async (
    revisionId: string,
    comment?: string
  ): Promise<boolean> => {
    if (!providerId) return false;

    try {
      const revision = pendingRevisions.find(r => r.id === revisionId);
      if (!revision) return false;

      const updatedApprovals = {
        ...revision.providerApprovals,
        [providerId]: {
          status: 'approved' as ApprovalStatus,
          respondedAt: Timestamp.now(),
          comment: comment || undefined,
        },
      };

      const newApprovedCount = Object.values(updatedApprovals).filter(
        a => a.status === 'approved'
      ).length;

      // Check if all providers have approved
      const allApproved = newApprovedCount === revision.totalProviders;

      await updateDocument(Collections.EVENT_REVISIONS, revisionId, {
        providerApprovals: updatedApprovals,
        approvedCount: newApprovedCount,
        status: allApproved ? 'approved' : 'pending_approval',
        ...(allApproved && { appliedAt: Timestamp.now() }),
      });

      // If all approved, apply the change to the event
      if (allApproved && revision.newValue) {
        await applyRevisionToEvent(revision);
      }

      await fetchPendingRevisions();
      return true;
    } catch (err: any) {
      console.warn('[useProviderPendingRevisions] Error approving revision:', err);
      return false;
    }
  }, [providerId, pendingRevisions, fetchPendingRevisions]);

  const rejectRevision = useCallback(async (
    revisionId: string,
    comment?: string
  ): Promise<boolean> => {
    if (!providerId) return false;

    try {
      const revision = pendingRevisions.find(r => r.id === revisionId);
      if (!revision) return false;

      const updatedApprovals = {
        ...revision.providerApprovals,
        [providerId]: {
          status: 'rejected' as ApprovalStatus,
          respondedAt: Timestamp.now(),
          comment: comment || undefined,
        },
      };

      const newRejectedCount = Object.values(updatedApprovals).filter(
        a => a.status === 'rejected'
      ).length;

      await updateDocument(Collections.EVENT_REVISIONS, revisionId, {
        providerApprovals: updatedApprovals,
        rejectedCount: newRejectedCount,
        status: 'rejected',
      });

      await fetchPendingRevisions();
      return true;
    } catch (err: any) {
      console.warn('[useProviderPendingRevisions] Error rejecting revision:', err);
      return false;
    }
  }, [providerId, pendingRevisions, fetchPendingRevisions]);

  return {
    pendingRevisions,
    loading,
    error,
    refetch: fetchPendingRevisions,
    approveRevision,
    rejectRevision,
  };
}

// ============================================
// HELPER: Apply revision to event
// ============================================

async function applyRevisionToEvent(revision: EventRevision): Promise<void> {
  if (!revision.newValue) return;

  const updateData: Record<string, any> = {};

  switch (revision.type) {
    case 'date':
      updateData.date = revision.newValue;
      break;
    case 'venue':
      updateData.venue = revision.newValue;
      break;
    case 'budget':
      updateData.budget = parseInt(revision.newValue) || 0;
      break;
  }

  if (Object.keys(updateData).length > 0) {
    await updateDocument(Collections.EVENTS, revision.eventId, updateData);
    console.log('[useEventRevisions] Revision applied to event:', revision.eventId);
  }
}

// ============================================
// HELPER: Format revision for display
// ============================================

export function getRevisionTypeLabel(type: RevisionType): string {
  const labels: Record<RevisionType, string> = {
    date: 'Tarih Değişikliği',
    venue: 'Mekan Değişikliği',
    budget: 'Bütçe Güncelleme',
    other: 'Diğer Değişiklik',
  };
  return labels[type] || 'Değişiklik';
}

export function getRevisionTypeIcon(type: RevisionType): string {
  const icons: Record<RevisionType, string> = {
    date: 'calendar-outline',
    venue: 'location-outline',
    budget: 'wallet-outline',
    other: 'create-outline',
  };
  return icons[type] || 'document-outline';
}

export function getRevisionStatusLabel(status: RevisionStatus): string {
  const labels: Record<RevisionStatus, string> = {
    pending_approval: 'Onay Bekliyor',
    approved: 'Onaylandı',
    rejected: 'Reddedildi',
    partially_approved: 'Kısmi Onay',
  };
  return labels[status] || status;
}

export function getRevisionStatusColor(status: RevisionStatus): string {
  const colors: Record<RevisionStatus, string> = {
    pending_approval: '#f59e0b', // warning/amber
    approved: '#22c55e', // success/green
    rejected: '#ef4444', // error/red
    partially_approved: '#3b82f6', // info/blue
  };
  return colors[status] || '#71717a';
}

export function formatRevisionValue(type: RevisionType, value: string | null): string {
  if (!value) return '-';

  switch (type) {
    case 'budget':
      const amount = parseInt(value);
      if (isNaN(amount)) return value;
      return `₺${amount.toLocaleString('tr-TR')}`;
    case 'date':
      // Try to format date if it's in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-');
        const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
      }
      return value;
    default:
      return value;
  }
}
