'use client';

/**
 * RHS 합동 학습 화면 최상위 컴포넌트
 * 이 컴포넌트는 두 직각삼각형을 병합하는 조작을 통해
 * 이등변삼각형을 형성하고 RHA로 귀결되는 논리를 체험하도록 안내합니다.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Triangle } from '@/components/Triangle';
import { ChipSystem } from '@/components/ChipSystem';
import { useRhsActivity } from '../state/useRhsActivity';
import StepIndicatorRhs from './StepIndicator';
import ProofPanelRhs from './ProofPanel';
import ExactMergeScene from './ExactMergeScene';
import DragSummary from './DragSummary';

export default function RhsFeature() {
  const { ui, actions } = useRhsActivity();
  // 병합 전환 애니메이션: 이동 → 크로스페이드 → 정밀 장면
  const [showExact, setShowExact] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (ui.merged) {
      setIsTransitioning(true);
      const t = setTimeout(() => {
        setShowExact(true);
        setIsTransitioning(false);
      }, 700);
      return () => clearTimeout(t);
    }
    // 병합 해제 시 즉시 원상복구
    setShowExact(false);
    setIsTransitioning(false);
  }, [ui.merged]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white p-4 max-w-4xl mx-auto">
      {/* 좌측 상단 홈 버튼 */}
      <motion.div 
        className="fixed top-4 left-4 z-40"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <button
          onClick={() => window.location.href = '/'}
          className="backdrop-blur-sm bg-white/80 border border-white/40 rounded-2xl p-3 shadow-lg hover:bg-white/90 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">🏠</span>
            </div>
            <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">홈</span>
          </div>
        </button>
      </motion.div>
      
      {/* 헤더 */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">직각삼각형 RHS 합동</h1>
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

      {/* 병합 실험하기 섹션 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔄</span>
            <h2 className="text-lg font-semibold text-gray-800">병합 실험하기</h2>
          </div>
        </div>
        
        <div className="p-8">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-8 mb-6">
            <div className="relative w-full max-w-2xl h-64 mx-auto">
              {/* 기존 두 삼각형 레이어 */}
              <motion.div
                className="absolute inset-0 flex gap-8 justify-center items-center"
                animate={{ opacity: showExact ? 0 : 1 }}
                transition={{ duration: 0.4 }}
              >
                {/* 왼쪽 삼각형 */}
                <motion.div
                  className="w-56 h-48"
                  animate={{ x: ui.merged || isTransitioning ? -20 : 0 }}
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
                  animate={{ x: ui.merged || isTransitioning ? -200 : 0 }}
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

              {/* 병합 결과 장면 레이어 */}
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
          
          <div className="flex justify-center">
            <button
              onClick={actions.toggleMerge}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg font-medium text-lg flex items-center gap-2"
            >
              <span>{ui.merged ? '🔄' : '🔀'}</span>
              {ui.merged ? '병합 해제' : '병합 시도'}
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
          <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-cyan-600 font-bold">🔄</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-800 mb-2">병합 결과</h3>
          <p className="text-xs text-gray-600">
            병합했을 때 어떤 모양의 삼각형이 만들어지는지 관찰해보세요.
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
              <h3 className="font-medium text-gray-800 mb-1">변을 통한 새로운 도형 성질 관찰</h3>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-1">이등변삼각형의 성질 발견하기</h3>
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


