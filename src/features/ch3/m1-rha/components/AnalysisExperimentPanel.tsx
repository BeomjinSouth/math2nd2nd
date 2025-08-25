'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Triangle } from '@/components/Triangle';
import AngleSumAnalysisScene from './AngleSumAnalysisScene';

interface AnalysisExperimentPanelProps {
  ui: {
    analyzing: boolean;
    highlights: string[];
    triangleA: any;
    triangleB: any;
  };
  actions: {
    toggleAnalysis: () => void;
  };
  title?: string;
  canvasWidthClass?: string;
  instantExact?: boolean;
}

const AnalysisExperimentPanel: React.FC<AnalysisExperimentPanelProps> = ({ 
  ui, 
  actions, 
  title = '각도 분석하기', 
  canvasWidthClass,
  instantExact 
}) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (instantExact) {
      setShowAnalysis(ui.analyzing);
      setIsTransitioning(false);
      return;
    }
    if (ui.analyzing) {
      setIsTransitioning(true);
      const t = setTimeout(() => {
        setShowAnalysis(true);
        setIsTransitioning(false);
      }, 700);
      return () => clearTimeout(t);
    }
    setShowAnalysis(false);
    setIsTransitioning(false);
  }, [ui.analyzing]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-bold">📐</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 mb-6">
        <div className={`relative ${canvasWidthClass ?? 'w-[36rem]'} h-56 mx-auto`}>
          {/* 기존 두 삼각형 레이어 */}
          <motion.div
            className="absolute inset-0 flex gap-6 justify-center"
            animate={{ opacity: showAnalysis ? 0 : 1 }}
            transition={{ duration: instantExact ? 0 : 0.4 }}
          >
            <motion.div
              className="w-72 h-56"
              animate={{ x: ui.analyzing || isTransitioning ? -20 : 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
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
              className="w-72 h-56"
              animate={{ x: ui.analyzing || isTransitioning ? -300 : 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
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

          {/* 각도 분석 결과 장면 */}
          <motion.div
            className="absolute inset-0 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: showAnalysis ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <AngleSumAnalysisScene />
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={actions.toggleAnalysis}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg font-medium text-lg"
        >
          {ui.analyzing ? '📐 분석 해제' : '🔍 각도 분석'}
        </button>
      </div>
    </div>
  );
};

export default AnalysisExperimentPanel;