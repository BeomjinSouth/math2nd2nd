'use client';

import { IsoscelesBaseAnglesFeature } from '@/features/ch1/m1-discover-base-angles';

export default function IsoscelesBaseAnglesPage() {
  return (
    <IsoscelesBaseAnglesFeature
      // 완료 후 구글 폼 처리: 새 탭 오픈은 컴포넌트 내부에서 처리됩니다.
      surveyUrl={process.env.NEXT_PUBLIC_CH1_M1_SURVEY_URL}
      embedSurvey={true}
      onComplete={(result) => {
        console.log('Feature completed:', result);
      }}
    />
  );
}
