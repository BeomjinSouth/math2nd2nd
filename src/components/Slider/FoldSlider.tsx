'use client';

/**
 * FoldSlider - 이등변삼각형 접기 액티비티용 슬라이더 (풀버전)
 *
 * 목표
 * - 마우스/터치 드래그, 트랙 클릭, 키보드, 숫자 입력으로 각도 변경
 * - 스냅(예: 0/90/180), step 반올림, min/max 클램프
 * - 드래그 중 매 프레임 측정 금지: 드래그 시작 시 트랙 rect 1회 캐싱 + rAF 스로틀
 * - 접근성: role="slider", aria 값, 키보드 조작, sr-only range
 * - 안전성: value가 null/undefined여도 안전하게 동작(내부 보정값 v 사용)
 * - 핸들이 화면 밖으로 튀지 않도록 드래그 제약 적용
 *
 * 확장 포인트
 * - tickInterval, snapPoints, snapTolerance, formatValue, messages, debug
 */

import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
  useId,
} from 'react';
import { motion } from 'framer-motion';
import { calculateFeedbackIntensity } from '@/core';

// ======================== 타입 & 유틸 ========================

type Messages = {
  start?: string;
  nearOverlap?: string;
  overlapped?: string;
};

export interface FoldSliderProps {
  /** 현재 값; null/undefined여도 안전. 내부에서 v로 보정 */
  value?: number | null;
  /** 값이 바뀔 때마다 호출 (항상 number를 보장) */
  onChange: (value: number) => void;
  /** 드래그/키조작 종료 시 1회 호출(옵션, number 보장) */
  onChangeEnd?: (value: number) => void;

  /** 범위/단계 */
  min?: number;           // 기본 0
  max?: number;           // 기본 180
  step?: number;          // 기본 1 (0.5 등 가능)

  /** 외형/동작 옵션 */
  disabled?: boolean;
  label?: string;         // 시각 라벨(화면 표시)
  ariaLabel?: string;     // 스크린리더 라벨(없으면 label 사용)
  showValue?: boolean;    // 값 배지 표시 여부
  className?: string;     // 외부에서 여백/폭 제어용
  /** 도 단위 숫자 입력과 증감 버튼 표시 여부 */
  showNumberInput?: boolean;

  /** 눈금/스냅/포맷 */
  tickInterval?: number;  // 눈금 간격(도), 기본 10
  snapPoints?: number[];  // 스냅 포인트, 기본 [0,90,180]
  snapTolerance?: number; // 스냅 허용 오차(도), 기본 0.75
  formatValue?: (v: number) => string; // 값 표시 포맷

  /** 상태 메시지 텍스트 */
  messages?: Messages;

  /** 디버그: 값/이벤트 로그 */
  debug?: boolean;
}

/** step의 소수 자릿수 추정 */
function getDecimals(step: number) {
  const s = step.toString();
  return s.includes('.') ? s.split('.')[1].length : 0;
}

/** Mouse/Touch 이벤트에서 clientX 추출 */
function getClientXFromEvent(e: React.MouseEvent | React.TouchEvent) {
  // Touch 이벤트와 Mouse 이벤트를 모두 안전하게 처리합니다.
  // React.TouchEvent의 경우 touches 또는 changedTouches에서 clientX를 우선 사용하고,
  // 그렇지 않으면 React.MouseEvent의 clientX를 사용합니다.
  type TouchLike = { clientX: number };
  type TouchContainer = { touches?: TouchLike[]; changedTouches?: TouchLike[] };
  const maybeTouch = (e as unknown as TouchContainer) || {};
  const t: TouchLike | undefined = maybeTouch.touches?.[0] ?? maybeTouch.changedTouches?.[0];
  return typeof t?.clientX === 'number'
    ? t.clientX
    : (e as React.MouseEvent).clientX;
}

// ======================== 컴포넌트 ========================

