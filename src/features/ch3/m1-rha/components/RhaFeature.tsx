'use client';

/**
 * RHA 합동 학습 화면 최상위 컴포넌트
 * 이 컴포넌트는 직각-빗변-예각 조건이 어떻게 유일한 삼각형을 결정하는지 시각적으로 탐구합니다.
 * 사용자가 참조 삼각형의 빗변을 선택한 후, 슬라이더로 E점의 위치와 각도를 조절하여
 * F점이 가로축에 닿게 하고 목표 각도를 맞추는 과정을 통해 RHA 합동을 체험합니다.
 * 
 * 주요 기능:
 * - 참조 삼각형에서 빗변 선택
 * - 구성 영역에서 슬라이더로 삼각형 조작
 * - 성공 시 합동 조건 확인 및 퀴즈 제공
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, Point } from '../types';
import ReferenceTriangle from './ReferenceTriangle';
import ConstructionArea from './ConstructionArea';
import ControlPanel from './ControlPanel';

const RhaFeature: React.FC = () => {
  // 게임 상태 관리
  const [gameState, setGameState] = useState<GameState>(GameState.Idle);
  
  // 참조 삼각형의 꼭짓점들
  const [triangleA, setTriangleA] = useState<Point>({ x: 0, y: 0 });
  const [triangleB, setTriangleB] = useState<Point>({ x: 0, y: 0 });
  const [triangleC, setTriangleC] = useState<Point>({ x: 0, y: 0 });
  
  // 실제 정답값들 (목표값)
  const [trueH, setTrueH] = useState<number>(0);     // 실제 빗변의 길이
  const [trueTheta, setTrueTheta] = useState<number>(0); // 실제 목표 각도
  
  // 사용자가 조작하는 현재 값들
  const [h, setH] = useState<number>(0);             // 현재 빗변 길이
  const [theta, setTheta] = useState<number>(0);     // 현재 각도 (사용자 조작)
  const [e, setE] = useState<number>(50);            // E점의 위치
  
  // 단계적 제어를 위한 상태
  const [thetaAdjusted, setThetaAdjusted] = useState<boolean>(false); // 각도 정확 일치 여부

  /**
   * 랜덤한 직각삼각형을 생성하는 함수
   * 빗변 길이와 예각을 랜덤으로 설정하여 새로운 문제를 만듭니다.
   */
  const generateRandomTriangle = useCallback(() => {
    const h_int = Math.floor(Math.random() * 101) + 150; // 150-250 범위의 빗변 길이
    const theta_int = Math.floor(Math.random() * 51) + 20; // 20-70도 범위의 예각

    setTrueH(h_int);
    setTrueTheta(theta_int);

    // 삼각법을 이용해 삼각형 좌표 계산
    const thetaRad = (theta_int * Math.PI) / 180;
    const sideAB = h_int * Math.cos(thetaRad); 
    const sideBC = h_int * Math.sin(thetaRad);

    // B점을 기준점으로 설정
    const bX = 280;
    const bY = 280;

    setTriangleB({ x: bX, y: bY });
    setTriangleA({ x: bX, y: bY - sideAB });
    setTriangleC({ x: bX - sideBC, y: bY });

    // 상태 초기화
    setGameState(GameState.Idle);
    setH(0);
    setTheta(0);
    setE(50);
    setThetaAdjusted(false); // 각도 정확 일치 상태 초기화
  }, []);

  // 컴포넌트 마운트 시 초기 삼각형 생성
  useEffect(() => {
    generateRandomTriangle();
  }, [generateRandomTriangle]);

  /**
   * 빗변 선택 핸들러
   * 사용자가 참조 삼각형의 빗변을 클릭했을 때 호출됩니다.
   */
  const handleHypotenuseSelect = useCallback(() => {
    if (gameState === GameState.Idle) {
      setH(trueH);                    // 빗변 길이를 실제값으로 설정
      setTheta(45);                   // 초기 각도를 45도로 설정
      setGameState(GameState.Sliding); // 슬라이딩 상태로 전환
    }
  }, [gameState, trueH]);
  
  // 라디안 변환값들 (계산 최적화를 위해 메모이제이션)
  const thetaRad = useMemo(() => (theta * Math.PI) / 180, [theta]);
  const trueThetaRad = useMemo(() => (trueTheta * Math.PI) / 180, [trueTheta]);
  
  /**
   * F점의 좌표 계산
   * 사용자가 조작하는 각도와 E점 위치를 바탕으로 F점의 좌표를 계산합니다.
   */
  const F = useMemo(() => {
    if (!h) return { x: 0, y: 0 };
    return {
      x: -h * Math.sin(thetaRad),
      y: e - h * Math.cos(thetaRad),
    };
  }, [e, h, thetaRad]);
  
  /**
   * E 슬라이더의 최대값 계산
   * 문제 해결이 가능하도록 충분한 범위를 제공합니다.
   */
  const eMax = useMemo(() => {
    if(!h) return 200;
    const target = h * Math.cos(trueThetaRad || (45 * Math.PI / 180));
    return Math.max(target * 1.5, h, 100);
  }, [h, trueThetaRad]);
  
  // 목표 E값 (정답 위치)
  const targetE = useMemo(() => h * Math.cos(trueThetaRad), [h, trueThetaRad]);

  /**
   * 각도 자석 효과 - 정답 근처에서 자동으로 스냅
   * 각도가 목표값의 ±2도 이내에 오면 자동으로 정답으로 조정됩니다.
   * E 슬라이더는 각도가 정확히 일치할 때만 활성화됩니다.
   */
  useEffect(() => {
    if (gameState === GameState.Sliding && h > 0) {
      const magnetThreshold = 2.0; // 자석 효과 임계값 (도 단위)
      const angleDiff = Math.abs(theta - trueTheta);
      
      if (angleDiff <= magnetThreshold && angleDiff > 0.0001) {
        // 부드러운 애니메이션으로 정답에 스냅
        const snapTimer = setTimeout(() => {
          setTheta(trueTheta);
          setThetaAdjusted(true); // 정확 일치로 표시
        }, 150);
        return () => clearTimeout(snapTimer);
      }
      
      // 정확히 일치 여부를 상시 반영
      setThetaAdjusted(angleDiff < 0.0001);
    }
  }, [theta, trueTheta, gameState, h]);

  /**
   * 성공 조건 체크
   * F점이 가로축에 충분히 가깝고 각도가 목표값에 충분히 가까운지 확인합니다.
   */
  useEffect(() => {
    if (gameState === GameState.Sliding) {
      const positionTolerance = 1.5;  // 위치 허용 오차
      const angleTolerance = 1.0;     // 각도 허용 오차 (도 단위)
      
      if (Math.abs(F.y) <= positionTolerance && Math.abs(theta - trueTheta) <= angleTolerance) {
        setE(targetE);          // 정확한 위치로 스냅
        setTheta(trueTheta);    // 정확한 각도로 스냅
        setGameState(GameState.Success); // 성공 상태로 전환
      }
    }
  }, [F.y, gameState, targetE, theta, trueTheta]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 font-sans">
      {/* 개선된 헤더 섹션 */}
      <header className="w-full max-w-7xl mx-auto text-center mb-6">
        <div className="relative">
          {/* 배경 그래디언트 효과 */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-xl blur-lg"></div>
          
          <div className="relative bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">R</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">H</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">A</span>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              RHA 합동 시각적 탐구
            </h1>
            
          </div>
        </div>
      </header>
      
      {/* 메인 콘텐츠 영역: 3열 레이아웃 */}
      <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 참조 삼각형 영역 */}
        <div className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-gray-700/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">📐</span>
            </div>
            <h3 className="text-xl font-bold text-cyan-400">노란색 빗변 AC를 클릭!</h3>
            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">ABC</span>
          </div>
          
          {/* 초기 안내 메시지 */}
          {gameState === GameState.Idle && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-400 text-lg">👆</span>
                <span className="text-yellow-300 font-semibold">시작하기</span>
              </div>
            </div>
          )}
          
          <ReferenceTriangle A={triangleA} B={triangleB} C={triangleC} onHypotenuseSelect={handleHypotenuseSelect} gameState={gameState} />
        </div>
        
        {/* 구성 영역 */}
        <div className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-gray-700/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">🔧</span>
            </div>
            <h3 className="text-xl font-bold text-blue-400">구성 영역</h3>
            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">DEF</span>
          </div>
          <p className="text-sm text-gray-400 mb-4">슬라이더로 삼각형을 조작하여 RHA 조건을 완성하세요</p>
          <ConstructionArea e={e} h={h} theta={theta} F={F} gameState={gameState} />
        </div>

        {/* 제어판 영역 */}
        <div className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-gray-700/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <ControlPanel 
            gameState={gameState}
            h={h}
            theta={theta}
            trueTheta={trueTheta}
            e={e}
            F={F}
            eMax={eMax}
            thetaAdjusted={thetaAdjusted}
            onSliderChange={(newE) => {
              if ((gameState === GameState.Sliding || gameState === GameState.Success) && thetaAdjusted) {
                if (gameState !== GameState.Success) setGameState(GameState.Sliding);
                setE(newE);
              }
            }}
            onThetaSliderChange={(newTheta) => {
              if (gameState === GameState.Sliding || gameState === GameState.Success) {
                if (gameState !== GameState.Success) setGameState(GameState.Sliding);
                setTheta(newTheta);
                setThetaAdjusted(Math.abs(newTheta - trueTheta) < 0.0001);
              }
            }}
            onReset={generateRandomTriangle}
          />
        </div>
      </main>

      {/* 성공 모달 제거: 성공 요약은 제어판에서 표시 */}

      {/* CSS 애니메이션 정의 */}
      <style>{`
        @keyframes success-modal-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes success-modal-scale-in {
          from { transform: scale(0.7) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-success-fade-in {
          animation: success-modal-fade-in 0.3s ease-out forwards;
        }
        .animate-success-scale-in {
          animation: success-modal-scale-in 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
        }
      `}</style>
    </div>
  );
};

export default RhaFeature;


