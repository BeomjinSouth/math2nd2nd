'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Triangle } from '@/components/Triangle';
import ExactMergeScene from './ExactMergeScene';

interface MergeExperimentPanelProps {
  ui: {
    merged: boolean;
    highlights: string[];
    triangleA: any;
    triangleB: any;
  };
  actions: {
    toggleMerge: () => void;
  };
  title?: string;
  // 너비가 좁은 컬럼에서 오버플로우를 방지하기 위한 선택적 캔버스 너비 클래스입니다.
  // 예시: "w-full max-w-[32rem]" 또는 "w-[28rem]"
  canvasWidthClass?: string;
  // 증명 단계 등에서 병합 시 즉시 정밀 장면으로 전환하고 중간 애니메이션을 생략할지 여부입니다.
  instantExact?: boolean;
}

const MergeExperimentPanel: React.FC<MergeExperimentPanelProps> = ({ ui, actions, title = '병합 실험하기', canvasWidthClass, instantExact }) => {
  const [showExact, setShowExact] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (instantExact) {
      setShowExact(ui.merged);
      setIsTransitioning(false);
      return;
    }
    if (ui.merged) {
      setIsTransitioning(true);
      const t = setTimeout(() => {
        setShowExact(true);
        setIsTransitioning(false);
      }, 700);
      return () => clearTimeout(t);
    }
    setShowExact(false);
    setIsTransitioning(false);
  }, [ui.merged]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-cyan-100">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
          <span className="text-cyan-600 font-bold">🔄</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>

      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-8 mb-6">
        <div className={`relative ${canvasWidthClass ?? 'w-[36rem]'} h-56 mx-auto`}>
          {/* 기존 두 삼각형 레이어 */}
          <motion.div
            className="absolute inset-0 flex gap-0 justify-center"
            animate={{ opacity: showExact ? 0 : 1 }}
            transition={{ duration: instantExact ? 0 : 0.4 }}
          >
            <motion.div
              className="w-72 h-56"
              animate={{ x: ui.merged || isTransitioning ? 82 : 0 }}
              transition={{ type: 'tween', ease: 'easeOut', duration: 0.5 }}
            >
              <Triangle
                triangle={ui.triangleA}
                highlightedElements={ui.highlights}
                showFoldLine={false}
                showInnerPieces={false}
                showLabels={true}
                labels={{ A: 'A', B: 'B', C: 'C' }}
              />
            </motion.div>
            <motion.div
              className="w-72 h-56 -ml-10"
              animate={{ x: ui.merged || isTransitioning ? -37 : 0 }}
              transition={{ type: 'tween', ease: 'easeOut', duration: 0.5 }}
            >
              <Triangle
                triangle={ui.triangleB}
                highlightedElements={ui.highlights}
                showFoldLine={false}
                showInnerPieces={false}
                showLabels={true}
                labels={{ A: 'D', B: 'F', C: 'E' }}
              />
            </motion.div>
          </motion.div>

          {/* 병합 결과 장면 */}
          <motion.div
            className="absolute inset-0 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: showExact ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <ExactMergeScene />
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={actions.toggleMerge}
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg font-medium text-lg"
        >
          {ui.merged ? '🔄 병합 해제' : '🔀 병합 시도'}
        </button>
      </div>
    </div>
  );
};

export default MergeExperimentPanel;


