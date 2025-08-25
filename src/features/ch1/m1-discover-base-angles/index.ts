/**
 * Isosceles Base Angles Feature Exports
 * Feature-based module for discovering base angle equality in isosceles triangles
 */

// Main feature component
export { default as IsoscelesBaseAnglesFeature } from './components/IsoscelesBaseAnglesFeature';

// State management hooks
export { useIsoscelesActivity, STEP_INSTRUCTIONS } from './state/useIsoscelesActivity';

// Feature metadata
export const ISOSCELES_BASE_ANGLES_FEATURE_INFO = {
  id: 'ch1-m1',
  title: '이등변삼각형의 두 밑각',
  description: '두 변의 길이가 같은 삼각형의 두 밑각의 크기가 같은 이유를 탐구합니다.',
  category: '기하학',
  difficulty: 'beginner',
  estimatedDuration: '10-15분',
  learningObjectives: [
    '이등변삼각형의 정의를 이해한다',
    '종이접기를 통해 두 밑각이 겹침을 관찰한다',
    'SAS 합동 조건을 발견한다',
    '합동을 이용하여 두 밑각이 같음을 논리적으로 설명한다'
  ],
  prerequisites: [
    '삼각형의 기본 개념',
    '각의 개념',
    '합동의 기본 개념'
  ],
  tags: ['이등변삼각형', '합동', 'SAS', '종이접기', '탐구학습']
};

// Feature type definitions
export interface FeatureCompletionResult {
  moduleId: string;
  completedAt: Date;
  score?: number;
  timeSpent?: number;
  hintsUsed?: number;
  attempts?: number;
}

export interface FeatureProps {
  userId?: string;
  onComplete?: (result: FeatureCompletionResult) => void;
  initialState?: Record<string, unknown>;
}