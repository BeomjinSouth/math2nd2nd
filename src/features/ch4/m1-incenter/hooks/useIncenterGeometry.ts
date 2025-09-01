/**
 * 이 훅은 주어진 삼각형 꼭짓점으로부터 내심과 관련된 모든 기하 요소를 계산합니다
 * 의도는 렌더링 컴포넌트가 순수한 계산 결과를 재사용 가능하게 제공받도록 하여
 * 단계별 상호작용에서 일관되고 정확한 기하 표현을 유지하는 것입니다
 */

import { useMemo } from 'react';
import type { Point, Vertices, Line, SmallTriangle } from '../types';
import { TrianglePair } from '../types';

const vec = (p1: Point, p2: Point) => ({ x: p2.x - p1.x, y: p2.y - p1.y });
const dot = (v1: Point, v2: Point) => v1.x * v2.x + v1.y * v2.y;
const magnitude = (v: Point) => Math.hypot(v.x, v.y);
const normalize = (v: Point) => {
  const m = magnitude(v);
  return m === 0 ? { x: 0, y: 0 } : { x: v.x / m, y: v.y / m };
};
const add = (p1: Point, p2: Point) => ({ x: p1.x + p2.x, y: p1.y + p2.y });
const scale = (v: Point, s: number) => ({ x: v.x * s, y: v.y * s });

export const useIncenterGeometry = (vertices: Vertices) => {
  const { A, B, C } = vertices;

  return useMemo(() => {
    const vAB = vec(A, B);
    const vAC = vec(A, C);
    const vBA = vec(B, A);
    const vBC = vec(B, C);
    const vCA = vec(C, A);
    const vCB = vec(C, B);

    const lenAB = magnitude(vAB);
    const lenAC = magnitude(vAC);
    const lenBC = magnitude(vBC);

    const perimeter = lenBC + lenAC + lenAB;
    const Ix = (lenBC * A.x + lenAC * B.x + lenAB * C.x) / perimeter;
    const Iy = (lenBC * A.y + lenAC * B.y + lenAB * C.y) / perimeter;
    const incenter: Point = { x: Ix, y: Iy };

    const bisectorDirA = normalize(add(normalize(vAB), normalize(vAC)));
    const bisectorDirB = normalize(add(normalize(vBA), normalize(vBC)));
    const bisectorDirC = normalize(add(normalize(vCA), normalize(vCB)));

    const bisectorA: Line = { start: A, end: add(A, scale(bisectorDirA, 600)) };
    const bisectorB: Line = { start: B, end: add(B, scale(bisectorDirB, 600)) };
    const bisectorC: Line = { start: C, end: add(C, scale(bisectorDirC, 600)) };

    const vAI = vec(A, incenter);
    const projAD = dot(vAI, vAB) / (lenAB || 1);
    const D = add(A, scale(normalize(vAB), projAD));

    const vBI = vec(B, incenter);
    const projBE = dot(vBI, vBC) / (lenBC || 1);
    const E = add(B, scale(normalize(vBC), projBE));

    const vCI = vec(C, incenter);
    const projCF = dot(vCI, vCA) / (lenAC || 1);
    const F = add(C, scale(normalize(vCA), projCF));

    const perpendiculars: { D: Line; E: Line; F: Line } = {
      D: { start: incenter, end: D },
      E: { start: incenter, end: E },
      F: { start: incenter, end: F },
    };

    const incircleRadius = magnitude(vec(incenter, D));

    const createPath = (p1: Point, p2: Point, p3: Point) => `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} Z`;

    const smallTriangles: SmallTriangle[] = [
      { id: 'AFI', pair: TrianglePair.PAIR_A, vertices: [A, F, incenter], path: createPath(A, F, incenter) },
      { id: 'ADI', pair: TrianglePair.PAIR_A, vertices: [A, D, incenter], path: createPath(A, D, incenter) },
      { id: 'BDI', pair: TrianglePair.PAIR_B, vertices: [B, D, incenter], path: createPath(B, D, incenter) },
      { id: 'BEI', pair: TrianglePair.PAIR_B, vertices: [B, E, incenter], path: createPath(B, E, incenter) },
      { id: 'CEI', pair: TrianglePair.PAIR_C, vertices: [C, E, incenter], path: createPath(C, E, incenter) },
      { id: 'CFI', pair: TrianglePair.PAIR_C, vertices: [C, F, incenter], path: createPath(C, F, incenter) },
    ];

    return {
      incenter,
      bisectorA,
      bisectorB,
      bisectorC,
      feet: { D, E, F },
      perpendiculars,
      incircleRadius,
      smallTriangles,
    };
  }, [A, B, C]);
};


