/**
 * Adaptive feedback system for learning activities
 * Provides contextual hints, encouragement, and guidance
 */

import { Triangle, Point } from '../geometry/types';
import { LearningStep } from './activity-machine';
import { ChipSystemManager, ChipValidationResult } from './chip-system';
import { detectOverlap } from '../geometry/fold';

// Feedback types and interfaces
export interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  content: string;
  priority: FeedbackPriority;
  duration?: number; // ms, undefined for persistent
  actions?: FeedbackAction[];
  metadata?: Record<string, any>;
}

export type FeedbackType = 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'hint' 
  | 'encouragement' 
  | 'instruction'
  | 'discovery';

export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';

export interface FeedbackAction {
  label: string;
  action: () => void;
  type: 'primary' | 'secondary';
}

export interface FeedbackContext {
  step: LearningStep;
  foldAngle: number;
  collectedChips: string[];
  selectedAnswer: string | null;
  triangle: Triangle;
  foldPoint?: Point;
  error?: string;
  timeOnStep?: number; // seconds
  attempts?: number;
}

/**
 * Styling descriptor for feedback message rendering
 */
export interface MessageStyling {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
}

/**
 * Feedback system manager
 */
export class FeedbackManager {
  private messages: Map<string, FeedbackMessage> = new Map();
  private messageHistory: FeedbackMessage[] = [];
  private chipSystem: ChipSystemManager;
  
  constructor(chipSystem: ChipSystemManager) {
    this.chipSystem = chipSystem;
  }
  
  /**
   * Generate contextual feedback based on current state
   */
  generateFeedback(context: FeedbackContext): FeedbackMessage[] {
    const messages: FeedbackMessage[] = [];
    
    switch (context.step) {
      case 'action':
        messages.push(...this.generateActionFeedback(context));
        break;
      case 'observation':
        messages.push(...this.generateObservationFeedback(context));
        break;
      case 'inquiry':
        messages.push(...this.generateInquiryFeedback(context));
        break;
      case 'discovery':
        messages.push(...this.generateDiscoveryFeedback(context));
        break;
      case 'justification':
        messages.push(...this.generateJustificationFeedback(context));
        break;
    }
    
    // Add time-based feedback
    if (context.timeOnStep && context.timeOnStep > 30) {
      messages.push(this.generateTimeBasedFeedback(context));
    }
    
    // Store messages
    messages.forEach(msg => {
      this.messages.set(msg.id, msg);
      this.messageHistory.push(msg);
    });
    
    return messages.sort((a, b) => this.priorityOrder(b.priority) - this.priorityOrder(a.priority));
  }
  
  /**
   * Generate feedback for action step
   */
  private generateActionFeedback(context: FeedbackContext): FeedbackMessage[] {
    const messages: FeedbackMessage[] = [];
    const { foldAngle } = context;
    
    if (foldAngle === 0) {
      messages.push({
        id: 'action-start',
        type: 'instruction',
        content: '슬라이더를 움직여서 삼각형을 접어보세요!',
        priority: 'medium',
        metadata: { step: 'action', phase: 'start' }
      });
    } else if (foldAngle < 30) {
      messages.push({
        id: 'action-gentle-fold',
        type: 'encouragement',
        content: '좋은 시작이에요! 계속 접어보세요.',
        priority: 'low',
        duration: 3000
      });
    } else if (foldAngle < 70) {
      messages.push({
        id: 'action-progress',
        type: 'hint',
        content: '두 각이 서로 가까워지고 있어요. 더 접어보세요!',
        priority: 'medium',
        duration: 3000
      });
    } else if (foldAngle >= 70 && foldAngle < 90) {
      messages.push({
        id: 'action-almost-overlap',
        type: 'hint',
        content: '거의 다 왔어요! 두 각이 거의 겹쳐집니다.',
        priority: 'medium',
        duration: 2000
      });
    } else if (foldAngle >= 90) {
      messages.push({
        id: 'action-success',
        type: 'success',
        content: '완벽해요! 두 밑각의 크기가 동일한 것을 확인했습니다! ✨',
        priority: 'high',
        duration: 4000
      });
    }
    
    return messages;
  }
  
  /**
   * Generate feedback for observation step
   */
  private generateObservationFeedback(context: FeedbackContext): FeedbackMessage[] {
    const messages: FeedbackMessage[] = [];
    const { foldAngle, triangle, foldPoint } = context;
    
    if (foldAngle < 90) {
      messages.push({
        id: 'observation-need-more-fold',
        type: 'hint',
        content: '더 많이 접어서 두 각이 완전히 겹치도록 해보세요.',
        priority: 'medium'
      });
    } else {
      const overlap = detectOverlap(triangle, foldAngle);
      
      if (overlap.isOverlapping) {
        messages.push({
          id: 'observation-overlap-detected',
          type: 'discovery',
          content: `두 밑각이 ${overlap.overlapPercentage.toFixed(0)}% 겹쳐졌습니다. 이것이 우연일까요?`,
          priority: 'high',
          duration: 5000
        });
      }
    }
    
    return messages;
  }
  
