'use client';

/**
 * ch1/m2 페이지 컴포넌트
 * 이 파일은 http://localhost:3000/ch1/m2 경로로 접속했을 때 렌더링되는 클라이언트 컴포넌트를 정의합니다.
 * 의도는 ch1/m1 전반부 경험을 유지하되, 60% 이후에 각의 이등분선의 성질을
 * 별도 단계로 확인하는 m2 전용 학습을 제공하는 것입니다.
 *
 * 구성 개요
 * - m2 전용 IsoscelesConverseFeature를 사용합니다.
 * - 완료 이벤트를 콘솔로 로깅하여 동작 확인이 가능하도록 합니다.
 */

import { IsoscelesConverseFeature } from '@/features/ch1/m2-angles-to-sides';

export default function IsoscelesConversePage() {
  return (
    <IsoscelesConverseFeature
      onComplete={(result) => {
        console.log('Feature completed on ch1/m2:', result);
      }}
    />
  );
}


