/**
 * XState activity machine for learning module state management (engine scope)
 */
import { assign, createMachine, interpret } from 'xstate';
import { SAS_PATTERNS, CHIP_DEFINITIONS } from './chip-system';

export type LearningStep =
  | 'action'
  | 'inquiry'
  | 'discovery'
  | 'misconception'
  | 'justification';

interface ActivityContext {
  foldAngle: number;
  collectedChips: string[];
  selectedAnswer: string | null;
  highlightedElements: string[];
  stepCompletion: Record<LearningStep, boolean>;
  error: string | null;
  completedAt?: Date;
}

type ActivityEvent =
  | { type: 'SET_FOLD_ANGLE'; angle: number }
  | { type: 'COLLECT_CHIP'; chipId: string }
  | { type: 'SELECT_ANSWER'; answer: string }
  | { type: 'HIGHLIGHT_ELEMENTS'; elements: string[] }
  | { type: 'COMPLETE_STEP' }
  | { type: 'PROCEED_TO_NEXT' }
  | { type: 'PROCEED_TO_PREV' }
  | { type: 'RESET_MODULE' }
  | { type: 'VALIDATE_PROGRESS' }
  | { type: 'SKIP_DISCOVERY' }
  | { type: 'BACK_TO_DISCOVERY' }
  | { type: 'ERROR'; error: string };

const initialContext: ActivityContext = {
  foldAngle: 0,
  collectedChips: [],
  selectedAnswer: null,
  highlightedElements: [],
  stepCompletion: {
    action: false,
    inquiry: false,
    discovery: false,
    misconception: false,
    justification: false,
  },
  error: null,
};

const guards = {
  canProceedFromAction: ({ context }: { context: ActivityContext }) => context.foldAngle >= 90,
  canProceedFromInquiry: ({ context }: { context: ActivityContext }) => context.selectedAnswer === 'congruence',
  canProceedFromDiscovery: ({ context }: { context: ActivityContext }) => {
    const ids = context.collectedChips;
    return SAS_PATTERNS.some(p => p.requiredChips.every(id => ids.includes(id)));
  },
  hasValidChip: ({ context, event }: { context: ActivityContext; event: ActivityEvent }) => {
    if (event.type !== 'COLLECT_CHIP') return false;
    const validIds = CHIP_DEFINITIONS.map(c => c.id);
    return validIds.includes(event.chipId) && !context.collectedChips.includes(event.chipId);
  },
};

const actions = {
  setFoldAngle: assign({
    foldAngle: ({ context, event }) => {
      if (event?.type === 'SET_FOLD_ANGLE' && typeof event.angle === 'number') {
        const a = event.angle;
        console.log('[XState] 🔄 setFoldAngle assign 실행', { 
          inputAngle: a, 
          clampedAngle: Math.max(0, Math.min(180, a)),
          previousAngle: context.foldAngle 
        });
        return Math.max(0, Math.min(180, a));
      }
      console.log('[XState] ❌ setFoldAngle assign 실패', { event, eventType: event?.type });
      return context.foldAngle;
    },
  }),
  collectChip: assign({
    collectedChips: ({ context, event }) => {
      if (event.type === 'COLLECT_CHIP' && !context.collectedChips.includes(event.chipId)) {
        return [...context.collectedChips, event.chipId];
      }
      return context.collectedChips;
    },
  }),
  selectAnswer: assign({
    selectedAnswer: ({ context, event }) =>
      event.type === 'SELECT_ANSWER' ? event.answer : context.selectedAnswer,
  }),
  highlightElements: assign({
    highlightedElements: ({ context, event }) => {
      if (event.type !== 'HIGHLIGHT_ELEMENTS') return context.highlightedElements;
      const prev = Array.isArray(context.highlightedElements) ? context.highlightedElements : [];
      const next = Array.isArray(event.elements) ? event.elements : [];
      return Array.from(new Set([...(prev as string[]), ...(next as string[])]));
    },
  }),
  // ✅ 각 단계별 완료 마킹 액션을 분리하여 정확히 기록합니다.
  markActionCompleted: assign({
    stepCompletion: ({ context }) => ({ ...context.stepCompletion, action: true }),
  }),
  markInquiryCompleted: assign({
    stepCompletion: ({ context }) => ({ ...context.stepCompletion, inquiry: true }),
  }),
  markDiscoveryCompleted: assign({
    stepCompletion: ({ context }) => ({ ...context.stepCompletion, discovery: true }),
  }),
  markJustificationCompleted: assign({
    stepCompletion: ({ context }) => ({ ...context.stepCompletion, justification: true }),
  }),
  setError: assign({
    error: ({ event }) =>
      event.type === 'ERROR' ? event.error : null,
  }),
  clearError: assign({ error: () => null }),
  resetToInitial: assign(() => initialContext),
  markCompleted: assign({ completedAt: () => new Date() }),
};

