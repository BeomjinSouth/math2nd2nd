'use client';

/**
 * ChipSystem 컴포넌트
 * 이 파일은 학습 활동 중 수집해야 하는 조건 칩들을 시각적으로 보여주고, 클릭하여 수집하는 UI를 제공합니다.
 * 의도는 다양한 합동 유형(SAS, ASA, RHA, RHS 등)에 맞춰 유연하게 문구와 슬롯 레이아웃을 커스터마이즈할 수 있게 하는 것입니다.
 * 또한 프로그래밍 비전문가도 쉽게 코드를 이해할 수 있도록 상세한 한글 주석을 제공합니다.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfettiBurst } from '@/components/Celebration';

/**
 * Chip 데이터 모델
 * id는 칩 고유 식별자입니다.
 * label은 사용자에게 보여줄 이름입니다.
 * type은 칩의 종류를 의미하며 색상과 배지를 결정합니다.
 * collected는 이미 수집했는지를 나타냅니다.
 * description은 보조 설명 텍스트입니다.
 */
export interface Chip {
  id: string; // 칩의 고유 ID
  label: string; // 칩에 표시할 라벨
  type: 'side' | 'angle' | 'common'; // 칩의 유형(S, A, 공통)
  collected: boolean; // 수집 여부
  description?: string; // 칩에 대한 보조 설명
}

/**
 * ChipSystem 컴포넌트 속성
 * chips는 화면에 표시할 칩 목록입니다.
 * onChipClick은 사용자가 칩을 클릭했을 때 호출되는 콜백입니다.
 * targetPattern은 슬롯에 표시할 패턴 배열이며 문자열을 자유롭게 넣을 수 있습니다.
 *  예: ['S','A','S'] 또는 ['A','S','A'] 또는 ['R','H','S']
 * isComplete는 모든 칩을 수집해 목표를 완성했음을 의미합니다.
 * className은 외부에서 스타일을 덮어쓰는 용도입니다.
 * titleText와 subtitleText는 상단 제목과 안내 문구를 커스터마이즈합니다.
 * completeTitle과 completeMessage는 완료 카드의 제목과 본문을 커스터마이즈합니다.
 */
interface ChipSystemProps {
  chips: Chip[]; // 표시할 칩 목록
  onChipClick?: (chipId: string) => void; // 칩 클릭 콜백
  targetPattern?: string[]; // 슬롯 패턴 문자열 배열
  isComplete?: boolean; // 완료 여부
  className?: string; // 외부 스타일 클래스
  titleText?: string; // 상단 제목 커스텀 텍스트
  subtitleText?: string; // 상단 보조 설명 커스텀 텍스트
  completeTitle?: string; // 완료 카드 제목 커스텀 텍스트
  completeMessage?: string; // 완료 카드 본문 커스텀 텍스트
  /** 칩 카드를 클릭 가능하게 할지 여부. 기본값은 true입니다. */
  clickable?: boolean;
}

