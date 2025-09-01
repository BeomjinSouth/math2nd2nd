'use client';

/**
 * Triangle - 이등변삼각형 종이접기 시각화 컴포넌트
 * 
 * 이 파일의 역할과 의도:
 * - 이등변삼각형의 종이접기 학습을 위한 인터랙티브 SVG 삼각형을 렌더링합니다
 * - polyhedra-folding 스타일의 자연스러운 접기 애니메이션을 2D로 구현합니다
 * - 학생이 삼각형의 각 부분(변, 각, 접는선)을 클릭하여 수학적 조건을 발견할 수 있게 합니다
 * - framer-motion을 사용하여 부드럽고 교육적으로 효과적인 애니메이션을 제공합니다
 * 
 * 핵심 기능:
 * - foldAngle(0~180): 접기 각도에 따른 실시간 애니메이션
 * - 자연스러운 종이접기 시뮬레이션 (3D 효과, 그림자, 색상 변화)
 * - 교육용 인터랙션 (클릭 가능한 기하학적 요소들)
 * - 접기 깊이에 따른 시각적 피드백
 * 
 * 학습 이론 기반:
 * - 구성주의 학습: 학생이 직접 조작하며 기하학적 성질을 발견
 * - 시각적 학습: 추상적인 수학 개념을 구체적인 조작 활동으로 체험
 * - 즉각적 피드백: 접기 행동의 결과를 실시간으로 확인
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Triangle as TriangleType, getAngleBisectorIntersection, reflectPoint } from '@/core';

interface TriangleProps {
  /** 삼각형의 좌표 정보 (A: 꼭지점, B,C: 밑각) */
  triangle: TriangleType;
  /** 접기 각도 (0~180도). 0=펼친상태, 90=직각, 180=완전접힘 */
  foldAngle?: number;
  /** 삼각형 요소 클릭 시 호출되는 콜백 (SAS 조건 수집용) */
  onElementClick?: (element: TriangleElement) => void;
  /** 강조 표시할 요소들의 ID 배열 (빨간색으로 하이라이트) */
  highlightedElements?: string[];
  /** 접는 선(각의 이등분선) 표시 여부. 학습 단계에 따라 제어 */
  showFoldLine?: boolean;
  /** 접힌 두 조각(파란색/초록색) 표시 여부. RHS 등에서는 false */
  showInnerPieces?: boolean;
  /** 꼭지점 라벨(A,B,C) 표시 여부 */
  showLabels?: boolean;
  /** 각 클릭을 위한 원형 영역을 표시할지 여부 */
  showAngleClickZones?: boolean;
  /** 커스텀 라벨 텍스트 (기본값: A, B, C) */
  labels?: { A: string; B: string; C: string };
  /** 추가 CSS 클래스 */
  className?: string;
  /** D에서의 직각 표시를 보여줄지 여부 */
  showPerpendicularAtD?: boolean;
  /** BC를 이등분하는 눈금 표시를 보여줄지 여부 */
  showMidpointTicksOnBC?: boolean;
  /** 꼭지점 A에서 각 이등분을 나타내는 동일한 각호 표시 여부 */
  showAngleEqualityArcsAtA?: boolean;
  /** 꼭지점 A 주변에 두 개의 점으로 각 동등을 표현할지 여부 */
  showAngleDotsAtA?: boolean;
  /** D 라벨을 표시할지 여부 */
  showDLabel?: boolean;
  /** 밑변 BC를 숨길지 여부 */
  hideBaseBC?: boolean;
  /** 밑각 겹침 하이라이트(주황 원)를 표시할지 여부 */
  showOverlapHighlights?: boolean;
  /** 밑각 B, C에 각호를 표시할지 여부 */
  showAngleArcAtB?: boolean;
  showAngleArcAtC?: boolean;
}

export type TriangleElement =
  | 'side-AB' | 'side-AC' | 'side-BC'
  | 'angle-A' | 'angle-B' | 'angle-C'
  | 'angle-A-left' | 'angle-A-right'
  | 'fold-line'
  | 'side-BD' | 'side-CD';

