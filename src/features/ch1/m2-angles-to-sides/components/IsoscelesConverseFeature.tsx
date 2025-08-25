'use client';

/**
 * IsoscelesConverseFeature
 * 이 파일은 ch1/m2 인터랙티브 학습 화면을 렌더링하기 위해 만들어졌습니다.
 * 의도는 m1의 전반부 경험을 유지하되, discovery 이후
 * 수직이등분선의 조건을 발견법으로 정리하는 3단계를 제공하는 것입니다.
 * - 조건 체크 단계에서 수직과 이등분 두 요소를 모두 확인합니다.
 * - 식 정리 단계에서 드래그 앤 드롭으로 AD ⟂ BC 와 BD = DC 를 완성합니다.
 * - 연결 단계에서 △ABD ≡ △ACD 합동으로 위 식들이 성립함을 이해하고 결론으로 넘어갑니다.
 */

import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Triangle } from '@/components/Triangle';
import { useIsoscelesConverseActivity } from '../state/useIsoscelesConverseActivity';
import { FoldSlider } from '@/components/Slider';

interface Props {
  onComplete?: (result: { moduleId: string; completedAt: Date; score?: number }) => void;
}

const IsoscelesConverseFeature: React.FC<Props> = ({ onComplete }) => {
  const {
    state,
    currentStep,
    currentInstruction,
    isCompleted,
    triangle,
    moduleId,
    targetProperty,
    actions,
    showPerpendicular,
    showMidpointTicks,
  } = useIsoscelesConverseActivity();

  useEffect(() => {
    if (isCompleted && onComplete) {
      onComplete({ moduleId, completedAt: new Date(), score: 100 });
    }
  }, [isCompleted, onComplete, moduleId]);

  const handleFinal = useCallback(() => actions.proceedToNext(), [actions]);

  // m2 전용 가상 단계 제어: discovery 이후 fill → congruence → arrange
  const [postStep, setPostStep] = useState<'none' | 'fill' | 'congruence' | 'arrange' | 'done'>('none');



  const uiStep = useMemo(() => {
    if (currentStep === 'discovery') {
      if (postStep === 'fill') return 'fill';
      if (postStep === 'congruence') return 'congruence';
      if (postStep === 'arrange') return 'arrange' as const;
    }
    return currentStep;
  }, [currentStep, postStep]);

  const uiInstruction = useMemo(() => {
    // 훅의 currentInstruction은 기계 단계 기반이므로, 가상 단계는 수동 매핑
    if (uiStep === 'fill') return { title: '문장으로 정리하기', instruction: '드래그하여 빈 칸을 채워 AD가 BC와 서로 직각으로 만나고 BD와 DC의 길이가 같다는 문장을 완성해보세요.' };
    if (uiStep === 'congruence') return { title: '합동으로 연결하기', instruction: '△ABD 와 △ACD 가 합동이므로 위 식들이 성립함을 이해해봅시다.' };
    if (uiStep === 'arrange') return { title: '순서 배열하기', instruction: '초록색 상자를 위에서 아래로 올바른 순서로 정렬하세요.' };
    return currentInstruction;
  }, [uiStep, currentInstruction]);

  // 7단계 진행: action → inquiry → fill → congruence → arrange → justification
  const stepIndex = useMemo(() => {
    switch (uiStep) {
      case 'action': return 1;
      case 'inquiry': return 2;
      case 'fill': return 3;
      case 'congruence': return 4;
      case 'arrange': return 5;
      case 'justification': return 6;
      default: return 1;
    }
  }, [uiStep]);

  const totalSteps = 6;

  const uiProgress = useMemo(() => stepIndex * 20, [stepIndex]);

  // 1단계(접기 액션) 완료 여부를 계산합니다. 90도 이상 접으면 다음 단계 버튼을 노출합니다.
  const canProceed = useMemo(() => {
    if (currentStep === 'action') return (state.foldAngle ?? 0) >= 90;
    if (currentStep === 'inquiry') return state.selectedAnswer === 'congruence';
    return false;
  }, [currentStep, state.foldAngle, state.selectedAnswer]);

  // observation에 진입하면 즉시 inquiry로 스킵합니다.
  useEffect(() => {
    if (currentStep === 'observation') {
      actions.proceedToNext();
    }
  }, [currentStep, actions]);

  // discovery에 진입하면 m2 전용 추가 단계로 분기합니다.
  useEffect(() => {
    if (currentStep === 'discovery' && postStep === 'none') {
      setPostStep('fill');
    }
  }, [currentStep, postStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* 배경 장식 요소들 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
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
                이등변삼각형의 비밀2
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
                {stepIndex}/{totalSteps}
              </span>
            </div>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${uiProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* 현재 단계 안내 카드 - 시각적 강조 개선 */}
        <motion.div
          key={uiStep}
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
                {uiInstruction.title}
              </h2>
              <p className="text-xl text-white/90 leading-relaxed font-medium">
                {uiInstruction.instruction}
              </p>
            </div>
          </div>
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
                  highlightedElements={state.highlightedElements}
                  showFoldLine={uiStep !== 'action'}
                  showPerpendicularAtD={showPerpendicular}
                  showMidpointTicksOnBC={showMidpointTicks}
                  showDLabel={uiStep !== 'action'}
                  showAngleDotsAtA={uiStep === 'action' || uiStep === 'observation'}
                  showAngleClickZones={false}
                  showOverlapHighlights={false}
                  showAngleArcAtB={uiStep === 'inquiry'}
                  showAngleArcAtC={uiStep === 'inquiry'}
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
            <AnimatePresence>
              {(uiStep === 'action' || uiStep === 'observation') && (
                <motion.div className="backdrop-blur-sm bg-white/90 border border-white/50 rounded-3xl p-8 shadow-2xl shadow-orange-500/10" initial={{ opacity: 0, height: 0, y: 30 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -30 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
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
                    formatValue={(angle) => `${Math.round((angle/180)*100)}%`}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {uiStep === 'inquiry' && (
                <InquiryFillBlank onComplete={() => { actions.selectAnswer('congruence'); actions.proceedToNext(); }} />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {uiStep === 'arrange' && (
                <motion.div className="backdrop-blur-sm bg-white/90 border border-white/50 rounded-3xl p-8 shadow-2xl shadow-indigo-500/10" initial={{ opacity: 0, x: 30, y: 20 }} animate={{ opacity: 1, x: 0, y: 0 }} exit={{ opacity: 0, x: -30, y: -20 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
                  <ArrangeBlocks onComplete={() => actions.skipDiscoveryToJustification()} />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {uiStep === 'justification' && (
                <motion.div className="backdrop-blur-sm bg-white/90 border border-white/50 rounded-3xl p-8 shadow-2xl shadow-yellow-500/20" initial={{ opacity: 0, x: 30, y: 20 }} animate={{ opacity: 1, x: 0, y: 0 }} exit={{ opacity: 0, x: -30, y: -20 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
                  <div className="text-center">
                    <h3 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-6">축하합니다</h3>
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 mb-6">
                      <p className="text-xl text-gray-700 leading-relaxed">{uiInstruction.instruction}</p>
                    </div>
                    {!isCompleted && (
                      <motion.button onClick={handleFinal} className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/25" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                        완료하기
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>



            <AnimatePresence>
              {uiStep === 'fill' && (
                <motion.div className="backdrop-blur-sm bg-white/90 border border-white/50 rounded-3xl p-8 shadow-2xl shadow-indigo-500/10" initial={{ opacity: 0, x: 30, y: 20 }} animate={{ opacity: 1, x: 0, y: 0 }} exit={{ opacity: 0, x: -30, y: -20 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
                  <div className="space-y-6">
                    <p className="text-gray-700 text-lg">토큰을 끌어 빈 칸에 놓아 문장을 완성하세요. 선분은 위에 작은 선을 그려 표시했습니다.</p>

                    <FillBlanksActivity onComplete={() => setPostStep('congruence')} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {uiStep === 'congruence' && (
                <motion.div className="backdrop-blur-sm bg-white/90 border border-white/50 rounded-3xl p-8 shadow-2xl shadow-indigo-500/10" initial={{ opacity: 0, x: 30, y: 20 }} animate={{ opacity: 1, x: 0, y: 0 }} exit={{ opacity: 0, x: -30, y: -20 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
                  <div className="space-y-8">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">논리적 추론 과정</h3>
                      <p className="text-gray-600">수학적 증명의 단계를 차례대로 따라가 봅시다</p>
                    </div>
                    
                    <div className="space-y-6">
                      {/* 단계 1: 주어진 조건 */}
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-2xl">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                          <div>
                            <h4 className="font-bold text-blue-800 mb-2">주어진 조건</h4>
                            <p className="text-blue-700">삼각형 ABC는 이등변삼각형이므로 AB = AC</p>
                          </div>
                        </div>
                      </div>

                      {/* 단계 2: 각의 이등분선 */}
                      <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-2xl">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                          <div>
                            <h4 className="font-bold text-green-800 mb-2">접는 선의 성질</h4>
                            <p className="text-green-700">접는 선 <span style={{ textDecoration: 'overline' }}>AD</span> 는 꼭지각 ∠BAC의 이등분선이므로 ∠BAD = ∠CAD</p>
                          </div>
                        </div>
                      </div>

                      {/* 단계 3: 공통변 */}
                      <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-2xl">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                          <div>
                            <h4 className="font-bold text-purple-800 mb-2">공통변</h4>
                            <p className="text-purple-700">변 <span style={{ textDecoration: 'overline' }}>AD</span> 는 두 삼각형 △ABD와 △ACD의 공통변</p>
                          </div>
                        </div>
                      </div>

                      {/* 단계 4: 합동 결론 */}
                      <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-2xl">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
                          <div>
                            <h4 className="font-bold text-orange-800 mb-2">SAS 합동</h4>
                            <p className="text-orange-700">변-각-변 조건에 의해 △ABD ≡ △ACD</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">💡</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-800">결론</h4>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        합동인 두 삼각형의 대응변과 대응각은 같으므로, D에서 직각이 형성되고 BC가 D를 기준으로 이등분됩니다.
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <motion.button onClick={() => setPostStep('arrange')} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-bold" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                        다음: 순서 배열하기
                      </motion.button>
                    </div>
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
          <div className="flex items-center gap-3">
          {uiStep !== 'action' && (
            <motion.button
              onClick={() => {
                // 가상 단계에서의 이전 단계 처리는 로컬 상태로 수행
                if (uiStep === 'arrange') { setPostStep('congruence'); return; }
                if (uiStep === 'congruence') { setPostStep('fill'); return; }
                // discovery 이전 단계는 상태 머신으로 위임
                actions.proceedToPrev();
              }}
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
          {canProceed && (
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
      </div>
    </div>
  );
};

export default IsoscelesConverseFeature;

// --- 내부 보조 컴포넌트: fill 빈칸 채우기 활동 ---
interface FillBlanksActivityProps { onComplete: () => void }
const FillBlanksActivity: React.FC<FillBlanksActivityProps> = ({ onComplete }) => {
  type Token = 'AD' | 'BC' | 'BD' | 'DC';
  const [availableTokens, setAvailableTokens] = useState<Token[]>(['AD', 'BC', 'BD', 'DC']);
  const [slots, setSlots] = useState<{ perpLeft: Token | null; perpRight: Token | null; eqLeft: Token | null; eqRight: Token | null }>({ perpLeft: null, perpRight: null, eqLeft: null, eqRight: null });


  const handleDragStart = useCallback((e: React.DragEvent<HTMLButtonElement>, token: Token) => { e.dataTransfer.setData('text/plain', token); e.dataTransfer.effectAllowed = 'move'; }, []);
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, slotKey: keyof typeof slots) => { e.preventDefault(); const token = e.dataTransfer.getData('text/plain') as Token; if (!token) return; if (!availableTokens.includes(token)) return; setSlots(prev => ({ ...prev, [slotKey]: token })); setAvailableTokens(prev => prev.filter(t => t !== token)); }, [availableTokens]);
  const allowDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); }, []);
  const resetFill = useCallback(() => { setAvailableTokens(['AD', 'BC', 'BD', 'DC']); setSlots({ perpLeft: null, perpRight: null, eqLeft: null, eqRight: null }); }, []);

  const isFillComplete = useMemo(() => !!(slots.perpLeft && slots.perpRight && slots.eqLeft && slots.eqRight), [slots]);
  const isFillCorrect = useMemo(() => slots.perpLeft === 'AD' && slots.perpRight === 'BC' && ((slots.eqLeft === 'BD' && slots.eqRight === 'DC') || (slots.eqLeft === 'DC' && slots.eqRight === 'BD')), [slots]);

  const checkAnswer = () => {
    if (isFillCorrect) {
      // 폭죽 효과
      const confetti = document.createElement('div');
      confetti.innerHTML = '🎉🎊✨🎉🎊✨🎉🎊✨';
      confetti.style.position = 'fixed';
      confetti.style.top = '50%';
      confetti.style.left = '50%';
      confetti.style.transform = 'translate(-50%, -50%)';
      confetti.style.fontSize = '3rem';
      confetti.style.zIndex = '9999';
      confetti.style.pointerEvents = 'none';
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        document.body.removeChild(confetti);
        alert('정답입니다! 🎉');
        onComplete();
      }, 1000);
    } else {
      alert('아직 정답이 아닙니다. 다시 시도해보세요.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {availableTokens.map(tok => (
          <button key={tok} draggable onDragStart={(e) => handleDragStart(e, tok)} className="px-4 py-2 rounded-xl border-2 border-indigo-300 bg-indigo-50 text-indigo-800 font-semibold shadow-sm hover:bg-indigo-100">
            <span style={{ position: 'relative', paddingTop: 4 }}>
              <span style={{ position: 'absolute', top: -6, left: 0, right: 0, height: 2, background: '#4f46e5' }} />
              {tok}
            </span>
          </button>
        ))}
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div onDragOver={allowDrop} onDrop={(e) => handleDrop(e, 'perpLeft')} className="min-w-[72px] h-12 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white text-gray-600">{slots.perpLeft ?? '빈칸'}</div>
          <span className="text-lg text-gray-700">와 서로 직각으로 만난다</span>
          <div onDragOver={allowDrop} onDrop={(e) => handleDrop(e, 'perpRight')} className="min-w-[72px] h-12 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white text-gray-600">{slots.perpRight ?? '빈칸'}</div>
        </div>
        <div className="flex items-center gap-3">
          <div onDragOver={allowDrop} onDrop={(e) => handleDrop(e, 'eqLeft')} className="min-w-[72px] h-12 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white text-gray-600">{slots.eqLeft ?? '빈칸'}</div>
          <span className="text-2xl">=</span>
          <div onDragOver={allowDrop} onDrop={(e) => handleDrop(e, 'eqRight')} className="min-w-[72px] h-12 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white text-gray-600">{slots.eqRight ?? '빈칸'}</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <button onClick={resetFill} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">초기화</button>
        <motion.button
          onClick={checkAnswer}
          disabled={!isFillComplete}
          className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
            isFillComplete 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          whileHover={{ scale: isFillComplete ? 1.05 : 1, y: isFillComplete ? -2 : 0 }}
          whileTap={{ scale: 0.95 }}
        >
          정답 확인하기
        </motion.button>
      </div>
    </div>
  );
};

// --- 내부 보조 컴포넌트: inquiry 빈칸 채우기 ---
interface InquiryFillBlankProps { onComplete: () => void }
const InquiryFillBlank: React.FC<InquiryFillBlankProps> = ({ onComplete }) => {
  const [answer, setAnswer] = useState('');
  const correctAnswer = '각의 이등분선';
  const isCorrect = answer.trim() === correctAnswer;

  const handleSubmit = () => {
    if (isCorrect) {
      onComplete();
    }
  };

  return (
    <motion.div 
      className="backdrop-blur-sm bg-white/90 border border-white/50 rounded-3xl p-8 shadow-2xl shadow-indigo-500/10" 
      initial={{ opacity: 0, x: 30, y: 20 }} 
      animate={{ opacity: 1, x: 0, y: 0 }} 
      exit={{ opacity: 0, x: -30, y: -20 }} 
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🤔</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">질문에 답해보세요</h3>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <p className="text-lg text-gray-800 leading-relaxed mb-4">
            <span className="inline-block"><span style={{ textDecoration: 'overline' }}>AD</span></span> 는 접는 선입니다.
          </p>
          <p className="text-lg text-gray-800 leading-relaxed">
            접는 선을 부르는 수학적 표현은 무엇일까요?
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-lg text-gray-700">답:</span>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="답을 입력하세요"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-lg text-gray-900 font-semibold"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {answer && (
            <div className={`p-4 rounded-xl ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-lg ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? '정답입니다! 🎉' : '다시 시도해보세요.'}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <motion.button
              onClick={handleSubmit}
              disabled={!isCorrect}
              className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                isCorrect 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              whileHover={{ scale: isCorrect ? 1.05 : 1, y: isCorrect ? -2 : 0 }}
              whileTap={{ scale: 0.95 }}
            >
              다음 단계로
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- 내부 보조 컴포넌트: 마지막 순서 배열 활동 ---
interface ArrangeBlocksProps { onComplete: () => void }
const ArrangeBlocks: React.FC<ArrangeBlocksProps> = ({ onComplete }) => {
  // 카드 데이터와 정답 순서 (5개로 확장)
  const correct = useMemo(() => [
    '정의: 두 변의 길이가 같은 삼각형',
    '꼭지각의 이등분선을 그었다',
    '△ABD 와 △ACD 는 SAS 합동',
    '변 BD = 변 CD 이고 각 ADC = 각 ADB = 90도',
    '결론: 꼭지각의 이등분선은 밑변을 수직이등분한다'
  ], []);

  const [cards, setCards] = useState<string[]>([
    '△ABD 와 △ACD 는 SAS 합동',
    '정의: 두 변의 길이가 같은 삼각형',
    '결론: 꼭지각의 이등분선은 밑변을 수직이등분한다',
    '변 BD = 변 CD 이고 각 ADC = 각 ADB = 90도',
    '꼭지각의 이등분선을 그었다',
  ]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const onDragStart = (idx: number) => setDragIdx(idx);
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const onDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) return;
    setCards(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    setDragIdx(null);
  };

  const isCorrect = useMemo(() => cards.every((c, i) => c === correct[i]), [cards, correct]);

  const checkAnswer = () => {
    setShowAnswer(true);
    if (isCorrect) {
      // 폭죽 효과 (간단한 구현)
      const confetti = document.createElement('div');
      confetti.innerHTML = '🎉🎊✨🎉🎊✨🎉🎊✨';
      confetti.style.position = 'fixed';
      confetti.style.top = '50%';
      confetti.style.left = '50%';
      confetti.style.transform = 'translate(-50%, -50%)';
      confetti.style.fontSize = '3rem';
      confetti.style.zIndex = '9999';
      confetti.style.pointerEvents = 'none';
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        document.body.removeChild(confetti);
        alert('정답입니다! 🎉');
        onComplete();
      }, 1000);
    } else {
      alert('아직 정답이 아닙니다. 다시 시도해보세요.');
      setShowAnswer(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">논리적 순서 배열</h3>
        <p className="text-gray-600">상자를 위에서 아래로 올바른 순서로 정렬하세요</p>
      </div>
      
      <div className="space-y-3">
        {cards.map((text, idx) => (
          <motion.div
            key={idx}
            draggable
            onDragStart={() => onDragStart(idx)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(idx)}
            className="p-4 rounded-2xl border-2 bg-white border-gray-200 text-gray-800 cursor-move select-none hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-200 shadow-sm"
            whileHover={{ scale: 1.02, y: -2 }}
            whileDrag={{ scale: 1.05, rotate: 2 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                {idx + 1}
              </div>
              <span className="flex-1">{text}</span>
              <div className="text-gray-400">⋮⋮</div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="flex justify-center">
        <motion.button
          onClick={checkAnswer}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-bold shadow-lg"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          정답 확인하기
        </motion.button>
      </div>
      
      {showAnswer && isCorrect && (
        <motion.div
          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🎉</span>
            <h4 className="text-lg font-bold text-green-800">정답입니다!</h4>
            <span className="text-2xl">🎉</span>
          </div>
          <p className="text-green-700">논리적 순서를 완벽하게 맞췄습니다.</p>
        </motion.div>
      )}
    </div>
  );
};


