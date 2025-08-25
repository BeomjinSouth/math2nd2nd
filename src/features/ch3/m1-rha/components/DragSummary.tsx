'use client';

/**
 * DragSummary (RHA)
 * 이 컴포넌트는 RHA 활동을 마무리할 때 학습자가 핵심 사실을 드래그로 빈 칸에 채워 보도록 돕습니다.
 * 의도는 주어진 조건과 계산으로 구한 조건 그리고 결론을 구분하여 스스로 연결하도록 하는 것입니다.
 */

import React from 'react';
import DragFillBoard, { DragGroup, DragTile } from '@/components/DragFill/DragFillBoard';

const tiles: DragTile[] = [
  { id: 'given-right', label: '두 삼각형의 직각이 같다' },
  { id: 'given-acute', label: '예각 한 쌍이 같다' },
  { id: 'computed-acute', label: '내각합 180°로 다른 예각이 같다' },
  { id: 'conclusion-rha', label: 'RHA 합동이 성립한다' },
  // 오답 유도용 추가 타일
  { id: 'distractor-asa', label: 'ASA 합동이라고만 부른다' }
];

const groups: DragGroup[] = [
  {
    id: 'g-given',
    title: '주어진 조건',
    slots: [
      { id: 's-right', expectedTileId: 'given-right', hint: '직각 정보' },
      { id: 's-acute', expectedTileId: 'given-acute', hint: '예각 정보' }
    ]
  },
  {
    id: 'g-computed',
    title: '계산으로 구한 조건',
    slots: [{ id: 's-computed-acute', expectedTileId: 'computed-acute', hint: '내각합 180°' }]
  },
  {
    id: 'g-conclusion',
    title: '결론',
    slots: [{ id: 's-conclusion', expectedTileId: 'conclusion-rha' }]
  }
];

const DragSummaryRha: React.FC = () => {
  return (
    <DragFillBoard
      tiles={tiles}
      groups={groups}
      paletteTitle="타일을 드래그하여 빈 칸을 채우세요"
    />
  );
};

export default DragSummaryRha;


