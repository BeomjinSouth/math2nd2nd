/**
 * IncenterFeature
 * 이 컨테이너는 '삼각형의 내심' 파트의 단계 관리와 상호작용 로직을 담당합니다
 * 의도는 App.tsx에 있던 교육 흐름을 모듈화하여 Next.js 페이지에 쉽게 탑재하는 것입니다
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import IncenterCanvas from './IncenterCanvas';
import type { Vertices, SmallTriangle, TrianglePair } from '../types';

const TOTAL_STEPS = 6;

const shuffleArray = (array: string[]) => {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};

export default function IncenterFeature() {
  const [step, setStep] = useState(1);
  const [vertices, setVertices] = useState<Vertices>({
    A: { x: 150, y: 500 },
    B: { x: 650, y: 500 },
    C: { x: 550, y: 100 },
  });

  const [isIcConnected, setIsIcConnected] = useState(false);
  const [drawnPerpendiculars, setDrawnPerpendiculars] = useState<('D' | 'E' | 'F')[]>([]);
  const [selectedTriangle, setSelectedTriangle] = useState<SmallTriangle | null>(null);
  const [correctPairs, setCorrectPairs] = useState<TrianglePair[]>([]);
  const [showWrongPairAlert, setShowWrongPairAlert] = useState(false);

  const [step5DroppedPoints, setStep5DroppedPoints] = useState<(string | null)[]>([null, null, null]);
  const [isStep5Correct, setIsStep5Correct] = useState(false);

  const [animateCircle, setAnimateCircle] = useState(false);
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [step6DroppedSegments, setStep6DroppedSegments] = useState<(string | null)[]>([null, null, null]);
  const [isStep6Correct, setIsStep6Correct] = useState(false);
  const [showWrongAnswerAlert, setShowWrongAnswerAlert] = useState(false);
  const [step6Reason, setStep6Reason] = useState<string | null>(null);

  const handleRestart = () => {
    setStep(1);
    setVertices({ A: { x: 150, y: 500 }, B: { x: 650, y: 500 }, C: { x: 550, y: 100 } });
    setIsIcConnected(false);
    setDrawnPerpendiculars([]);
    setSelectedTriangle(null);
    setCorrectPairs([]);
    setShowWrongPairAlert(false);
    setStep5DroppedPoints([null, null, null]);
    setIsStep5Correct(false);
    setAnimateCircle(false);
    setIsAnimationDone(false);
    setDraggedItem(null);
    setStep6DroppedSegments([null, null, null]);
    setIsStep6Correct(false);
    setShowWrongAnswerAlert(false);
    setStep6Reason(null);
  };

  const handleNext = () => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1));

  useEffect(() => {
    if (showWrongPairAlert) {
      const t = setTimeout(() => setShowWrongPairAlert(false), 2000);
      return () => clearTimeout(t);
    }
    if (showWrongAnswerAlert) {
      const t = setTimeout(() => setShowWrongAnswerAlert(false), 800);
      return () => clearTimeout(t);
    }
  }, [showWrongPairAlert, showWrongAnswerAlert]);

  const handleTriangleClick = useCallback(
    (triangle: SmallTriangle | null) => {
      if (!triangle || correctPairs.includes(triangle.pair)) return;
      if (!selectedTriangle) {
        setSelectedTriangle(triangle);
      } else {
        if (selectedTriangle.id !== triangle.id && selectedTriangle.pair === triangle.pair) {
          setCorrectPairs((prev) => [...prev, triangle.pair].sort() as TrianglePair[]);
        } else {
          setShowWrongPairAlert(true);
        }
        setSelectedTriangle(null);
      }
    },
    [selectedTriangle, correctPairs]
  );

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: string) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  useEffect(() => {
    const correct = new Set(['점 D', '점 E', '점 F']);
    const dropped = new Set(step5DroppedPoints.filter(Boolean));
    setIsStep5Correct(dropped.size === 3 && Array.from(dropped).every((x) => correct.has(x as string)));
  }, [step5DroppedPoints]);

  useEffect(() => {
    const correct = new Set(['선분 ID', '선분 IE', '선분 IF']);
    const dropped = new Set(step6DroppedSegments.filter(Boolean));
    setIsStep6Correct(dropped.size === 3 && Array.from(dropped).every((x) => correct.has(x as string)));
  }, [step6DroppedSegments]);

  const WrongAnswerAlert = () => (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-6xl font-bold p-12 rounded-full z-50 shadow-lg animate-ping">
      땡!
    </div>
  );

  const DragDropQuizStep5 = () => {
    const options = useMemo(() => shuffleArray(['점 A', '점 C', '점 D', '점 E', '점 F']), []);
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      if (draggedItem && !step5DroppedPoints.includes(draggedItem)) {
        const next = [...step5DroppedPoints];
        next[index] = draggedItem;
        setStep5DroppedPoints(next);
      }
      setDraggedItem(null);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    };
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-xl border-l-4 border-cyan-400">
          <p className="text-lg leading-relaxed text-slate-700 mb-4">
            🔍 애니메이션으로 그린 원은 어떤 점들을 지나나요? 
            아래 보기에서 알맞은 점 <span className="font-semibold text-cyan-600">3개</span>를 찾아 빈 칸에 드래그하세요.
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-xl">
          <div className="flex items-center justify-center gap-4 text-center">
            {step5DroppedPoints.map((item, index) => (
              <div 
                key={index} 
                onDragOver={handleDragOver} 
                onDrop={(e) => handleDrop(e, index)} 
                className={`w-32 h-20 bg-white border-3 border-dashed rounded-xl flex justify-center items-center font-bold text-xl shadow-lg transition-all duration-200 ${
                  item ? 'border-green-400 bg-green-50 text-green-700' : 'border-blue-400 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                {item || '?'}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
          <p className="text-center text-slate-600 mb-4 font-medium">드래그할 수 있는 점들:</p>
          <div className="flex justify-center flex-wrap gap-3">
            {options
              .filter((opt) => !step5DroppedPoints.includes(opt))
              .map((option) => (
                <div 
                  key={option} 
                  draggable 
                  onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, option); }} 
                  className="px-6 py-3 bg-gradient-to-r from-yellow-300 to-amber-300 border-2 border-yellow-400 rounded-xl cursor-grab active:cursor-grabbing text-lg font-semibold text-yellow-800 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  {option}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  const DragDropQuizStep6 = () => {
    const options = useMemo(() => shuffleArray(['선분 ID', '선분 IE', '선분 IF', '선분 IA', '선분 IB', '선분 AC']), []);
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      const correctSegments = ['선분 ID', '선분 IE', '선분 IF'];
      if (draggedItem && !step6DroppedSegments.includes(draggedItem)) {
        if (correctSegments.includes(draggedItem)) {
          const next = [...step6DroppedSegments];
          next[index] = draggedItem;
          setStep6DroppedSegments(next);
        } else {
          setShowWrongAnswerAlert(true);
        }
      }
      setDraggedItem(null);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    };
    return (
      <div className="text-2xl mt-4">
        <p className="mb-6 font-semibold">내심의 성질에 따라 길이가 같은 세 선분을 아래 빈 칸에 드래그하여 등식을 완성하세요.</p>
        <div className="flex items-center justify-center gap-2 text-center p-4 bg-slate-200 rounded-lg">
          {step6DroppedSegments.map((item, index) => (
            <React.Fragment key={index}>
              <div onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, index)} className="w-40 h-16 bg-white border-2 border-dashed border-slate-400 rounded-md flex justify-center items-center font-bold text-blue-600 text-2xl">
                {item}
              </div>
              {index < 2 && <span className="font-bold text-3xl mx-2">=</span>}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-center flex-wrap gap-4 mt-8">
          {options
            .filter((seg) => !step6DroppedSegments.includes(seg))
            .map((seg) => (
              <div key={seg} draggable onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, seg); }} className="px-6 py-3 bg-yellow-300 border-2 border-yellow-400 rounded-md cursor-grab active:cursor-grabbing text-xl">
                {seg}
              </div>
            ))}
        </div>
      </div>
    );
  };

  const MultipleChoiceQuizStep6 = () => {
    const correct = '내접원의 반지름에 해당하기 때문에 길이가 같다';
    const incorrect = '삼각형의 높이에 해당하기 때문이다';
    const options = useMemo(() => shuffleArray([correct, incorrect]), []);
    const handleAnswer = (answer: string) => {
      setStep6Reason(answer);
      if (answer !== correct) setShowWrongAnswerAlert(true);
    };
    return (
      <div className="text-2xl mt-8 pt-6 border-t-2 border-slate-300">
        <p className="mb-6 font-semibold">질문: 왜 세 선분(ID, IE, IF)의 길이는 모두 같을까요?</p>
        <div className="flex flex-col gap-4">
          {options.map((option) => {
            const isSelected = step6Reason === option;
            const isCorrect = isSelected && option === correct;
            const isIncorrect = isSelected && option !== correct;
            return (
              <button key={option} onClick={() => handleAnswer(option)} className={`w-full text-left p-4 rounded-lg border-2 text-xl transition-colors ${isCorrect ? 'bg-green-200 border-green-500 text-green-800 font-bold' : isIncorrect ? 'bg-red-200 border-red-500 text-red-800 font-bold' : 'bg-white border-slate-300 hover:bg-slate-200'}`}>
                {option}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-3 rounded-full text-xl font-bold shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                단계 1: 교점 찾기
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border-l-4 border-orange-400">
              <p className="text-lg leading-relaxed text-slate-700">
                삼각형의 세 각의 이등분선은 한 점에서 만납니다. 
                <span className="font-semibold text-orange-600"> 주황색으로 표시된 두 각의 이등분선</span>이 만나는 
                <span className="font-semibold text-orange-600"> 점 I</span>가 보입니다.
              </p>
              <div className="mt-4 p-4 bg-white rounded-lg border border-orange-200">
                <p className="text-base text-slate-600">
                  🎯 <strong>목표:</strong> 점 I에서 꼭짓점 C로 선을 이어 나머지 각의 이등분선을 완성해 보세요.
                </p>
                <p className="text-sm text-orange-600 mt-2 font-medium">
                  💡 힌트: 주황색 점을 꼭짓점 C로 드래그하세요!
                </p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-400 to-pink-500 text-white px-6 py-3 rounded-full text-xl font-bold shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5H9a2 2 0 00-2 2v12a4 4 0 004 4h6a2 2 0 002-2V7a2 2 0 00-2-2z" />
                </svg>
                단계 2: 수선 긋기
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border-l-4 border-red-400">
              <p className="text-lg leading-relaxed text-slate-700 mb-4">
                교점 I에서 삼각형의 각 변 <span className="font-semibold text-red-600">(AB, BC, CA)</span>에 
                <span className="font-semibold text-red-600"> 수선</span>을 그어 보세요.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                <p className="text-base text-blue-800">
                  📐 <strong>수선이란?</strong> 점에서 직선까지의 가장 짧은 거리를 나타내는 수직인 선분입니다.
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-red-200">
                <p className="text-base text-slate-600">
                  🎯 <strong>목표:</strong> 빨간색 점을 각 변으로 드래그하여 수선의 발 D, E, F를 찾으세요.
                </p>
                <p className="text-sm text-red-600 mt-2 font-medium">
                  💡 힌트: 총 3개의 수선을 그어야 합니다! ({drawnPerpendiculars.length}/3 완료)
                </p>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-full text-xl font-bold shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                단계 3: 합동인 삼각형 찾기
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-l-4 border-green-400">
              <p className="text-lg leading-relaxed text-slate-700 mb-4">
                점 I와 수선의 발 D, E, F로 인해 삼각형 ABC가 
                <span className="font-semibold text-green-600"> 여섯 개의 작은 직각삼각형</span>으로 나뉘었습니다.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                <p className="text-base text-purple-800">
                  🔍 <strong>합동이란?</strong> 모양과 크기가 완전히 같은 삼각형들을 말합니다.
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <p className="text-base text-slate-600">
                  🎯 <strong>목표:</strong> 서로 합동인 삼각형 두 개씩을 찾아 클릭해 보세요.
                </p>
                <p className="text-sm text-green-600 mt-2 font-medium">
                  💡 힌트: 총 3쌍의 합동 삼각형을 찾아야 합니다! ({correctPairs.length}/3 완료)
                </p>
              </div>
              {showWrongPairAlert && 
                <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-400 rounded-lg animate-pulse">
                  <p className="text-lg font-bold text-red-600 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    틀렸습니다! 다시 시도해 보세요.
                  </p>
                </div>
              }
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white px-6 py-3 rounded-full text-xl font-bold shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                단계 4: 내접원 그리기
              </div>
            </div>
            {!isAnimationDone ? (
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-xl border-l-4 border-pink-400">
                <p className="text-lg leading-relaxed text-slate-700 mb-4">
                  점 D, E, F는 모두 <span className="font-semibold text-pink-600">내심 I로부터 같은 거리</span>에 있습니다. 
                  이 점들을 지나는 원이 바로 삼각형의 <span className="font-semibold text-pink-600">내접원</span>입니다.
                </p>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-6">
                  <p className="text-base text-indigo-800">
                    ⭕ <strong>내접원이란?</strong> 삼각형 안에 그어진 원으로, 삼각형의 세 변에 모두 접하는 원입니다.
                  </p>
                </div>
                <div className="text-center">
                  <button 
                    onClick={() => setAnimateCircle(true)} 
                    disabled={animateCircle} 
                    className="group px-10 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xl font-bold rounded-full hover:from-pink-600 hover:to-purple-700 disabled:from-pink-300 disabled:to-purple-400 disabled:cursor-not-allowed shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <span className="flex items-center gap-3">
                      {animateCircle ? (
                        <>
                          <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          그리는 중...
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          애니메이션 시작!
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-l-4 border-green-400 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-2xl text-green-700 font-bold mb-2">내접원이 완성되었습니다!</p>
                <p className="text-lg text-green-600">다음 단계로 진행하세요.</p>
              </div>
            )}
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-6 py-3 rounded-full text-xl font-bold shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                단계 5: 내접원의 성질 확인
              </div>
            </div>
            <DragDropQuizStep5 />
          </div>
        );
      case 6: {
        const isReasonCorrect = step6Reason === '내접원의 반지름에 해당하기 때문에 길이가 같다';
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-400 to-indigo-500 text-white px-6 py-3 rounded-full text-xl font-bold shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                단계 6: 내심의 성질 정리
              </div>
            </div>
            
            {!isStep6Correct && <DragDropQuizStep6 />}
            
            {isStep6Correct && !isReasonCorrect && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-l-4 border-green-400 text-center">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-2xl text-green-700 font-bold">등식이 완성되었습니다!</p>
                </div>
                <MultipleChoiceQuizStep6 />
              </div>
            )}
            
            {isStep6Correct && isReasonCorrect && (
              <div className="bg-gradient-to-br from-sky-50 to-blue-100 p-8 rounded-2xl border-2 border-sky-300 shadow-lg">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-3xl font-bold text-sky-800 mb-2">학습 완료!</h3>
                  <div className="w-24 h-1 bg-gradient-to-r from-sky-400 to-blue-500 mx-auto rounded-full"></div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-sky-200">
                  <h4 className="text-2xl font-bold text-sky-800 mb-4 text-center">📐 내심의 성질</h4>
                  <div className="space-y-3 text-lg text-slate-700">
                    <p className="flex items-start gap-3">
                      <span className="text-sky-600 font-bold mt-1">•</span>
                      삼각형의 <span className="font-semibold text-sky-700">내심(I)</span>은 세 변으로부터 같은 거리에 있습니다.
                    </p>
                    <p className="flex items-start gap-3">
                      <span className="text-sky-600 font-bold mt-1">•</span>
                      이 거리가 바로 <span className="font-semibold text-sky-700">내접원의 반지름</span>이 됩니다.
                    </p>
                    <div className="bg-sky-100 p-4 rounded-lg border border-sky-200 mt-4">
                      <p className="text-center text-xl font-bold text-sky-800">
                        선분 ID = 선분 IE = 선분 IF
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    const isReasonCorrect = step6Reason === '내접원의 반지름에 해당하기 때문에 길이가 같다';
    switch (step) {
      case 1:
        return !isIcConnected;
      case 2:
        return drawnPerpendiculars.length < 3;
      case 3:
        return correctPairs.length < 3;
      case 4:
        return !isAnimationDone;
      case 5:
        return !isStep5Correct;
      case 6:
        return !isStep6Correct || !isReasonCorrect;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4 lg:p-8 font-sans">
      {showWrongAnswerAlert && <WrongAnswerAlert />}
      
      {/* 상단 제목 영역 */}
      <div className="w-full max-w-7xl mb-6">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            삼각형의 내심
          </h1>
          <p className="text-xl text-slate-600 mb-4">세 각의 이등분선의 교점과 내접원의 성질을 탐구합니다</p>
          <div className="flex justify-center items-center gap-3">
            <div className="flex gap-2">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    i + 1 === step
                      ? 'bg-blue-500 scale-125 shadow-lg'
                      : i + 1 < step
                      ? 'bg-green-500 scale-110'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-slate-700 ml-2">
              단계 {step} / {TOTAL_STEPS}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2">
          <IncenterCanvas
            step={step}
            vertices={vertices}
            setVertices={setVertices}
            isIcConnected={isIcConnected}
            onIcConnected={() => setIsIcConnected(true)}
            drawnPerpendiculars={drawnPerpendiculars}
            onPerpendicularDrawn={(foot) => setDrawnPerpendiculars((prev) => [...new Set([...prev, foot])])}
            selectedTriangle={selectedTriangle}
            setSelectedTriangle={handleTriangleClick}
            correctPairs={correctPairs}
            animateCircle={animateCircle}
            isAnimationDone={isAnimationDone}
            onAnimationDone={() => setIsAnimationDone(true)}
          />
        </div>
        <div className="lg:w-1/2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          {/* 단계 내용 영역 */}
          <div className="p-8 min-h-[400px] flex flex-col justify-center">
            {renderStepContent()}
          </div>
          
          {/* 하단 네비게이션 */}
          <div className="bg-gradient-to-r from-slate-100 to-blue-100 p-6 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <button 
                onClick={handlePrev} 
                disabled={step === 1} 
                className="group px-8 py-3 bg-white border-2 border-slate-300 text-slate-700 text-lg font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  이전
                </span>
              </button>
              
              {step === TOTAL_STEPS && isStep6Correct && step6Reason === '내접원의 반지름에 해당하기 때문에 길이가 같다' ? (
                <button 
                  onClick={handleRestart} 
                  className="group px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-lg transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    다시하기
                  </span>
                </button>
              ) : (
                <button 
                  onClick={handleNext} 
                  disabled={isNextDisabled()} 
                  className="group px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-bold rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed shadow-lg transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    다음
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


