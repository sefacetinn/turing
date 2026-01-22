/**
 * Database Models Index
 *
 * Exports all WatermelonDB models for the application.
 */

import Event from './Event';
import Offer from './Offer';
import Artist from './Artist';
import Conversation from './Conversation';
import Message from './Message';
import SyncQueue, { SyncQueueQueries, MAX_RETRY_ATTEMPTS } from './SyncQueue';

// Export all models
export {
  Event,
  Offer,
  Artist,
  Conversation,
  Message,
  SyncQueue,
  SyncQueueQueries,
  MAX_RETRY_ATTEMPTS,
};

// Model classes array for database initialization
export const modelClasses = [
  Event,
  Offer,
  Artist,
  Conversation,
  Message,
  SyncQueue,
];

export default modelClasses;
