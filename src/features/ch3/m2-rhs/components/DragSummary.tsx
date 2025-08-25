'use client';

/**
 * DragSummary (RHS)
 * 이 컴포넌트는 RHS 활동을 마무리하면서 병합 관찰에서 출발해 조건과 결론을 스스로 정리하도록 돕습니다.
 */

import React from 'react';
import DragFillBoard, { DragGroup, DragTile } from '@/components/DragFill/DragFillBoard';

const tiles: DragTile[] = [
  { id: 'given-right', label: '두 삼각형의 직각이 같다' },
  { id: 'given-hypo', label: '두 빗변의 길이가 같다' },
  { id: 'given-side', label: '다른 한 변의 길이가 같다' },
  { id: 'conclusion-rhs', label: 'RHS 합동이 성립한다' },
  { id: 'bridge-rha', label: '이등변 관찰로 RHA와 연결된다' }
];

const groups: DragGroup[] = [
  {
    id: 'g-given',
    title: '주어진 조건',
    slots: [
      { id: 's-right', expectedTileId: 'given-right' },
      { id: 's-hypo', expectedTileId: 'given-hypo' },
      { id: 's-side', expectedTileId: 'given-side' }
    ]
  },
  {
    id: 'g-connection',
    title: '관찰로 연결',
    slots: [{ id: 's-bridge', expectedTileId: 'bridge-rha' }]
  },
  {
    id: 'g-conclusion',
    title: '결론',
    slots: [{ id: 's-conclusion', expectedTileId: 'conclusion-rhs' }]
  }
];

const DragSummaryRhs: React.FC = () => {
  return (
    <DragFillBoard
      tiles={tiles}
      groups={groups}
      paletteTitle="타일을 드래그하여 빈 칸을 채우세요"
    />
  );
};

export default DragSummaryRhs;


