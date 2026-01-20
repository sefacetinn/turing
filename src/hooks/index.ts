export { useNetworkStatus, isOnline, type NetworkStatus } from './useNetworkStatus';
export { useKeyboard, dismissKeyboard, getKeyboardBehavior, getKeyboardVerticalOffset } from './useKeyboard';
export { useForm, useFieldValidation } from './useForm';

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
  useProviderOffers,
  useOrganizerOffers,
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
} from './useFirestoreData';
