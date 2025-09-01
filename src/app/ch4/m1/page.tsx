'use client';

/**
 * ch4/m1 페이지 엔트리
 * 이 파일은 '삼각형의 내심' 모듈을 라우트에 연결합니다
 * 의도는 상위 레벨에서 컨테이너만 장착하고 모든 상호작용은 feature 내부에 위임하는 것입니다
 */

import { IncenterFeature } from '@/features/ch4/m1-incenter';

export default function Page() {
  return <IncenterFeature />;
}


