'use client';

/**
 * RHA 단계별 라우트 페이지
 * 이 페이지는 /ch3/m1/step/[step] 경로에서 단계 번호에 따른 화면 조각만 렌더링합니다.
 * 의도는 한 화면에 요소를 몰아넣지 않고, 학습 흐름을 따라 순차적으로 집중하도록 하는 것입니다.
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
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white p-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">직각삼각형 RHA 합동</h1>
          <p className="text-sm text-gray-600">단계 {stepNumber} / {TOTAL}</p>
        </div>

        {stepNumber === 1 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">관찰</h3>
            <div className="flex gap-6 justify-center">
              <Triangle triangle={ui.triangleA} highlightedElements={ui.highlights} />
              <Triangle triangle={ui.triangleB} highlightedElements={ui.highlights} />
            </div>
            <p className="mt-4 text-sm text-gray-700">
              두 삼각형은 모두 직각입니다. 빗변과 한 예각의 동치 여부를 관찰합니다.
            </p>
          </div>
        )}

        {stepNumber === 2 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">180° 확인</h3>
            <AngleSumHelper onConfirm={actions.confirmAngleSum} />
          </div>
        )}

        {stepNumber === 3 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">칩 수집</h3>
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

        {stepNumber === 4 && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">정당화</h3>
              <ProofPanel isComplete={ui.isComplete} />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">드래그 요약</h3>
              <DragSummary />
            </div>
          </div>
        )}

        <StepNav basePath="/ch3/m1/step" current={stepNumber} total={TOTAL} />
      </div>
    </div>
  );
}