const Triangle: React.FC<TriangleProps> = ({
  triangle,
  foldAngle = 0,
  onElementClick,
  highlightedElements = [],
  showFoldLine = true,
  showInnerPieces = true,
  showLabels = true,
  showAngleClickZones = false,
  labels = { A: 'A', B: 'B', C: 'C' },
  className = '',
  showPerpendicularAtD = false,
  showMidpointTicksOnBC = false,
  showAngleEqualityArcsAtA = false,
  showAngleDotsAtA = false,
  showDLabel = false,
  hideBaseBC = false,
  showOverlapHighlights = true,
  showAngleArcAtB = false,
  showAngleArcAtC = false,
}) => {
  const [hovered, setHovered] = useState<string | null>(null);

  // ====== 좌표 스케일 변환 ======
  const S = 100;
  const A = { x: triangle.A.x * S, y: triangle.A.y * S };
  const B = { x: triangle.B.x * S, y: triangle.B.y * S };
  const C = { x: triangle.C.x * S, y: triangle.C.y * S };

  // A의 이등분선과 BC의 교점 D
  const foldPoint = getAngleBisectorIntersection(triangle);
  const D = { x: foldPoint.x * S, y: foldPoint.y * S };

  // ====== 접기 애니메이션 기본 설정 ======
  // 요구사항: 오른쪽 초록 조각은 고정. 왼쪽 파란 조각은 접는선 AD에 대한 반사 위치로 선형 보간하여
  // 회전처럼 보이지 않고 접는선으로 "접히는" 느낌을 구현한다.
  const t = Math.max(0, Math.min(1, foldAngle / 180));
  const B_ref = reflectPoint(triangle.B, triangle.A, foldPoint);
  const lerp = (a: number, b: number, r: number) => a + (b - a) * r;
  const Bm = { x: lerp(triangle.B.x, B_ref.x, t) * S, y: lerp(triangle.B.y, B_ref.y, t) * S };

  // ====== 유틸 ======
  const isHi = (id: string) => highlightedElements.includes(id);

  // 각 UI 요소별 기본 색상과 하이라이트 색상을 지정한다
  const hiColorMap: Record<string, string> = {
    'side-AB': '#3b82f6',   // 파랑
    'side-AC': '#3b82f6',   // 파랑
    'fold-line': '#22c55e', // 공통변 AD는 초록
    'angle-A': '#ef4444',   // 빨강
  };
  const baseColorMap: Record<string, string> = {
    'side-AB': '#3b82f6',
    'side-AC': '#3b82f6',
    'fold-line': '#22c55e',
    'side-BC': '#9ca3af',
    'angle-A': '#374151',
    'angle-B': '#374151',
    'angle-C': '#374151',
  };
  const hiStroke = (id: string) => hiColorMap[id] || '#ef4444';
  const hiFill = (id: string) => `${(hiColorMap[id] || '#ef4444')}33`;

  const strokeFor = (id: string) => (isHi(id) ? hiStroke(id) : (baseColorMap[id] ?? '#374151'));
  const fillFor = (id: string) => (isHi(id) ? hiFill(id) : 'none');
  const widthFor = (id: string) =>
    isHi(id) || hovered === id ? 3 : 2;

  const getLineProps = (id: string) => ({
    stroke: strokeFor(id),
    strokeWidth: widthFor(id),
    fill: 'transparent',
    style: { cursor: 'pointer' as const, pointerEvents: 'stroke' as const },
    onMouseEnter: () => setHovered(id),
    onMouseLeave: () => setHovered(null),
    onClick: () => onElementClick?.(id as TriangleElement),
  });

  const getCircleProps = (id: string, r: number, rHover: number) => ({
    stroke: strokeFor(id),
    strokeWidth: widthFor(id),
    fill: fillFor(id),
    r,
    style: { cursor: 'pointer' as const },
    onMouseEnter: () => setHovered(id),
    onMouseLeave: () => setHovered(null),
    onClick: () => onElementClick?.(id as TriangleElement),
    whileHover: { r: rHover },
  });

  const getTextStyle = (id: string) => ({
    fill: strokeFor(id),
    fontSize: 16,
    fontWeight: isHi(id) ? 'bold' : 'normal' as const,
    cursor: 'pointer',
  });

  // ====== 보조 표시 유틸: 직각 표시와 중점 눈금 ======
  const vec = (p1: {x:number;y:number}, p2: {x:number;y:number}) => ({ x: p2.x - p1.x, y: p2.y - p1.y });
  const len = (v: {x:number;y:number}) => Math.hypot(v.x, v.y) || 1;
  const norm = (v: {x:number;y:number}) => { const l = len(v); return { x: v.x / l, y: v.y / l }; };
  const add = (p: {x:number;y:number}, v: {x:number;y:number}, s: number) => ({ x: p.x + v.x * s, y: p.y + v.y * s });
  const perp = (v: {x:number;y:number}) => ({ x: -v.y, y: v.x });

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <svg
        viewBox="0 0 400 300"
        className="w-full h-full max-w-md"
        style={{ aspectRatio: '4/3' }}
      >
        {/* 배경 삼각형 */}
        <motion.path
          d={`M ${A.x} ${A.y} L ${B.x} ${B.y} L ${C.x} ${C.y} Z`}
          fill="#ffffff"
          stroke="#e2e8f0"
          strokeWidth={1}
          initial={false}
        />

        {/* 접는 선 (A→D) - 각의 이등분선 */}
        {showFoldLine && (
          <motion.line
            x1={A.x} y1={A.y} x2={D.x} y2={D.y}
            stroke="#22c55e"
            strokeWidth={2}
            strokeDasharray="8,4"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              strokeWidth: foldAngle > 0 ? 3 : 2,
              stroke: '#22c55e'
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            data-testid="fold-line"
          />
        )}

        {/* 오른쪽 조각(ACD): 고정 */}
        {showInnerPieces && (
          <g>
            <path
              d={`M ${A.x} ${A.y} L ${D.x} ${D.y} L ${C.x} ${C.y} Z`}
              fill="#dcfce7"
              stroke="#22c55e"
              strokeWidth={2}
            />
          </g>
        )}

        {/* 왼쪽 조각(ABD): B를 AD에 대한 반사점으로 보간하여 접힘 표현 */}
        {showInnerPieces && (
          <g>
            <path
              d={`M ${A.x} ${A.y} L ${Bm.x} ${Bm.y} L ${D.x} ${D.y} Z`}
              fill="#dbeafe"
              stroke="#3b82f6"
              strokeWidth={2}
            />
          </g>
        )}

        {/* 클릭 가능한 변들 */}
        <motion.line
          x1={A.x} y1={A.y} x2={B.x} y2={B.y}
          {...getLineProps('side-AB')}
          whileHover={{ strokeWidth: 4 }}
        />
        <motion.line
          x1={A.x} y1={A.y} x2={C.x} y2={C.y}
          {...getLineProps('side-AC')}
          whileHover={{ strokeWidth: 4 }}
        />
        {!hideBaseBC && (
          <motion.line
            x1={B.x} y1={B.y} x2={C.x} y2={C.y}
            {...getLineProps('side-BC')}
            whileHover={{ strokeWidth: 4 }}
          />
        )}
        {/* 보조 변 BD, CD */}
        <motion.line
          x1={B.x} y1={B.y} x2={D.x} y2={D.y}
          {...getLineProps('side-BD')}
          whileHover={{ strokeWidth: 4 }}
        />
        <motion.line
          x1={C.x} y1={C.y} x2={D.x} y2={D.y}
          {...getLineProps('side-CD')}
          whileHover={{ strokeWidth: 4 }}
        />

        {/* 공통변 AD (fold-line) */}
        <motion.line
          x1={A.x} y1={A.y} x2={D.x} y2={D.y}
          {...getLineProps('fold-line')}
          whileHover={{ strokeWidth: 4 }}
        />

        {/* 각(원) 클릭 영역과 라벨. showLabels=false이면 숨깁니다 */}
        {showLabels && (
          <>
            {/* 꼭지점 A 주변을 좌우로 넓게 나누어 클릭 가능 영역 제공 - 개선된 버전 */}
            {onElementClick && (
              <>
                {/* 왼쪽 각 BAD 클릭 영역 - 더 크고 시각적 피드백 추가 */}
                <g>
                  <rect 
                    x={A.x - 60} y={A.y - 50} width={60} height={80} 
                    fill="transparent"
                    stroke="transparent"
                    strokeWidth={0}
                    strokeDasharray="5,5"
                    rx={8}
                    style={{ cursor: 'pointer', pointerEvents: 'all' }}
                    onMouseEnter={() => setHovered('angle-A-left')}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => {
                      onElementClick?.('angle-A-left');
                      onElementClick?.('angle-A'); // 기존 코드와 호환성을 위해 angle-A도 트리거
                    }}
                  />
                  {hovered === 'angle-A-left' && (
                    <text x={A.x - 30} y={A.y - 55} textAnchor="middle" fontSize={10} fill="#ef4444" fontWeight="bold">
                      ∠BAD
                    </text>
                  )}
                </g>
                
                {/* 오른쪽 각 CAD 클릭 영역 - 더 크고 시각적 피드백 추가 */}
                <g>
                  <rect 
                    x={A.x} y={A.y - 50} width={60} height={80} 
                    fill="transparent"
                    stroke="transparent"
                    strokeWidth={0}
                    strokeDasharray="5,5"
                    rx={8}
                    style={{ cursor: 'pointer', pointerEvents: 'all' }}
                    onMouseEnter={() => setHovered('angle-A-right')}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => {
                      onElementClick?.('angle-A-right');
                      onElementClick?.('angle-A'); // 기존 코드와 호환성을 위해 angle-A도 트리거
                    }}
                  />
                  {hovered === 'angle-A-right' && (
                    <text x={A.x + 30} y={A.y - 55} textAnchor="middle" fontSize={10} fill="#22c55e" fontWeight="bold">
                      ∠CAD
                    </text>
                  )}
                </g>
                
                {/* 중앙 분할선 표시 (접는선이 보일 때만) */}
                {showFoldLine && (
                  <line 
                    x1={A.x} y1={A.y - 50} 
                    x2={A.x} y2={A.y + 30}
                    stroke="#6b7280"
                    strokeWidth={1}
                    strokeDasharray="3,3"
                    opacity={0.5}
                  />
                )}
              </>
            )}
            
            <circle cx={B.x} cy={B.y} r={15} fill="transparent" stroke="transparent"
              style={{ cursor: 'pointer', pointerEvents: 'all' }}
              onMouseEnter={() => setHovered('angle-B')}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onElementClick?.('angle-B')}
            />
            <circle cx={C.x} cy={C.y} r={15} fill="transparent" stroke="transparent"
              style={{ cursor: 'pointer', pointerEvents: 'all' }}
              onMouseEnter={() => setHovered('angle-C')}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onElementClick?.('angle-C')}
            />
            {/* 필요할 때만 시각적 링 표시 */}
            {showAngleClickZones && (
              <>
                <motion.circle
                  cx={A.x} cy={A.y}
                  {...getCircleProps('angle-A', 20, 25)}
                />
                <motion.circle cx={B.x} cy={B.y} {...getCircleProps('angle-B', 15, 20)} />
                <motion.circle cx={C.x} cy={C.y} {...getCircleProps('angle-C', 15, 20)} />
              </>
            )}
            <text x={A.x - 10} y={A.y - 10} {...getTextStyle('angle-A')}>{labels.A}</text>
            <text x={B.x - 15} y={B.y + 20} {...getTextStyle('angle-B')}>{labels.B}</text>
            <text x={C.x + 10} y={C.y + 20} {...getTextStyle('angle-C')}>{labels.C}</text>
          </>
        )}
        {/* D 라벨은 RHS 문맥에서는 혼란을 주므로 숨긴다 */}
        {showDLabel && (
          <>
            <circle cx={D.x} cy={D.y} r={4} fill="#111827" />
            <text x={D.x + 6} y={D.y + 16} style={{ fill: '#374151', fontSize: 14, fontWeight: 600 }}>D</text>
          </>
        )}

        {/* 직각 표시: AD ⟂ BC 를 시각화 */}
        {showPerpendicularAtD && (
          (() => {
            const vAD = norm(vec(D, A));
            const vBC = norm(vec(B, C));
            const size = 12; // 표시 길이
            const p1 = add(D, vAD, size);
            const p2 = add(D, vBC, size);
            return (
              <g>
                <line x1={D.x} y1={D.y} x2={p1.x} y2={p1.y} stroke="#0ea5e9" strokeWidth={3} />
                <line x1={D.x} y1={D.y} x2={p2.x} y2={p2.y} stroke="#0ea5e9" strokeWidth={3} />
              </g>
            );
          })()
        )}

        {/* 중점 눈금 표시: BD = DC 를 시각화 */}
        {showMidpointTicksOnBC && (
          (() => {
            const vBC = norm(vec(B, C));
            const vN = norm(perp(vBC));
            const k = 6; // 눈금 길이
            const M1 = { x: (B.x + D.x) / 2, y: (B.y + D.y) / 2 };
            const M2 = { x: (C.x + D.x) / 2, y: (C.y + D.y) / 2 };
            return (
              <g>
                <line x1={M1.x - vN.x * k} y1={M1.y - vN.y * k} x2={M1.x + vN.x * k} y2={M1.y + vN.y * k} stroke="#10b981" strokeWidth={3} />
                <line x1={M2.x - vN.x * k} y1={M2.y - vN.y * k} x2={M2.x + vN.x * k} y2={M2.y + vN.y * k} stroke="#10b981" strokeWidth={3} />
              </g>
            );
          })()
        )}

        {/* 각 이등분 동일 각호 표시: A 주변에 두 개의 같은 호 */}
        {showAngleEqualityArcsAtA && (
          (() => {
            const r = 18; // 호 반지름
            const uAB = norm(vec(A, B));
            const uAC = norm(vec(A, C));
            const uAD = norm(vec(A, D));
            const s1 = { x: A.x + uAB.x * r, y: A.y + uAB.y * r };
            const m = { x: A.x + uAD.x * r, y: A.y + uAD.y * r };
            const e1 = m; // 첫 번째 호의 끝점
            const s2 = m; // 두 번째 호의 시작점
            const e2 = { x: A.x + uAC.x * r, y: A.y + uAC.y * r };
            return (
              <g>
                <path d={`M ${s1.x} ${s1.y} A ${r} ${r} 0 0 1 ${e1.x} ${e1.y}`} stroke="#3b82f6" strokeWidth={3} fill="none" />
                <path d={`M ${s2.x} ${s2.y} A ${r} ${r} 0 0 1 ${e2.x} ${e2.y}`} stroke="#3b82f6" strokeWidth={3} fill="none" />
              </g>
            );
          })()
        )}

        {/* 각 이등분 동일 표시: A 주변 두 점 */}
        {showAngleDotsAtA && (
          (() => {
            const r = 26;
            const uAB = norm(vec(A, B));
            const uAC = norm(vec(A, C));
            const uAD = norm(vec(A, D));
            const dirL = norm({ x: uAB.x + uAD.x, y: uAB.y + uAD.y });
            const dirR = norm({ x: uAC.x + uAD.x, y: uAC.y + uAD.y });
            const pL = { x: A.x + dirL.x * r, y: A.y + dirL.y * r };
            const pR = { x: A.x + dirR.x * r, y: A.y + dirR.y * r };
            return (
              <g>
                <circle cx={pL.x} cy={pL.y} r={3.5} fill="#ef4444" />
                <circle cx={pR.x} cy={pR.y} r={3.5} fill="#ef4444" />
              </g>
            );
          })()
        )}

        {/* polyhedra-folding 스타일 겹침 강조 - 각도가 겹칠 때 */}
        {showOverlapHighlights && !hideBaseBC && foldAngle > 85 && foldAngle < 180 && (
          <>
            {/* 왼쪽 밑각 (B) 겹침 표시 */}
            <motion.circle cx={B.x} cy={B.y} r={12} fill="rgba(255, 165, 0, 0.6)" stroke="#f59e0b" strokeWidth={3}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.8], r: [8, 15, 12] }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}
            />
            {/* 오른쪽 밑각 (C) 겹침 표시 */}
            <motion.circle cx={C.x} cy={C.y} r={12} fill="rgba(255, 165, 0, 0.6)" stroke="#f59e0b" strokeWidth={3}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.8], r: [8, 15, 12] }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}
            />
          </>
        )}

        {/* 밑각 B, C 각호 표시 */}
        {(showAngleArcAtB || showAngleArcAtC) && (
          (() => {
            const r = 16;
            const uBA = norm(vec(B, A));
            const uBC = norm(vec(B, C));
            const uCA = norm(vec(C, A));
            const uCB = norm(vec(C, B));
            const bStart = { x: B.x + uBA.x * r, y: B.y + uBA.y * r };
            const bEnd = { x: B.x + uBC.x * r, y: B.y + uBC.y * r };
            const cStart = { x: C.x + uCB.x * r, y: C.y + uCB.y * r };
            const cEnd = { x: C.x + uCA.x * r, y: C.y + uCA.y * r };
            return (
              <g>
                {showAngleArcAtB && (
                  <path d={`M ${bStart.x} ${bStart.y} A ${r} ${r} 0 0 1 ${bEnd.x} ${bEnd.y}`} stroke="#f59e0b" strokeWidth={5} fill="none" strokeLinecap="round" />
                )}
                {showAngleArcAtC && (
                  <path d={`M ${cStart.x} ${cStart.y} A ${r} ${r} 0 0 1 ${cEnd.x} ${cEnd.y}`} stroke="#f59e0b" strokeWidth={5} fill="none" strokeLinecap="round" />
                )}
              </g>
            );
          })()
        )}

        {/* 100% 접힘 시 밑각 동등 표시: B와 C에 동일 각호를 그린다 */}
        {!hideBaseBC && foldAngle >= 180 && (
          (() => {
            const r = 20; // 각호 반지름
            // B에서의 각호: BA 방향에서 BC 방향까지
            const uBA = norm(vec(B, A));
            const uBC = norm(vec(B, C));
            const bStart = { x: B.x + uBA.x * r, y: B.y + uBA.y * r };
            const bEnd   = { x: B.x + uBC.x * r, y: B.y + uBC.y * r };
            // C에서의 각호: CA 방향에서 CB 방향까지
            const uCA = norm(vec(C, A));
            const uCB = norm(vec(C, B));
            const cStart = { x: C.x + uCA.x * r, y: C.y + uCA.y * r };
            const cEnd   = { x: C.x + uCB.x * r, y: C.y + uCB.y * r };
            return (
              <g>
                <path d={`M ${bStart.x} ${bStart.y} A ${r} ${r} 0 0 1 ${bEnd.x} ${bEnd.y}`} stroke="#f59e0b" strokeWidth={3} fill="none" />
                <path d={`M ${cStart.x} ${cStart.y} A ${r} ${r} 0 0 1 ${cEnd.x} ${cEnd.y}`} stroke="#f59e0b" strokeWidth={3} fill="none" />
              </g>
            );
          })()
        )}
      </svg>
    </div>
  );
};

export default Triangle;
