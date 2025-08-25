'use client';

/**
 * DragFillBoard
 * 이 컴포넌트는 학습자가 주어진 개념 타일을 드래그하여 그룹의 빈 칸에 채워 넣도록 돕는 상호작용 보드입니다.
 * 의도는 활동을 마친 뒤 핵심 사실을 스스로 정리하게 하여 개념 연결과 어휘를 강화하는 것입니다.
 *
 * 설계 원칙
 * - 외부에서 전달한 타일 목록과 그룹/슬롯 정의만으로 동작합니다.
 * - 각 슬롯은 하나의 정답 타일(expectedTileId)만 허용합니다.
 * - HTML5 Drag and Drop API를 사용하여 외부 의존성을 추가하지 않습니다.
 * - 접근성 기본값을 지키기 위해 버튼과 aria 속성을 함께 제공합니다.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ConfettiBurst } from '@/components/Celebration';

export interface DragTile {
  /** 타일의 고유 식별자입니다. */
  id: string;
  /** 타일에 표시될 라벨입니다. 수학 기호나 문장을 포함할 수 있습니다. */
  label: string;
}

export interface DragSlot {
  /** 슬롯의 고유 식별자입니다. */
  id: string;
  /** 이 슬롯이 정답으로 허용하는 타일의 id입니다. */
  expectedTileId: string;
  /** 슬롯 아래쪽에 보조 설명으로 보여줄 텍스트입니다. 선택 사항입니다. */
  hint?: string;
}

export interface DragGroup {
  /** 그룹의 고유 식별자입니다. */
  id: string;
  /** 그룹 제목입니다. 예: 주어진 조건, 계산으로 구한 조건, 결론 */
  title: string;
  /** 그룹에 포함된 슬롯 목록입니다. */
  slots: DragSlot[];
}

interface DragFillBoardProps {
  /** 드래그 가능한 모든 타일의 목록입니다. */
  tiles: DragTile[];
  /** 보드에 배치할 그룹과 각 그룹의 슬롯 정의입니다. */
  groups: DragGroup[];
  /** 모든 슬롯이 올바르게 채워졌을 때 호출되는 콜백입니다. */
  onComplete?: () => void;
  /** 타일 팔레트 영역 제목입니다. */
  paletteTitle?: string;
  /** 추가 스타일 적용을 위한 클래스 이름입니다. */
  className?: string;
}

type SlotFillState = Record<string, string | undefined>; // slotId -> tileId

