/**
 * RHA 모듈 전용 상태 훅 (새로운 구조)
 * 이 훅은 RHA 학습 흐름에 필요한 데이터와 액션을 제공합니다.
 * 새로운 시각적 탐구 방식과 기존 단계별 학습을 모두 지원합니다.
 * 
 * 구성 요약:
 * - 두 직각삼각형을 생성합니다. 각 A가 90°가 되도록 좌표를 배치합니다.
 * - 칩 세트는 직각(R), 빗변(H), 한 예각(A)의 세 가지로 구성됩니다.
 * - 칩 클릭 시 하이라이트를 업데이트하고 수집 상태를 변경합니다.
 * - 세 칩이 모두 수집된 경우 core 기하 유틸의 checkRHA로 최종 검증합니다.
 * - ui.isComplete는 칩 수집과 수학적 검증이 모두 참일 때에만 true가 됩니다.
 */

'use client';

import { useCallback, useMemo, useState } from 'react';
import { Triangle as TriangleType, measureTriangle, checkRHA } from '@/core';
import type { Chip } from '@/components/ChipSystem';

/**
 * 두 직각삼각형 샘플을 생성합니다.
 * 간단화를 위해 이등변을 활용하여 A에서 90°이 되도록 좌표를 배치합니다.
 * 실제 정밀 좌표는 추후 geometry 유틸로 대체 가능합니다.
 */
function createRightTrianglesPair(): { t1: TriangleType; t2: TriangleType } {
  // Triangle 컴포넌트의 viewBox는 400x300이다. 정규화 좌표는 대략 0~3 범위로 사용한다.
  // 두 삼각형 모두 A에서 90°가 되도록 설정한다.
  // t1: AB는 수직, AC는 수평이 되도록 배치한다.
  const t1: TriangleType = {
    A: { x: 1.2, y: 1.2 },
    B: { x: 1.2, y: 2.6 },
    C: { x: 2.6, y: 1.2 }
  };
  // t2: 동일한 크기이되 좌표를 살짝 이동하여 시각적 변별을 준다.
  const t2: TriangleType = {
    A: { x: 1.1, y: 1.1 },
    B: { x: 2.5, y: 1.1 },
    C: { x: 1.1, y: 2.5 }
  };
  return { t1, t2 };
}

/**
 * 직각 판정을 위한 간단한 헬퍼입니다.
 */
function hasRightAngle(tri: TriangleType): boolean {
  const a = measureTriangle(tri).angles;
  return Math.abs(a.A - 90) < 1 || Math.abs(a.B - 90) < 1 || Math.abs(a.C - 90) < 1;
}

/**
 * 빗변을 근사적으로 판단하기 위해 가장 긴 변을 반환합니다.
 */
function getHypotenuseLabel(tri: TriangleType): 'AB' | 'AC' | 'BC' {
  const s = measureTriangle(tri).sides;
  const entries: Array<{ k: 'AB' | 'AC' | 'BC'; v: number }> = [
    { k: 'AB', v: s.AB },
    { k: 'AC', v: s.AC },
    { k: 'BC', v: s.BC }
  ];
  return entries.sort((x, y) => y.v - x.v)[0].k;
}

/**
 * useRhaActivity 훅 본체입니다.
 */
export function useRhaActivity() {
  // 초기 직각삼각형 쌍을 생성합니다.
  const { t1, t2 } = useMemo(createRightTrianglesPair, []);

  // 각도 분석 상태 관리 (RHS의 병합과 유사)
  const [analyzing, setAnalyzing] = useState(false);

  // 칩 수집 상태를 로컬에서 관리합니다.
  const [chips, setChips] = useState<Chip[]>([
    { id: 'right', label: '직각', type: 'angle', collected: false, description: '두 삼각형 모두 90°' },
    { id: 'hypotenuse', label: '빗변', type: 'side', collected: false, description: '가장 긴 변이 서로 같음' },
    { id: 'acute', label: '한 예각', type: 'angle', collected: false, description: '한 쌍의 예각이 같음' }
  ]);

  // 하이라이트할 요소들의 ID 목록을 관리합니다.
  // Triangle 컴포넌트는 'angle-A' | 'angle-B' | 'angle-C' | 'side-AB' | 'side-AC' | 'side-BC' 등을 인식합니다.
  const [highlights, setHighlights] = useState<string[]>([]);

  // 칩 클릭 시 하이라이트와 수집 상태를 갱신합니다.
  const onChipClick = useCallback((chipId: string) => {
    // 칩 수집 처리
    setChips(prev => prev.map(c => (c.id === chipId ? { ...c, collected: true } : c)));

    // 칩 종류에 따라 하이라이트할 대상을 선택합니다.
    if (chipId === 'right') {
      // 직각을 angle-A로 표시합니다(우리 좌표에서는 A가 직각).
      setHighlights(['angle-A']);
    } else if (chipId === 'hypotenuse') {
      // 빗변은 가장 긴 변이며 우리 좌표에서는 BC입니다.
      setHighlights(['side-BC']);
    } else if (chipId === 'acute') {
      // 예각은 한쪽 밑각을 예시로 표시합니다.
      setHighlights(['angle-B']);
    }
  }, []);

  // 각도 분석 토글 액션 (RHS의 병합과 유사)
  const toggleAnalysis = useCallback(() => {
    setAnalyzing(a => !a);
    // 분석 시 자동으로 직각 칩을 수집하도록 처리합니다.
    if (!analyzing) {
      setChips(prev => prev.map(c => (c.id === 'right' ? { ...c, collected: true } : c)));
    }
  }, [analyzing]);

  // 삼각형 요소 클릭 핸들러 (RHS와 동일)
  const onTriangleElementClick = useCallback((elementId: string) => {
    if (elementId === 'angle-A') {
      onChipClick('right');
    } else if (elementId === 'side-BC') {
      onChipClick('hypotenuse');
    } else if (elementId === 'angle-B' || elementId === 'angle-C') {
      onChipClick('acute');
    }
  }, [onChipClick]);

  // 칩 수집이 완료되었는지 확인합니다.
  const allChipsCollected = useMemo(() => chips.every(c => c.collected), [chips]);

  // 수학적 측면에서 RHA가 실제로 성립하는지 core의 checkRHA로 검증합니다.
  const rhaValidated = useMemo(() => {
    // 칩이 모두 모였을 때만 계산 비용을 들여 검증합니다.
    if (!allChipsCollected) return false;
    return !!checkRHA(t1, t2);
  }, [allChipsCollected, t1, t2]);

  // RHA 완료 여부는 칩 수집과 수학적 검증이 모두 참일 때 true입니다.
  const isComplete = rhaValidated;

  // 화면 표현에 필요한 데이터 묶음을 제공합니다.
  const ui = useMemo(() => ({
    triangleA: t1,
    triangleB: t2,
    highlights,
    chips,
    isComplete,
    analyzing,
    stepIndex: allChipsCollected ? 3 : (analyzing ? 2 : 1)
  }), [t1, t2, highlights, chips, isComplete, analyzing, allChipsCollected]);

  // 내각합 확인을 통해 '한 예각' 칩을 수집하는 액션을 제공합니다.
  const confirmAngleSum = useCallback(() => {
    // 한 예각 칩 수집
    onChipClick('acute');
  }, [onChipClick]);

  // 외부로 노출할 액션 집합입니다.
  const actions = useMemo(() => ({ 
    onChipClick, 
    toggleAnalysis, 
    onTriangleElementClick,
    confirmAngleSum 
  }), [onChipClick, toggleAnalysis, onTriangleElementClick, confirmAngleSum]);

  return { ui, actions };
}
