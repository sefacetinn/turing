export { useNetworkStatus, isOnline, type NetworkStatus } from './useNetworkStatus';
export { useKeyboard, dismissKeyboard, getKeyboardBehavior, getKeyboardVerticalOffset } from './useKeyboard';
export { useForm, useFieldValidation } from './useForm';
export { useNotifications } from './useNotifications';
export { useAnalyticsTracking, useScreenTracking, useNavigationTracking } from './useAnalyticsTracking';
export { useResponsive, useDeviceSize, useBreakpointValue, useOrientation } from './useResponsive';
export { useAppUpdate } from './useAppUpdate';

// Provider finance hook
export { useProviderFinance, type FinancialSummary, type MonthlyEarning, type FinancialTransaction, type ServiceIncome } from './useProviderFinance';

// Admin hooks
export { useAdminPermissions, type AdminPermissionsResult } from './useAdminPermissions';
export { useAdminDashboard, type UseAdminDashboardResult } from './useAdminDashboard';
export { useAdminUsers, type UseAdminUsersResult } from './useAdminUsers';
export { useAdminEvents, type UseAdminEventsResult } from './useAdminEvents';
export { useAdminFinance, type UseAdminFinanceResult } from './useAdminFinance';
export { useAdminRoles, type UseAdminRolesResult } from './useAdminRoles';

// Firestore data hooks
export {
  useUserEvents,
  useProviderJobs,
  useOffers,
  useConversations,
  useOrganizerDashboard,
  useProviderDashboard,
  useEvent,
  useArtists,
  useArtist,
  useAllArtists,
  useBookingProviders,
  useBookingProvider,
  useProviderArtists,
  // Chat hooks
  useChatConversations,
  useChatMessages,
  sendChatMessage,
  createOrGetConversation,
  getConversationById,
  markMessagesAsRead,
  // Favorites hooks
  useFavorites,
  toggleFavorite,
  // Offer request hooks
  createOfferRequest,
  respondToOfferRequest,
  respondToQuote,
  submitProviderQuote,
  sendCounterOffer,
  acceptOffer,
  rejectOffer,
  cancelOffer,
  useOffer,
  useProviderEventOffer,
  useProviderOffers,
  useOrganizerOffers,
  useUserContracts,
  syncOffersToEventServices,
  syncOffersToEventServicesWithDebug,
  // Artist team and rider hooks
  useArtistTeam,
  addArtistTeamMember,
  removeArtistTeamMember,
  useArtistRiders,
  uploadArtistRider,
  deleteArtistRider,
  // Artist shows hook
  useArtistShows,
  type ArtistShow,
  type CreateOfferRequestParams,
  type FirestoreEvent,
  type FirestoreOffer,
  type FirestoreConversation,
  type FirestoreArtist,
  type FirestoreBookingProvider,
  type FirestoreChatMessage,
  type FirestoreChatConversation,
  type FirestoreFavorite,
  type DashboardStats,
  type ArtistTeamMember,
  type ArtistRider,
  type UserContract,
} from './useFirestoreData';

// Offline data hooks (WatermelonDB)
export {
  useOfflineCollection,
  useOfflineItem,
  useOfflineEvents,
  useOfflineOffers,
  useOfflineArtists,
  useOfflineConversations,
  useOfflineMessages,
  useSyncStatus,
  usePendingSyncCount,
  type UseOfflineDataResult,
  type UseOfflineItemResult,
} from './useOfflineData';

// Event Revisions hooks
export {
  useEventRevisions,
  useProviderPendingRevisions,
  getRevisionTypeLabel,
  getRevisionTypeIcon,
  getRevisionStatusLabel,
  getRevisionStatusColor,
  formatRevisionValue,
  type EventRevision,
  type RevisionType,
  type RevisionStatus,
  type ApprovalStatus,
  type ProviderApproval,
  type UseEventRevisionsResult,
  type UseProviderPendingRevisionsResult,
} from './useEventRevisions';