const DragFillBoard: React.FC<DragFillBoardProps> = ({ tiles, groups, onComplete, paletteTitle, className }) => {
  // 내부 상태는 어떤 슬롯에 어떤 타일이 놓였는지를 기록합니다.
  const [fills, setFills] = useState<SlotFillState>({});
  const [errorSlotId, setErrorSlotId] = useState<string | null>(null);
  const [hoverSlotId, setHoverSlotId] = useState<string | null>(null);

  // 사용 가능한 타일 목록은 전체 타일 중 아직 어떤 슬롯에도 배치되지 않은 타일입니다.
  const availableTiles = useMemo(() => {
    const used = new Set(Object.values(fills).filter(Boolean) as string[]);
    return tiles.filter(t => !used.has(t.id));
  }, [tiles, fills]);

  // 모든 슬롯이 올바르게 채워졌는지 확인합니다.
  const isAllCorrect = useMemo(() => {
    return groups.every(g => g.slots.every(s => fills[s.id] === s.expectedTileId));
  }, [groups, fills]);

  // 정답 달성 시 콜백을 1회 호출합니다.
  useEffect(() => {
    if (isAllCorrect && onComplete) {
      onComplete();
    }
  }, [isAllCorrect, onComplete]);

  // 드래그 시작 시 타일 id를 DataTransfer에 저장합니다.
  function onDragStartTile(e: React.DragEvent<HTMLButtonElement>, tileId: string) {
    e.dataTransfer.setData('text/plain', tileId);
    e.dataTransfer.effectAllowed = 'move';
  }

  // 슬롯으로 드롭할 때 정답 여부를 판정합니다.
  function onDropToSlot(e: React.DragEvent<HTMLDivElement>, slot: DragSlot) {
    e.preventDefault();
    const tileId = e.dataTransfer.getData('text/plain');
    if (!tileId) return;
    if (tileId === slot.expectedTileId) {
      setFills(prev => ({ ...prev, [slot.id]: tileId }));
      setErrorSlotId(null);
      setHoverSlotId(null);
    } else {
      // 오답인 경우 잠시 흔들리는 효과를 주기 위해 errorSlotId를 기록합니다.
      setErrorSlotId(slot.id);
      setTimeout(() => setErrorSlotId(null), 500);
    }
  }

  function onDragOverAllow(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function onDragEnterSlot(slotId: string) {
    setHoverSlotId(slotId);
  }

  function onDragLeaveSlot(slotId: string) {
    if (hoverSlotId === slotId) setHoverSlotId(null);
  }

  function removeFromSlot(slotId: string) {
    setFills(prev => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  }

  function resetAll() {
    setFills({});
    setErrorSlotId(null);
  }

  return (
    <div className={`relative ${className ?? ''}`}>
      <ConfettiBurst show={isAllCorrect} />
      <div className="grid lg:grid-cols-3 gap-4">
        {groups.map(group => (
          <div key={group.id} className="bg-white rounded-lg border shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{group.title}</h3>
            <div className="space-y-3">
              {group.slots.map(slot => {
                const placedTileId = fills[slot.id];
                const placedTile = tiles.find(t => t.id === placedTileId);
                const correct = placedTileId === slot.expectedTileId;
                const errored = errorSlotId === slot.id;
                const hovered = hoverSlotId === slot.id;
                const base = 'w-full min-h-12 rounded-md border px-3 py-2 flex items-center justify-between transition-colors';
                const cls = placedTile
                  ? correct
                    ? `${base} bg-green-50 border-green-300 text-green-900`
                    : `${base} bg-red-50 border-red-300 text-red-900`
                  : `${base} ${hovered ? 'bg-violet-50 border-violet-300' : 'bg-gray-50 border-gray-300 border-dashed'} text-gray-700`;
                const shake = errored ? 'animate-[shake_0.5s]' : '';
                return (
                  <div
                    key={slot.id}
                    className={`${cls} ${shake}`}
                    onDrop={e => onDropToSlot(e, slot)}
                    onDragOver={onDragOverAllow}
                    onDragEnter={() => onDragEnterSlot(slot.id)}
                    onDragLeave={() => onDragLeaveSlot(slot.id)}
                    role="button"
                    aria-label={`드롭 영역 ${group.title}`}
                  >
                    <div className="text-sm">
                      {placedTile ? placedTile.label : '여기에 타일을 드래그하여 놓으세요'}
                    </div>
                    {placedTile && (
                      <button
                        type="button"
                        onClick={() => removeFromSlot(slot.id)}
                        className="ml-3 text-xs px-2 py-1 rounded bg-white/80 border hover:bg-white"
                        aria-label="배치 제거"
                      >
                        제거
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="bg-white rounded-lg border shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{paletteTitle ?? '드래그할 타일'}</h3>
          <div className="flex flex-col gap-2">
            {availableTiles.map(tile => (
              <button
                key={tile.id}
                draggable
                onDragStart={e => onDragStartTile(e, tile.id)}
                className="text-sm px-3 py-2 rounded-md border bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                aria-grabbed="false"
                aria-label={`타일 ${tile.label}`}
                type="button"
              >
                {tile.label}
              </button>
            ))}
            {availableTiles.length === 0 && (
              <div className="text-xs text-gray-700">모든 타일이 배치되었습니다</div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={resetAll}
              className="text-xs px-2 py-1 rounded border bg-white hover:bg-gray-50 text-gray-900"
            >
              다시 하기
            </button>
            {isAllCorrect && (
              <div className="text-xs text-green-800">완료되었습니다</div>
            )}
          </div>
        </div>
      </div>

      {/* 간단한 흔들림 애니메이션을 유틸리티 클래스 없이 직접 정의합니다. */}
      <style>{`
        @keyframes shake {
          10% { transform: translateX(-2px); }
          30% { transform: translateX(3px); }
          50% { transform: translateX(-3px); }
          70% { transform: translateX(2px); }
          90% { transform: translateX(-1px); }
        }
      `}</style>
    </div>
  );
};

export default DragFillBoard;


