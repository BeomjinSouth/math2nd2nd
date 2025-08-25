'use client';

/**
 * ExactMergeScene
 * 병합 상태에서 두 직각삼각형을 하나의 SVG 좌표계에 정확히 포개어
 * 최종 이등변삼각형 A(D)-B/E-C(F) 도형을 그려준다.
 * - 이 컴포넌트는 임의 픽셀 이동 대신, 하나의 좌표계에서 정확한 위치를 사용한다.
 */

import React from 'react';

interface ExactMergeSceneProps {
  width?: number; // px
  height?: number; // px
}

const ExactMergeScene: React.FC<ExactMergeSceneProps> = ({ width = 400, height = 300 }) => {
  // 단일 좌표계 상의 기준 좌표(픽셀 단위)
  const A = { x: 200, y: 60 };
  const B = { x: 80, y: 230 };
  const E = { x: 320, y: 230 };
  const C = { x: 200, y: 230 }; // C(F)

  const squareSize = 18;

  return (
    <div className="flex justify-center items-center w-72 h-56">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" style={{ aspectRatio: '4/3' }}>
        {/* 외곽 이등변 삼각형 */}
        <path d={`M ${A.x} ${A.y} L ${B.x} ${B.y} L ${E.x} ${E.y} Z`} fill="#ffffff" stroke="#374151" strokeWidth={3} />

        {/* 수선 AC */}
        <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke="#374151" strokeWidth={3} />

        {/* 밑변 위 직각 표시 */}
        <path
          d={`M ${C.x - squareSize / 2} ${C.y} L ${C.x - squareSize / 2} ${C.y - squareSize}
              L ${C.x + squareSize / 2} ${C.y - squareSize} L ${C.x + squareSize / 2} ${C.y}`}
          fill="#ffffff"
          stroke="#374151"
          strokeWidth={3}
        />

        {/* 라벨 */}
        <text x={A.x - 16} y={A.y - 12} fill="#374151" fontSize={18} fontWeight={600}>A(D)</text>
        <text x={B.x - 12} y={B.y + 24} fill="#374151" fontSize={18} fontWeight={600}>B</text>
        <text x={E.x + 6} y={E.y + 24} fill="#374151" fontSize={18} fontWeight={600}>E</text>
        <text x={C.x - 16} y={C.y + 34} fill="#374151" fontSize={18} fontWeight={600}>C(F)</text>
      </svg>
    </div>
  );
};

export default ExactMergeScene;


