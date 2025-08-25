'use client';

/**
 * RHS 단계별 라우트 페이지
 * 이 페이지는 /ch3/m2/step/[step] 경로에서 단계 번호별 화면 조각을 렌더링합니다.
 */

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ChipSystem } from '@/components/ChipSystem';
import { StepNav } from '@/components/StepNav';
import ProofPanel from '@/features/ch3/m2-rhs/components/ProofPanel';
import DragSummary from '@/features/ch3/m2-rhs/components/DragSummary';
import { useRhsActivity } from '@/features/ch3/m2-rhs/state/useRhsActivity';
import MergeExperimentPanel from '@/features/ch3/m2-rhs/components/MergeExperimentPanel';
import { motion } from 'framer-motion';

const TOTAL = 4; // 1 병합 관찰, 2 관찰 설명, 3 칩 수집, 4 정당화(+요약)

export default function Page() {
  const params = useParams();
  const stepNumber = useMemo(() => {
    const raw = params?.step as string | undefined;
    const n = parseInt(raw ?? '1', 10);
    if (Number.isNaN(n) || n < 1) return 1;
    if (n > TOTAL) return TOTAL;
    return n;
  }, [params]);

  const { ui, actions } = useRhsActivity();
  // 전환 로직은 공용 패널 내부에서 처리합니다.

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white p-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">직각삼각형 RHS 합동</h1>
          <p className="text-sm text-gray-600">단계 {stepNumber} / {TOTAL}</p>
        </div>

        {stepNumber === 1 && (
          <div className="space-y-6">
            {/* 단계 1 헤더 */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xl">🔍</span>
                </div>
                <h2 className="text-2xl font-bold">두 삼각형 탐색하기</h2>
              </div>
              <p className="text-cyan-50 text-lg leading-relaxed">
                두 직각삼각형을 병합해서 어떤 일이 일어나는지 관찰해보세요.
              </p>
            </div>

            {/* 메인 상호작용 영역 (공용 패널) */}
            {/* 타입 간소화를 위해 as unknown 캐스팅만 적용 */}
            <MergeExperimentPanel ui={ui as unknown as { merged: boolean; highlights: string[]; triangleA: unknown; triangleB: unknown }} actions={actions as unknown as { toggleMerge: () => void }} />

            {/* 관찰 포인트 가이드 */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4 border border-amber-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">📐</span>
                  <h4 className="font-semibold text-amber-800">직각 확인</h4>
                </div>
                <p className="text-sm text-amber-700">
                  두 삼각형 모두 직각을 가지고 있는지 확인해보세요.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">📏</span>
                  <h4 className="font-semibold text-green-800">길이 비교</h4>
                </div>
                <p className="text-sm text-green-700">
                  빗변과 다른 한 변의 길이가 어떻게 되어 있는지 살펴보세요.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🔄</span>
                  <h4 className="font-semibold text-purple-800">병합 결과</h4>
                </div>
                <p className="text-sm text-purple-700">
                  병합했을 때 어떤 모양의 큰 삼각형이 만들어지는지 관찰해보세요.
                </p>
              </div>
            </div>

            {/* 학습 목표 */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">🎯</span>
                이 단계에서 배우는 것
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-green-600 text-lg">✓</span>
                  <p className="text-gray-700">두 직각삼각형의 특성 파악하기</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 text-lg">✓</span>
                  <p className="text-gray-700">병합을 통한 새로운 도형 생성 관찰</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 text-lg">✓</span>
                  <p className="text-gray-700">이등변삼각형의 성질 발견하기</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 text-lg">✓</span>
                  <p className="text-gray-700">합동 관계의 단서 찾기</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {stepNumber === 2 && (
          <div className="space-y-6">
            {/* 메인 제목 카드 */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xl">👁️</span>
                </div>
                <h2 className="text-2xl font-bold">관찰과 분석</h2>
              </div>
              <p className="text-emerald-50 text-lg leading-relaxed">
                두 직각삼각형이 어떻게 병합되어 이등변삼각형을 만드는지 자세히 살펴보겠습니다.
              </p>
            </div>

            {/* 공용 병합 실험 패널 */}
            <MergeExperimentPanel
              ui={ui as unknown as { merged: boolean; highlights: string[]; triangleA: unknown; triangleB: unknown }}
              actions={actions as unknown as { toggleMerge: () => void }}
              title="직접 병합해보기"
            />

            {/* 수학적 설명 */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">📐</span>
                수학적 원리
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">⚖️</div>
                  <p className="font-medium text-gray-800">이등변삼각형</p>
                  <p className="text-gray-600">밑각이 같다</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">🔄</div>
                  <p className="font-medium text-gray-800">합동 조건</p>
                  <p className="text-gray-600">RHA 완성</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl mb-2">✅</div>
                  <p className="font-medium text-gray-800">증명 완료</p>
                  <p className="text-gray-600">RHS = 합동</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {stepNumber === 3 && (
          <div className="space-y-6">
            {/* 단계 3 헤더 */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xl">🧩</span>
                </div>
                <h2 className="text-2xl font-bold">조건 수집하기</h2>
              </div>
              <p className="text-blue-50 text-lg leading-relaxed">
                RHS 합동 조건을 찾아서 수집해보세요. 직각, 빗변, 다른 한 변을 차례로 모아보겠습니다.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* 칩 수집 게임 */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">🎯</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">RHS 조건 찾기</h3>
                </div>
              <ChipSystem
                chips={ui.chips}
                onChipClick={actions.onChipClick}
                targetPattern={['R', 'H', 'S']}
                titleText="RHS 합동 조건을 찾아보세요"
                subtitleText="직각, 빗변, 다른 한 변을 차례로 수집해보세요"
                  completeTitle="🎉 RHS 합동을 발견했습니다!"
                completeMessage="병합을 통해 이등변이 되고 RHA로 귀결되어 합동입니다"
                isComplete={ui.isComplete}
              />
              </div>

              {/* 조건 설명 카드 */}
              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">📐</span>
                    <h4 className="font-semibold text-red-800">R - 직각</h4>
                  </div>
                  <p className="text-sm text-red-700">
                    두 삼각형 모두 직각을 가지고 있어야 합니다.
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">📏</span>
                    <h4 className="font-semibold text-yellow-800">H - 빗변</h4>
                  </div>
                  <p className="text-sm text-yellow-700">
                    직각의 맞은편 변(빗변)의 길이가 같아야 합니다.
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">📐</span>
                    <h4 className="font-semibold text-green-800">S - 다른 한 변</h4>
                  </div>
                  <p className="text-sm text-green-700">
                    직각을 끼고 있는 한 변의 길이가 같아야 합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 공용 병합 실험 패널 */}
            <MergeExperimentPanel
              ui={ui as unknown as { merged: boolean; highlights: string[]; triangleA: unknown; triangleB: unknown }}
              actions={actions as unknown as { toggleMerge: () => void }}
              title="병합 결과 확인"
            />

            {/* 학습 요약 */}
            {ui.isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-emerald-400 to-green-500 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xl">🎓</span>
                  </div>
                  <h3 className="text-xl font-bold">학습 완료!</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🔍</div>
                    <p className="font-medium">조건 발견</p>
                    <p className="text-sm opacity-90">RHS 조건 완성</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">🔗</div>
                    <p className="font-medium">논리 연결</p>
                    <p className="text-sm opacity-90">RHA 합동 도출</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">✅</div>
                    <p className="font-medium">증명 완료</p>
                    <p className="text-sm opacity-90">합동 관계 확인</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {stepNumber === 4 && (
          <div className="space-y-6">
            {/* 단계 4 헤더 */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <h2 className="text-2xl font-bold">증명 완성하기</h2>
              </div>
              <p className="text-purple-50 text-lg leading-relaxed">
                지금까지 학습한 내용을 바탕으로 RHS 합동을 완전히 증명해보겠습니다.
              </p>
            </div>

            {/* 증명 과정 시각화 */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* 논리적 증명 단계 */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">📝</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">논리적 증명</h3>
                </div>
                
          <div className="space-y-4">
                  {/* 가정 */}
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <span>📋</span> 가정 (주어진 조건)
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1 ml-4">
                      <li>• 두 직각삼각형 △ABC, △DEF</li>
                      <li>• ∠C = ∠F = 90° (직각)</li>
                      <li>• AB = DE (빗변의 길이가 같음)</li>
                      <li>• BC = EF (한 변의 길이가 같음)</li>
                    </ul>
                  </div>

                  {/* 증명 과정 */}
                  <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                    <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                      <span>⚙️</span> 증명 과정
                    </h4>
                    <div className="text-sm text-amber-700 space-y-2 ml-4">
                      <p><span className="font-medium">1단계:</span> 두 삼각형을 BC와 EF를 맞춰 병합</p>
                      <p><span className="font-medium">2단계:</span> 병합된 큰 삼각형은 이등변삼각형</p>
                      <p><span className="font-medium">3단계:</span> 이등변삼각형의 밑각은 같음</p>
                      <p><span className="font-medium">4단계:</span> 따라서 ∠A = ∠D</p>
                    </div>
                  </div>

                  {/* 결론 */}
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <span>✅</span> 결론
                    </h4>
                    <p className="text-sm text-green-700 ml-4">
                      RHA(직각-빗변-예각) 조건이 만족되므로<br/>
                      <span className="font-semibold">△ABC ≅ △DEF</span>
                    </p>
                  </div>
                </div>

              <ProofPanel isComplete={ui.isComplete} />
              </div>

              {/* 시각적 증명 */}
              <div className="space-y-6">
                {/* 공용 병합 실험 패널 */}
                <MergeExperimentPanel
                  ui={ui as unknown as { merged: boolean; highlights: string[]; triangleA: unknown; triangleB: unknown }}
                  actions={actions as unknown as { toggleMerge: () => void }}
                  title="시각적 증명"
                  canvasWidthClass="w-full max-w-[32rem]"
                  instantExact
                />

                {/* RHS → RHA 변환 설명 */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold">🔀</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">RHS → RHA 변환</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <span className="text-2xl">🎯</span>
                      <div>
                        <p className="font-medium text-orange-800">RHS 조건</p>
                        <p className="text-sm text-orange-600">직각 + 빗변 + 다른 한 변</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <span className="text-2xl text-orange-500">↓</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                      <span className="text-2xl">✨</span>
                      <div>
                        <p className="font-medium text-emerald-800">RHA 조건</p>
                        <p className="text-sm text-emerald-600">직각 + 빗변 + 예각</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 드래그 요약 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-bold">🖱️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">학습 정리하기</h3>
              </div>
              
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-6">
                <p className="text-teal-800 mb-4 text-center">
                  아래에서 주요 개념들을 드래그해서 정리해보세요!
                </p>
              <DragSummary />
              </div>
            </div>

            {/* 최종 학습 완료 카드 */}
            {ui.isComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl shadow-xl p-8 text-white text-center"
              >
                <div className="mb-6">
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-3xl font-bold mb-2">축하합니다!</h2>
                  <p className="text-xl opacity-90">RHS 합동 학습을 완료했습니다</p>
                </div>
                
                <div className="grid md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-2xl mb-2">🔍</div>
                    <p className="font-medium">조건 발견</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-2xl mb-2">🔄</div>
                    <p className="font-medium">병합 이해</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-2xl mb-2">🧩</div>
                    <p className="font-medium">논리 연결</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="text-2xl mb-2">✅</div>
                    <p className="font-medium">증명 완성</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        <StepNav basePath="/ch3/m2/step" current={stepNumber} total={TOTAL} />
      </div>
    </div>
  );
}