const ChipSystem: React.FC<ChipSystemProps> = ({
  chips, // 칩 리스트
  onChipClick, // 클릭 콜백
  targetPattern = ['S', 'A', 'S'], // 기본 패턴은 SAS
  isComplete = false, // 기본은 미완료 상태
  className = '', // 외부 스타일 클래스
  titleText = '합동 조건 찾기', // 기본 제목
  subtitleText = '삼각형의 변과 각을 클릭하여 합동 조건을 모아보세요.', // 기본 부제
  completeTitle = '합동을 발견했습니다!', // 기본 완료 제목
  completeMessage = '수집한 조건으로 합동이 성립합니다.', // 기본 완료 메시지
  clickable = true
}) => {
  // 칩 유형에 따라 색상을 결정합니다.
  const getChipColor = (type: Chip['type']) => {
    switch (type) {
      case 'side': return '#3b82f6'; // 파란색(변)
      case 'angle': return '#ef4444'; // 빨간색(각)
      case 'common': return '#22c55e'; // 초록색(공통)
      default: return '#6b7280'; // 회색(기본)
    }
  };
  
  // 칩 유형을 S/A 배지로 변환합니다.
  const getChipTypeLabel = (type: Chip['type']) => {
    switch (type) {
      case 'side': return 'S'; // 변
      case 'angle': return 'A'; // 각
      case 'common': return 'S'; // 공통변은 S로 표기
      default: return '?'; // 알 수 없는 타입
    }
  };
  
  // 수집된 칩만 따로 계산해서 진행률과 슬롯 매칭에 사용합니다.
  const collectedChips = chips.filter(chip => chip.collected);
  const targetSlots = targetPattern.length;

  // 타입 우선 매칭으로 슬롯을 채웁니다. S는 side/common을, A는 angle을 우선 배치합니다.
  const slotFilledBy: (Chip | null)[] = new Array(targetSlots).fill(null);
  const remaining = [...collectedChips];
  for (let i = 0; i < targetSlots; i++) {
    const p = targetPattern[i];
    if (p === 'S') {
      const idx = remaining.findIndex(c => c.type === 'side' || c.type === 'common');
      slotFilledBy[i] = idx >= 0 ? remaining.splice(idx, 1)[0] : null;
    } else if (p === 'A') {
      const idx = remaining.findIndex(c => c.type === 'angle');
      slotFilledBy[i] = idx >= 0 ? remaining.splice(idx, 1)[0] : null;
    } else {
      slotFilledBy[i] = remaining.shift() ?? null;
    }
  }
  const filledCount = slotFilledBy.filter(Boolean).length;

  // 완료 시 짧게 confetti를 표시합니다. 외부 isComplete 변화에 반응합니다.
  const [showConfetti, setShowConfetti] = useState(false);
  useEffect(() => {
    if (isComplete) {
      setShowConfetti(true);
      const id = setTimeout(() => setShowConfetti(false), 1200);
      return () => clearTimeout(id);
    }
  }, [isComplete]);
  
  return (
    <div className={`relative w-full max-w-2xl mx-auto p-4 ${className}`}>
      <ConfettiBurst show={showConfetti} />
      {/* 상단 제목과 부제. 학습 맥락에 따라 커스터마이즈 가능 */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {titleText}
        </h3>
        <p className="text-sm text-gray-800">
          {subtitleText}
        </p>
      </div>
      
      {/* 수집 가능한 칩 목록 */}
      <div className="mb-8">
        <h4 className="text-md font-medium text-gray-900 mb-3">조건 요소들</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {chips.map((chip) => (
            <motion.button
              key={chip.id}
              onClick={clickable && !chip.collected ? () => onChipClick?.(chip.id) : undefined}
              disabled={chip.collected || !clickable}
              className={`relative p-3 rounded-lg border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                chip.collected
                  ? 'bg-gray-50 border-gray-300 cursor-default'
                  : clickable
                    ? 'bg-white hover:shadow-md cursor-pointer'
                    : 'bg-white border-gray-300 cursor-default'
              }`}
              style={{
                borderColor: chip.collected ? '#d1d5db' : '#111827'
              }}
              whileHover={!chip.collected && clickable ? { scale: 1.02 } : {}}
              whileTap={!chip.collected && clickable ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${
                  chip.collected ? 'text-gray-900' : 'text-gray-900'
                }`} style={{ opacity: chip.collected ? 0.9 : 1 }}>
                  {chip.label}
                </span>
                <motion.div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                  style={{ backgroundColor: chip.collected ? `${getChipColor(chip.type)}` : '#111827', opacity: chip.collected ? 0.5 : 1 }}
                  animate={{
                    backgroundColor: chip.collected ? `${getChipColor(chip.type)}` : '#111827',
                    opacity: chip.collected ? 0.5 : 1
                  }}
                >
                  {getChipTypeLabel(chip.type)}
                </motion.div>
              </div>
              {chip.description && (
                <p className="text-xs text-gray-700 mt-1 text-left" style={{ opacity: chip.collected ? 0.8 : 1 }}>
                  {chip.description}
                </p>
              )}
              {chip.collected && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ backgroundColor: `${getChipColor(chip.type)}20` }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* 패턴 슬롯. 문자열 배열을 그대로 시각화하여 다양한 표기 사용 가능 */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">패턴</h4>
        <div className="flex justify-center items-center space-x-4">
          {targetPattern.map((patternType, index) => {
            const matchingChip = slotFilledBy[index] ?? undefined;
            const isSlotFilled = matchingChip !== null && matchingChip !== undefined;
            
            return (
              <motion.div
                key={index}
                className={`w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center text-2xl font-bold ${
                  isSlotFilled ? 'border-solid' : 'border-gray-300'
                }`}
                style={{
                  backgroundColor: isSlotFilled && matchingChip ? `${getChipColor(matchingChip.type)}22` : 'transparent',
                  borderColor: isSlotFilled && matchingChip ? getChipColor(matchingChip.type) : '#d1d5db'
                }}
                animate={{
                  scale: isSlotFilled ? 1 : 0.95,
                  backgroundColor: isSlotFilled && matchingChip ? `${getChipColor(matchingChip.type)}22` : 'transparent'
                }}
              >
                <AnimatePresence>
                  {isSlotFilled ? (
                    <motion.span
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: -180 }}
                      style={{ color: getChipColor(matchingChip.type) }}
                    >
                      {patternType}
                    </motion.span>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      className="text-gray-500"
                    >
                      {patternType}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* 진행 상황 바 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">진행 상황</span>
          <span className="text-sm font-medium text-gray-800">
            {Math.min(filledCount, targetSlots)} / {targetSlots}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(Math.min(filledCount, targetSlots) / targetSlots) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
      
      {/* 완료 카드. 상단 텍스트를 커스터마이즈 가능 */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            className="bg-green-100 border border-green-300 rounded-lg p-4 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl mr-2">🎉</span>
              <h4 className="text-lg font-bold text-green-800">
                {completeTitle}
              </h4>
            </div>
            <p className="text-green-700">
              {completeMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChipSystem;