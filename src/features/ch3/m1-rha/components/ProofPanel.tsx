'use client';

/**
 * ProofPanel (RHA)
 * 칩 수집이 완료되었을 때, RHA가 ASA로 귀결됨을 간단한 문장으로 정리해 주는 패널입니다.
 * 의도는 학습자가 모은 증거를 문장 형태로 연결해 정당화를 돕는 것입니다.
 */

import React from 'react';

interface ProofPanelProps {
  isComplete: boolean;
}

const ProofPanel: React.FC<ProofPanelProps> = ({ isComplete }) => {
  if (!isComplete) return null;
  return (
    <div className="mt-6 p-4 rounded border bg-violet-50 border-violet-200 text-violet-900">
      <h4 className="font-semibold mb-2">정당화</h4>
      <p className="text-sm">
        두 삼각형은 모두 직각을 가지며, 빗변의 길이가 같습니다. 한 예각도 서로 같으므로
        두 각과 그 사이변(빗변)이 같은 ASA 합동이 성립합니다. 따라서 두 삼각형은 합동이며,
        이를 직각삼각형 맥락에서 RHA라 부릅니다.
      </p>
    </div>
  );
};

export default ProofPanel;