export const activityMachine = createMachine(
  {
    id: 'learning-activity',
    initial: 'action',
    context: initialContext,
    types: {} as { context: ActivityContext; events: ActivityEvent },

    // ✅ 모든 상태에서 접기 각도 업데이트 허용
    on: {
      SET_FOLD_ANGLE: { actions: ['setFoldAngle'] },
    },

    states: {
      action: {
        on: {
          COMPLETE_STEP: [
            { target: 'inquiry', actions: ['markActionCompleted'], guard: 'canProceedFromAction' },
            { actions: ['setError'], target: 'action' },
          ],
          PROCEED_TO_NEXT: { target: 'inquiry', guard: 'canProceedFromAction', actions: ['markActionCompleted'] },
          HIGHLIGHT_ELEMENTS: { actions: ['highlightElements'] },
          RESET_MODULE: { target: 'action', actions: ['resetToInitial'] },
          ERROR: { actions: ['setError'] },
        },
        entry: ['clearError'],
        meta: {
          title: '삼각형 접기',
          instruction: '꼭지각 A를 반으로 접어 밑변 BC와 만나게 해보세요.',
          hint: '슬라이더를 움직여서 삼각형을 접어보세요!',
        },
      },

      inquiry: {
        on: {
          SELECT_ANSWER: { actions: ['selectAnswer'] },
          COMPLETE_STEP: [
            { target: 'discovery', actions: ['markInquiryCompleted'], guard: 'canProceedFromInquiry' },
            { actions: ['setError'] },
          ],
          PROCEED_TO_NEXT: { target: 'discovery', guard: 'canProceedFromInquiry', actions: ['markInquiryCompleted'] },
          PROCEED_TO_PREV: { target: 'action' },
          RESET_MODULE: { target: 'action', actions: ['resetToInitial'] },
        },
        meta: {
          title: '질문하기',
          instruction: '두 밑각이 완전히 겹쳐지는 이유는 무엇일까요?',
          options: [
            { id: 'coincidence', label: '원래부터 우연히 같았다' },
            { id: 'congruence', label: '접어서 생긴 두 직각 삼각형이 완전히 똑같이 생겼기(합동) 때문이다' },
          ],
        },
      },

      discovery: {
        on: {
          COLLECT_CHIP: { actions: ['collectChip'], guard: 'hasValidChip' },
          COMPLETE_STEP: [
            { target: 'misconception', actions: ['markDiscoveryCompleted'], guard: 'canProceedFromDiscovery' },
            { actions: ['setError'] },
          ],
          PROCEED_TO_NEXT: { target: 'misconception', guard: 'canProceedFromDiscovery', actions: ['markDiscoveryCompleted'] },
          // ✅ 특정 모듈(m2)에서는 발견 단계 후 곧바로 결론으로 넘어가도록 허용합니다.
          SKIP_DISCOVERY: { target: 'justification', actions: ['markDiscoveryCompleted'] },
          HIGHLIGHT_ELEMENTS: { actions: ['highlightElements'] },
          PROCEED_TO_PREV: { target: 'inquiry' },
          RESET_MODULE: { target: 'action', actions: ['resetToInitial'] },
        },
        meta: {
          title: '조건 발견하기',
          instruction: '삼각형 ABD와 ACD는 왜 합동일까요? 합동 조건을 찾아보세요!',
          hint: '삼각형의 변과 각을 클릭하여 SAS 조건을 찾아보세요.',
        },
      },

      misconception: {
        on: {
          SELECT_ANSWER: { actions: ['selectAnswer'] },
          PROCEED_TO_NEXT: { target: 'justification' },
          PROCEED_TO_PREV: { target: 'discovery' },
          RESET_MODULE: { target: 'action', actions: ['resetToInitial'] },
        },
        meta: {
          title: '오개념 점검',
          instruction: 'BD와 CD의 길이를 근거로 SSS 합동을 주장하는 것이 왜 타당하지 않은지 생각해보세요.',
        },
      },

      justification: {
        on: {
          COMPLETE_STEP: { target: 'completed', actions: ['markJustificationCompleted', 'markCompleted'] },
          BACK_TO_DISCOVERY: { target: 'discovery' },
          PROCEED_TO_PREV: { target: 'misconception' },
          RESET_MODULE: { target: 'action', actions: ['resetToInitial'] },
        },
        meta: {
          title: '결론 도출하기',
          instruction: '따라서, 합동인 두 삼각형의 대응각인 ∠B와 ∠C의 크기는 같습니다.',
        },
      },

      completed: {
        on: {
          RESET_MODULE: { target: 'action', actions: ['resetToInitial'] },
        },
        meta: {
          title: '완료!',
          instruction: '모든 단계를 완료했습니다.',
          hint: '다시 도전하려면 리셋 버튼을 누르세요.',
        },
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { guards: guards as any, actions: actions as any }
);

/**
 * ✅ engine/index.ts에서 import하는 헬퍼 (필요해서 다시 추가)
 * 해석기(Interpreter)를 만들어 반환합니다. 훅이 아니라 서비스 인스턴스가 필요한 곳에서 사용.
 */
export function createActivityService() {
   return interpret(activityMachine).start();
}
