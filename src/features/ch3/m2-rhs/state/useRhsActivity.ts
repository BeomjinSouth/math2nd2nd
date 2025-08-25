/**
 * RHS 모듈 전용 상태 훅
 * 이 훅은 병합 조작과 칩 수집을 간단한 로컬 상태로 관리하여
 * RHS 학습 흐름을 빠르게 시연할 수 있도록 합니다.
 * 의도는 이후 core의 상태머신 및 chip-system으로 쉽게 이관 가능한 형태로 유지하는 것입니다.
 *
 * 구성 요약
 * - 두 직각삼각형을 생성하고 버튼으로 병합을 시뮬레이션합니다.
 * - 병합 성공 시 직각 칩을 자동 수집하여 관찰 단계를 단축합니다.
 * - 칩 세트는 직각(R), 빗변(H), 다른 한 변(S)의 세 가지로 구성됩니다.
 * - 모든 칩 수집 후에는 RHA로 귀결됨을 표현하는 메시지를 ChipSystem 쪽 문구로 전달합니다.
 */

'use client';

import { useCallback, useMemo, useState } from 'react';
import { Triangle as TriangleType, checkRHS } from '@/core';
import type { Chip } from '@/components/ChipSystem';

// 샘플 좌표 유틸: 두 개의 직각삼각형을 생성합니다.
function createRightTrianglesPair(): { t1: TriangleType; t2: TriangleType } {
  // Triangle 컴포넌트의 viewBox는 400x300이다. 정규화 좌표는 대략 0~3 범위로 사용한다.
  // t1은 오른쪽에 직각이 위치하도록 설정한다(∠C=90°). 밑변 BC는 수평, AC는 수직.
  const t1: TriangleType = {
    A: { x: 2.6, y: 1.0 },
    B: { x: 0.8, y: 2.5 },
    C: { x: 2.6, y: 2.5 }
  };
  // t2는 왼쪽에 직각이 위치하도록 설정한다(∠B=90°). 밑변 BC는 수평, AB는 수직.
  const t2: TriangleType = {
    A: { x: 0.8, y: 1.0 },
    B: { x: 0.8, y: 2.5 },
    C: { x: 2.6, y: 2.5 }
  };
  return { t1, t2 };
}

export function useRhsActivity() {
  const { t1, t2 } = useMemo(createRightTrianglesPair, []);

  const [merged, setMerged] = useState(false);
  // 그림에서 강조 표시할 요소의 ID 목록입니다. Triangle 컴포넌트가 인식하는 ID를 사용합니다.
  const [highlights, setHighlights] = useState<string[]>([]);
  const [chips, setChips] = useState<Chip[]>([
    { id: 'right', label: '직각', type: 'angle', collected: false, description: '두 삼각형 모두 90°' },
    { id: 'hypotenuse', label: '빗변', type: 'side', collected: false, description: '가장 긴 변이 서로 같음' },
    { id: 'side', label: '다른 한 변', type: 'side', collected: false, description: '한 변의 길이가 서로 같음' }
  ]);

  const toggleMerge = useCallback(() => {
    setMerged(m => !m);
    // 데모 단계에서는 병합에 성공하면 자동으로 직각 칩을 수집하도록 처리합니다.
    setChips(prev => prev.map(c => (c.id === 'right' ? { ...c, collected: true } : c)));
  }, []);

  const onChipClick = useCallback((chipId: string) => {
    setChips(prev => prev.map(c => (c.id === chipId ? { ...c, collected: true } : c)));
    // 칩 수집 시 그림에서도 즉시 대응 요소를 강조합니다.
    if (chipId === 'right') {
      setHighlights(['angle-A']);
    } else if (chipId === 'hypotenuse') {
      setHighlights(['side-BC']);
    } else if (chipId === 'side') {
      setHighlights(['side-AB']);
    }
  }, []);

  // 그림의 변/각을 직접 클릭했을 때도 칩이 수집되도록 연결합니다.
  const onTriangleElementClick = useCallback((elementId: string) => {
    if (elementId === 'angle-A') {
      onChipClick('right');
    } else if (elementId === 'side-BC') {
      onChipClick('hypotenuse');
    } else if (elementId === 'side-AB' || elementId === 'side-AC') {
      onChipClick('side');
    }
  }, [onChipClick]);

  // 칩 수집 상태가 모두 true인지 확인합니다.
  const allChipsCollected = useMemo(() => chips.every(c => c.collected), [chips]);

  // 수학적으로 RHS가 실제 성립하는지 core의 checkRHS로 검증합니다.
  const rhsValidated = useMemo(() => {
    if (!allChipsCollected) return false;
    return !!checkRHS(t1, t2);
  }, [allChipsCollected, t1, t2]);

  // 완료 여부는 칩 수집과 수학적 검증이 모두 참일 때 true입니다.
  const isComplete = rhsValidated;

  const ui = useMemo(() => ({
    triangleA: t1,
    triangleB: t2,
    highlights,
    chips,
    isComplete,
    merged,
    stepIndex: allChipsCollected ? 3 : (merged ? 2 : 1)
  }), [t1, t2, highlights, chips, isComplete, merged, allChipsCollected]);

  const actions = useMemo(() => ({ onChipClick, toggleMerge, onTriangleElementClick }), [onChipClick, toggleMerge, onTriangleElementClick]);

  return { ui, actions };
}