  /**
   * Generate feedback for inquiry step
   */
  private generateInquiryFeedback(context: FeedbackContext): FeedbackMessage[] {
    const messages: FeedbackMessage[] = [];
    const { selectedAnswer, attempts = 0 } = context;
    
    if (!selectedAnswer) {
      messages.push({
        id: 'inquiry-prompt',
        type: 'instruction',
        content: '두 각이 겹치는 이유를 생각해보세요. 우연일까요, 아니면 다른 이유가 있을까요?',
        priority: 'medium'
      });
    } else if (selectedAnswer === 'coincidence') {
      messages.push({
        id: 'inquiry-wrong-answer',
        type: 'hint',
        content: '음... 정말 우연일까요? 접기 전후의 삼각형을 다시 살펴보세요.',
        priority: 'medium',
        duration: 4000
      });
    } else if (selectedAnswer === 'congruence') {
      messages.push({
        id: 'inquiry-correct-answer',
        type: 'success',
        content: '정답입니다! 합동이 핵심이군요. 이제 왜 합동인지 알아봅시다!',
        priority: 'high',
        duration: 4000
      });
    }
    
    if (attempts > 1) {
      messages.push({
        id: 'inquiry-multiple-attempts',
        type: 'encouragement',
        content: '괜찮아요! 다시 생각해보세요. 접었을 때 생긴 두 삼각형에 주목해보세요.',
        priority: 'low'
      });
    }
    
    return messages;
  }
  
  /**
   * Generate feedback for discovery step
   */
  private generateDiscoveryFeedback(context: FeedbackContext): FeedbackMessage[] {
    const messages: FeedbackMessage[] = [];
    const { collectedChips } = context;
    
    const validation = this.chipSystem.validateCollection(context.triangle, context.foldPoint);
    
    if (collectedChips.length === 0) {
      messages.push({
        id: 'discovery-start',
        type: 'instruction',
        content: '삼각형의 변과 각을 클릭해서 합동 조건을 찾아보세요!',
        priority: 'medium'
      });
    } else if (collectedChips.length === 1) {
      messages.push({
        id: 'discovery-first-chip',
        type: 'encouragement',
        content: '좋은 시작이에요! 더 찾아보세요.',
        priority: 'low',
        duration: 2000
      });
    } else if (collectedChips.length === 2) {
      messages.push({
        id: 'discovery-second-chip',
        type: 'hint',
        content: '좋아요! SAS 조건을 위해서는 변-각-변이 필요해요.',
        priority: 'medium',
        duration: 3000
      });
    } else if (validation.isValid) {
      messages.push({
        id: 'discovery-complete',
        type: 'success',
        content: `훌륭해요! ${validation.congruenceType} 합동 조건을 완성했습니다! 🎉`,
        priority: 'high',
        duration: 5000
      });
    } else {
      messages.push({
        id: 'discovery-progress',
        type: 'hint',
        content: validation.feedback,
        priority: 'medium',
        duration: 3000
      });
    }
    
    // Add specific hints for missing chips
    if (validation.missingChips.length > 0) {
      const nextHint = this.chipSystem.getNextHint(context.triangle, context.foldPoint);
      messages.push({
        id: 'discovery-next-hint',
        type: 'hint',
        content: nextHint,
        priority: 'low'
      });
    }
    
    return messages;
  }
  
  /**
   * Generate feedback for justification step
   */
  private generateJustificationFeedback(context: FeedbackContext): FeedbackMessage[] {
    const messages: FeedbackMessage[] = [];
    
    messages.push({
      id: 'justification-summary',
      type: 'success',
      content: '축하합니다! 이등변삼각형의 밑각이 같다는 중요한 성질을 발견했어요!',
      priority: 'high',
      duration: 6000,
      metadata: { achievement: 'base-angles-theorem' }
    });
    
    messages.push({
      id: 'justification-understanding',
      type: 'instruction',
      content: 'SAS 합동을 통해 ∠B = ∠C임을 증명했습니다. 이것이 바로 수학적 증명이에요!',
      priority: 'medium'
    });
    
    return messages;
  }
  
