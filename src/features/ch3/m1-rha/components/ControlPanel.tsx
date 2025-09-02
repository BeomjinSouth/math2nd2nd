/**
 * RHA 합동 제어판 컴포넌트
 * 이 컴포넌트는 사용자가 RHA 조건을 맞추기 위해 상호작용할 수 있는 모든 제어 요소를 제공합니다.
 * E점의 위치와 각도를 조절하는 슬라이더, 현재 상태 표시, 그리고 성공 시 퀴즈를 포함합니다.
 * 
 * 주요 기능:
 * - 게임 상태에 따른 안내 메시지 표시
 * - 빗변 길이와 각도 정보 표시
 * - E 슬라이더 (점 E의 위치 조절)
 * - 각도 슬라이더 (∠DEF 조절)
 * - 새 삼각형 생성 버튼
 * - 성공 시 RHA 합동 관련 퀴즈 제공
 */

'use client';

import React, { useState } from 'react';
import { ControlPanelProps, GameState } from '../types';

/**
 * RHA 합동에 대한 퀴즈 컴포넌트
 * 성공 시 사용자의 이해도를 확인하는 간단한 선택형 퀴즈를 제공합니다.
 */
const Quiz: React.FC = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const correctAnswer = 1; // 정답은 인덱스 1 (값 1)

  const options = [0, 1, 2, '무한'];

  const handleSelect = (index: number) => {
    setSelected(index);
    if (index !== correctAnswer) {
      setShowHint(true);
    } else {
      setShowHint(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
      <h3 className="font-bold text-lg text-cyan-400">간단 퀴즈</h3>
      <p className="mt-1 text-gray-300">
        RHA 조건(직각, 같은 빗변 길이, 같은 예각)을 만족하는 직각삼각형의 개수는?
      </p>
      <div className="flex space-x-2 mt-3">
        {options.map((opt, index) => (
          <button
            key={index}
            onClick={() => handleSelect(index)}
            className={`px-4 py-2 rounded-md transition-colors duration-200 font-semibold ${
              selected === index
                ? index === correctAnswer
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
                : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {showHint && (
        <div className="mt-3 text-sm p-3 bg-yellow-900/50 border border-yellow-700 text-yellow-300 rounded-md">
          <b>힌트:</b> 빗변의 길이와 예각이 정해지면, 나머지 한 변의 길이(슬라이더가 나타내는 값 &#39;e&#39;)도 
          단 하나의 값으로 결정됩니다. 따라서 삼각형은 하나뿐입니다.
        </div>
      )}
    </div>
  );
};

/**
 * 메인 제어판 컴포넌트
 */
const ControlPanel: React.FC<ControlPanelProps> = ({ 
  gameState, h, theta, trueTheta, e, eMax, thetaAdjusted,
  onSliderChange, onThetaSliderChange, onReset 
}) => {
  
  /**
   * 게임 상태와 진행 단계에 따른 안내 메시지를 반환합니다.
   */
  const getInstruction = () => {
    switch (gameState) {
      case GameState.Sliding:
        if (!thetaAdjusted) {
          return '📐 먼저 각도 슬라이더를 조절하여 목표 각도에 맞춰보세요. (자석 효과가 도움을 줄 거예요!)';
        } else {
          return '📏 이제 E 슬라이더를 조절하여 F가 가로축(DH)에 닿게 만들어보세요.';
        }
      case GameState.Success:
        return '🎉 성공! RHA 조건을 만족하는 직각삼각형은 유일하게 결정됩니다.';
      default:
        return '';
    }
  };

  // 슬라이더 비활성화 여부
  const isThetaSliderDisabled = gameState === GameState.Idle;
  const isESliderDisabled = gameState === GameState.Idle || !thetaAdjusted;

  return (
    <div className="bg-transparent w-full">
      
      {/* 헤더 및 새 삼각형 버튼 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">⚙️</span>
        </div>
        <h3 className="text-xl font-bold text-purple-400">제어판</h3>
        <div className="ml-auto">
          <button 
            onClick={onReset} 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md transition-transform duration-150 active:scale-95"
          >
            새 삼각형
          </button>
        </div>
      </div>
      
      {/* 안내 메시지 */}
      <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-300 leading-relaxed">
          {getInstruction().replace(/'/g, "&#39;")}
        </p>
      </div>

      {/* 현재 상태 표시 - 개선된 UI */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 p-4 rounded-lg">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-white text-sm font-bold">H</span>
          </div>
          <span className="text-xs text-blue-300 block">빗변 AC</span>
          <span className="text-xl font-mono text-white font-bold">{(h / 25).toFixed(1)} cm</span>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 p-4 rounded-lg">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-gray-900 text-sm font-bold">∠</span>
          </div>
          <span className="text-xs text-yellow-300 block">현재 각도</span>
          <span className="text-xl font-mono text-white font-bold">{theta.toFixed(1)}°</span>
        </div>
        
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 p-4 rounded-lg">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-white text-sm font-bold">🎯</span>
          </div>
          <span className="text-xs text-green-300 block">목표 각도</span>
          <span className="text-xl font-mono text-white font-bold">{trueTheta.toFixed(0)}°</span>
        </div>
      </div>
      
      {/* 진행 상태 표시바 */}
      <div className="mt-6 bg-gray-700 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out"
          style={{ 
            width: `${gameState === GameState.Idle ? 0 : 
                     gameState === GameState.Sliding ? (thetaAdjusted ? 70 : 35) : 100}%` 
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>시작</span>
        <span>각도 조절</span>
        <span>위치 조절</span>
        <span>완료</span>
      </div>

      {/* 슬라이더 제어 영역 - 개선된 UI */}
      <div className="space-y-4">
        
        {/* 성공 요약 카드 */}
        {gameState === GameState.Success && (
          <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-900/20 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h4 className="text-lg font-bold text-emerald-300">RHA 합동 성공</h4>
            </div>
            <div className="bg-gray-800/60 rounded-lg p-4 mb-4">
              <div className="text-center mb-2">
                <span className="text-green-300 font-semibold">직각(R)</span>
                <span className="text-gray-400 mx-2">+</span>
                <span className="text-blue-300 font-semibold">빗변(H)</span>
                <span className="text-gray-400 mx-2">+</span>
                <span className="text-purple-300 font-semibold">예각(A)</span>
              </div>
              <p className="text-sm text-gray-200 text-center leading-relaxed">
                조건이 일치하여 단 하나의 삼각형이<br/>
                <span className="text-cyan-300 font-semibold">유일하게 결정</span>되었습니다
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 text-center">
                <div className="text-blue-300">빗변 길이</div>
                <div className="text-white font-bold">{(h / 25).toFixed(1)} cm</div>
              </div>
              <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3 text-center">
                <div className="text-green-300">완성 각도</div>
                <div className="text-white font-bold">{theta.toFixed(1)}°</div>
              </div>
            </div>
            <button 
              onClick={onReset}
              className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-lg shadow-md transition-transform duration-150 active:scale-95"
            >
              🎯 다시 도전하기
            </button>
          </div>
        )}
        
        {/* 각도 슬라이더 - 우선순위 1 */}
        <div className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
          isThetaSliderDisabled 
            ? 'border-gray-600 bg-gray-700/30' 
            : thetaAdjusted 
              ? 'border-green-500/50 bg-green-900/20'
              : 'border-yellow-500/50 bg-yellow-900/20'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              isThetaSliderDisabled 
                ? 'bg-gray-600 text-gray-400' 
                : thetaAdjusted 
                  ? 'bg-green-500 text-white'
                  : 'bg-yellow-500 text-gray-900'
            }`}>
              1
            </div>
            <label htmlFor="theta-slider" className={`font-medium ${
              isThetaSliderDisabled ? 'text-gray-500' : 'text-white'
            }`}>
              🎯 각도 조절 (∠DEF) {thetaAdjusted && '✓'}
            </label>
            {!isThetaSliderDisabled && !thetaAdjusted && (
              <span className="text-xs text-yellow-400 animate-pulse">← 먼저 조절하세요</span>
            )}
          </div>
          <input
            id="theta-slider"
            type="range"
            min="1"
            max="89"
            step="0.1"
            value={theta}
            onChange={(event) => onThetaSliderChange(parseFloat(event.target.value))}
            disabled={isThetaSliderDisabled}
            className="w-full h-4 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed range-lg"
            style={{ 
              '--thumb-color': isThetaSliderDisabled ? '#6b7280' : thetaAdjusted ? '#22c55e' : '#eab308',
              background: isThetaSliderDisabled 
                ? '#4b5563' 
                : `linear-gradient(to right, ${thetaAdjusted ? '#22c55e' : '#eab308'} 0%, ${thetaAdjusted ? '#22c55e' : '#eab308'} ${((theta-1)/88)*100}%, #374151 ${((theta-1)/88)*100}%, #374151 100%)`
            } as React.CSSProperties}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1°</span>
            <span>목표: {trueTheta.toFixed(0)}°</span>
            <span>89°</span>
          </div>
        </div>
        
        {/* E 슬라이더 - 우선순위 2 */}
        <div className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
          isESliderDisabled 
            ? 'border-gray-600 bg-gray-700/30' 
            : 'border-cyan-500/50 bg-cyan-900/20'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              isESliderDisabled 
                ? 'bg-gray-600 text-gray-400' 
                : 'bg-cyan-500 text-white'
            }`}>
              2
            </div>
            <label htmlFor="e-slider" className={`font-medium ${
              isESliderDisabled ? 'text-gray-500' : 'text-white'
            }`}>
              📏 E점 위치 조절
            </label>
            {isESliderDisabled && gameState === GameState.Sliding && (
              <span className="text-xs text-gray-400">각도를 먼저 조절하세요</span>
            )}
          </div>
          <input
            id="e-slider"
            type="range"
            min="0"
            max={eMax}
            step="0.1"
            value={e}
            onChange={(event) => onSliderChange(parseFloat(event.target.value))}
            disabled={isESliderDisabled}
            className="w-full h-4 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed range-lg"
            style={{ 
              '--thumb-color': isESliderDisabled ? '#6b7280' : '#06b6d4',
              background: isESliderDisabled 
                ? '#4b5563' 
                : `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(e/eMax)*100}%, #374151 ${(e/eMax)*100}%, #374151 100%)`
            } as React.CSSProperties}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>F가 가로축에 닿도록</span>
            <span>{eMax.toFixed(0)}</span>
          </div>
        </div>
      </div>
      
      {/* 성공 시 퀴즈 표시 */}
      {gameState === GameState.Success && <Quiz />}
      
      {/* 향상된 슬라이더 스타일링 */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--thumb-color);
          cursor: pointer;
          margin-top: -10px;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: all 0.2s ease;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
        input[type=range]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--thumb-color);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        input[type=range]:disabled::-webkit-slider-thumb {
          cursor: not-allowed;
          transform: none !important;
          opacity: 0.5;
        }
        input[type=range]:disabled::-moz-range-thumb {
          cursor: not-allowed;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export default ControlPanel;
