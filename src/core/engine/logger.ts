/**
 * Advanced logging and analytics system
 * Tracks user interactions, learning progress, and system performance
 */

import { LearningStep } from './activity-machine';
import { FeedbackMessage } from './feedback';

// Log level enumeration
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

// Event types for learning analytics
export type LearningEvent = 
  | 'step_enter'
  | 'step_exit'
  | 'step_complete'
  | 'fold_angle_change'
  | 'chip_collect'
  | 'chip_uncollect'
  | 'answer_select'
  | 'hint_request'
  | 'error_encounter'
  | 'module_complete'
  | 'module_reset';

// Log entry interface
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  event: LearningEvent | string;
  message: string;
  context?: LogContext;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId: string;
}

// Context information for log entries
export interface LogContext {
  step?: LearningStep;
  moduleId?: string;
  foldAngle?: number;
  collectedChips?: string[];
  selectedAnswer?: string;
  timeOnStep?: number;
  attempt?: number;
  error?: Error;
  metadata?: {
    chipId?: string;
    [key: string]: unknown;
  };
}

// Analytics data structures
export interface LearningAnalytics {
  sessionId: string;
  userId?: string;
  moduleId: string;
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  stepDurations: Record<LearningStep, number>;
  stepAttempts: Record<LearningStep, number>;
  chipCollectionTime: Record<string, number>;
  foldAngleHistory: { timestamp: Date; angle: number; step: LearningStep }[];
  hintsRequested: number;
  errorsEncountered: number;
  completed: boolean;
  score?: number;
}

// Performance metrics
export interface PerformanceMetrics {
  sessionId: string;
  timestamp: Date;
  memoryUsage?: number;
  renderTime?: number;
  interactionLatency?: number;
  errorRate?: number;
}

/**
 * Logger class for comprehensive logging and analytics
 */
export class Logger {
  private logs: LogEntry[] = [];
  private analytics: Map<string, LearningAnalytics> = new Map();
  private performance: PerformanceMetrics[] = [];
  private sessionId: string;
  private logLevel: LogLevel = LogLevel.INFO;
  private maxLogSize: number = 10000;
  private listeners: Map<string, (entry: LogEntry) => void> = new Map();
  
  constructor(sessionId?: string) {
    this.sessionId = sessionId || this.generateSessionId();
  }
  
  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Log a message with specified level
   */
  log(
    level: LogLevel, 
    event: LearningEvent | string, 
    message: string, 
    context?: LogContext, 
    metadata?: Record<string, any>
  ): void {
    if (level < this.logLevel) return;
    
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date(),
      level,
      event,
      message,
      context,
      metadata,
      sessionId: this.sessionId
    };
    
    this.addEntry(entry);
    this.notifyListeners(entry);
    