const FoldSlider: React.FC<FoldSliderProps> = ({
  value,
  onChange,
  onChangeEnd,
  min = 0,
  max = 180,
  step = 1,
  disabled = false,
  label = '접기 각도',
  ariaLabel,
  showValue = true,
  className = '',
  tickInterval = 10,
  snapPoints = [0, 90, 180],
  snapTolerance = 0.75,
  formatValue,
  messages,
  debug = false,
  showNumberInput = true,
}) => {
  // ---------- 내부 상태/참조 ----------
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingInput, setIsEditingInput] = useState(false);
  const [inputStr, setInputStr] = useState<string>(String(value ?? min));

  const trackRef = useRef<HTMLDivElement | null>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);
  const movedRef = useRef(false);            // 드래그 중 실제 이동 발생 여부
  const inputId = useId();

  // ---------- 안전 숫자 보정 ----------
  const range = Math.max(1e-9, max - min);
  const decimals = getDecimals(step);
  const v: number =
    typeof value === 'number' && Number.isFinite(value) ? value : min;

  // ---------- 정규화 파이프라인 ----------
  const clampValue = useCallback(
    (x: number) => Math.max(min, Math.min(max, x)),
    [min, max]
  );
  const roundToStep = useCallback((x: number) => Math.round(x / step) * step, [step]);
  const applySnap = useCallback(
    (x: number) => {
      for (const p of snapPoints) {
        if (Math.abs(x - p) <= snapTolerance) return p;
      }
      return x;
    },
    [snapPoints, snapTolerance]
  );
  /** 스냅 → 스텝 반올림 → 범위 클램프 */
  const canonicalize = useCallback(
    (x: number) => clampValue(roundToStep(applySnap(x))),
    [applySnap, roundToStep, clampValue]
  );

  // ---------- 진행률/색상 ----------
  const progress = Math.max(0, Math.min(1, (v - min) / range));
  const getSliderColor = () => {
    if (disabled) return '#e2e8f0'; // slate-200
    return calculateFeedbackIntensity(v).color;
  };

  // ---------- 눈금 ----------
  const marks = useMemo(() => {
    const ti = Math.max(1, tickInterval);
    const count = Math.floor((max - min) / ti);
    return new Array(count + 1).fill(0).map((_, i) => {
      const mv = min + i * ti;
      const mp = (mv - min) / range;
      return (
        <div
          key={`tick-${mv}`}
          className="absolute w-0.5 h-2 bg-gray-300 -translate-x-0.5"
          style={{ left: `${mp * 100}%` }}
          aria-hidden
        />
      );
    });
  }, [min, max, tickInterval, range]);

  // ---------- 메시지(100%에서만 완전 겹침 표기) ----------
  // 색상은 기존 강도 계산을 그대로 사용하되, 문구는 100%일 때만 "완전히 겹쳐졌습니다"를 노출합니다.
  // 색상 계산만을 위해 호출하지만, 내부적으로 getSliderColor가 이미 사용 중이므로 별도 변수는 유지하지 않습니다.
  let defaultMessage: string;
  if (v >= max) {
    defaultMessage = '✨ 완전히 겹쳐졌습니다! ✨';
  } else if (v <= min) {
    defaultMessage = '삼각형을 접기 시작해보세요!';
  } else if (v >= 80) {
    defaultMessage = '두 각이 거의 겹쳐집니다!';
  } else {
    defaultMessage = '계속 접어보세요...';
  }
  const isComplete = v >= max;
  const msgText =
    (v <= min && (messages?.start ?? defaultMessage)) ||
    (v >= max && (messages?.overlapped ?? defaultMessage)) ||
    (messages?.nearOverlap ?? defaultMessage);

  // ---------- 숫자 입력 표시 동기화 ----------
  useEffect(() => {
    if (!isEditingInput) setInputStr(String(v.toFixed(decimals)));
  }, [v, isEditingInput, decimals]);

  // ---------- rAF 누수 방지 ----------
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ======================== 핸들러 (분리형) ========================

  /** 좌표 → 값 업데이트 (rAF 내부에서 호출) */
  const updateFromClientX = useCallback((clientX: number) => {
    const rect = rectRef.current || trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const rel = (clientX - rect.left) / rect.width;
    const raw = min + Math.max(0, Math.min(1, rel)) * range;
    const next = canonicalize(raw);
    
    if (debug) console.log('[FoldSlider] 값 변경:', { raw, next });
    
    if (next !== v) {
      onChange(next);
    }
  }, [min, range, canonicalize, v, onChange, debug]);

  /** 트랙 클릭/터치로 점프 */
  const handleTrackPointer = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    updateFromClientX(getClientXFromEvent(e));
  }, [disabled, updateFromClientX]);

  /** 키보드 조작 */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const key = e.key;
    const delta =
      key === 'ArrowRight' ? step :
      key === 'ArrowLeft'  ? -step :
      key === 'PageUp'     ? step * 10 :
      key === 'PageDown'   ? -step * 10 :
      key === 'Home'       ? (min - v) :
      key === 'End'        ? (max - v) : 0;

    if (delta !== 0) {
      e.preventDefault();
      const next = canonicalize(v + delta);
      if (next !== v) {
        if (debug) console.log('[FoldSlider] key change', { from: v, to: next, key });
        onChange(next);
      }
    }
  }, [disabled, step, min, max, v, canonicalize, onChange, debug]);

  const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (['ArrowRight','ArrowLeft','PageUp','PageDown','Home','End'].includes(e.key)) {
      if (debug) console.log('[FoldSlider] onChangeEnd (key)', v);
      onChangeEnd?.(v);
    }
  }, [disabled, v, onChangeEnd, debug]);

  /** 드래그 시작/이동/끝 */
  const handleDragStart = useCallback(() => {
    if (disabled) return;
    setIsDragging(true);
    rectRef.current = trackRef.current?.getBoundingClientRect() || null;
    movedRef.current = false;
    if (debug) console.log('[FoldSlider] drag start');
  }, [disabled, debug]);

  const handleDrag = useCallback((_e: unknown, info: { point: { x: number; y: number } }) => {
    if (disabled) return;
    // 드래그 중에는 핸들이 자체적으로 약간의 x 변위를 갖는 일이 있어 left%와 어긋날 수 있다.
    // 이를 방지하기 위해 매 프레임 transform의 x를 0으로 고정하고, 값은 트랙 좌표로만 갱신한다.
    if (rafRef.current !== null) return;         // rAF 스로틀
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      movedRef.current = true;
      updateFromClientX(info.point.x);
    });
  }, [disabled, updateFromClientX]);

  const handleDragEnd = useCallback(() => {
    if (disabled) return;
    setIsDragging(false);
    rectRef.current = null;
    if (movedRef.current) {
      if (debug) console.log('[FoldSlider] onChangeEnd (drag)', v);
      onChangeEnd?.(v);
    }
  }, [disabled, v, onChangeEnd, debug]);

  /** 숫자 입력 확정형 처리 */
  const handleNumberBlurOrEnter = useCallback(() => {
    setIsEditingInput(false);
    const n = Number(inputStr.replace(',', '.'));
    if (Number.isFinite(n)) {
      const next = canonicalize(n);
      if (debug) console.log('[FoldSlider] input commit', { raw: n, next });
      onChange(next);
    } else {
      setInputStr(String(v.toFixed(decimals)));
    }
  }, [inputStr, canonicalize, onChange, v, decimals, debug]);

  // ======================== 렌더 ========================

  const displayValue = formatValue ? formatValue(v) : `${v.toFixed(decimals)}°`;

  return (
    <div className={`w-full max-w-md mx-auto p-4 ${className}`} data-testid="fold-slider-root">
      {/* 라벨 & 값 */}
      <div className="flex justify-between items-center mb-4">
        <label className="text-lg font-semibold text-gray-700" htmlFor={inputId}>
          {label}
        </label>
        {showValue && (
          <motion.div
            className="bg-gray-100 px-3 py-1 rounded-lg font-mono text-lg"
            animate={{
              backgroundColor: isDragging ? getSliderColor() : '#f3f4f6',
              color: isDragging ? '#ffffff' : '#374151',
            }}
          >
            {displayValue}
          </motion.div>
        )}
      </div>

      {/* 트랙 + 진행 */}
      <div className="relative mb-4 select-none">
        <div
          className={`w-full h-3 rounded-full relative ${disabled ? 'bg-gray-200' : 'bg-gray-200 cursor-pointer'}`}
          ref={trackRef}
          onMouseDown={handleTrackPointer}
          onTouchStart={handleTrackPointer}
          aria-hidden
          data-testid="fold-slider-track"
        >
          <motion.div
            className="h-full rounded-full"
            style={{ width: `${progress * 100}%`, backgroundColor: getSliderColor() }}
            animate={{ backgroundColor: getSliderColor() }}
            transition={{ duration: 0.2 }}
          />
          {marks}
        </div>

        {/* 핸들(시각 이동은 억제, 위치는 left:%로만 제어) */}
        <motion.div
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={v}
          aria-label={ariaLabel ?? label}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          className={`absolute w-6 h-6 bg-white border-2 rounded-full shadow-lg
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          style={{
            left: `${progress * 100}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderColor: getSliderColor(),
            pointerEvents: disabled ? 'none' : 'auto',
          }}
          whileHover={disabled ? {} : { scale: 1.2 }}
          whileTap={disabled ? {} : { scale: 0.9 }}
          drag={disabled ? false : 'x'}
          dragElastic={0}
          dragMomentum={false}
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={{
            x: 0,
            borderColor: getSliderColor(),
            boxShadow: isDragging
              ? `0 0 0 4px ${getSliderColor()}40`
              : '0 4px 6px -1px rgba(0,0,0,0.1)',
          }}
          data-testid="fold-slider-handle"
        />
      </div>

      {/* sr-only range: 스크린리더 호환 */}
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={v}
        onChange={(e) => onChange(canonicalize(Number(e.target.value)))}
        disabled={disabled}
        className="sr-only"
        aria-hidden={false}
      />

      {/* 숫자 입력 & 증감 버튼 (도 단위). 퍼센트 UI에서는 혼동을 줄이기 위해 숨길 수 있음 */}
      {showNumberInput && (
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => onChange(canonicalize(v - step * 10))}
          disabled={disabled || v <= min}
          className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded"
          data-testid="fold-slider-dec10"
        >
          -10°
        </button>
        <button
          onClick={() => onChange(canonicalize(v - step))}
          disabled={disabled || v <= min}
          className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded"
          data-testid="fold-slider-dec1"
        >
          -1°
        </button>

        {/* 확정형 입력 */}
        <input
          type="text"
          inputMode="decimal"
          value={inputStr}
          onFocus={() => setIsEditingInput(true)}
          onChange={(e) => setInputStr(e.target.value)}
          onBlur={handleNumberBlurOrEnter}
          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                              else if (e.key === 'Escape') { setIsEditingInput(false); setInputStr(String(v.toFixed(decimals))); (e.target as HTMLInputElement).blur(); } }}
          disabled={disabled}
          className="w-24 px-2 py-1 text-center border border-gray-300 rounded
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     disabled:bg-gray-100"
          aria-label={ariaLabel ?? label}
          data-testid="fold-slider-input"
        />

        <button
          onClick={() => onChange(canonicalize(v + step))}
          disabled={disabled || v >= max}
          className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded"
          data-testid="fold-slider-inc1"
        >
          +1°
        </button>
        <button
          onClick={() => onChange(canonicalize(v + step * 10))}
          disabled={disabled || v >= max}
          className="p-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded"
          data-testid="fold-slider-inc10"
        >
          +10°
        </button>
      </div>
      )}

      {/* 상태 메시지 */}
      {msgText && (
        <motion.div
          aria-live="polite"
          className={`text-center p-3 rounded-lg ${isComplete ? 'text-2xl font-extrabold' : 'font-medium'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ backgroundColor: `${getSliderColor()}20`, color: getSliderColor() }}
          data-testid="fold-slider-message"
        >
          {msgText}
        </motion.div>
      )}

      {/* 리셋 */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => onChange(canonicalize(min))}
          disabled={disabled || v === min}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg transition-colors"
          data-testid="fold-slider-reset"
        >
          리셋
        </button>
      </div>
    </div>
  );
};

export default FoldSlider;
export { FoldSlider }; // named import가 필요할 수 있어 같이 export
