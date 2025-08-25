/**
 * Gamified chip collection system for SAS congruence discovery
 * Handles chip availability, validation, and collection mechanics
 */

import { Triangle, Point, CongruenceCondition } from '../geometry/types';
import { isIsosceles } from '../geometry/triangle';

// Chip types and interfaces
export interface Chip {
  id: string;
  label: string;
  type: ChipType;
  collected: boolean;
  description: string;
  isAvailable: boolean;
  validationRule?: (triangle: Triangle, foldPoint?: Point) => boolean;
  hint?: string;
  order: number;
}

export type ChipType = 'side' | 'angle' | 'common' | 'given';

export interface ChipValidationResult {
  isValid: boolean;
  congruenceType: CongruenceCondition['type'] | null;
  missingChips: string[];
  completionPercentage: number;
  feedback: string;
}

// Chip system configuration
export const CHIP_DEFINITIONS: Readonly<Omit<Chip, 'collected' | 'isAvailable'>[]> = [
  {
    id: 'side-AB',
    label: '변 AB',
    type: 'given',
    description: '주어진 조건 (이등변삼각형)',
    hint: '이등변삼각형의 두 등변 중 하나',
    order: 1,
    validationRule: (triangle: Triangle) => isIsosceles(triangle)
  },
  {
    id: 'side-AC',
    label: '변 AC', 
    type: 'given',
    description: '주어진 조건 (이등변삼각형)',
    hint: '이등변삼각형의 두 등변 중 하나',
    order: 2,
    validationRule: (triangle: Triangle) => isIsosceles(triangle)
  },
  // 혼동을 줄 수 있는 요소들(대응 요소 파악용)
  {
    id: 'side-BC',
    label: '변 BC',
    type: 'side',
    description: '밑변. SAS에는 포함되지 않음',
    hint: '밑변 자체는 SAS에 직접 쓰이지 않습니다',
    order: 6,
    validationRule: () => true
  },
  {
    id: 'side-BD',
    label: '변 BD',
    type: 'side',
    description: '보조 변 BD. SAS에는 포함되지 않음',
    hint: '접은 선 D와 B를 잇는 선분입니다',
    order: 9,
    validationRule: () => true
  },
  {
    id: 'side-CD',
    label: '변 CD',
    type: 'side',
    description: '보조 변 CD. SAS에는 포함되지 않음',
    hint: '접은 선 D와 C를 잇는 선분입니다',
    order: 10,
    validationRule: () => true
  },
  {
    id: 'common-AD',
    label: '공통변 AD',
    type: 'common',
    description: '두 삼각형이 공유하는 변',
    hint: '접은 선이 만든 두 삼각형이 공통으로 가지는 변',
    order: 3,
    validationRule: () => true
  },
  {
    id: 'angle-BAD',
    label: '∠BAD',
    type: 'angle',
    description: '접은 선이 만드는 각',
    hint: '각의 이등분선이 만든 각 중 하나',
    order: 4,
    validationRule: () => true
  },
  {
    id: 'angle-CAD',
    label: '∠CAD',
    type: 'angle', 
    description: '접은 선이 만드는 각 (각의 이등분선)',
    hint: '각의 이등분선이 만든 각 중 하나',
    order: 5,
    validationRule: () => true
  },
  {
    id: 'angle-B',
    label: '∠B',
    type: 'angle',
    description: '밑각 B. 대응각 개념 확인용',
    hint: '밑각은 대응각 개념 이해에 사용됩니다',
    order: 7,
    validationRule: () => true
  },
  {
    id: 'angle-C',
    label: '∠C',
    type: 'angle',
    description: '밑각 C. 대응각 개념 확인용',
    hint: '밑각은 대응각 개념 이해에 사용됩니다',
    order: 8,
    validationRule: () => true
  }
];

// SAS condition patterns
export const SAS_PATTERNS = [
  {
    name: 'Standard SAS',
    requiredChips: ['side-AB', 'side-AC', 'common-AD', 'angle-BAD', 'angle-CAD'].slice(0,3),
    description: '변-각-변 순서로 배치된 SAS 조건'
  },
  {
    name: 'Alternative SAS',
    requiredChips: ['side-AB', 'side-AC', 'common-AD', 'angle-BAD', 'angle-CAD'].filter(id => id !== 'angle-BAD').slice(0,3),
    description: '다른 방향의 변-각-변 SAS 조건'
  },
  {
    name: 'Complete SAS',
    requiredChips: ['side-AB', 'side-AC', 'common-AD'],
    description: '두 등변과 공통변'
  }
];

/**
 * UI 요소 ID ↔ 칩 ID 매핑(SAS 모듈 전용)
 */
