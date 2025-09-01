'use client';

/**
 * 홈 페이지 컴포넌트
 * 이 파일은 사용자가 http://localhost:3000 에 접속했을 때 보게 되는 첫 화면을 정의합니다.
 * 의도는 각 학습 모듈로 이동할 수 있는 진입점 역할을 하는 것이며,
 * 특히 RHA(직각-빗변-각)와 RHS(직각-빗변-변) 활동 페이지로 쉽게 이동하도록 링크를 제공합니다.
 *
 * 구성 개요
 * - 상단 제목과 간단 소개 문구를 보여줍니다.
 * - 하단 카드형 링크들을 나열하여 개별 모듈로 이동하게 합니다.
 * - 기존 ch1/m1 링크 외에 ch1/m2, ch3/m1(RHA), ch3/m2(RHS) 링크를 추가합니다.
 */

import Link from 'next/link';

/**
 * Home
 * - 최상위 레이아웃 내에 간단한 소개와 모듈 링크를 렌더링합니다.
 * - 링크 카드 하나하나가 학습 모듈로의 네비게이션을 담당합니다.
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {/* 제목 영역: 제품명 표기 */}
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Math Explorer - 성호중 박범진</h1>
      </div>

      {/* 소개 문구: 간단한 앱 설명 */}
      <div className="mt-12">
        <p className="text-lg">
          중2 평면 도형들의 성질을 탐구하는 웹 애플리케이션입니다.
        </p>
      </div>

      {/* 모듈 링크: ch1/m1, ch1/m2, ch3/m1, ch3/m2, ch4/m1 로 이동하는 카드들 */}
      <div className="mt-24 grid text-center lg:w-full lg:max-w-5xl lg:grid-cols-5 lg:text-left gap-4">
        {/* CH1-M1: 이등변삼각형 밑각 */}
        <Link
          href="/ch1/m1"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Chapter 1.1{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            이등변삼각형의 두 밑각의 크기는 같을까?
          </p>
        </Link>

        {/* CH1-M2: 이등변삼각형 밑각 복제 */}
        <Link
          href="/ch1/m2"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Chapter 1.2{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          {/* 
            아래 문장은 "접는 선" 뒤에서 줄을 바꿔서 
            "밑변을 수직이등분할까?"를 강조해서 보여주기 위한 부분입니다.
            - <br /> 태그를 사용하면 줄바꿈이 됩니다.
            - "접는 선" 뒤에서 줄을 바꿔주세요.
          */}
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            꼭지각의 이등분선(접는 선)은<br />
            밑변을 수직이등분할까?
          </p>
        </Link>

        {/* CH3-M1: RHA 합동 */}
        <Link
          href="/ch3/m1"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Chapter 3.1 RHA{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            직각삼각형에서 빗변과 한 예각이 같으면 왜 합동일까?
          </p>
        </Link>

        {/* CH3-M2: RHS 합동 */}
        <Link
          href="/ch3/m2"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Chapter 3.2 RHS{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            직각삼각형에서 빗변과 다른 한 변이 같으면 왜 합동일까?
          </p>
        </Link>

        {/* CH4-M1: 삼각형의 내심 */}
        <Link
          href="/ch4/m1"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Chapter 4.1 내심{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            세 각의 이등분선의 교점과 내접원의 성질을 탐구합니다.
          </p>
        </Link>
      </div>
    </main>
  );
}
