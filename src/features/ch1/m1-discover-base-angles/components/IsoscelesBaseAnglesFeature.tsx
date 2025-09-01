/**
 * Isosceles Base Angles Discovery Feature - Main Learning Component
 * 
 * This is the main React component that students interact with to learn about
 * isosceles triangles. It provides a complete interactive learning experience
 * with 5 educational steps:
 * 
 * 1. **Action**: Student folds triangle using a slider
 * 2. **Observation**: Student observes that base angles overlap
 * 3. **Inquiry**: Student answers why angles overlap (multiple choice)
 * 4. **Discovery**: Student clicks triangle parts to find SAS conditions
 * 5. **Justification**: Student sees the final mathematical conclusion
 * 
 * **Key Features:**
 * - Interactive triangle that responds to folding
 * - Animated transitions between learning steps
 * - Chip collection system for discovering mathematical conditions
 * - Progress tracking and completion handling
 * - Responsive design that works on different screen sizes
 * - Korean language interface for Korean students
 * 
 * **Educational Theory:**
 * Based on discovery learning principles where students learn by doing
 * rather than being told facts. The component guides students through
 * hands-on exploration that leads to mathematical understanding.
 * 
 * @component
 * @example
 * ```tsx
 * // Basic usage in a learning management system
 * <IsoscelesBaseAnglesFeature 
 *   userId="student123"
 *   onComplete={(result) => {
 *     console.log(`Student completed module ${result.moduleId} with score ${result.score}`);
 *     // Save progress to database, show celebration, etc.
 *   }}
 * />
 * ```
 */

'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Triangle, TriangleElement } from '@/components/Triangle';
import { FoldSlider } from '@/components/Slider';
import { ChipSystem } from '@/components/ChipSystem';
import { useIsoscelesActivity } from '../state/useIsoscelesActivity';
import { SAS_UI_TO_CHIP } from '@/core';

/**
 * Props for the IsoscelesBaseAnglesFeature component
 * 
 * @interface IsoscelesBaseAnglesFeatureProps
 */
interface IsoscelesBaseAnglesFeatureProps {
  /**
   * Optional unique identifier for the student using this component
   * 
   * This can be used for:
   * - Tracking individual student progress
   * - Personalizing the learning experience
   * - Saving learning analytics data
   * - Resuming previous learning sessions
   * 
   * If not provided, the component works in "anonymous" mode.
   * 
   * @example "student123" or "user-abc-def-123"
   */
  userId?: string;
  
  /**
   * Callback function called when student completes the entire learning module
   * 
   * This function receives detailed information about the completion:
   * - moduleId: Which learning module was completed
   * - completedAt: Exact timestamp of completion
   * - score: Optional performance score (0-100)
   * 
   * Use this to:
   * - Save progress to a database
   * - Show celebration animations
   * - Unlock next modules
   * - Update student's learning record
   * - Send notifications to teachers/parents
   * 
   * @example
   * ```tsx
   * const handleModuleComplete = (result) => {
   *   // Save to database
   *   saveStudentProgress({
   *     studentId: "student123",
   *     moduleId: result.moduleId,
   *     completedAt: result.completedAt,
   *     score: result.score
   *   });
   *   
   *   // Show success message
   *   showNotification(`Congratulations! You scored ${result.score}%`);
   *   
   *   // Navigate to next module
   *   router.push('/modules/ch1-m2');
   * };
   * ```
   */
  onComplete?: (result: {
    moduleId: string;
    completedAt: Date;
    score?: number;
  }) => void;
  /**
   * 설문조사용 구글 폼 URL입니다. 제공되면 완료하기 클릭 시 새 탭으로 열리거나,
   * embedSurvey가 true인 경우 완료 모달에 임베드됩니다.
   */
  surveyUrl?: string;
  /**
   * true이면 완료 모달에 구글 폼을 iframe으로 임베드합니다. 기본값은 false입니다.
   */
  embedSurvey?: boolean;
}

/**
 * Main component implementation
 * 
 * This component orchestrates the entire learning experience by:
 * 1. Managing state through XState machine (useIsoscelesActivity hook)
 * 2. Rendering different UI elements based on current learning step
 * 3. Handling user interactions (clicks, slider movements, button presses)
 * 4. Providing visual feedback and progress tracking
 * 5. Managing transitions between learning steps
 * 
 * @param {IsoscelesBaseAnglesFeatureProps} props - Component properties
 * @returns {JSX.Element} The complete learning interface
 */
