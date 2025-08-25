'use client';

/**
 * ConfettiBurst
 * 이 컴포넌트는 방해되지 않는 가벼운 축하 애니메이션을 제공합니다.
 * 의도는 완료 시 짧게 나타나는 미세한 색종이 낙하 효과를 통해 성취감을 전달하되,
 * 인터랙션을 가로막지 않고 자동으로 사라지게 하는 것입니다.
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiBurstProps {
  /** 애니메이션 표시 여부입니다. true일 때 잠시 나타났다 사라집니다. */
  show: boolean;
  /** 색종이 조각 개수입니다. 기본 16개로 부담을 낮춥니다. */
  count?: number;
  /** 컨테이너에 추가할 클래스입니다. 포인터 이벤트는 내부에서 차단합니다. */
  className?: string;
}

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7'];

const ConfettiBurst: React.FC<ConfettiBurstProps> = ({ show, count = 16, className }) => {
  // 각 파티클의 초기 위치와 변화를 미리 계산해 재렌더 비용을 줄입니다.
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, idx) => {
      const angle = (idx / count) * Math.PI * 2;
      const radius = 30 + Math.random() * 40; // 시작 반경
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const driftX = (Math.random() - 0.5) * 60; // 좌우 흔들림
      const fall = 120 + Math.random() * 60; // 낙하 거리
      const rotate = (Math.random() - 0.5) * 240; // 회전량
      const color = COLORS[idx % COLORS.length];
      const width = 6 + Math.floor(Math.random() * 6);
      const height = 8 + Math.floor(Math.random() * 8);
      return { x, y, driftX, fall, rotate, color, width, height };
    });
  }, [count]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`pointer-events-none absolute inset-0 overflow-visible ${className ?? ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute left-1/2 top-0 origin-top">
            {particles.map((p, i) => (
              <motion.span
                key={`confetti-${i}`}
                initial={{ x: p.x, y: p.y, rotate: 0, opacity: 0.9 }}
                animate={{
                  x: p.x + p.driftX,
                  y: p.y + p.fall,
                  rotate: p.rotate,
                  opacity: 0
                }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{
                  display: 'inline-block',
                  width: p.width,
                  height: p.height,
                  marginLeft: 4,
                  backgroundColor: p.color,
                  borderRadius: 2,
                }}
              />)
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfettiBurst;


