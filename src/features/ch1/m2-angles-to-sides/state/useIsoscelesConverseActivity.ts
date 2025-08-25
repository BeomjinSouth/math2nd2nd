'use client';

/**
 * useIsoscelesConverseActivity 훅
 * 이 파일은 ch1/m2 모듈의 상태와 진행 로직을 관리하기 위해 만들어졌습니다.
 * 의도는 m1과 동일한 전반부 흐름을 유지하되, 진행률 약 60% 이후에
 * 각의 이등분선 AD의 성질을 별도로 다루는 두 단계를 추가하는 것입니다.
 * 추가 단계는 AD ⟂ BC 확인과 BD = DC 확인입니다.
 */

import { useCallback, useMemo } from 'react';
import { useMachine } from '@xstate/react';
import { activityMachine, createLearningEngine, Triangle } from '@/core';

const ISOSCELES_TRIANGLE: Triangle = {
  A: { x: 2, y: 0.5 },
  B: { x: 1, y: 2.5 },
  C: { x: 3, y: 2.5 },
};

export const STEP_INSTRUCTIONS_M2 = {
  action: {
    title: '삼각형 접기',
    instruction: '삼각형 ABC를 반으로 접어보세요.',
    hint: '슬라이더를 움직여 접기 양을 조절하세요.',
  },
  observation: {
    title: '관찰하기',
    instruction: '접힌 두 부분이 어떻게 겹쳐지는지 관찰해보세요.',
    hint: '두 밑각이 겹치는 순간을 포착해보세요.',
  },
  inquiry: {
    title: '전략 세우기',
    instruction: '이제 왜 두 삼각형이 합동인지 생각해봅시다. 어떤 단서를 이용할 수 있을까요.',
    options: [
      { id: 'coincidence', label: '우연히 겹쳤다' },
      { id: 'congruence', label: '각의 이등분선과 공통변을 이용해 합동을 보일 수 있다' },
    ],
  },
  discovery: {
    title: '조건 발견하기',
    instruction: '삼각형의 요소를 클릭하여 단서를 수집해보세요.',
    hint: '∠B, ∠C, ∠A의 이등분선, 공통변 AD를 찾아보세요.',
  },
  perpendicular: {
    title: '수직 확인하기',
    instruction: '각의 이등분선 AD가 밑변 BC에 수직인지 확인해보세요.',
    hint: '접힘이 충분할 때 D에서 직각 표시를 확인할 수 있습니다.',
  },
  midpoint: {
    title: '중점 확인하기',
    instruction: 'AD가 밑변 BC를 이등분하는지 확인해보세요. BD와 DC가 같은지 살펴보세요.',
    hint: 'D를 기준으로 BC의 양쪽 길이가 같은지 눈금 표시를 확인하세요.',
  },
  justification: {
    title: '결론 도출하기',
    instruction: 'ASA 합동으로 △ABD와 △ACD가 합동임을 설명하고 AB = AC를 결론 내립니다.',
    hint: '합동이면 대응변의 길이는 같습니다.',
  },
} as const;

export type M2Step = keyof typeof STEP_INSTRUCTIONS_M2 | 'completed';

export function useIsoscelesConverseActivity() {
  const engine = useMemo(() => createLearningEngine(), []);
  const [machineState, send] = useMachine(activityMachine);

  // m1과 동일한 전반부 진행 제어를 위해 상태 파생
  const currentStep = useMemo<M2Step>(() => {
    if (machineState.matches('action')) return 'action';
    if (machineState.matches('observation')) return 'observation';
    if (machineState.matches('inquiry')) return 'inquiry';
    if (machineState.matches('discovery')) return 'discovery';
    if (machineState.matches('justification')) return 'justification';
    if (machineState.matches('completed')) return 'completed';
    return 'action';
  }, [machineState]);

  // m2 전용 진행률 계산: observation까지 40, inquiry 60, discovery 80, 이후 90, 100으로 조정
  const progressPercentage = useMemo(() => {
    const map: Record<string, number> = {
      action: 20,
      observation: 40,
      inquiry: 60,
      discovery: 80,
      justification: 100, // 실제 UI에서는 perpendicular, midpoint 사이 단계를 별도 카드로 보여줄 예정
      completed: 100,
    };
    return map[currentStep] ?? 0;
  }, [currentStep]);

  // 액션 바인딩
  const setFoldAngle = useCallback((angle: number) => send({ type: 'SET_FOLD_ANGLE', angle }), [send]);
  const selectAnswer = useCallback((answer: string) => send({ type: 'SELECT_ANSWER', answer }), [send]);
  const proceedToNext = useCallback(() => send({ type: 'PROCEED_TO_NEXT' }), [send]);
  const proceedToPrev = useCallback(() => send({ type: 'PROCEED_TO_PREV' }), [send]);
  // m2 전용: discovery 이후 결론으로 바로 이동
  const skipDiscoveryToJustification = useCallback(() => send({ type: 'SKIP_DISCOVERY' }), [send]);
  const resetModule = useCallback(() => { engine.chipSystem.reset(); send({ type: 'RESET_MODULE' }); }, [send, engine.chipSystem]);
  const highlightElements = useCallback((elements: string[]) => send({ type: 'HIGHLIGHT_ELEMENTS', elements }), [send]);

  // m2 전용 플래그: 수직 표시와 이등분 눈금 표시를 컨트롤
  const showPerpendicular = useMemo(() => machineState.context.foldAngle >= 85, [machineState.context.foldAngle]);
  const showMidpointTicks = useMemo(() => machineState.context.foldAngle >= 90, [machineState.context.foldAngle]);

  const actions = useMemo(() => ({ setFoldAngle, selectAnswer, proceedToNext, proceedToPrev, resetModule, highlightElements, skipDiscoveryToJustification }), [setFoldAngle, selectAnswer, proceedToNext, proceedToPrev, resetModule, highlightElements, skipDiscoveryToJustification]);

  // 칩 시스템 데이터 및 수집 액션 노출
  const chipSystemData = useMemo(() => {
    engine.chipSystem.updateAvailability(ISOSCELES_TRIANGLE);
    const availableChips = engine.chipSystem.getAvailableChips();
    const collectedChips = engine.chipSystem.getCollectedChips();
    const progress = engine.chipSystem.getProgress();
    const validation = engine.chipSystem.validateCollection(ISOSCELES_TRIANGLE);
    return { availableChips, collectedChips, progress, validation };
  }, [engine.chipSystem]);

  const collectChip = useCallback((chipId: string) => {
    engine.chipSystem.updateAvailability(ISOSCELES_TRIANGLE);
    engine.chipSystem.collectChip(chipId, ISOSCELES_TRIANGLE);
  }, [engine.chipSystem]);

  return {
    state: machineState.context,
    currentStep,
    currentInstruction: STEP_INSTRUCTIONS_M2[currentStep as keyof typeof STEP_INSTRUCTIONS_M2] ?? STEP_INSTRUCTIONS_M2.action,
    progressPercentage,
    canProceedToNext: true,
    isCompleted: machineState.matches('completed'),
    triangle: ISOSCELES_TRIANGLE,
    moduleId: 'ch1-m2',
    targetProperty: '꼭지각의 이등분선(접는 선)은 밑변을 수직이등분한다',
    actions: { ...actions, collectChip },
    // m2 전용 표시 컨트롤
    showPerpendicular,
    showMidpointTicks,
    chipSystem: chipSystemData,
  };
}


