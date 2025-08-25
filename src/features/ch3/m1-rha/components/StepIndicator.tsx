'use client';

/**
 * StepIndicator
 * 이 컴포넌트는 학습 단계 진행 상황을 시각적으로 보여줍니다.
 * 의도는 현재 단계와 전체 단계 목록을 한눈에 보여주어 학습 흐름을 이해하도록 돕는 것입니다.
 */

import React from 'react';

interface StepIndicatorProps {
  steps: string[]; // 단계 이름 배열 (예: ['관찰', '확인', '수집', '정당화'])
  currentIndex: number; // 현재 단계의 인덱스
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentIndex }) => {
  return (
    <div className="flex items-center gap-2 text-sm" aria-label="학습 단계 진행">
      {steps.map((label, idx) => {
        const active = idx === currentIndex;
        const done = idx < currentIndex;
        const base = 'px-2 py-1 rounded border';
        const cls = done
          ? `${base} bg-green-100 border-green-300 text-green-800`
          : active
          ? `${base} bg-emerald-100 border-emerald-300 text-emerald-800`
          : `${base} bg-gray-50 border-gray-200 text-gray-600`;
        return (
          <div className={cls} key={`step-${idx}`}>
            {label}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;


