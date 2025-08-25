'use client';

/**
 * RHA 합동 학습 모듈의 라우트 엔트리 컴포넌트
 * 이 파일은 Next.js app 라우터에서 /ch3/m1 경로로 접근했을 때 렌더링되는 최상위 컴포넌트입니다.
 * 의도는 feature 계층의 RHA 전용 학습 화면을 마운트하고, 페이지 수준에서는 컨테이너 역할만 수행하는 것입니다.
 */

import Link from 'next/link';

/**
 * Page 컴포넌트는 별도의 상태나 로직을 가지지 않습니다.
 * 단순히 RhaFeature를 렌더링하여 기능을 위임합니다.
 */
export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white p-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">직각삼각형 RHA 합동</h1>
        <p className="text-lg text-gray-600 mb-6">단계별로 차근차근 학습해 보세요</p>
        <Link href="/ch3/m1/step/1" className="px-4 py-2 rounded border bg-white text-gray-800 hover:bg-gray-50 hover:text-gray-900">시작하기</Link>
      </div>
    </div>
  );
}


