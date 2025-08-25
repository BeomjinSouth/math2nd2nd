'use client';

/**
 * AngleSumHelper
 * 이 컴포넌트는 RHA 모듈에서 "삼각형 내각의 합은 180°"라는 사실을 이용해
 * 한 예각이 같으면 나머지 예각도 같아짐을 직관적으로 확인시키는 미니 도구입니다.
 * 의도는 버튼 한 번으로 추론을 자동화하지 않고, 간단한 상호작용을 통해 학습자가
 * 스스로 클릭을 통해 확인하고 칩을 획득하게 하는 것입니다.
 *
 * 사용 방법
 * - 설명을 읽고 "180° 계산으로 다른 예각 동치 확인" 버튼을 클릭합니다.
 * - 상위에서 주입한 onConfirm 콜백이 호출되어 한 예각 칩을 지급하고 해당 각을 하이라이트합니다.
 */

import React from 'react';

interface AngleSumHelperProps {
  onConfirm: () => void; // 확인 버튼 클릭 시 호출되어 칩 지급 로직을 트리거
}

const AngleSumHelper: React.FC<AngleSumHelperProps> = ({ onConfirm }) => {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-700">
        삼각형의 세 각의 크기 합은 항상 180°입니다. 두 삼각형이 모두 직각이므로 90°를 제외하면
        남은 두 예각의 합이 같습니다. 한 예각이 서로 같다면 나머지 예각도 자동으로 같습니다.
      </p>
      <button
        onClick={onConfirm}
        className="px-3 py-2 bg-violet-500 text-white rounded hover:bg-violet-600 transition-colors text-sm"
      >
        180° 계산으로 다른 예각 동치 확인
      </button>
    </div>
  );
};

export default AngleSumHelper;


