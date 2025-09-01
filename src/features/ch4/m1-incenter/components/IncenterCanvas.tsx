/**
 * IncenterCanvas
 * 이 컴포넌트는 '삼각형의 내심' 학습에서 SVG 기반 조작 장면을 그립니다
 * 의도는 꼭짓점 드래그, 내심 연결, 수선 스냅, 소삼각형 선택, 내접원 애니메이션 등
 * 단계별 상호작용을 시각적으로 제공하는 것입니다
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Point, Vertices, SmallTriangle } from '../types';
import { TrianglePair } from '../types';
import { useIncenterGeometry } from '../hooks/useIncenterGeometry';

export interface IncenterCanvasProps {
  step: number;
  vertices: Vertices;
  setVertices: (v: Vertices) => void;
  isIcConnected: boolean;
  onIcConnected: () => void;
  drawnPerpendiculars: ('D' | 'E' | 'F')[];
  onPerpendicularDrawn: (foot: 'D' | 'E' | 'F') => void;
  selectedTriangle: SmallTriangle | null;
  setSelectedTriangle: (t: SmallTriangle | null) => void;
  correctPairs: TrianglePair[];
  animateCircle: boolean;
  isAnimationDone: boolean;
  onAnimationDone: () => void;
}

interface DragState {
  type: 'vertex' | 'ic-line' | 'perpendicular' | null;
  target?: 'C';
  tempPoint?: Point;
  snapTarget?: 'D' | 'E' | 'F' | null;
}

const SNAP_THRESHOLD = 20;

const RightAngleIcon = ({ at, side1, side2 }: { at: Point; side1: Point; side2: Point }) => {
  const size = 18;
  const v1 = { x: side1.x - at.x, y: side1.y - at.y };
  const angle1 = Math.atan2(v1.y, v1.x);
  return (
    <g transform={`translate(${at.x}, ${at.y}) rotate(${(angle1 * 180) / Math.PI})`}>
      <path d={`M 0 0 L ${size} 0 L ${size} ${size} L 0 ${size} Z`} fill="none" stroke="rgba(239, 68, 68, 0.7)" strokeWidth="3" />
    </g>
  );
};

export const IncenterCanvas: React.FC<IncenterCanvasProps> = ({
  step,
  vertices,
  setVertices,
  isIcConnected,
  onIcConnected,
  drawnPerpendiculars,
  onPerpendicularDrawn,
  selectedTriangle,
  setSelectedTriangle,
  correctPairs,
  animateCircle,
  isAnimationDone,
  onAnimationDone,
}) => {
  const [dragState, setDragState] = useState<DragState>({ type: null });
  const [animationProgress, setAnimationProgress] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const animationTimerRef = useRef<number | null>(null);

  const geo = useIncenterGeometry(vertices);

  const getSVGPoint = useCallback((e: React.MouseEvent | MouseEvent): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = (e as MouseEvent).clientX;
    pt.y = (e as MouseEvent).clientY;
    const svgPoint = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    return { x: svgPoint.x, y: svgPoint.y };
  }, []);

  const distance = (p1: Point, p2: Point) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

  const handleMouseDown = (e: React.MouseEvent, type: DragState['type'], target?: any) => {
    const currentPoint = getSVGPoint(e);
    if (type === 'vertex' && step < 3) {
      setDragState({ type: 'vertex', target });
    } else if (type === 'ic-line' && step === 1 && !isIcConnected) {
      setDragState({ type: 'ic-line', tempPoint: currentPoint });
    } else if (type === 'perpendicular' && step === 2 && drawnPerpendiculars.length < 3) {
      setDragState({ type: 'perpendicular', tempPoint: currentPoint });
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.type) return;
      const currentPoint = getSVGPoint(e);
      switch (dragState.type) {
        case 'vertex':
          if (dragState.target) {
            setVertices({ ...vertices, [dragState.target]: currentPoint });
          }
          break;
        case 'ic-line':
          setDragState({ ...dragState, tempPoint: currentPoint });
          break;
        case 'perpendicular': {
          let closest: 'D' | 'E' | 'F' | null = null;
          let min = Infinity;
          (Object.keys(geo.feet) as Array<'D' | 'E' | 'F'>).forEach((key) => {
            if (drawnPerpendiculars.includes(key)) return;
            const d = distance(currentPoint, geo.feet[key]);
            if (d < min) {
              min = d;
              closest = key;
            }
          });
          if (min < SNAP_THRESHOLD * 2) {
            setDragState({ type: 'perpendicular', tempPoint: geo.feet[closest!], snapTarget: closest });
          } else {
            setDragState({ type: 'perpendicular', tempPoint: currentPoint, snapTarget: null });
          }
          break;
        }
      }
    },
    [dragState, vertices, setVertices, getSVGPoint, geo.feet, drawnPerpendiculars]
  );

  const handleMouseUp = useCallback(() => {
    switch (dragState.type) {
      case 'ic-line':
        if (dragState.tempPoint && distance(dragState.tempPoint, vertices.C) < SNAP_THRESHOLD) {
          onIcConnected();
        }
        break;
      case 'perpendicular':
        if (dragState.snapTarget) {
          onPerpendicularDrawn(dragState.snapTarget);
        }
        break;
    }
    setDragState({ type: null });
  }, [dragState, vertices.C, onIcConnected, onPerpendicularDrawn]);

  useEffect(() => {
    if (animateCircle && !isAnimationDone) {
      let start: number | null = null;
      const duration = 3000;
      const frame = (ts: number) => {
        if (!start) start = ts;
        const t = Math.min((ts - start) / duration, 1);
        setAnimationProgress(t);
        if (t < 1) {
          animationTimerRef.current = requestAnimationFrame(frame);
        } else {
          onAnimationDone();
        }
      };
      animationTimerRef.current = requestAnimationFrame(frame);
      return () => {
        if (animationTimerRef.current) cancelAnimationFrame(animationTimerRef.current);
        animationTimerRef.current = null;
      };
    }
  }, [animateCircle, isAnimationDone, onAnimationDone]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const pairColors: { [key in TrianglePair]: string } = {
    [TrianglePair.PAIR_A]: 'fill-blue-400',
    [TrianglePair.PAIR_B]: 'fill-green-400',
    [TrianglePair.PAIR_C]: 'fill-yellow-400',
  };

  const showStaticCircle = (step === 4 && isAnimationDone) || step > 4;

  const getCircleArcPath = (center: Point, radius: number, startPoint: Point, progress: number): string => {
    if (progress <= 0) return `M ${startPoint.x} ${startPoint.y}`;
    const startAngle = Math.atan2(startPoint.y - center.y, startPoint.x - center.x);
    const finalProgress = progress === 1 ? progress - 0.0001 : progress;
    const endAngle = startAngle + finalProgress * 2 * Math.PI;
    const endX = center.x + radius * Math.cos(endAngle);
    const endY = center.y + radius * Math.sin(endAngle);
    const largeArcFlag = progress > 0.5 ? 1 : 0;
    return `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  };

  return (
    <div className="w-full h-[500px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-xl overflow-hidden border-2 border-blue-200">
      <svg ref={svgRef} viewBox="0 0 800 600" className="w-full h-full cursor-default">
        {/* 배경 삼각형 - 더 눈에 잘 띄도록 개선 */}
        <path 
          d={`M ${vertices.A.x} ${vertices.A.y} L ${vertices.B.x} ${vertices.B.y} L ${vertices.C.x} ${vertices.C.y} Z`} 
          fill="rgba(59, 130, 246, 0.15)" 
          stroke="#3b82f6" 
          strokeWidth="6" 
          filter="drop-shadow(2px 2px 4px rgba(0,0,0,0.1))"
        />

        {step >= 1 && (
          <>
            {/* 각의 이등분선들 - 더 두드러지게 */}
            <line x1={geo.bisectorA.start.x} y1={geo.bisectorA.start.y} x2={geo.incenter.x} y2={geo.incenter.y} 
              stroke="#f97316" strokeWidth="4" strokeDasharray="8,4" opacity="0.8" />
            <line x1={geo.bisectorB.start.x} y1={geo.bisectorB.start.y} x2={geo.incenter.x} y2={geo.incenter.y} 
              stroke="#f97316" strokeWidth="4" strokeDasharray="8,4" opacity="0.8" />
            {/* 내심 점 - 더 크고 눈에 띄게 */}
            <circle cx={geo.incenter.x} cy={geo.incenter.y} r="12" fill="#f97316" stroke="#ea580c" strokeWidth="3" 
              filter="drop-shadow(2px 2px 6px rgba(0,0,0,0.3))" />
          </>
        )}

        {/* C로 연결되는 각의 이등분선 */}
        {isIcConnected && <line x1={geo.bisectorC.start.x} y1={geo.bisectorC.start.y} x2={geo.incenter.x} y2={geo.incenter.y} 
          stroke="#f97316" strokeWidth="4" strokeDasharray="8,4" opacity="0.8" />}
        
        {/* 드래그 중인 임시 선 - 더 눈에 띄게 */}
        {dragState.type === 'ic-line' && dragState.tempPoint && 
          <line x1={geo.incenter.x} y1={geo.incenter.y} x2={dragState.tempPoint.x} y2={dragState.tempPoint.y} 
            stroke="#3b82f6" strokeWidth="5" strokeDasharray="10,5" opacity="0.8" />}
        
        {/* C 점 스냅 영역 - 더 명확하게 */}
        {step === 1 && !isIcConnected && 
          <circle cx={vertices.C.x} cy={vertices.C.y} r={SNAP_THRESHOLD} 
            fill="rgba(59, 130, 246, 0.2)" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,4" 
            className="animate-pulse" />}

        {/* 수선들 - 더 선명하게 */}
        {drawnPerpendiculars.map((key) => (
          <React.Fragment key={key}>
            <line x1={geo.perpendiculars[key].start.x} y1={geo.perpendiculars[key].start.y} 
              x2={geo.perpendiculars[key].end.x} y2={geo.perpendiculars[key].end.y} 
              stroke="#ef4444" strokeWidth="5" opacity="0.9" 
              filter="drop-shadow(1px 1px 3px rgba(0,0,0,0.2))" />
            <RightAngleIcon at={geo.feet[key]} 
              side1={key === 'D' ? vertices.A : key === 'E' ? vertices.B : vertices.C} 
              side2={geo.incenter} />
          </React.Fragment>
        ))}
        
        {/* 수선 드래그 중 임시 선 */}
        {dragState.type === 'perpendicular' && dragState.tempPoint && (
          <line x1={geo.incenter.x} y1={geo.incenter.y} x2={dragState.tempPoint.x} y2={dragState.tempPoint.y} 
            stroke={dragState.snapTarget ? '#ef4444' : '#f87171'} strokeWidth="5" strokeDasharray="8,4" 
            opacity="0.8" />
        )}

        {step === 3 &&
          geo.smallTriangles.map((tri) => {
            const isSelected = selectedTriangle?.id === tri.id;
            const isCorrect = correctPairs.includes(tri.pair);
            const colorClass = isCorrect ? pairColors[tri.pair] : 'fill-transparent';
            return (
              <path key={tri.id} d={tri.path} className={`${colorClass} stroke-slate-400 stroke-[2px] hover:fill-slate-300/50 cursor-pointer transition-colors duration-200 ${isSelected ? 'fill-indigo-400/70' : ''}`} onClick={() => setSelectedTriangle(tri)} />
            );
          })}

        {/* 원 그리기 애니메이션 - 더 부드럽고 눈에 띄게 */}
        {step === 4 && animateCircle && !isAnimationDone && (
          <>
            <path d={getCircleArcPath(geo.incenter, geo.incircleRadius, geo.feet.D, animationProgress)} 
              stroke="#ec4899" strokeWidth="6" fill="none" 
              filter="drop-shadow(2px 2px 8px rgba(236, 72, 153, 0.4))"
              strokeLinecap="round" />
            <circle 
              cx={geo.incenter.x + geo.incircleRadius * Math.cos(Math.atan2(geo.feet.D.y - geo.incenter.y, geo.feet.D.x - geo.incenter.x) + animationProgress * 2 * Math.PI)} 
              cy={geo.incenter.y + geo.incircleRadius * Math.sin(Math.atan2(geo.feet.D.y - geo.incenter.y, geo.feet.D.x - geo.incenter.x) + animationProgress * 2 * Math.PI)} 
              r="10" fill="#e11d48" stroke="#be185d" strokeWidth="2"
              filter="drop-shadow(2px 2px 6px rgba(0,0,0,0.3))" />
          </>
        )}

        {/* 완성된 내접원 - 더 아름답게 */}
        {showStaticCircle && 
          <circle cx={geo.incenter.x} cy={geo.incenter.y} r={geo.incircleRadius} 
            fill="rgba(236, 72, 153, 0.15)" stroke="#ec4899" strokeWidth="5" 
            filter="drop-shadow(2px 2px 8px rgba(236, 72, 153, 0.3))" />}

        {/* 꼭지점 라벨들 - 더 선명하고 읽기 쉽게 */}
        {Object.entries(vertices).map(([key, { x, y }]) => (
          <g key={key}>
            <circle cx={x} cy={y - 20} r="20" fill="rgba(255, 255, 255, 0.9)" stroke="#334155" strokeWidth="2" />
            <text x={x} y={y - 15} textAnchor="middle" fill="#1e293b" fontSize="32" fontWeight="bold">
              {key}
            </text>
          </g>
        ))}
        
        {/* 내심 라벨 - 더 눈에 띄게 */}
        {step >= 1 && (
          <g>
            <circle cx={geo.incenter.x + 25} cy={geo.incenter.y - 5} r="18" fill="rgba(251, 146, 60, 0.9)" stroke="#ea580c" strokeWidth="2" />
            <text x={geo.incenter.x + 25} y={geo.incenter.y + 2} textAnchor="middle" fill="#ffffff" fontSize="28" fontWeight="bold">
              I
            </text>
          </g>
        )}
        
        {/* 수선의 발 라벨들 - 더 명확하게 */}
        {step >= 2 && (
          <>
            {drawnPerpendiculars.includes('D') && (
              <g>
                <circle cx={geo.feet.D.x} cy={geo.feet.D.y + 30} r="16" fill="rgba(239, 68, 68, 0.9)" stroke="#dc2626" strokeWidth="2" />
                <text x={geo.feet.D.x} y={geo.feet.D.y + 37} textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="bold">
                  D
                </text>
              </g>
            )}
            {drawnPerpendiculars.includes('E') && (
              <g>
                <circle cx={geo.feet.E.x + 25} cy={geo.feet.E.y + 25} r="16" fill="rgba(239, 68, 68, 0.9)" stroke="#dc2626" strokeWidth="2" />
                <text x={geo.feet.E.x + 25} y={geo.feet.E.y + 32} textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="bold">
                  E
                </text>
              </g>
            )}
            {drawnPerpendiculars.includes('F') && (
              <g>
                <circle cx={geo.feet.F.x - 25} cy={geo.feet.F.y + 25} r="16" fill="rgba(239, 68, 68, 0.9)" stroke="#dc2626" strokeWidth="2" />
                <text x={geo.feet.F.x - 25} y={geo.feet.F.y + 32} textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="bold">
                  F
                </text>
              </g>
            )}
          </>
        )}

        {/* 인터랙티브 핸들들 - 더 크고 눈에 띄게 */}
        {Object.entries(vertices).map(([key, { x, y }]) => (
          <circle 
            key={`${key}-handle`} 
            cx={x} cy={y} 
            r={key === 'C' && step < 3 ? '18' : '12'} 
            fill={key === 'C' && step < 3 ? '#3b82f6' : '#0ea5e9'} 
            stroke={key === 'C' && step < 3 ? '#1d4ed8' : '#0284c7'} 
            strokeWidth="3"
            className={key === 'C' && step < 3 ? 'cursor-grab active:cursor-grabbing hover:scale-110 transition-transform' : 'cursor-default'} 
            onMouseDown={(e) => handleMouseDown(e, 'vertex', key)}
            filter="drop-shadow(2px 2px 6px rgba(0,0,0,0.3))" />
        ))}

        {/* 단계별 인터랙티브 버튼들 - 더 명확한 피드백 */}
        {step === 1 && !isIcConnected && 
          <circle cx={geo.incenter.x} cy={geo.incenter.y} r="18" fill="#3b82f6" 
            stroke="#1d4ed8" strokeWidth="4"
            className="cursor-pointer animate-pulse hover:scale-110 transition-transform" 
            onMouseDown={(e) => handleMouseDown(e, 'ic-line')}
            filter="drop-shadow(3px 3px 8px rgba(0,0,0,0.4))" />}
        
        {step === 2 && drawnPerpendiculars.length < 3 && 
          <circle cx={geo.incenter.x} cy={geo.incenter.y} r="18" fill="#ef4444" 
            stroke="#dc2626" strokeWidth="4"
            className="cursor-pointer animate-pulse hover:scale-110 transition-transform" 
            onMouseDown={(e) => handleMouseDown(e, 'perpendicular')}
            filter="drop-shadow(3px 3px 8px rgba(0,0,0,0.4))" />}
      </svg>
    </div>
  );
};

export default IncenterCanvas;