export const SAS_UI_TO_CHIP: Record<string, string | undefined> = {
  'side-AB': 'side-AB',
  'side-AC': 'side-AC',
  'side-BC': 'side-BC',
  'fold-line': 'common-AD',
  'angle-A': 'angle-BAD',
  'angle-A-left': 'angle-BAD',
  'angle-A-right': 'angle-CAD',
  'angle-B': 'angle-B',
  'angle-C': 'angle-C',
  'side-BD': 'side-BD',
  'side-CD': 'side-CD',
};

/**
 * Chip system manager class
 */
export class ChipSystemManager {
  private chips: Map<string, Chip> = new Map();
  private collectedChips: Set<string> = new Set();
  
  constructor() {
    this.initializeChips();
  }
  
  /**
   * Initialize chips with default state
   */
  private initializeChips(): void {
    CHIP_DEFINITIONS.forEach(chipDef => {
      const chip: Chip = {
        ...chipDef,
        collected: false,
        isAvailable: false
      };
      this.chips.set(chip.id, chip);
    });
  }
  
  /**
   * Update chip availability based on current triangle state
   */
  updateAvailability(triangle: Triangle, foldPoint?: Point): void {
    this.chips.forEach((chip, id) => {
      if (chip.validationRule) {
        const isAvailable = chip.validationRule(triangle, foldPoint);
        this.chips.set(id, { ...chip, isAvailable });
      } else {
        this.chips.set(id, { ...chip, isAvailable: true });
      }
    });
  }
  
  /**
   * Collect a chip if it's available and valid
   */
  collectChip(chipId: string, triangle: Triangle, foldPoint?: Point): boolean {
    const chip = this.chips.get(chipId);
    
    if (!chip || chip.collected || !chip.isAvailable) {
      return false;
    }
    
    // Additional validation based on current state
    if (chip.validationRule && !chip.validationRule(triangle, foldPoint)) {
      return false;
    }
    
    // Update chip state
    this.chips.set(chipId, { ...chip, collected: true });
    this.collectedChips.add(chipId);
    
    return true;
  }
  
  /**
   * Remove a collected chip (for corrections)
   */
  uncollectChip(chipId: string): boolean {
    const chip = this.chips.get(chipId);
    
    if (!chip || !chip.collected) {
      return false;
    }
    
    this.chips.set(chipId, { ...chip, collected: false });
    this.collectedChips.delete(chipId);
    
    return true;
  }
  
  /**
   * Get all available chips
   */
  getAvailableChips(): Chip[] {
    return Array.from(this.chips.values())
      .filter(chip => chip.isAvailable)
      .sort((a, b) => a.order - b.order);
  }
  
  /**
   * Get collected chips
   */
  getCollectedChips(): Chip[] {
    return Array.from(this.chips.values())
      .filter(chip => chip.collected)
      .sort((a, b) => a.order - b.order);
  }
  
  /**
   * Get chip by ID
   */
  getChip(chipId: string): Chip | undefined {
    return this.chips.get(chipId);
  }
  
  /**
   * Validate current chip combination
   */
  validateCollection(triangle: Triangle, foldPoint?: Point): ChipValidationResult {
    const collectedIds = Array.from(this.collectedChips);
    
    const validation = validateChipCombination(collectedIds);
    
    let feedback = '';
    let completionPercentage = 0;
    
    if (validation.isValid) {
      feedback = `완벽합니다! ${validation.congruenceType} 합동 조건을 모두 찾았습니다.`;
      completionPercentage = 100;
    } else {
      const missing = validation.missingChips;
      completionPercentage = Math.round((collectedIds.length / 4) * 100);
      
      if (missing.length === 1) {
        feedback = `거의 다 했어요! ${this.getChipLabel(missing[0])}이(가) 더 필요합니다.`;
      } else if (missing.length <= 2) {
        feedback = `좋은 시작이에요! ${missing.length}개의 조건이 더 필요합니다.`;
      } else {
        feedback = '더 많은 조건을 찾아보세요!';
      }
    }
    
    return {
      isValid: validation.isValid,
      congruenceType: validation.congruenceType,
      missingChips: validation.missingChips,
      completionPercentage,
      feedback
    };
  }
  
  /**
   * Get chip label by ID
   */
  private getChipLabel(chipId: string): string {
    const chip = this.chips.get(chipId);
    return chip ? chip.label : chipId;
  }
  
  /**
   * Check if SAS pattern is complete
   */
  checkSASCompletion(): boolean {
    const collectedIds = Array.from(this.collectedChips);
    
    return SAS_PATTERNS.some(pattern => 
      pattern.requiredChips.every(chipId => collectedIds.includes(chipId))
    );
  }
  
