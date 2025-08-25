'use client';

/**
 * AngleSumAnalysisScene
 * RHA 조건 분석 상태에서 두 직각삼각형의 내각 관계를 시각적으로 보여주는 장면
 * 180° 내각의 합 성질을 이용해 나머지 각이 같아짐을 강조합니다.
 */

import React from 'react';

interface AngleSumAnalysisSceneProps {
  width?: number; // px
  height?: number; // px
}

const AngleSumAnalysisScene: React.FC<AngleSumAnalysisSceneProps> = ({ width = 400, height = 300 }) => {
  // 두 삼각형을 나란히 배치한 좌표계
  const triangleA = {
    A: { x: 100, y: 60 },
    B: { x: 50, y: 200 },
    C: { x: 150, y: 200 }
  };

  const triangleB = {
    D: { x: 300, y: 60 },
    F: { x: 250, y: 200 },
    E: { x: 350, y: 200 }
  };

  const squareSize = 12;

  return (
    <div className="flex justify-center items-center w-72 h-56">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" style={{ aspectRatio: '4/3' }}>
        {/* 삼각형 ABC */}
        <path 
          d={`M ${triangleA.A.x} ${triangleA.A.y} L ${triangleA.B.x} ${triangleA.B.y} L ${triangleA.C.x} ${triangleA.C.y} Z`} 
          fill="rgba(59, 130, 246, 0.1)" 
          stroke="#3b82f6" 
          strokeWidth={2} 
        />

        {/* 삼각형 DEF */}
        <path 
          d={`M ${triangleB.D.x} ${triangleB.D.y} L ${triangleB.F.x} ${triangleB.F.y} L ${triangleB.E.x} ${triangleB.E.y} Z`} 
          fill="rgba(16, 185, 129, 0.1)" 
          stroke="#10b981" 
          strokeWidth={2} 
        />

        {/* 직각 표시 (C) */}
        <path
          d={`M ${triangleA.C.x - squareSize/2} ${triangleA.C.y} L ${triangleA.C.x - squareSize/2} ${triangleA.C.y - squareSize}
              L ${triangleA.C.x + squareSize/2} ${triangleA.C.y - squareSize} L ${triangleA.C.x + squareSize/2} ${triangleA.C.y}`}
          fill="white"
          stroke="#3b82f6"
          strokeWidth={2}
        />

        {/* 직각 표시 (E) */}
        <path
          d={`M ${triangleB.E.x - squareSize/2} ${triangleB.E.y} L ${triangleB.E.x - squareSize/2} ${triangleB.E.y - squareSize}
              L ${triangleB.E.x + squareSize/2} ${triangleB.E.y - squareSize} L ${triangleB.E.x + squareSize/2} ${triangleB.E.y}`}
          fill="white"
          stroke="#10b981"
          strokeWidth={2}
        />

        {/* 각도 호 표시 (각 A와 각 D - 강조) */}
        <path
          d={`M ${triangleA.A.x + 20} ${triangleA.A.y + 10} A 15 15 0 0 1 ${triangleA.A.x + 10} ${triangleA.A.y + 20}`}
          fill="none"
          stroke="#ef4444"
          strokeWidth={3}
        />
        <path
          d={`M ${triangleB.D.x - 20} ${triangleB.D.y + 10} A 15 15 0 0 0 ${triangleB.D.x - 10} ${triangleB.D.y + 20}`}
          fill="none"
          stroke="#ef4444"
          strokeWidth={3}
        />

        {/* 각도 호 표시 (각 B와 각 F - 주어진 조건) */}
        <path
          d={`M ${triangleA.B.x + 15} ${triangleA.B.y - 10} A 12 12 0 0 0 ${triangleA.B.x + 8} ${triangleA.B.y - 18}`}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth={3}
        />
        <path
          d={`M ${triangleB.F.x - 15} ${triangleB.F.y - 10} A 12 12 0 0 1 ${triangleB.F.x - 8} ${triangleB.F.y - 18}`}
          fill="none"
          stroke="#8b5cf6"
          strokeWidth={3}
        />

        {/* 라벨 */}
        <text x={triangleA.A.x - 12} y={triangleA.A.y - 8} fill="#374151" fontSize={14} fontWeight={600}>A</text>
        <text x={triangleA.B.x - 18} y={triangleA.B.y + 18} fill="#374151" fontSize={14} fontWeight={600}>B</text>
        <text x={triangleA.C.x - 8} y={triangleA.C.y + 18} fill="#374151" fontSize={14} fontWeight={600}>C</text>

        <text x={triangleB.D.x + 8} y={triangleB.D.y - 8} fill="#374151" fontSize={14} fontWeight={600}>D</text>
        <text x={triangleB.F.x - 18} y={triangleB.F.y + 18} fill="#374151" fontSize={14} fontWeight={600}>F</text>
        <text x={triangleB.E.x + 8} y={triangleB.E.y + 18} fill="#374151" fontSize={14} fontWeight={600}>E</text>

        {/* 180° 공식 표시 */}
        <text x={200} y={240} textAnchor="middle" fill="#374151" fontSize={16} fontWeight={600}>
          ∠A + ∠B + 90° = 180° ⟹ ∠A = ∠D
        </text>

        {/* 같은 각도 표시 화살표 */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
          </marker>
        </defs>
        
        <path 
          d={`M ${triangleA.A.x + 30} ${triangleA.A.y} Q 200 30 ${triangleB.D.x - 30} ${triangleB.D.y}`}
          fill="none" 
          stroke="#ef4444" 
          strokeWidth={2}
          markerEnd="url(#arrowhead)"
          strokeDasharray="5,5"
        />
        
        <text x={200} y={25} textAnchor="middle" fill="#ef4444" fontSize={12} fontWeight={600}>
          같은 크기!
        </text>
      </svg>
    </div>
  );
};

export default AngleSumAnalysisScene;