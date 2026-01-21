import { useState, useCallback, useMemo, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  getDocuments,
  updateDocument,
  deleteDocument,
  Collections,
  orderBy,
} from '../services/firebase';
import type {
  AdminEvent,
  EventFilters,
  EventApprovalStatus,
  ModerationQueueItem,
} from '../types/admin';

export interface UseAdminEventsResult {
  // Data
  events: AdminEvent[];
  filteredEvents: AdminEvent[];
  selectedEvent: AdminEvent | null;
  moderationQueue: ModerationQueueItem[];

  // Filters
  filters: EventFilters;
  setFilters: (filters: EventFilters) => void;
  resetFilters: () => void;

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isProcessing: boolean;

  // Actions
  refresh: () => Promise<void>;
  selectEvent: (eventId: string | null) => void;
  approveEvent: (eventId: string) => Promise<void>;
  rejectEvent: (eventId: string, reason: string) => Promise<void>;
  flagEvent: (eventId: string, reason: string) => Promise<void>;
  unflagEvent: (eventId: string) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;

  // Stats
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    flagged: number;
    active: number;
  };
}

const defaultFilters: EventFilters = {
  search: '',
  status: 'all',
  approvalStatus: 'all',
  isFlagged: undefined,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

// Map Firebase event data to AdminEvent type
function mapFirebaseEventToAdminEvent(firebaseEvent: any): AdminEvent {
  // Determine approval status
  let approvalStatus: EventApprovalStatus = 'pending';
  if (firebaseEvent.approvalStatus) {
    approvalStatus = firebaseEvent.approvalStatus;
  } else if (firebaseEvent.isApproved) {
    approvalStatus = 'approved';
  } else if (firebaseEvent.isRejected) {
    approvalStatus = 'rejected';
  }

  return {
    id: firebaseEvent.id,
    title: firebaseEvent.title || firebaseEvent.name || 'İsimsiz Etkinlik',
    date: firebaseEvent.date || firebaseEvent.eventDate || new Date().toISOString(),
    time: firebaseEvent.time || firebaseEvent.eventTime || '00:00',
    city: firebaseEvent.city || firebaseEvent.location?.city || 'Belirtilmedi',
    district: firebaseEvent.district || firebaseEvent.location?.district || '',
    venue: firebaseEvent.venue || firebaseEvent.location?.venue || 'Belirtilmedi',
    status: firebaseEvent.status || 'planning',
    budget: firebaseEvent.budget || 0,
    organizerId: firebaseEvent.organizerId || firebaseEvent.userId || '',
    organizerName: firebaseEvent.organizerName || firebaseEvent.createdByName || 'Bilinmiyor',
    organizerImage: firebaseEvent.organizerImage || firebaseEvent.createdByAvatar,
    approvalStatus,
    approvedBy: firebaseEvent.approvedBy,
    approvedAt: firebaseEvent.approvedAt?.toDate?.()?.toISOString() || firebaseEvent.approvedAt,
    rejectedBy: firebaseEvent.rejectedBy,
    rejectedAt: firebaseEvent.rejectedAt?.toDate?.()?.toISOString() || firebaseEvent.rejectedAt,
    rejectionReason: firebaseEvent.rejectionReason,
    isFlagged: firebaseEvent.isFlagged || false,
    flaggedAt: firebaseEvent.flaggedAt?.toDate?.()?.toISOString() || firebaseEvent.flaggedAt,
    flaggedBy: firebaseEvent.flaggedBy,
    flagReason: firebaseEvent.flagReason,
    createdAt: firebaseEvent.createdAt?.toDate?.()?.toISOString() || firebaseEvent.createdAt || new Date().toISOString(),
  };
}

export function useAdminEvents(): UseAdminEventsResult {
  const { logAction } = useAdmin();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);
  const [moderationQueue, setModerationQueue] = useState<ModerationQueueItem[]>([]);
  const [filters, setFilters] = useState<EventFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch events from Firebase
  const fetchEvents = useCallback(async () => {
    try {
      const firebaseEvents = await getDocuments<any>(Collections.EVENTS, [
        orderBy('createdAt', 'desc'),
      ]);

      const mappedEvents = firebaseEvents.map(mapFirebaseEventToAdminEvent);
      setEvents(mappedEvents);

      // Build moderation queue from pending/flagged events
      const queue: ModerationQueueItem[] = mappedEvents
        .filter((e) => e.approvalStatus === 'pending' || e.isFlagged)
        .map((e) => ({
          id: `mod_${e.id}`,
          type: 'event' as const,
          targetId: e.id,
          targetName: e.title,
          reason: e.isFlagged ? e.flagReason || 'İşaretlendi' : 'Onay bekliyor',
          description: e.isFlagged
            ? `Etkinlik işaretlendi: ${e.flagReason || 'Sebep belirtilmedi'}`
            : 'Yeni etkinlik onay bekliyor',
          status: 'pending' as const,
          priority: e.isFlagged ? 'high' as const : 'medium' as const,
          reportedAt: e.flaggedAt || e.createdAt,
        }));
      setModerationQueue(queue);
    } catch (error) {
      // Firebase permission error - show empty list
      console.log('Unable to fetch events (Firebase permission required)');
      setEvents([]);
      setModerationQueue([]);
    }
  }, []);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    fetchEvents().finally(() => setIsLoading(false));
  }, [fetchEvents]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(searchLower) ||
          event.venue.toLowerCase().includes(searchLower) ||
          event.city.toLowerCase().includes(searchLower) ||
          event.organizerName.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      result = result.filter((event) => event.status === filters.status);
    }

    // Approval status filter
    if (filters.approvalStatus && filters.approvalStatus !== 'all') {
      result = result.filter((event) => event.approvalStatus === filters.approvalStatus);
    }

    // Flagged filter
    if (filters.isFlagged !== undefined) {
      result = result.filter((event) => event.isFlagged === filters.isFlagged);
    }

    // Date range filter
    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.start).getTime();
      const endDate = new Date(filters.dateRange.end).getTime();
      result = result.filter((event) => {
        const eventDate = new Date(event.date).getTime();
        return eventDate >= startDate && eventDate <= endDate;
      });
    }

    // Sort
    if (filters.sortBy) {
      result.sort((a, b) => {
        let aValue = 0;
        let bValue = 0;

        switch (filters.sortBy) {
          case 'date':
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'budget':
            aValue = a.budget || 0;
            bValue = b.budget || 0;
            break;
        }

        return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    return result;
  }, [events, filters]);

  // Calculate stats
  const stats = useMemo(() => ({
    total: events.length,
    pending: events.filter((e) => e.approvalStatus === 'pending').length,
    approved: events.filter((e) => e.approvalStatus === 'approved').length,
    rejected: events.filter((e) => e.approvalStatus === 'rejected').length,
    flagged: events.filter((e) => e.isFlagged).length,
    active: events.filter((e) => e.status === 'confirmed' || e.status === 'planning').length,
  }), [events]);

  // Actions
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchEvents();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchEvents]);

  const selectEvent = useCallback((eventId: string | null) => {
    if (eventId === null) {
      setSelectedEvent(null);
    } else {
      const event = events.find((e) => e.id === eventId) || null;
      setSelectedEvent(event);
    }
  }, [events]);

  const approveEvent = useCallback(async (eventId: string) => {
    setIsProcessing(true);
    try {
      // Update in Firebase
      await updateDocument(Collections.EVENTS, eventId, {
        approvalStatus: 'approved',
        approvedAt: new Date().toISOString(),
        isApproved: true,
        isFlagged: false,
        flaggedAt: null,
        flagReason: null,
      });

      const event = events.find((e) => e.id === eventId);
      if (event) {
        await logAction('event.approve', 'event', eventId, {
          previousValue: { approvalStatus: event.approvalStatus },
          newValue: { approvalStatus: 'approved' },
          description: `${event.title} onaylandı`,
        });
      }

      // Update local state
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? {
                ...event,
                approvalStatus: 'approved' as EventApprovalStatus,
                approvedAt: new Date().toISOString(),
                isFlagged: false,
                flaggedAt: undefined,
                flagReason: undefined,
              }
            : event
        )
      );

      // Remove from moderation queue
      setModerationQueue((prev) =>
        prev.filter((item) => !(item.type === 'event' && item.targetId === eventId))
      );
    } catch (error) {
      console.error('Error approving event:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [events, logAction]);

  const rejectEvent = useCallback(async (eventId: string, reason: string) => {
    setIsProcessing(true);
    try {
      // Update in Firebase
      await updateDocument(Collections.EVENTS, eventId, {
        approvalStatus: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason,
        isRejected: true,
      });

      const event = events.find((e) => e.id === eventId);
      if (event) {
        await logAction('event.reject', 'event', eventId, {
          previousValue: { approvalStatus: event.approvalStatus },
          newValue: { approvalStatus: 'rejected', rejectionReason: reason },
          description: `${event.title} reddedildi: ${reason}`,
        });
      }

      // Update local state
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? {
                ...event,
                approvalStatus: 'rejected' as EventApprovalStatus,
                rejectedAt: new Date().toISOString(),
                rejectionReason: reason,
              }
            : event
        )
      );

      // Remove from moderation queue
      setModerationQueue((prev) =>
        prev.filter((item) => !(item.type === 'event' && item.targetId === eventId))
      );
    } catch (error) {
      console.error('Error rejecting event:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [events, logAction]);

  const flagEvent = useCallback(async (eventId: string, reason: string) => {
    setIsProcessing(true);
    try {
      // Update in Firebase
      await updateDocument(Collections.EVENTS, eventId, {
        isFlagged: true,
        flaggedAt: new Date().toISOString(),
        flagReason: reason,
      });

      const event = events.find((e) => e.id === eventId);
      if (event) {
        await logAction('event.flag', 'event', eventId, {
          newValue: { isFlagged: true, flagReason: reason },
          description: `${event.title} işaretlendi: ${reason}`,
        });
      }

      // Update local state
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? {
                ...event,
                isFlagged: true,
                flaggedAt: new Date().toISOString(),
                flagReason: reason,
              }
            : event
        )
      );

      // Add to moderation queue
      if (event) {
        setModerationQueue((prev) => [
          ...prev,
          {
            id: `mod_${Date.now()}`,
            type: 'event',
            targetId: eventId,
            targetName: event.title,
            reason: 'Manuel işaretleme',
            description: reason,
            status: 'pending',
            priority: 'high',
            reportedAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error flagging event:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [events, logAction]);

  const unflagEvent = useCallback(async (eventId: string) => {
    setIsProcessing(true);
    try {
      // Update in Firebase
      await updateDocument(Collections.EVENTS, eventId, {
        isFlagged: false,
        flaggedAt: null,
        flagReason: null,
      });

      const event = events.find((e) => e.id === eventId);
      if (event) {
        await logAction('event.unflag', 'event', eventId, {
          previousValue: { isFlagged: true, flagReason: event.flagReason },
          newValue: { isFlagged: false },
          description: `${event.title} işareti kaldırıldı`,
        });
      }

      // Update local state
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? {
                ...event,
                isFlagged: false,
                flaggedAt: undefined,
                flagReason: undefined,
              }
            : event
        )
      );

      // Remove from moderation queue
      setModerationQueue((prev) =>
        prev.filter((item) => !(item.type === 'event' && item.targetId === eventId))
      );
    } catch (error) {
      console.error('Error unflagging event:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [events, logAction]);

  const deleteEvent = useCallback(async (eventId: string) => {
    setIsProcessing(true);
    try {
      // Delete from Firebase
      await deleteDocument(Collections.EVENTS, eventId);

      const event = events.find((e) => e.id === eventId);
      if (event) {
        await logAction('event.delete', 'event', eventId, {
          description: `${event.title} silindi`,
        });
      }

      // Update local state
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(null);
      }

      // Remove from moderation queue
      setModerationQueue((prev) =>
        prev.filter((item) => !(item.type === 'event' && item.targetId === eventId))
      );
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [events, selectedEvent, logAction]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return {
    events,
    filteredEvents,
    selectedEvent,
    moderationQueue,
    filters,
    setFilters,
    resetFilters,
    isLoading,
    isRefreshing,
    isProcessing,
    refresh,
    selectEvent,
    approveEvent,
    rejectEvent,
    flagEvent,
    unflagEvent,
    deleteEvent,
    stats,
  };
}

export default useAdminEvents;
