'use client';

/**
 * RHA 단계별 라우트 페이지 (새로운 구조)
 * 이 페이지는 /ch3/m1/step/[step] 경로에서 단계 번호에 따른 화면 조각만 렌더링합니다.
 * 새로운 시각적 탐구 방식과 일관된 디자인을 사용하여 학습 흐름을 제공합니다.
 * 
 * 단계 구성:
 * 1. 관찰 - 두 직각삼각형의 특성 파악
 * 2. 180° 확인 - 내각의 합을 통한 각도 분석
 * 3. 칩 수집 - RHA 조건 요소 수집
 * 4. 정당화 + 요약 - 합동 증명 및 학습 정리
 */

import React, { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Triangle } from '@/components/Triangle';
import { ChipSystem } from '@/components/ChipSystem';
import { StepNav } from '@/components/StepNav';
import AngleSumHelper from '@/features/ch3/m1-rha/components/AngleSumHelper';
import ProofPanel from '@/features/ch3/m1-rha/components/ProofPanel';
import DragSummary from '@/features/ch3/m1-rha/components/DragSummary';
import { useRhaActivity } from '@/features/ch3/m1-rha/state/useRhaActivity';

const TOTAL = 4; // 1 관찰, 2 180° 확인, 3 칩 수집, 4 정당화(+요약)

export default function Page() {
  const params = useParams();
  const stepNumber = useMemo(() => {
    const raw = params?.step as string | undefined;
    const n = parseInt(raw ?? '1', 10);
    if (Number.isNaN(n) || n < 1) return 1;
    if (n > TOTAL) return TOTAL;
    return n;
  }, [params]);

  const { ui, actions } = useRhaActivity();

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 섹션 - 새로운 디자인과 일치 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-cyan-400">RHA 합동 단계별 학습</h1>
          <p className="text-lg text-gray-400 mt-2">단계 {stepNumber} / {TOTAL}</p>
        </div>

        {/* 단계 1: 관찰 */}
        {stepNumber === 1 && (
          <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🔍</span>
              <h3 className="text-xl font-bold text-cyan-400">두 삼각형 관찰하기</h3>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 mb-6">
              <div className="flex gap-8 justify-center items-center">
                <div className="w-64 h-48">
                  <Triangle 
                    triangle={ui.triangleA} 
                    highlightedElements={ui.highlights}
                    showLabels={true}
                    labels={{ A: 'A', B: 'B', C: 'C' }}
                    onElementClick={actions.onTriangleElementClick}
                  />
                </div>
                <div className="w-64 h-48">
                  <Triangle 
                    triangle={ui.triangleB} 
                    highlightedElements={ui.highlights}
                    showLabels={true}
                    labels={{ A: 'D', B: 'F', C: 'E' }}
                    onElementClick={actions.onTriangleElementClick}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <p className="text-gray-300 text-center">
                두 삼각형은 모두 직각을 가지고 있습니다. 빗변과 한 예각의 관계를 관찰해보세요.
              </p>
            </div>
          </div>
        )}

        {/* 단계 2: 180° 확인 */}
        {stepNumber === 2 && (
          <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">📐</span>
              <h3 className="text-xl font-bold text-cyan-400">내각의 합 180° 확인</h3>
            </div>
            <AngleSumHelper onConfirm={actions.confirmAngleSum} />
          </div>
        )}

        {/* 단계 3: 칩 수집 */}
        {stepNumber === 3 && (
          <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🎯</span>
              <h3 className="text-xl font-bold text-cyan-400">RHA 조건 수집</h3>
            </div>
            <ChipSystem
              chips={ui.chips}
              onChipClick={actions.onChipClick}
              targetPattern={['R', 'H', 'A']}
              titleText="RHA 합동 조건을 찾아보세요"
              subtitleText="직각, 빗변, 한 예각을 차례로 수집해보세요"
              completeTitle="RHA 합동을 발견했습니다!"
              completeMessage="직각과 빗변이 같고 한 예각까지 같으므로 ASA로서 합동이 성립합니다"
              isComplete={ui.isComplete}
            />
          </div>
        )}

        {/* 단계 4: 정당화 + 요약 */}
        {stepNumber === 4 && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">✅</span>
                <h3 className="text-xl font-bold text-cyan-400">합동 증명 정당화</h3>
              </div>
              <ProofPanel isComplete={ui.isComplete} />
            </div>
            
            <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📝</span>
                <h3 className="text-xl font-bold text-cyan-400">학습 내용 정리</h3>
              </div>
              <DragSummary />
            </div>
          </div>
        )}

        {/* 네비게이션 */}
        <div className="mt-8">
          <StepNav basePath="/ch3/m1/step" current={stepNumber} total={TOTAL} />
        </div>
      </div>
    </div>
  );
}