    // Console output in development
    if (process.env.NODE_ENV === 'development') {
      this.consoleOutput(entry);
    }
  }
  
  /**
   * Convenience methods for different log levels
   */
  debug(event: LearningEvent | string, message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, event, message, context);
  }
  
  info(event: LearningEvent | string, message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, event, message, context);
  }
  
  warn(event: LearningEvent | string, message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, event, message, context);
  }
  
  error(event: LearningEvent | string, message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, event, message, context);
  }
  
  critical(event: LearningEvent | string, message: string, context?: LogContext): void {
    this.log(LogLevel.CRITICAL, event, message, context);
  }
  
  /**
   * Track learning analytics events
   */
  trackLearningEvent(
    event: LearningEvent,
    context: LogContext,
    userId?: string
  ): void {
    const moduleId = context.moduleId || 'ch1-m1';
    let analytics = this.analytics.get(this.sessionId);
    
    if (!analytics) {
      analytics = this.createAnalyticsSession(moduleId, userId);
      this.analytics.set(this.sessionId, analytics);
    }
    
    this.updateAnalytics(analytics, event, context);
    this.info(event, `Learning event: ${event}`, context);
  }
  
  /**
   * Create a new analytics session
   */
  private createAnalyticsSession(moduleId: string, userId?: string): LearningAnalytics {
    return {
      sessionId: this.sessionId,
      userId,
      moduleId,
      startTime: new Date(),
      stepDurations: {
        action: 0,
        misconception: 0,
        inquiry: 0,
        discovery: 0,
        justification: 0
      },
      stepAttempts: {
        action: 0,
        misconception: 0,
        inquiry: 0,
        discovery: 0,
        justification: 0
      },
      chipCollectionTime: {},
      foldAngleHistory: [],
      hintsRequested: 0,
      errorsEncountered: 0,
      completed: false
    };
  }
  
  /**
   * Update analytics based on events
   */
  private updateAnalytics(
    analytics: LearningAnalytics,
    event: LearningEvent,
    context: LogContext
  ): void {
    switch (event) {
      case 'step_enter':
        if (context.step) {
          analytics.stepAttempts[context.step]++;
        }
        break;
        
      case 'step_complete':
        if (context.step && context.timeOnStep) {
          analytics.stepDurations[context.step] += context.timeOnStep;
        }
        break;
        
      case 'fold_angle_change':
        if (context.foldAngle !== undefined && context.step) {
          analytics.foldAngleHistory.push({
            timestamp: new Date(),
            angle: context.foldAngle,
            step: context.step
          });
        }
        break;
        
      case 'chip_collect':
        if (context.metadata?.chipId) {
          analytics.chipCollectionTime[context.metadata.chipId] = Date.now();
        }
        break;
        
      case 'hint_request':
        analytics.hintsRequested++;
        break;
        
      case 'error_encounter':
        analytics.errorsEncountered++;
        break;
        
      case 'module_complete':
        analytics.completed = true;
        analytics.endTime = new Date();
        if (analytics.startTime) {
          analytics.totalDuration = analytics.endTime.getTime() - analytics.startTime.getTime();
        }
        this.calculateScore(analytics);
        break;
    }
  }
  
  /**
   * Calculate learning score based on performance
   */
  private calculateScore(analytics: LearningAnalytics): void {
    let score = 100;
    
    // Deduct points for excessive hints
    if (analytics.hintsRequested > 3) {
      score -= (analytics.hintsRequested - 3) * 5;
    }
    
    // Deduct points for errors
    score -= analytics.errorsEncountered * 10;
    
    // Bonus for efficiency
    const totalAttempts = Object.values(analytics.stepAttempts).reduce((sum, attempts) => sum + attempts, 0);
    if (totalAttempts <= 5) {
      score += 10;
    }
    
    // Bonus for completion time
    if (analytics.totalDuration && analytics.totalDuration < 5 * 60 * 1000) { // 5 minutes
      score += 15;
    }
    
    analytics.score = Math.max(0, Math.min(100, score));
  }
  
  /**
   * Track performance metrics
   */
  trackPerformance(metrics: Omit<PerformanceMetrics, 'sessionId' | 'timestamp'>): void {
    const performanceEntry: PerformanceMetrics = {
      ...metrics,
      sessionId: this.sessionId,
      timestamp: new Date()
    };
    
    this.performance.push(performanceEntry);
    
    // Keep only recent performance data
    if (this.performance.length > 1000) {
      this.performance = this.performance.slice(-500);
    }
    
    this.debug('performance_track', 'Performance metrics tracked', { metadata: metrics });
  }
  
  /**
   * Add log entry to storage
   */
  private addEntry(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Maintain log size limit
    if (this.logs.length > this.maxLogSize) {
      this.logs = this.logs.slice(-this.maxLogSize / 2);
    }
  }
  
  /**
   * Console output for development
   */
  private consoleOutput(entry: LogEntry): void {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
    const levelName = levelNames[entry.level];
    const timestamp = entry.timestamp.toISOString();
    
    const logMessage = `[${timestamp}] ${levelName} (${entry.event}): ${entry.message}`;
    
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, entry.context);
        break;
      case LogLevel.INFO:
        console.info(logMessage, entry.context);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, entry.context);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(logMessage, entry.context);
        break;
    }
  }
  
  /**
   * Add event listener for log entries
   */
  addListener(id: string, callback: (entry: LogEntry) => void): void {
    this.listeners.set(id, callback);
  }
  
  /**
   * Remove event listener
   */
  removeListener(id: string): void {
    this.listeners.delete(id);
  }
  
  /**
   * Notify all listeners of new log entry
   */
  private notifyListeners(entry: LogEntry): void {
    this.listeners.forEach(callback => {
      try {
        callback(entry);
      } catch (error) {
        console.error('Error in log listener:', error);
      }
    });
  }
  
  /**
   * Get filtered logs
   */
  getLogs(filter?: {
    level?: LogLevel;
    event?: LearningEvent | string;
    since?: Date;
    limit?: number;
  }): LogEntry[] {
    let filteredLogs = [...this.logs];
    
    if (filter) {
      if (filter.level !== undefined) {
        filteredLogs = filteredLogs.filter(log => log.level >= filter.level!);
      }
      
      if (filter.event) {
        filteredLogs = filteredLogs.filter(log => log.event === filter.event);
      }
      
      if (filter.since) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.since!);
      }
      
      if (filter.limit) {
        filteredLogs = filteredLogs.slice(-filter.limit);
      }
    }
    
    return filteredLogs;
  }
  
  /**
   * Get analytics for current session
   */
  getAnalytics(): LearningAnalytics | undefined {
    return this.analytics.get(this.sessionId);
  }
  
  /**
   * Get performance metrics
   */
  getPerformanceMetrics(since?: Date): PerformanceMetrics[] {
    if (since) {
      return this.performance.filter(metric => metric.timestamp >= since);
    }
    return [...this.performance];
  }
  
  /**
   * Export logs for analysis
   */
  exportLogs(): {
    logs: LogEntry[];
    analytics: LearningAnalytics[];
    performance: PerformanceMetrics[];
  } {
    return {
      logs: [...this.logs],
      analytics: Array.from(this.analytics.values()),
      performance: [...this.performance]
    };
  }
  
  /**
   * Clear all logs and analytics
   */
  clear(): void {
    this.logs = [];
    this.analytics.clear();
    this.performance = [];
  }
  
  /**
   * Set log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    this.info('config_change', `Log level set to ${LogLevel[level]}`);
  }
  
  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}

/**
 * Global logger instance
 */
