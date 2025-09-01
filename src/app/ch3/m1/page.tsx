'use client';

/**
 * RHA 합동 학습 모듈의 라우트 엔트리 컴포넌트 (새로운 구조)
 * 이 파일은 Next.js app 라우터에서 /ch3/m1 경로로 접근했을 때 렌더링되는 최상위 컴포넌트입니다.
 * 새로운 시각적 탐구 방식을 기본으로 제공하며, 단계별 학습으로 가는 옵션도 함께 제공합니다.
 */

import React from 'react';
import Link from 'next/link';
import RhaFeature from '@/features/ch3/m1-rha';

/**
 * Page 컴포넌트는 새로운 RHA 시각적 탐구 기능을 렌더링합니다.
 * 사용자는 직관적인 슬라이더 인터페이스로 RHA 합동을 체험할 수 있습니다.
 */
export default function Page() {
  return (
    <div className="relative">
      {/* 단계별 학습 버튼 - 좌측 상단에 고정 */}
      <div className="fixed top-4 left-4 z-50">
        <Link 
          href="/ch3/m1/step/1"
          className="backdrop-blur-sm bg-indigo-600/90 hover:bg-indigo-700/90 text-white px-4 py-2 rounded-lg shadow-lg transition-colors font-medium border border-indigo-500/50"
        >
          📚 단계별 학습
        </Link>
      </div>
      
      {/* 메인 RHA 시각적 탐구 기능 */}
      <RhaFeature />
    </div>
  );
}


