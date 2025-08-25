'use client';

import { useMachine } from '@xstate/react';
import { activityMachine, createLearningEngine, Triangle, isSASChipSetComplete } from '@/core';
import { useMemo, useCallback } from 'react';

const ISOSCELES_TRIANGLE: Triangle = {
  A: { x: 2, y: 0.5 },
  B: { x: 1, y: 2.5 },
  C: { x: 3, y: 2.5 },
};

export const STEP_INSTRUCTIONS = {
  action: {
    title: '삼각형 접기',
    instruction: '꼭지각 A를 반으로 접어 밑변 BC와 만나게 해보세요.',
    hint: '슬라이더를 움직여서 삼각형을 접어보세요!',
  },
  observation: {
    title: '관찰하기',
    instruction: '접힌 두 부분이 어떻게 겹쳐지는지 관찰해보세요.',
    hint: '두 밑각(∠B와 ∠C)이 완전히 겹쳐지나요?',
  },
  inquiry: {
    title: '질문하기',
    instruction: '두 밑각이 완전히 겹쳐지는 이유는 무엇일까요?',
    options: [
      { id: 'coincidence', label: '원래부터 우연히 같았다' },
      { id: 'congruence', label: '접어서 생긴 두 직각 삼각형이 완전히 똑같이 생겼기(합동) 때문이다' },
    ],
  },
  discovery: {
    title: '조건 발견하기',
    instruction: '삼각형 ABD와 ACD는 왜 합동일까요? 변과 각을 클릭해서 조건을 찾아보세요!',
    hint: 'SAS 조건을 찾아보세요',
  },
  justification: {
    title: '결론 도출하기',
    instruction:
      '따라서, 합동인 두 삼각형의 대응각인 ∠B와 ∠C의 크기는 같습니다.',
  },
} as const;

export function useIsoscelesActivity(userId?: string) {
  const engine = useMemo(() => createLearningEngine(), []);
  const [machineState, send] = useMachine(activityMachine);

  const currentStep = useMemo(() => {
    if (machineState.matches('action')) return 'action';
    if (machineState.matches('observation')) return 'observation';
    if (machineState.matches('inquiry')) return 'inquiry';
    if (machineState.matches('discovery')) return 'discovery';
    if (machineState.matches('misconception')) return 'misconception';
    if (machineState.matches('justification')) return 'justification';
    if (machineState.matches('completed')) return 'completed';
    return 'action';
  }, [machineState]);

  // === 액션들 ===
  const setFoldAngle = useCallback(
    (angle: number) => {
      // XState v5 문법으로 수정된 SET_FOLD_ANGLE 이벤트 전송
      send({ type: 'SET_FOLD_ANGLE', angle });
    },
    [send]
  );

  const collectChip = useCallback(
    (chipId: string) => {
      engine.chipSystem.updateAvailability(ISOSCELES_TRIANGLE);
      if (engine.chipSystem.collectChip(chipId, ISOSCELES_TRIANGLE)) {
        send({ type: 'COLLECT_CHIP', chipId });
      }
    },
    [send, engine.chipSystem]
  );

  const selectAnswer = useCallback(
    (answer: string) => send({ type: 'SELECT_ANSWER', answer }),
    [send]
  );

  const proceedToNext = useCallback(() => send({ type: 'PROCEED_TO_NEXT' }), [send]);

  const resetModule = useCallback(() => {
    engine.chipSystem.reset();
    send({ type: 'RESET_MODULE' });
  }, [send, engine.chipSystem]);

  const highlightElements = useCallback(
    (elements: string[]) => send({ type: 'HIGHLIGHT_ELEMENTS', elements }),
    [send]
  );

  const requestHint = useCallback(() => {
    console.log('Hint requested for step:', currentStep, 'user:', userId);
    return [];
  }, [currentStep, userId]);

  const actions = useMemo(
    () => ({
      setFoldAngle,
      collectChip,
      selectAnswer,
      proceedToNext,
      proceedToPrev: () => send({ type: 'PROCEED_TO_PREV' }),
      resetModule,
      highlightElements,
      requestHint,
    }),
    [
      setFoldAngle,
      collectChip,
      selectAnswer,
      proceedToNext,
      send,
      resetModule,
      highlightElements,
      requestHint,
    ]
  );

  const progressPercentage = useMemo(() => {
    const steps = ['action', 'inquiry', 'discovery', 'misconception', 'justification', 'completed'];
    const idx = steps.indexOf(currentStep);
    return (idx / (steps.length - 1)) * 100;
  }, [currentStep]);

  const canProceedToNext = useMemo(() => {
    const ctx = machineState.context;
    switch (currentStep) {
      case 'action':
        return ctx.foldAngle >= 90;
      case 'inquiry':
        return ctx.selectedAnswer === 'congruence';
      case 'discovery': {
        const ids = engine.chipSystem.getCollectedChips().map(c => c.id);
        return isSASChipSetComplete(ids);
      }
      case 'misconception':
        return true; // 오개념 단계는 진행 제한 없음
      case 'justification':
        return true;
      default:
        return false;
    }
  }, [currentStep, machineState.context, engine.chipSystem]);

  const chipSystemData = useMemo(() => {
    engine.chipSystem.updateAvailability(ISOSCELES_TRIANGLE);
    const availableChips = engine.chipSystem.getAvailableChips();
    const collectedChips = engine.chipSystem.getCollectedChips();
    const progress = engine.chipSystem.getProgress();
    const validation = engine.chipSystem.validateCollection(ISOSCELES_TRIANGLE);
    return { availableChips, collectedChips, progress, validation };
    // react-hooks/exhaustive-deps를 비활성화하여 XState 상태 변경 시 재계산되도록 강제합니다.
    // 상태 전이가 일어날 때 machineState가 바뀌므로 메모가 갱신됩니다.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.chipSystem, machineState]);

  return {
    state: machineState.context, // UI에서는 context만 쓰도록 유지
    currentStep,
    currentInstruction:
      STEP_INSTRUCTIONS[currentStep as keyof typeof STEP_INSTRUCTIONS] ||
      STEP_INSTRUCTIONS.action,
    progressPercentage,
    canProceedToNext,
    isCompleted: machineState.matches('completed'),
    triangle: ISOSCELES_TRIANGLE,
    moduleId: 'ch1-m1',
    targetProperty: '첫번째 성질. 이등변삼각형의 두 밑각은 크기가 같다',
    actions,
    chipSystem: chipSystemData,
  };
}