let globalLogger: Logger;

/**
 * Get or create global logger instance
 */
export function getLogger(): Logger {
  if (!globalLogger) {
    globalLogger = new Logger();
  }
  return globalLogger;
}

/**
 * Initialize logger with specific session ID
 */
export function initializeLogger(sessionId?: string): Logger {
  globalLogger = new Logger(sessionId);
  return globalLogger;
}

/**
 * Logger utility functions
 */
export const loggerUtils = {
  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: Date): string {
    return timestamp.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  },
  
  /**
   * Get log level color for UI
   */
  getLogLevelColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return '#6b7280';
      case LogLevel.INFO: return '#3b82f6';
      case LogLevel.WARN: return '#f59e0b';
      case LogLevel.ERROR: return '#ef4444';
      case LogLevel.CRITICAL: return '#dc2626';
      default: return '#6b7280';
    }
  },
  
  /**
   * Convert analytics to summary
   */
  summarizeAnalytics(analytics: LearningAnalytics): {
    completionRate: number;
    averageTimePerStep: number;
    efficiency: number;
    needsImprovement: string[];
  } {
    const totalSteps = Object.keys(analytics.stepDurations).length;
    const completedSteps = Object.values(analytics.stepDurations).filter(duration => duration > 0).length;
    const completionRate = (completedSteps / totalSteps) * 100;
    
    const totalTime = Object.values(analytics.stepDurations).reduce((sum, duration) => sum + duration, 0);
    const averageTimePerStep = totalTime / Math.max(completedSteps, 1);
    
    let efficiency = 100;
    if (analytics.hintsRequested > 2) efficiency -= 20;
    if (analytics.errorsEncountered > 1) efficiency -= 15;
    if (averageTimePerStep > 120) efficiency -= 10; // More than 2 minutes per step
    
    const needsImprovement: string[] = [];
    if (analytics.hintsRequested > 3) needsImprovement.push('hint dependency');
    if (analytics.errorsEncountered > 2) needsImprovement.push('error handling');
    if (averageTimePerStep > 180) needsImprovement.push('task completion speed');
    
    return {
      completionRate,
      averageTimePerStep,
      efficiency: Math.max(0, efficiency),
      needsImprovement
    };
  }
};