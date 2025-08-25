'use client';

/**
 * ProofPanel (RHS)
 * 칩 수집이 완료되었을 때, RHS 합동을 간단한 문장으로 정리하는 패널입니다.
 */

import React from 'react';

interface ProofPanelProps {
  isComplete: boolean;
}

const ProofPanelRhs: React.FC<ProofPanelProps> = ({ isComplete }) => {
  if (!isComplete) return null;
  return (
    <div className="mt-6 p-4 rounded border bg-emerald-50 border-emerald-200 text-emerald-900">
      <h4 className="font-semibold mb-2">정당화</h4>
      <p className="text-sm">
        두 삼각형은 모두 직각을 가지며, 빗변과 다른 한 변의 길이가 서로 같습니다. 직각삼각형에서
        이 조건이면 항상 합동이며, 이를 RHS 합동이라고 부릅니다. 병합 관찰을 통해 이등변이 되고
        밑각이 같아져 RHA(나아가 ASA)로 연결됨도 확인했습니다.
      </p>
    </div>
  );
};

export default ProofPanelRhs;