const IsoscelesBaseAnglesFeature: React.FC<IsoscelesBaseAnglesFeatureProps> = ({
  userId,
  onComplete,
  surveyUrl,
  embedSurvey = false,
}) => {
  // Get all the learning activity state and controls from our custom hook
  // This hook manages the XState machine that controls the learning flow
  const {
    state,               // Raw state machine state (for advanced usage)
    currentStep,         // Which step we're on: 'action' | 'observation' | 'inquiry' | 'discovery' | 'justification'
    currentInstruction,  // UI text to show student (title, instruction, hint)
    progressPercentage,  // How far through the activity (0-100%)
    canProceedToNext,   // Whether student can advance to next step
    isCompleted,        // Whether student finished entire activity
    triangle,           // Current triangle coordinates for rendering
    moduleId,           // Identifier for this learning module
    targetProperty,     // The geometric property being learned
    actions,            // Functions to send events to state machine
    chipSystem         // Data about collectible mathematical conditions
  } = useIsoscelesActivity(userId);
  
  // 상단 힌트 토글 상태. 기본은 닫힘으로 둡니다.
  const [isHintOpen, setIsHintOpen] = useState(false);
  // 칩 선택 시 이유 확인 모달 상태
  const [reasonModal, setReasonModal] = useState<{ show: boolean; chipType: string; chipLabel: string }>({ 
    show: false, 
    chipType: '', 
    chipLabel: '' 
  });
  // 오개념 단계 다단계 퀴즈 진행 상태
  const [misconceptionStage, setMisconceptionStage] = useState<1 | 2 | 3>(1);
  const [misconceptionSelected, setMisconceptionSelected] = useState<Record<number, string | undefined>>({});
  const [misconceptionCompleted, setMisconceptionCompleted] = useState(false);
  // 오개념 단계에 진입할 때마다 초기화
  useEffect(() => {
    if (currentStep === 'misconception') {
      setMisconceptionStage(1);
      setMisconceptionSelected({});
      setMisconceptionCompleted(false);
    }
  }, [currentStep]);

  // 오개념 단계 선택 처리기
  const handleMisconceptionSelect = useCallback((stage: 1 | 2 | 3, answerId: string) => {
    setMisconceptionSelected(prev => ({ ...prev, [stage]: answerId }));
    actions.selectAnswer(answerId);
    if (stage === 1 && answerId === 'asa') {
      // 바로 정답 안내 대신 이어서 2번째 문제를 제시
      setTimeout(() => setMisconceptionStage(2), 200);
      return;
    }
    if (stage === 2 && answerId === 'cong-unknown') {
      // 두 번째 문제 정답이면 세 번째 문제로 진행
      setTimeout(() => setMisconceptionStage(3), 200);
      return;
    }
    if (stage === 3 && answerId === 'proof-conditions') {
      // 마지막 문제를 맞히면 자동으로 다음 단계로 진행
      setMisconceptionCompleted(true);
      setTimeout(() => {
        actions.proceedToNext();
      }, 600);
    }
  }, [actions]);

  // 오개념 단계가 완료되어야만 다음 단계 버튼을 노출합니다.
  const canProceedToNextUi = canProceedToNext && (currentStep !== 'misconception' || misconceptionCompleted);
  
  // 단계 표시는 현재 상태를 기준으로 계산한다.
  const stepOrder = ['action', 'inquiry', 'discovery', 'misconception', 'justification'] as const;
  const currentStepNumber = currentStep === 'completed'
    ? stepOrder.length
    : Math.min(stepOrder.length, Math.max(1, stepOrder.indexOf(currentStep as typeof stepOrder[number]) + 1));
  
  /**
   * Handles when student clicks on triangle elements (sides, angles, etc.)
   * 
   * This is only active during the "discovery" step where students collect
   * mathematical conditions by clicking on triangle parts. Each clickable
   * element corresponds to a mathematical fact (like "side AB = side AC").
   * 
   * The mapping translates visual elements to mathematical concepts:
   * - side-AB → side-AB chip (one of the equal sides)
   * - fold-line → common-AD chip (the shared side after folding)
   * - angle-A → angle-BAD chip (the angle that gets bisected)
   * 
   * @param {TriangleElement} element - Which part of triangle was clicked
   */
  const handleTriangleElementClick = useCallback((element: TriangleElement) => {
    if (currentStep !== 'discovery') return;
    // 잘못된 요소를 클릭했을 때는 칩을 수집하지 않고 팝업으로 피드백을 제공합니다.
    const wrongTargets: TriangleElement[] = ['angle-B', 'angle-C', 'side-BC', 'side-BD', 'side-CD'];
    if (wrongTargets.includes(element)) {
      if (typeof window !== 'undefined') {
        window.alert('땡!');
      }
      return;
    }
    
    // SAS 조건 칩 수집 시 이유 확인 모달을 먼저 표시
    const showReasonModal = (chipType: string, chipLabel: string, chipId: string) => {
      setReasonModal({ show: true, chipType, chipLabel });
      // 모달에서 확인을 누르면 실제로 칩을 수집하도록 대기
      // 실제 수집은 모달 내부의 확인 버튼에서 처리
      setTimeout(() => {
        actions.collectChip(chipId);
      }, 100);
    };
    
    // 꼭지점 A 주변을 좌우 분할한 영역 클릭 처리
    if (element === 'angle-A-left' || element === 'angle-A') {
      const hasBAD = chipSystem.collectedChips?.some?.((c: { id: string }) => c.id === 'angle-BAD');
      const hasCAD = chipSystem.collectedChips?.some?.((c: { id: string }) => c.id === 'angle-CAD');
      if (!hasBAD) {
        showReasonModal('angle', '∠BAD', 'angle-BAD');
        return;
      }
      if (!hasCAD) {
        showReasonModal('angle', '∠CAD', 'angle-CAD');
        return;
      }
      return;
    }
    if (element === 'angle-A-right') {
      const hasCAD = chipSystem.collectedChips?.some?.((c: { id: string }) => c.id === 'angle-CAD');
      if (!hasCAD) {
        showReasonModal('angle', '∠CAD', 'angle-CAD');
        return;
      }
      return;
    }
    
    const chipId = SAS_UI_TO_CHIP[element as string];
    if (chipId) {
      // 다른 SAS 조건 칩들도 모달 표시
      if (element === 'side-AB') {
        showReasonModal('side', '변 AB', chipId);
      } else if (element === 'side-AC') {
        showReasonModal('side', '변 AC', chipId);
      } else if (element === 'fold-line') {
        showReasonModal('common', '공통변 AD', chipId);
      } else {
        actions.collectChip(chipId);
      }
    }
  }, [currentStep, actions, chipSystem.collectedChips]);
  
  /**
   * Automatic progression logic for smooth learning flow
   * 
   * This effect handles smart auto-advancement between steps to create
   * a smooth, guided learning experience. It prevents students from
   * getting stuck and provides natural transitions.
   * 
   * Auto-progression rules:
   * - Observation: Auto-advance 2 seconds after triangle is folded enough
   * - Discovery: Auto-advance 1 second after all SAS conditions found
   * 
   * Each auto-advancement includes visual feedback (highlighting) to
   * reinforce what the student discovered.
   */
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    switch (currentStep) {
      case 'observation':
        // 자동 진행을 비활성화합니다. 사용자가 직접 버튼으로 다음 단계로 이동합니다.
        break;
        
      case 'discovery':
        // ✅ 자동 이동을 비활성화합니다. 조건을 모두 모으면 하이라이트만 보여주고
        // 사용자가 "다음 단계로" 버튼을 눌러 스스로 넘어가도록 합니다.
        if (chipSystem.validation.isValid && !state.stepCompletion.discovery) {
          timeoutId = setTimeout(() => {
            actions.highlightElements(['side-AB', 'side-AC', 'fold-line', 'angle-A']);
          }, 600);
        }
        break;
    }
    
    // Cleanup timeout when component unmounts or dependencies change
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    currentStep, 
    state.foldAngle, 
    state.stepCompletion, 
    chipSystem.validation.isValid, 
    actions
  ]);
  
  /**
   * Handle module completion and notify parent component
   * 
   * When student successfully completes all learning steps, this effect
   * calls the onComplete callback with detailed completion information.
   * This allows the parent application to:
   * - Save progress to database
   * - Update student records
   * - Show celebration animations
   * - Navigate to next module
   * - Send notifications
   */
  useEffect(() => {
    if (isCompleted && onComplete) {
      onComplete({
        moduleId,                    // "ch1-m1" - identifies this specific module
        completedAt: new Date(),     // Exact timestamp of completion
        score: 100                   // Perfect score for completing all steps
        // Future: Could calculate score based on:
        // - Number of attempts
        // - Time taken
        // - Hints used
        // - Accuracy of responses
      });
    }
  }, [isCompleted, onComplete, moduleId]);
  
  /**
   * Handles student's answer selection in the inquiry step
   * 
   * When student selects an answer to "Why do base angles overlap?",
   * this function:
   * 1. Records their choice in the state machine
   * 2. If correct answer ('congruence'), auto-advances after 1 second
   * 3. If wrong answer, shows error feedback (handled by state machine)
   * 
   * @param {string} answerId - The ID of the selected answer option
   */
  const handleAnswerSelect = useCallback((answerId: string) => {
    // Record the student's answer selection
    actions.selectAnswer(answerId);
    
    // If they selected the correct answer, give brief pause then advance
    if (answerId === 'congruence') {
      setTimeout(() => {
        actions.proceedToNext();
      }, 1000);  // 1 second to read the "Correct!" feedback
    }
    // If wrong answer, state machine guards will prevent advancement
    // and UI will show error feedback
  }, [actions]);
  
  /**
   * Handles final confirmation button in justification step
   * 
   * When student reads the conclusion and clicks "Complete",
   * this advances to the final completed state and triggers
   * completion callbacks.
   */
  const handleFinalConfirmation = useCallback(() => {
    // 완료 클릭 순간에 새 탭을 여는 것이 팝업 차단을 피하는 가장 안전한 방식입니다.
    if (surveyUrl && !embedSurvey && typeof window !== 'undefined') {
      window.open(surveyUrl, '_blank', 'noopener,noreferrer');
    }
    actions.proceedToNext();
  }, [actions, surveyUrl, embedSurvey]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* 배경 장식 요소들 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* 좌측 상단 홈 버튼 */}
        <motion.div 
          className="fixed top-4 left-4 z-40"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <button
            onClick={() => window.location.href = '/'}
            className="backdrop-blur-sm bg-white/80 border border-white/40 rounded-2xl p-3 shadow-lg hover:bg-white/90 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">🏠</span>
              </div>
              <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">홈</span>
            </div>
          </button>
        </motion.div>
        
        {/* 헤더: 큰 제목과 목표 배지 */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">📐</span>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                이등변삼각형의 비밀
              </h1>
            </div>
          </div>
          
          {/* 목표 배지를 큰 제목 아래에 배치 */}
          <motion.div 
            className="backdrop-blur-sm bg-white/70 border border-white/20 rounded-3xl px-8 py-4 block mt-4 shadow-lg shadow-blue-500/10"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">🎯</span>
              </div>
              <p className="text-lg text-gray-700 font-semibold">
                {targetProperty}
              </p>
            </div>
          </motion.div>
        </motion.div>
        
        {/* 우측 상단 작은 진행률 바 */}
        <motion.div 
          className="fixed top-4 right-4 z-40"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="backdrop-blur-sm bg-white/80 border border-white/40 rounded-2xl p-3 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">📊</span>
              </div>
              <span className="text-sm font-bold text-gray-700">진행률</span>
              <span className="text-sm font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {currentStepNumber}/{stepOrder.length}
              </span>
            </div>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
        
        {/* 현재 단계 안내 카드 - 시각적 강조 개선 */}
        <motion.div
          key={currentStep}
          className="relative overflow-hidden rounded-3xl p-8 mb-12 shadow-2xl"
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* 배경 장식 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative flex items-start gap-6 mb-6">
            <motion.div 
              className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-lg"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <span className="text-4xl">🎯</span>
            </motion.div>
            <div className="flex-1">
              <h2 className="text-4xl font-black text-white mb-4 drop-shadow-lg">
                {currentInstruction.title}
              </h2>
              <p className="text-xl text-white/90 leading-relaxed font-medium">
                {currentInstruction.instruction}
              </p>
            </div>
          </div>
          
          {'hint' in currentInstruction && (
            <motion.div 
              className="p-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <button
                type="button"
                onClick={() => setIsHintOpen(v => !v)}
                className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl text-left hover:from-blue-100 hover:to-indigo-100 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💡</span>
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-blue-800">힌트 보기</div>
                  <div className="text-sm text-blue-700 opacity-80">클릭하여 힌트를 {isHintOpen ? '숨깁니다' : '열어봅니다'}</div>
                </div>
                <span className="text-blue-600 text-xl" aria-hidden="true">{isHintOpen ? '▾' : '▸'}</span>
              </button>
              <AnimatePresence>
                {isHintOpen && (
                  <motion.div
                    className="mt-3 flex items-start gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📝</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-blue-800 mb-2">힌트</h3>
                      <p className="text-blue-700 leading-relaxed">
                        {currentInstruction.hint}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Triangle Area */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Triangle */}
            <div className="backdrop-blur-sm bg-white/90 border border-white/50 rounded-3xl p-8 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🔺</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">이등변삼각형</h3>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-2xl p-6">
                <Triangle
                  triangle={triangle}
                  foldAngle={state.foldAngle}
                  onElementClick={handleTriangleElementClick}
                  highlightedElements={state.highlightedElements}
                  showFoldLine={currentStep !== 'action'}
                  showDLabel
                  hideBaseBC
                  showAngleDotsAtA
                  showAngleArcAtB={state.foldAngle >= 180}
                  showAngleArcAtC={state.foldAngle >= 180}
                />
              </div>
            </div>
            
            
          </motion.div>
          
          {/* Right: Interaction Area */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {/* Fold Slider moved to the right column */}
            <AnimatePresence>
              {currentStep === 'action' && (
                <motion.div
                  className="backdrop-blur-sm bg-white/90 border border-white/50 rounded-3xl p-8 shadow-2xl shadow-orange-500/10"
                  initial={{ opacity: 0, height: 0, y: 30 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -30 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                      <span className="text-xl">🎛️</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">접기 컨트롤</h3>
                  </div>
                  
                  <FoldSlider
                    value={state.foldAngle ?? 0}
                    onChange={(v) => actions.setFoldAngle(v)}
                    max={180}
                    step={5}
                    label="접기 퍼센트"
                    debug
                    formatValue={(angle) => `${Math.round((angle/180)*100)}%`}
                    showNumberInput={false}
                  />
                  
                  {state.foldAngle >= 180 && (
                    <motion.div
                      className="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl"
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                          <span className="text-xl">✨</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-emerald-800 mb-1">완벽해요!</h4>
                          <p className="text-emerald-700 mb-1">
                            <span style={{ fontSize: '1rem', fontWeight: 600, display: 'block', lineHeight: '2' }}>
                              두 밑각의 크기가 같다는 것을 확인했습니다!
                              <br />
                              이것이 바로 이등변삼각형의 특별한 성질입니다.
                            </span>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Multiple Choice Question (inquiry step) */}
            <AnimatePresence>
              {currentStep === 'inquiry' && 'options' in currentInstruction && (
                <motion.div
                  className="backdrop-blur-sm bg-white/90 border border-white/50 rounded-3xl p-8 shadow-2xl shadow-indigo-500/10"
                  initial={{ opacity: 0, x: 30, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: -30, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🤔</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      질문에 답해보세요
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {currentInstruction.options.map((option: { id: string; label: string }, index: number) => (
                      <motion.button
                        key={option.id}
                        onClick={() => handleAnswerSelect(option.id)}
                        className={`w-full p-6 text-left rounded-2xl border-2 transition-all group ${
                          state.selectedAnswer === option.id
                            ? option.id === 'congruence'
                              ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50 shadow-lg shadow-emerald-500/20'
                              : 'border-red-500 bg-gradient-to-r from-red-50 to-pink-50 shadow-lg shadow-red-500/20'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-lg hover:shadow-indigo-500/10'
                        }`}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            state.selectedAnswer === option.id
                              ? option.id === 'congruence'
                                ? 'border-emerald-500 bg-emerald-500'
                                : 'border-red-500 bg-red-500'
                              : 'border-gray-300 group-hover:border-indigo-400'
                          }`}>
                            {state.selectedAnswer === option.id && (
                              <motion.div
                                className="w-2 h-2 bg-white rounded-full"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2 }}
                              />
                            )}
                          </div>
                          <span className="text-lg text-gray-800 font-medium leading-relaxed break-keep">
                            {option.label}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  
                  {state.selectedAnswer === 'congruence' && (
                    <motion.div
                      className="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl"
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
                          <span className="text-xl">🎉</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-emerald-800 mb-1">정답입니다!</h4>
                          <p className="text-emerald-700">
                            훌륭해요! 이제 왜 합동인지 그 이유를 찾아봅시다.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Chip System (discovery step) */}
            <AnimatePresence>
              {currentStep === 'discovery' && (
                <motion.div
                  className="bg-white rounded-lg shadow-lg p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      SAS 합동 조건을 찾아보세요!
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      삼각형의 변과 각을 클릭해서 조건을 수집하세요.
                    </p>
                  </div>
                  
                  <ChipSystem
                    chips={chipSystem.availableChips.map(chip => ({
                      id: chip.id,
                      label: chip.label,
                      // 'given'은 표시 목적상 'side'로 매핑합니다.
                      type: (chip.type === 'given' ? 'side' : chip.type) as 'side' | 'angle' | 'common',
                      collected: chip.collected,
                      description: chip.description
                    }))}
                    onChipClick={actions.collectChip}
                    targetPattern={['S', 'A', 'S']}
                    isComplete={chipSystem.validation.isValid}
                    clickable={false}
                  />
                  
                  {/* Validation feedback */}
                  {!chipSystem.validation.isValid && chipSystem.validation.feedback && (
                    <motion.div
                      className={`mt-4 p-3 border rounded ${
                        chipSystem.validation.isValid
                          ? 'bg-green-100 border-green-300 text-green-800'
                          : 'bg-blue-100 border-blue-300 text-blue-800'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="text-sm">{chipSystem.validation.feedback}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Misconception step */}
            <AnimatePresence>
              {currentStep === 'misconception' && (
                <motion.div
                  className="backdrop-blur-sm bg-white/90 border border-white/50 rounded-3xl p-8 shadow-2xl shadow-red-500/10"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-pink-500 rounded-xl flex items-center justify-center">
                      <span className="text-xl">❓</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">오개념 점검</h3>
                  </div>
                  {misconceptionStage === 1 && (
                    <>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        왜 ∠BAD = ∠CAD 조건 대신 BD = CD를 근거로 SSS 합동을 주장할 수 없을까요?
                      </p>
                      <div className="space-y-4">
                        {[
                          { id: 'sss', label: 'BD = CD 를 알고 있으니 SSS 합동도 사용할 수 있다' },
                          { id: 'asa', label: '아직 BD = CD의 길이가 같은지 모름' },
                          { id: 'need-angle', label: '모르겠다.'}
                        ].map((opt, idx) => (
                          <motion.button
                            key={opt.id}
                            onClick={() => handleMisconceptionSelect(1, opt.id)}
                            className={`w-full p-4 text-left rounded-2xl border-2 transition-all ${
                              misconceptionSelected[1] === opt.id
                                ? opt.id === 'asa'
                                  ? 'border-emerald-500 bg-emerald-50'
                                  : 'border-red-500 bg-red-50'
                                : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                            }`}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <span className="text-lg text-gray-800">{opt.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </>
                  )}

                  {misconceptionStage === 2 && (
                    <>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        BD 와 CD 의 길이가 같은지 현재 단계에서 알 수 없다고 말하는 이유는 무엇인가요?
                      </p>
                      <div className="space-y-4">
                        {[
                          { id: 'cong-unknown', label: '삼각형 ABD 와 ACD 가 합동인지 아직 모른다. 따라서 BD 와 CD 가 같은 길이라고 말할 수 없다' },
                          { id: 'overlap-equal', label: '접었을 때 겹쳐 보이므로 당연히 길이가 같다' },
                          { id: 'midpoint', label: 'D 가 항상 BC 의 중점이라서 BD = CD 이다' }
                        ].map((opt, idx) => (
                          <motion.button
                            key={opt.id}
                            onClick={() => handleMisconceptionSelect(2, opt.id)}
                            className={`w-full p-4 text-left rounded-2xl border-2 transition-all ${
                              misconceptionSelected[2] === opt.id
                                ? opt.id === 'cong-unknown'
                                  ? 'border-emerald-500 bg-emerald-50'
                                  : 'border-red-500 bg-red-50'
                                : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                            }`}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <span className="text-lg text-gray-800">{opt.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </>
                  )}

                  {misconceptionStage === 3 && (
                    <>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        삼각형 ABD 와 ACD 는 똑같이 생겼고 실제로도 합동인 것 같은데 왜 합동인지 알 수 없다고 했나요?
                      </p>
                      <div className="space-y-4">
                        {[
                          { id: 'proof-conditions', label: '우리는 합동임을 보이기 위해 합동 조건을 찾는 중이다. 현재 단계에서는 합동을 가정하면 안 된다' },
                          { id: 'overlap-always', label: '접혀서 겹치면 언제나 합동이라고 이미 배웠다' },
                          { id: 'dunno3', label: '모르겠다' }
                        ].map((opt, idx) => (
                          <motion.button
                            key={opt.id}
                            onClick={() => handleMisconceptionSelect(3, opt.id)}
                            className={`w-full p-4 text-left rounded-2xl border-2 transition-all ${
                              misconceptionSelected[3] === opt.id
                                ? opt.id === 'proof-conditions'
                                  ? 'border-emerald-500 bg-emerald-50'
                                  : 'border-red-500 bg-red-50'
                                : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                            }`}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <span className="text-lg text-gray-800">{opt.label}</span>
                          </motion.button>
                        ))}
                      </div>
                      {misconceptionSelected[3] === 'proof-conditions' && (
                        <motion.div
                          className="mt-6 p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          정답입니다! 합동을 보이기 위해 합동 조건을 찾는 중이므로 아직 합동이라고 가정하면 안 됩니다. 다음 단계로 이동합니다.
                        </motion.div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Final Conclusion (justification step) */}
            <AnimatePresence>
              {currentStep === 'justification' && (
                <motion.div
                  className="backdrop-blur-sm bg-white/90 border border-white/50 rounded-3xl p-8 shadow-2xl shadow-yellow-500/20"
                  initial={{ opacity: 0, x: 30, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: -30, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <div className="text-center">
                    <motion.div 
                      className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <span className="text-4xl">🎉</span>
                    </motion.div>
                    
                    <h3 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-6">
                      축하합니다!
                    </h3>
                    
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 mb-6">
                      <p className="text-xl text-gray-700 leading-relaxed">
                        {currentInstruction.instruction}
                      </p>
                    </div>
                    
                    {'hint' in currentInstruction && (
                      <motion.div 
                        className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                            <span className="text-lg">🏆</span>
                          </div>
                          <h4 className="text-lg font-bold text-emerald-800">학습 성과</h4>
                        </div>
                        <p className="text-emerald-700 leading-relaxed">
                          {currentInstruction.hint}
                        </p>
                      </motion.div>
                    )}

                    {embedSurvey && surveyUrl && (
                      <motion.div
                        className="mt-2 mb-6 text-left"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        <div className="text-sm text-gray-600 mb-2">학습 소감 설문</div>
                        <div className="rounded-2xl overflow-hidden border border-gray-200">
                          <iframe
                            src={surveyUrl}
                            width="100%"
                            height="640"
                            style={{ border: 0, background: 'white' }}
                            allow="clipboard-write"
                            loading="lazy"
                            title="학습 소감 설문"
                          />
                        </div>
                        <div className="mt-2">
                          <a
                            href={surveyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-sm text-indigo-700 hover:text-indigo-900 underline"
                          >
                            새 탭에서 설문 열기
                          </a>
                        </div>
                      </motion.div>
                    )}
                    
                    {!isCompleted && (
                      <motion.button
                        onClick={handleFinalConfirmation}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/25"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                      >
                        <span className="flex items-center gap-2">
                          완료하기
                          <span className="text-xl">✨</span>
                        </span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            
          </motion.div>
        </div>
        
        {/* Navigation */}
        <motion.div 
          className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {currentStep === 'action' && state.foldAngle < 180 && (
            <motion.button
              onClick={actions.resetModule}
              className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-2xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-medium shadow-lg shadow-gray-500/10"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">🔄</span>
                다시 시작
              </span>
            </motion.button>
          )}
          
          <div className="flex items-center gap-3">
          {currentStep !== 'action' && (
            <motion.button
              onClick={actions.proceedToPrev}
              className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-2xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 font-medium shadow-lg shadow-gray-500/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2">
                <span className="text-xl">←</span>
                이전 단계
              </span>
            </motion.button>
          )}
          {canProceedToNextUi && (
            <motion.button
              onClick={actions.proceedToNext}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-bold text-lg shadow-lg shadow-emerald-500/25"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2">
                다음 단계로
                <span className="text-xl">→</span>
              </span>
            </motion.button>
          )}
          </div>
        </motion.div>
        
        {/* Completion Modal */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white/95 backdrop-blur-sm border border-white/30 rounded-3xl p-10 max-w-lg mx-4 text-center shadow-2xl"
                initial={{ scale: 0.3, y: 100, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.3, y: 100, opacity: 0 }}
                transition={{ 
                  type: "spring", 
                  damping: 25, 
                  stiffness: 300,
                  duration: 0.6 
                }}
              >
                <motion.div 
                  className="w-24 h-24 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, repeatType: "reverse" }
                  }}
                >
                  <span className="text-4xl">🎊</span>
                </motion.div>
                
                <motion.h2 
                  className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 bg-clip-text text-transparent mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  모듈 완료!
                </motion.h2>
                
                <motion.p 
                  className="text-xl text-gray-700 mb-8 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  이등변삼각형의 첫 번째 성질을 성공적으로 발견했습니다!
                </motion.p>
                {embedSurvey && surveyUrl && (
                  <motion.div
                    className="mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <div className="text-sm text-gray-600 mb-3">학습 소감 설문</div>
                    <iframe
                      src={surveyUrl}
                      width="100%"
                      height="640"
                      style={{ border: 0, borderRadius: 16, background: 'white' }}
                      allow="clipboard-write"
                      loading="lazy"
                      title="학습 소감 설문"
                    />
                    <div className="mt-3">
                      <a
                        href={surveyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-sm text-indigo-700 hover:text-indigo-900 underline"
                      >
                        새 탭에서 설문 열기
                      </a>
                    </div>
                  </motion.div>
                )}
                
                <motion.div 
                  className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 mb-8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">🏆</span>
                    </div>
                    <h3 className="text-lg font-bold text-blue-800">발견한 수학 원리</h3>
                  </div>
                  <p className="text-blue-700 font-semibold text-lg">
                    &ldquo;이등변삼각형의 두 밑각의 크기는 같다&rdquo;
                  </p>
                </motion.div>
                
                <motion.button
                  onClick={actions.resetModule}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white text-lg font-bold rounded-2xl hover:from-purple-600 hover:via-pink-600 hover:to-yellow-600 transition-all duration-300 shadow-lg shadow-purple-500/25"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl">🚀</span>
                    다시 도전하기
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 칩 선택 이유 확인 모달 */}
        <AnimatePresence>
          {reasonModal.show && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl"
                initial={{ scale: 0.3, y: 100, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.3, y: 100, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🤔</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {reasonModal.chipLabel} 선택 이유
                  </h3>
                  <p className="text-gray-600">
                    왜 이 조건이 SAS 합동에 필요한지 선택해보세요
                  </p>
                </div>
                
                <div className="space-y-3 mb-6">
                  {reasonModal.chipType === 'side' && [
                    { id: 'given', label: '이등변삼각형이라고 처음에 조건이 주어졌으니까' },
                    { id: 'equal', label: '왼쪽과 오른쪽의 두 삼각형이 합동이니까' },
                    { id: 'random', label: '딱 보기에 같아 보임' }
                  ].map((opt, idx) => (
                    <motion.button
                      key={opt.id}
                      onClick={() => {
                        if (opt.id === 'given' || opt.id === 'equal') {
                          setReasonModal({ show: false, chipType: '', chipLabel: '' });
                        }
                      }}
                      className={`w-full p-3 text-left rounded-xl border-2 transition-all ${
                        opt.id === 'given' || opt.id === 'equal'
                          ? 'border-emerald-500 hover:bg-emerald-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <span className="text-gray-800">{opt.label}</span>
                    </motion.button>
                  ))}
                  
                  {reasonModal.chipType === 'angle' && [
                    { id: 'bisector', label: '접는 선이 각의 이등분선이므로 두 각이 같다' },
                    { id: 'fold', label: '접었을 때 겹쳐지니까 같겠지 뭐~' },
                    { id: 'guess', label: '그냥 딱 보기에 같아 보인다' }
                  ].map((opt, idx) => (
                    <motion.button
                      key={opt.id}
                      onClick={() => {
                        if (opt.id === 'bisector' || opt.id === 'fold') {
                          setReasonModal({ show: false, chipType: '', chipLabel: '' });
                        }
                      }}
                      className={`w-full p-3 text-left rounded-xl border-2 transition-all ${
                        opt.id === 'bisector' || opt.id === 'fold'
                          ? 'border-emerald-500 hover:bg-emerald-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <span className="text-gray-800">{opt.label}</span>
                    </motion.button>
                  ))}
                  
                  {reasonModal.chipType === 'common' && [
                    { id: 'shared', label: '두 삼각형이 공통으로 가지는 변이다' },
                    { id: 'equal-itself', label: 'SAS 합동이라고 배웠으니까 이거겠지 뭐~' },
                    { id: 'dunno', label: '잘 모르겠다' }
                  ].map((opt, idx) => (
                    <motion.button
                      key={opt.id}
                      onClick={() => {
                        if (opt.id === 'shared' || opt.id === 'equal-itself') {
                          setReasonModal({ show: false, chipType: '', chipLabel: '' });
                        }
                      }}
                      className={`w-full p-3 text-left rounded-xl border-2 transition-all ${
                        opt.id === 'shared' || opt.id === 'equal-itself'
                          ? 'border-emerald-500 hover:bg-emerald-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <span className="text-gray-800">{opt.label}</span>
                    </motion.button>
                  ))}
                </div>
                
                <button
                  onClick={() => setReasonModal({ show: false, chipType: '', chipLabel: '' })}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  닫기
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IsoscelesBaseAnglesFeature;