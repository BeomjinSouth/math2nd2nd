/**
 * RHA 합동 구성 영역 컴포넌트
 * 이 컴포넌트는 사용자가 슬라이더로 삼각형을 조작하여 RHA 조건을 맞추는 영역입니다.
 * D점을 원점으로 하는 좌표계에서 E점과 F점을 조작하여 직각삼각형을 구성합니다.
 * 
 * 좌표계 설명:
 * - D: 원점 (직각이 위치하는 점)
 * - DH: 가로축 (수평 방향)
 * - DG: 세로축 (수직 방향)
 * - E: 세로축 위의 점 (e 값으로 조작)
 * - F: 사용자가 각도와 빗변 길이로 결정하는 점
 * 
 * 주요 기능:
 * - 좌표축 표시 (DH, DG)
 * - 직각 마커 표시
 * - 슬라이딩 상태에서 선분 EF 표시
 * - 성공 상태에서 삼각형 면 강조 표시
 * - 점들의 레이블 표시
 */

'use client';

import React from 'react';
import { ConstructionAreaProps, GameState } from '../types';

const ConstructionArea: React.FC<ConstructionAreaProps> = ({ 
  e, h, F, gameState 
}) => {
  // SVG 뷰박스 크기 및 원점 설정
  const width = 450;
  const height = 350;
  const origin = { x: width - 50, y: height - 50 }; // 오른쪽 아래를 원점으로 설정

  // E점 좌표 (세로축 위의 점)
  const E = { x: origin.x, y: origin.y - e };
  
  // F점 좌표 (SVG 좌표계로 변환)
  const F_svg = {
    x: origin.x + F.x,
    y: origin.y - F.y,
  };

  // 게임 상태에 따른 표시 조건
  const isSuccess = gameState === GameState.Success;
  const isSliding = gameState === GameState.Sliding;

  return (
    <div className="w-full aspect-[4/3] relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        
        {/* 화살표 마커 정의 */}
        <defs>
          <marker 
            id="arrow" 
            viewBox="0 0 10 10" 
            refX="5" refY="5" 
            markerWidth="6" markerHeight="6" 
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
          </marker>
        </defs>
        
        {/* 가로축 (DH) - 왼쪽 방향으로 화살표 */}
        <line 
          x1={origin.x} y1={origin.y} 
          x2={20} y2={origin.y} 
          className="stroke-gray-500" 
          strokeWidth="3" 
          markerEnd="url(#arrow)" 
        />
        
        {/* 세로축 (DG) - 위쪽 방향으로 화살표 */}
        <line 
          x1={origin.x} y1={origin.y} 
          x2={origin.x} y2={20} 
          className="stroke-gray-500" 
          strokeWidth="3" 
          markerEnd="url(#arrow)" 
        />

        {/* D점에서의 직각 마커 - 빨간색 ㄱ자 모양 */}
        <path 
          d={`M ${origin.x} ${origin.y - 15} L ${origin.x - 15} ${origin.y - 15} L ${origin.x - 15} ${origin.y}`} 
          stroke="rgb(239 68 68)" 
          strokeWidth="2" 
          fill="none" 
        />

        {/* 축 레이블 */}
        <text 
          x={20} y={origin.y - 10} 
          className="fill-gray-400 text-sm"
        >
          DH
        </text>
        <text 
          x={origin.x + 10} y={25} 
          className="fill-gray-400 text-sm"
        >
          DG
        </text>

        {/* 성공 상태일 때 삼각형 면 표시 */}
        {isSuccess && (
          <polygon 
            points={`${origin.x},${origin.y} ${E.x},${E.y} ${F_svg.x},${F_svg.y}`}
            className="fill-green-500/30 stroke-green-400"
            strokeWidth="2"
          />
        )}
        
        {/* 슬라이딩 또는 성공 상태일 때 선분 EF 표시 */}
        {(isSliding || isSuccess) && h > 0 && (
          <line 
            x1={E.x} y1={E.y} 
            x2={F_svg.x} y2={F_svg.y} 
            className={`stroke-2 ${
              isSuccess ? 'stroke-green-400' : 'stroke-yellow-400'
            }`} 
          />
        )}

        {/* 점들 표시 */}
        
        {/* D점 (원점) - 흰색 */}
        <g>
          <circle 
            cx={origin.x} cy={origin.y} 
            r="5" 
            className="fill-white" 
          />
          <text 
            x={origin.x + 10} y={origin.y + 15} 
            className="fill-white font-bold text-lg"
          >
            D
          </text>
        </g>

        {/* 슬라이딩 또는 성공 상태일 때 E점과 F점 표시 */}
        {(isSliding || isSuccess) && h > 0 && (
          <>
            {/* E점 - 노란색 */}
            <g>
              <circle 
                cx={E.x} cy={E.y} 
                r="5" 
                className="fill-yellow-400" 
              />
              <text 
                x={E.x - 20} y={E.y} 
                className="fill-white font-bold text-lg"
              >
                E
              </text>
            </g>

            {/* F점 - 노란색 */}
            <g>
              <circle 
                cx={F_svg.x} cy={F_svg.y} 
                r="5" 
                className="fill-yellow-400" 
              />
              <text 
                x={F_svg.x} y={F_svg.y + 20} 
                className="fill-white font-bold text-lg"
              >
                F
              </text>
            </g>
          </>
        )}
      </svg>
    </div>
  );
};

export default ConstructionArea;
