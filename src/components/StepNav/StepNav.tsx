'use client';

/**
 * StepNav
 * 이 컴포넌트는 단계형 학습 페이지에서 이전과 다음으로 이동하는 전용 내비게이션입니다.
 * 의도는 라우트 규칙을 단순 문자열 조합으로 받도록 하여 어디서든 재사용 가능하게 하는 것입니다.
 */

import React from 'react';
import Link from 'next/link';

interface StepNavProps {
  /** 기본 경로입니다. 예: /ch3/m1/step */
  basePath: string;
  /** 현재 단계(1부터 시작)입니다. */
  current: number;
  /** 전체 단계 수입니다. */
  total: number;
}

const StepNav: React.FC<StepNavProps> = ({ basePath, current, total }) => {
  const prev = current > 1 ? `${basePath}/${current - 1}` : null;
  const next = current < total ? `${basePath}/${current + 1}` : null;

  return (
    <div className="mt-6 flex items-center justify-between gap-2">
      <div>
        {prev ? (
          <Link
            href={prev}
            className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50 text-gray-900 shadow-sm"
          >
            이전 단계
          </Link>
        ) : (
          <span className="px-3 py-2 rounded-md border bg-gray-50 text-gray-700">처음 단계</span>
        )}
      </div>
      <div className="flex items-center gap-1 text-xs">
        {Array.from({ length: total }).map((_, i) => {
          const n = i + 1;
          const active = n === current;
          const cls = active
            ? 'px-2 py-1 rounded-md bg-violet-100 border border-violet-400 text-violet-900'
            : 'px-2 py-1 rounded-md bg-white border border-gray-300 text-gray-800 hover:bg-gray-50';
          return (
            <Link key={`step-dot-${n}`} href={`${basePath}/${n}`} className={cls}>
              {n}
            </Link>
          );
        })}
      </div>
      <div>
        {next ? (
          <Link
            href={next}
            className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50 text-gray-900 shadow-sm"
          >
            다음 단계
          </Link>
        ) : (
          <span className="px-3 py-2 rounded-md border bg-gray-50 text-gray-700">마지막 단계</span>
        )}
      </div>
    </div>
  );
};

export default StepNav;


