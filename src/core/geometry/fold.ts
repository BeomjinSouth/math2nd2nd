/**
 * Triangle folding operations
 * Handles geometric transformations for paper folding simulations
 */

import { Point, Triangle, Segment, FoldResult } from './types';
import { getAngleBisectorIntersection, distance, getArea, toRadians } from './triangle';

/**
 * Reflect a point across a line defined by two points
 */
export function reflectPoint(point: Point, lineStart: Point, lineEnd: Point): Point {
  // Line direction vector
  const lineDir = {
    x: lineEnd.x - lineStart.x,
    y: lineEnd.y - lineStart.y
  };
  
  // Vector from line start to point
  const toPoint = {
    x: point.x - lineStart.x,
    y: point.y - lineStart.y
  };
  
  // Line length squared
  const lineLengthSq = lineDir.x * lineDir.x + lineDir.y * lineDir.y;
  
  if (lineLengthSq === 0) {
    // Degenerate line, return original point
    return { ...point };
  }
  
  // Project point onto line
  const projection = (toPoint.x * lineDir.x + toPoint.y * lineDir.y) / lineLengthSq;
  
  // Point on line closest to our point
  const closestPoint = {
    x: lineStart.x + projection * lineDir.x,
    y: lineStart.y + projection * lineDir.y
  };
  
  // Reflect point across the line
  return {
    x: 2 * closestPoint.x - point.x,
    y: 2 * closestPoint.y - point.y
  };
}

/**
 * Calculate fold transformation for isosceles triangle along angle bisector
 */
export function foldTriangleAlongBisector(triangle: Triangle, foldAngle: number = 0): FoldResult {
  const bisectorPoint = getAngleBisectorIntersection(triangle);
  
  // Create fold line from apex to bisector intersection
  const foldLine: Segment = {
    start: triangle.A,
    end: bisectorPoint
  };
  
  // Create left and right triangles
  const leftTriangle: Triangle = {
    A: triangle.A,
    B: triangle.B,
    C: bisectorPoint
  };
  
  const rightTriangle: Triangle = {
    A: triangle.A,
    B: bisectorPoint,
    C: triangle.C
  };
  
  // Calculate overlap based on fold angle
  let overlapArea = 0;
  
  if (foldAngle > 90) {
    // When folded significantly, calculate overlapping area
    const reflectedB = reflectPoint(triangle.B, triangle.A, bisectorPoint);
    const reflectedC = reflectPoint(triangle.C, triangle.A, bisectorPoint);
    
    // Simple overlap calculation (can be more sophisticated)
    overlapArea = Math.min(getArea(leftTriangle), getArea(rightTriangle)) * 
                  Math.sin(toRadians(Math.min(foldAngle, 180))) * 0.5;
  }
  
  return {
    foldLine,
    leftTriangle,
    rightTriangle,
    overlapArea,
    isValid: true
  };
}

/**
 * Calculate fold position based on angle parameter
 */
export function calculateFoldTransform(foldAngle: number, foldLine: Segment): {
  leftTransform: string;
  rightTransform: string;
} {
  const centerX = foldLine.end.x;
  const centerY = foldLine.end.y;
  
  const leftAngle = -foldAngle * 0.5;
  const rightAngle = foldAngle * 0.5;
  
  return {
    leftTransform: `rotate(${leftAngle} ${centerX} ${centerY})`,
    rightTransform: `rotate(${rightAngle} ${centerX} ${centerY})`
  };
}

/**
 * Detect when folded parts overlap significantly
 */
export function detectOverlap(triangle: Triangle, foldAngle: number): {
  isOverlapping: boolean;
  overlapPercentage: number;
  overlappingElements: string[];
} {
  const threshold = 85; // degrees
  
  if (foldAngle < threshold) {
    return {
      isOverlapping: false,
      overlapPercentage: 0,
      overlappingElements: []
    };
  }
  
  const overlapPercentage = Math.min(100, (foldAngle - threshold) / (180 - threshold) * 100);
  
  let overlappingElements: string[] = [];
  
  if (foldAngle >= 90) {
    overlappingElements = ['angle-B', 'angle-C'];
  }
  
  if (foldAngle >= 170) {
    overlappingElements = [...overlappingElements, 'side-BC-segments'];
  }
  
  return {
    isOverlapping: true,
    overlapPercentage,
    overlappingElements
  };
}

/**
 * Calculate animation keyframes for smooth folding
 */
export function generateFoldKeyframes(startAngle: number, endAngle: number, steps: number = 30): number[] {
  const keyframes: number[] = [];
  
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    // Use easing function for more natural animation
    const easedProgress = easeInOutCubic(progress);
    const angle = startAngle + (endAngle - startAngle) * easedProgress;
    keyframes.push(angle);
  }
  
  return keyframes;
}

/**
 * Cubic easing function for natural animation
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// toRadians는 triangle.ts에서 공용 유틸로 제공됩니다.

/**
 * Validate fold operation
 */
export function validateFold(triangle: Triangle, foldLine: Segment): boolean {
  // Check if fold line starts at a vertex
  const tolerance = 0.001;
  
  const startsAtA = distance(foldLine.start, triangle.A) < tolerance;
  const startsAtB = distance(foldLine.start, triangle.B) < tolerance;
  const startsAtC = distance(foldLine.start, triangle.C) < tolerance;
  
  // For isosceles triangle, fold should start at apex (vertex A)
  return startsAtA;
}

/**
 * Calculate visual feedback intensity based on fold state
 */
export function calculateFeedbackIntensity(foldAngle: number): {
  intensity: number;
  color: string;
  message: string;
} {
  if (foldAngle < 30) {
    return {
      intensity: 0.2,
      color: '#3b82f6',
      message: '삼각형을 접기 시작해보세요!'
    };
  }
  
  if (foldAngle < 80) {
    return {
      intensity: 0.5,
      color: '#f59e0b',
      message: '계속 접어보세요...'
    };
  }
  
  if (foldAngle < 95) {
    return {
      intensity: 0.8,
      color: '#ef4444',
      message: '두 각이 거의 겹쳐집니다!'
    };
  }
  
  return {
    intensity: 1.0,
    color: '#22c55e',
    message: '✨ 완전히 겹쳐졌습니다! ✨'
  };
}