  /**
   * Generate time-based feedback for users who are stuck
   */
  private generateTimeBasedFeedback(context: FeedbackContext): FeedbackMessage {
    const timeMinutes = Math.floor((context.timeOnStep || 0) / 60);
    
    if (timeMinutes >= 2) {
      return {
        id: 'time-based-help',
        type: 'hint',
        content: '도움이 필요하신가요? 힌트 버튼을 눌러보세요!',
        priority: 'medium',
        actions: [
          {
            label: '힌트 보기',
            action: () => this.showStepHint(context.step),
            type: 'primary'
          }
        ]
      };
    }
    
    return {
      id: 'time-based-encouragement',
      type: 'encouragement',
      content: '천천히 해도 괜찮아요. 차근차근 해보세요!',
      priority: 'low'
    };
  }
  
  /**
   * Show step-specific hint
   */
  private showStepHint(step: LearningStep): void {
    const hints = {
      action: '슬라이더를 오른쪽으로 움직여서 삼각형을 접어보세요.',
      observation: '접힌 부분을 자세히 관찰하세요. 두 각이 어떻게 겹치는지 보세요.',
      inquiry: '접기를 통해 생긴 두 삼각형을 생각해보세요.',
      discovery: '변과 각에 주목하세요. AB=AC, AD는 공통변, 각은 이등분선으로 같아요.',
      justification: '합동인 삼각형의 대응각은 같다는 성질을 사용하세요.'
    };
    
    const hint = hints[step];
    
    this.addMessage({
      id: `hint-${step}`,
      type: 'hint',
      content: `💡 ${hint}`,
      priority: 'high',
      duration: 8000
    });
  }
  
  /**
   * Add a message manually
   */
  addMessage(message: FeedbackMessage): void {
    this.messages.set(message.id, message);
    this.messageHistory.push(message);
  }
  
  /**
   * Remove a message
   */
  removeMessage(messageId: string): void {
    this.messages.delete(messageId);
  }
  
  /**
   * Get all active messages
   */
  getActiveMessages(): FeedbackMessage[] {
    return Array.from(this.messages.values())
      .sort((a, b) => this.priorityOrder(b.priority) - this.priorityOrder(a.priority));
  }
  
  /**
   * Get message by ID
   */
  getMessage(messageId: string): FeedbackMessage | undefined {
    return this.messages.get(messageId);
  }
  
  /**
   * Clear all messages
   */
  clearMessages(): void {
    this.messages.clear();
  }
  
  /**
   * Get feedback history
   */
  getHistory(): FeedbackMessage[] {
    return [...this.messageHistory];
  }
  
  /**
   * Priority ordering helper
   */
  private priorityOrder(priority: FeedbackPriority): number {
    switch (priority) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }
  
  /**
   * Clean up expired messages
   */
  cleanup(): void {
    const now = Date.now();
    
    Array.from(this.messages.entries()).forEach(([id, message]) => {
      if (message.duration) {
        const messageTime = message.metadata?.timestamp || 0;
        if (now - messageTime > message.duration) {
          this.messages.delete(id);
        }
      }
    });
  }
}

/**
 * Get message styling based on type
 */
export function getMessageStyling(type: FeedbackType): MessageStyling {
  switch (type) {
    case 'success':
      return {
        backgroundColor: '#f0fdf4',
        borderColor: '#22c55e',
        textColor: '#15803d',
        icon: '✅'
      };
    case 'warning':
      return {
        backgroundColor: '#fffbeb',
        borderColor: '#f59e0b',
        textColor: '#d97706',
        icon: '⚠️'
      };
    case 'error':
      return {
        backgroundColor: '#fef2f2',
        borderColor: '#ef4444',
        textColor: '#dc2626',
        icon: '❌'
      };
    case 'hint':
      return {
        backgroundColor: '#eff6ff',
        borderColor: '#3b82f6',
        textColor: '#2563eb',
        icon: '💡'
      };
    case 'encouragement':
      return {
        backgroundColor: '#f3e8ff',
        borderColor: '#8b5cf6',
        textColor: '#7c3aed',
        icon: '🌟'
      };
    case 'discovery':
      return {
        backgroundColor: '#f0fdfa',
        borderColor: '#10b981',
        textColor: '#059669',
        icon: '🔍'
      };
    default:
      return {
        backgroundColor: '#f9fafb',
        borderColor: '#6b7280',
        textColor: '#374151',
        icon: 'ℹ️'
      };
  }
}

/**
 * Format message for display
 */
export function formatMessage(message: FeedbackMessage): {
  displayContent: string;
  styling: MessageStyling;
  shouldAnimate: boolean;
} {
  const styling = getMessageStyling(message.type);
  return {
    displayContent: `${styling.icon} ${message.content}`,
    styling,
    shouldAnimate: message.priority === 'high' || message.priority === 'critical'
  };
}

export const feedbackUtils = {
  getMessageStyling,
  formatMessage
};

/**
 * Create a new feedback manager
 */
export function createFeedbackManager(chipSystem: ChipSystemManager): FeedbackManager {
  return new FeedbackManager(chipSystem);
}