  /**
   * Get hint for next chip to collect
   */
  getNextHint(triangle: Triangle, foldPoint?: Point): string {
    const validation = this.validateCollection(triangle, foldPoint);
    
    if (validation.isValid) {
      return '모든 조건을 찾았습니다! 다음 단계로 진행하세요.';
    }
    
    if (validation.missingChips.length > 0) {
      const nextChip = this.chips.get(validation.missingChips[0]);
      if (nextChip) {
        return nextChip.hint || `${nextChip.label}을(를) 찾아보세요.`;
      }
    }
    
    return '삼각형의 변과 각을 클릭해서 조건을 찾아보세요!';
  }
  
  /**
   * Reset chip system
   */
  reset(): void {
    this.collectedChips.clear();
    this.chips.forEach((chip, id) => {
      this.chips.set(id, { ...chip, collected: false, isAvailable: false });
    });
  }
  
  /**
   * Get progress statistics
   */
  getProgress(): {
    collected: number;
    available: number;
    total: number;
    percentage: number;
  } {
    const available = this.getAvailableChips().length;
    const collected = this.collectedChips.size;
    const total = this.chips.size;
    
    return {
      collected,
      available,
      total,
      percentage: total > 0 ? Math.round((collected / total) * 100) : 0
    };
  }
  
  /**
   * Export chip state for persistence
   */
  exportState(): {
    collectedChips: string[];
    chipStates: Record<string, { collected: boolean; isAvailable: boolean }>;
  } {
    const chipStates: Record<string, { collected: boolean; isAvailable: boolean }> = {};
    
    this.chips.forEach((chip, id) => {
      chipStates[id] = {
        collected: chip.collected,
        isAvailable: chip.isAvailable
      };
    });
    
    return {
      collectedChips: Array.from(this.collectedChips),
      chipStates
    };
  }
  
  /**
   * Import chip state from persistence
   */
  importState(state: {
    collectedChips: string[];
    chipStates: Record<string, { collected: boolean; isAvailable: boolean }>;
  }): void {
    this.collectedChips.clear();
    state.collectedChips.forEach(id => this.collectedChips.add(id));
    
    Object.entries(state.chipStates).forEach(([id, chipState]) => {
      const chip = this.chips.get(id);
      if (chip) {
        this.chips.set(id, {
          ...chip,
          collected: chipState.collected,
          isAvailable: chipState.isAvailable
        });
      }
    });
  }
}

/**
 * Create a new chip system instance
 */
export function createChipSystem(): ChipSystemManager {
  return new ChipSystemManager();
}

/**
 * Utility functions for chip interactions
 */
export const chipUtils = {
  /**
   * Get chip color based on type
   */
  getChipColor(type: ChipType): string {
    switch (type) {
      case 'side': return '#3b82f6';      // Blue
      case 'angle': return '#f59e0b';     // Amber
      case 'common': return '#10b981';    // Emerald
      case 'given': return '#8b5cf6';     // Violet
      default: return '#6b7280';          // Gray
    }
  },
  
  /**
   * Get chip icon based on type
   */
  getChipIcon(type: ChipType): string {
    switch (type) {
      case 'side': return '📏';
      case 'angle': return '📐';
      case 'common': return '🔗';
      case 'given': return '✨';
      default: return '🔘';
    }
  },
  
  /**
   * Format chip for display
   */
  formatChip(chip: Chip): {
    displayLabel: string;
    color: string;
    icon: string;
  } {
    return {
      displayLabel: chip.label,
      color: chipUtils.getChipColor(chip.type),
      icon: chipUtils.getChipIcon(chip.type)
    };
  }
};

/**
 * Check if a set of chip IDs completes SAS requirement
 */
export function isSASChipSetComplete(collectedChipIds: string[]): boolean {
  // BAD와 CAD는 동시에 요구되며, AB와 AC가 함께 요구되고, AD는 단독으로 요구됩니다.
  const hasAngles = collectedChipIds.includes('angle-BAD') && collectedChipIds.includes('angle-CAD');
  const hasSides = collectedChipIds.includes('side-AB') && collectedChipIds.includes('side-AC');
  const hasCommon = collectedChipIds.includes('common-AD');
  return hasAngles && hasSides && hasCommon;
}

/**
 * Validate if collected chips satisfy SAS for the isosceles folding module
 */
function validateChipCombination(collectedChipIds: string[]): {
  isValid: boolean;
  congruenceType: CongruenceCondition['type'] | null;
  missingChips: string[];
} {
  const required = ['angle-BAD', 'angle-CAD', 'side-AB', 'side-AC', 'common-AD'];
  const missing = required.filter(id => !collectedChipIds.includes(id));
  const isValid = missing.length === 0;
  return { isValid, congruenceType: isValid ? 'SAS' : null, missingChips: missing };
}