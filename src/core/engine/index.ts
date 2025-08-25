/**
 * Core Engine Module Exports
 * Provides state management, feedback, analytics, and interaction systems
 */

import { createChipSystem } from './chip-system';
import { createFeedbackManager } from './feedback';
import { getLogger } from './logger';
import { createActivityService } from './activity-machine';


// Activity Machine (XState-based state management)
export {
  activityMachine,
  createActivityService,
  type LearningStep
} from './activity-machine';


// Chip System (Gamified learning mechanics)
export {
  ChipSystemManager,
  createChipSystem,
  chipUtils,
  CHIP_DEFINITIONS,
  SAS_PATTERNS,
  SAS_UI_TO_CHIP,
  isSASChipSetComplete,
  type Chip,
  type ChipType,
  type ChipValidationResult
} from './chip-system';

// Feedback System (Adaptive guidance)
export {
  FeedbackManager,
  createFeedbackManager,
  feedbackUtils,
  type FeedbackMessage,
  type FeedbackType,
  type FeedbackPriority,
  type FeedbackAction,
  type FeedbackContext
} from './feedback';

// Logger (Analytics and monitoring)
export {
  Logger,
  getLogger,
  initializeLogger,
  loggerUtils,
  LogLevel,
  type LearningEvent,
  type LogEntry,
  type LogContext,
  type LearningAnalytics,
  type PerformanceMetrics
} from './logger';

// Combined engine factory
export function createLearningEngine() {
  const chipSystem = createChipSystem();
  const feedbackManager = createFeedbackManager(chipSystem);
  const logger = getLogger();
  const activityService = createActivityService();
  
  return {
    chipSystem,
    feedbackManager,
    logger,
    activityService
  };
}