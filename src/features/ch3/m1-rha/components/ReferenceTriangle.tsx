/**
 * RHA 합동 참조 삼각형 컴포넌트
 * 이 컴포넌트는 사용자가 RHA 조건을 학습할 때 참조할 수 있는 직각삼각형을 표시합니다.
 * 사용자는 빗변(AC)을 클릭하여 RHA 탐구 활동을 시작할 수 있습니다.
 * 
 * 주요 기능:
 * - 직각삼각형 시각화 (A에서 직각, BC가 빗변)
 * - 빗변 클릭 시 탐구 활동 시작
 * - 게임 상태에 따른 시각적 피드백 제공
 * - 각도 표시 (직각 마커, 예각 마커)
 * - 꼭짓점 레이블 표시
 */

'use client';

import React from 'react';
import { ReferenceTriangleProps, GameState } from '../types';

const vertexRadius = 6; // 꼭짓점 원의 반지름

const ReferenceTriangle: React.FC<ReferenceTriangleProps> = ({ 
  A, B, C, onHypotenuseSelect, gameState 
}) => {
  
  /**
   * 직각 마커 경로를 생성합니다 (B점에서의 직각)
   * SVG path를 사용하여 ㄱ자 모양의 직각 표시를 그립니다.
   */
  const angleArcPath = () => {
    const radius = 20; // 직각 마커의 크기
    
    // B에서 A로 향하는 벡터
    const vBA = { x: A.x - B.x, y: A.y - B.y };
    // B에서 C로 향하는 벡터  
    const vBC = { x: C.x - B.x, y: C.y - B.y };
    
    // BA 방향 정규화 및 시작점 계산
    const magBA = Math.hypot(vBA.x, vBA.y);
    if (magBA === 0) return "";
    const startX = B.x + (vBA.x / magBA) * radius;
    const startY = B.y + (vBA.y / magBA) * radius;
    
    // BC 방향 정규화 및 끝점 계산
    const magBC = Math.hypot(vBC.x, vBC.y);
    if (magBC === 0) return "";
    const endX = B.x + (vBC.x / magBC) * radius;
    const endY = B.y + (vBC.y / magBC) * radius;

    // 직각 마커의 모서리점 계산
    const cornerX = B.x + (vBA.x / magBA + vBC.x / magBC) * radius;
    const cornerY = B.y + (vBA.y / magBA + vBC.y / magBC) * radius;

    return `M ${startX} ${startY} L ${cornerX} ${cornerY} L ${endX} ${endY}`;
  };

  /**
   * 예각 마커 경로를 생성합니다 (A점에서의 예각)
   * SVG arc를 사용하여 각도를 표시합니다.
   */
  const thetaArcPath = () => {
    const radius = 25; // 각도 마커의 크기
    
    // A에서 B로 향하는 벡터
    const vAB = { x: B.x - A.x, y: B.y - A.y };
    // A에서 C로 향하는 벡터
    const vAC = { x: C.x - A.x, y: C.y - A.y };
    
    // 각 방향의 각도 계산
    const startAngle = Math.atan2(vAB.y, vAB.x);
    const endAngle = Math.atan2(vAC.y, vAC.x);

    // 호의 시작점과 끝점 계산
    const startX = A.x + radius * Math.cos(startAngle);
    const startY = A.y + radius * Math.sin(startAngle);
    const endX = A.x + radius * Math.cos(endAngle);
    const endY = A.y + radius * Math.sin(endAngle);

    return `M ${startX},${startY} A ${radius},${radius} 0 0,1 ${endX},${endY}`;
  };

  // 빗변 클릭 가능 여부 확인 (Idle 상태에서만 클릭 가능)
  const isHypotenuseClickable = gameState === GameState.Idle;

  return (
    <div className="w-full aspect-square relative">
      <svg viewBox="0 0 340 340" className="w-full h-full">
        {/* 삼각형 면 - 반투명한 시안색으로 채움 */}
        <polygon 
          points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} 
          className="fill-cyan-500/20 stroke-cyan-400" 
          strokeWidth="2" 
        />
        
        {/* 빗변 AC - 클릭 가능한 노란색 라인 또는 일반 시안색 라인 */}
        <line 
          x1={A.x} y1={A.y} 
          x2={C.x} y2={C.y} 
          className={`stroke-2 transition-all duration-200 ${
            isHypotenuseClickable 
              ? 'stroke-yellow-400 cursor-pointer hover:stroke-yellow-300 hover:stroke-[4px]' 
              : 'stroke-cyan-400'
          }`} 
          onClick={onHypotenuseSelect} 
        />

        {/* 직각 마커 (B점에서) - 빨간색으로 표시 */}
        <path 
          d={angleArcPath()} 
          stroke="rgb(239 68 68)" 
          strokeWidth="2" 
          fill="none" 
        />

        {/* 예각 마커 (A점에서) - 하늘색으로 표시 */}
        <path 
          d={thetaArcPath()} 
          stroke="rgb(56 189 248)" 
          strokeWidth="2" 
          fill="none" 
        />

        {/* 꼭짓점들 */}
        
        {/* 꼭짓점 A - 클릭 가능 시 노란색, 아니면 시안색 */}
        <g>
          <circle 
            cx={A.x} cy={A.y} r={vertexRadius} 
            className={`transition-all duration-200 ${
              isHypotenuseClickable 
                ? 'fill-yellow-400 cursor-pointer hover:fill-yellow-300' 
                : 'fill-cyan-400'
            }`} 
            onClick={isHypotenuseClickable ? onHypotenuseSelect : undefined}
          />
          <text 
            x={A.x - 20} y={A.y} 
            className="fill-white font-bold text-lg select-none" 
            style={{pointerEvents: 'none'}}
          >
            A
          </text>
        </g>
        
        {/* 꼭짓점 B - 직각이 있는 점, 빨간색 */}
        <g>
          <circle 
            cx={B.x} cy={B.y} r={vertexRadius} 
            className="fill-red-500" 
          />
          <text 
            x={B.x + 10} y={B.y + 20} 
            className="fill-white font-bold text-lg select-none" 
            style={{pointerEvents: 'none'}}
          >
            B
          </text>
        </g>
        
        {/* 꼭짓점 C - 클릭 가능 시 노란색, 아니면 시안색 */}
        <g>
          <circle 
            cx={C.x} cy={C.y} r={vertexRadius} 
            className={`transition-all duration-200 ${
              isHypotenuseClickable 
                ? 'fill-yellow-400 cursor-pointer hover:fill-yellow-300' 
                : 'fill-cyan-400'
            }`} 
            onClick={onHypotenuseSelect}
          />
          <text 
            x={C.x - 20} y={C.y + 15} 
            className="fill-white font-bold text-lg select-none" 
            style={{pointerEvents: 'none'}}
          >
            C
          </text>
        </g>
      </svg>
    </div>
  );
};

export default ReferenceTriangle;
