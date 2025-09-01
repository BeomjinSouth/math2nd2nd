/**
 * RHA 합동 모듈의 타입 정의 파일
 * 이 파일은 RHA 합동 시각적 탐구 시스템에서 사용되는 모든 타입을 정의합니다.
 * 의도는 GameState, Point 등 핵심 타입들을 통해 
 * 직각-빗변-예각 조건을 시각적으로 체험할 수 있는 인터페이스를 제공하는 것입니다.
 */

/**
 * 게임의 진행 상태를 나타내는 열거형
 * - Idle: 초기 상태, 사용자가 빗변을 선택하기를 기다리는 상태
 * - Sliding: 사용자가 슬라이더로 삼각형을 조작하는 상태  
 * - Success: RHA 조건이 만족되어 합동이 성립한 상태
 */
export enum GameState {
  Idle = 'idle',
  Sliding = 'sliding', 
  Success = 'success'
}

/**
 * 2D 좌표를 나타내는 점 타입
 * SVG 좌표계에서 사용되는 x, y 좌표값을 담습니다.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * RHA 활동 상태를 관리하는 인터페이스
 * 사용자의 상호작용과 시각적 피드백을 위한 모든 상태 정보를 포함합니다.
 */
export interface RhaActivityState {
  /** 현재 게임 진행 상태 */
  gameState: GameState;
  
  /** 참조 삼각형의 꼭짓점들 */
  triangleA: Point;
  triangleB: Point;
  triangleC: Point;
  
  /** 실제 정답값들 (목표값) */
  trueH: number;      // 실제 빗변의 길이
  trueTheta: number;  // 실제 목표 각도 (도 단위)
  
  /** 사용자가 조작하는 현재 값들 */
  h: number;          // 현재 빗변 길이
  theta: number;      // 현재 각도 (도 단위)
  e: number;          // E점의 위치 (슬라이더로 조작)
  
  /** 계산된 점 F의 좌표 */
  F: Point;
  
  /** E 슬라이더의 최대값 */
  eMax: number;
  
  /** 목표 E 값 (정답 위치) */
  targetE: number;
}

/**
 * RHA 활동에서 사용 가능한 액션들의 인터페이스
 * 사용자 상호작용에 대응하는 모든 액션 함수들을 정의합니다.
 */
export interface RhaActivityActions {
  /** 빗변 선택 시 호출되는 액션 */
  handleHypotenuseSelect: () => void;
  
  /** E 슬라이더 값 변경 시 호출되는 액션 */
  onSliderChange: (newE: number) => void;
  
  /** 각도 슬라이더 값 변경 시 호출되는 액션 */
  onThetaSliderChange: (newTheta: number) => void;
  
  /** 새로운 삼각형 생성 (재시작) 액션 */
  onReset: () => void;
}

/**
 * 참조 삼각형 컴포넌트의 Props 인터페이스
 */
export interface ReferenceTriangleProps {
  A: Point;
  B: Point;
  C: Point;
  onHypotenuseSelect: () => void;
  gameState: GameState;
}

/**
 * 구성 영역 컴포넌트의 Props 인터페이스  
 */
export interface ConstructionAreaProps {
  e: number;
  h: number;
  theta: number;
  F: Point;
  gameState: GameState;
}

/**
 * 제어판 컴포넌트의 Props 인터페이스
 */
export interface ControlPanelProps {
  gameState: GameState;
  h: number;
  theta: number;
  trueTheta: number;
  e: number;
  eMax: number;
  F: Point;
  thetaAdjusted: boolean;
  onSliderChange: (value: number) => void;
  onThetaSliderChange: (value: number) => void;
  onReset: () => void;
}
