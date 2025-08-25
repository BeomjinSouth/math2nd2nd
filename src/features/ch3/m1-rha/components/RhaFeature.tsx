'use client';

/**
 * RHA 합동 학습 화면 최상위 컴포넌트
 * 이 컴포넌트는 두 직각삼각형에서 빗변과 한 예각이 같을 때
 * 내각의 합이 180°임을 이용해 나머지 각도 같아져 ASA로 귀결됨을 체험하도록 안내합니다.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Triangle } from '@/components/Triangle';
import { ChipSystem } from '@/components/ChipSystem';
import { useRhaActivity } from '../state/useRhaActivity';
import StepIndicatorRha from './StepIndicator';
import ProofPanelRha from './ProofPanel';
import AngleSumAnalysisScene from './AngleSumAnalysisScene';
import DragSummary from './DragSummary';

export default function RhaFeature() {
  const { ui, actions } = useRhaActivity();
  // 각도 분석 전환 애니메이션: 관찰 → 크로스페이드 → 분석 장면
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (ui.analyzing) {
      setIsTransitioning(true);
      const t = setTimeout(() => {
        setShowAnalysis(true);
        setIsTransitioning(false);
      }, 700);
      return () => clearTimeout(t);
    }
    // 분석 해제 시 즉시 원상복구
    setShowAnalysis(false);
    setIsTransitioning(false);
  }, [ui.analyzing]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">직각삼각형 RHA 합동</h1>
        <p className="text-sm text-gray-600">단계 1 / 4</p>
      </div>

      {/* 두 삼각형 탐색하기 섹션 */}
      <div className="bg-gradient-to-r from-cyan-400 to-blue-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🔍</span>
          <h2 className="text-xl font-semibold">두 삼각형 탐색하기</h2>
        </div>
        <p className="text-base opacity-90">
          두 직각삼각형에서 어떤 조건이 주어졌는지 관찰해보세요.
        </p>
      </div>

      {/* 분석 실험하기 섹션 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📏</span>
            <h2 className="text-lg font-semibold text-gray-800">분석 실험하기</h2>
          </div>
        </div>
        
        <div className="p-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 mb-6">
            <div className="relative w-full max-w-2xl h-64 mx-auto">
              {/* 기존 두 삼각형 레이어 */}
              <motion.div
                className="absolute inset-0 flex gap-8 justify-center items-center"
                animate={{ opacity: showAnalysis ? 0 : 1 }}
                transition={{ duration: 0.4 }}
              >
                {/* 왼쪽 삼각형 */}
                <motion.div
                  className="w-56 h-48"
                  animate={{ x: ui.analyzing || isTransitioning ? -20 : 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                  <Triangle
                    triangle={ui.triangleA}
                    highlightedElements={ui.highlights}
                    showFoldLine={false}
                    showInnerPieces={false}
                    onElementClick={actions.onTriangleElementClick}
                    className="w-56 h-48"
                    showLabels={true}
                    labels={{ A: 'A', B: 'B', C: 'C' }}
                  />
                </motion.div>

                {/* 오른쪽 삼각형 */}
                <motion.div
                  className="w-56 h-48"
                  animate={{ x: ui.analyzing || isTransitioning ? -200 : 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                  <Triangle
                    triangle={ui.triangleB}
                    highlightedElements={ui.highlights}
                    showFoldLine={false}
                    showInnerPieces={false}
                    onElementClick={actions.onTriangleElementClick}
                    className="w-56 h-48"
                    showLabels={true}
                    labels={{ A: 'D', B: 'F', C: 'E' }}
                  />
                </motion.div>
              </motion.div>

              {/* 각도 분석 장면 레이어 */}
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
          
          <div className="flex justify-center">
            <button
              onClick={actions.toggleAnalysis}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg font-medium text-lg flex items-center gap-2"
            >
              <span>{ui.analyzing ? '📏' : '🔍'}</span>
              {ui.analyzing ? '분석 해제' : '각도 분석'}
            </button>
          </div>
        </div>
      </div>

      {/* 3개의 카드 섹션 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-orange-600 font-bold">∠</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-800 mb-2">직각 확인</h3>
          <p className="text-xs text-gray-600">
            두 삼각형 모두 직각을 가지고 있는지 확인해보세요.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-green-600 font-bold">| |</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-800 mb-2">길이 비교</h3>
          <p className="text-xs text-gray-600">
            빗변과 다른 한 변의 길이가 어떻게 되어 있는지 살펴보세요.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-blue-600 font-bold">📏</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-800 mb-2">각도 분석</h3>
          <p className="text-xs text-gray-600">
            180° 성질로 나머지 각도가 같아짐을 확인해보세요.
          </p>
        </div>
      </div>

      {/* 이 단계에서 배우는 것 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🎓</span>
          <h2 className="text-lg font-semibold text-gray-800">이 단계에서 배우는 것</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-1">두 직각삼각형의 특성 파악하기</h3>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-1">변의 길이를 통한 도형 성질 관찰</h3>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-1">내각의 합 180° 성질 발견하기</h3>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-1">합동 조건의 단서 찾기</h3>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="flex justify-between items-center">
        <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
          이전 단계
        </button>
        
        <div className="flex gap-2">
          <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
          <span className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">2</span>
          <span className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">3</span>
          <span className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">4</span>
        </div>
        
        <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
          다음 단계
        </button>
      </div>
    </div>
  );
}


