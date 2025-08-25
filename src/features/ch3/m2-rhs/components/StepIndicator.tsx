'use client';

/**
 * StepIndicatorRhs
 * RHS 화면용 단계 표시 컴포넌트입니다. API는 RHA의 StepIndicator와 동일합니다.
 */

import React from 'react';

interface StepIndicatorProps {
  steps: string[];
  currentIndex: number;
}

const StepIndicatorRhs: React.FC<StepIndicatorProps> = ({ steps, currentIndex }) => {
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

export default StepIndicatorRhs;
