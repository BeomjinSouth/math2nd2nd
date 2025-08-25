/**
 * Geometric Inference Engine
 * Provides utility functions for deducing geometric properties
 */

import { Point, Triangle } from './types';

/**
 * Calculates the third angle of a triangle given two angles.
 * Assumes the sum of angles in a triangle is 180 degrees.
 * @param angleA - First known angle in degrees.
 * @param angleB - Second known angle in degrees.
 * @returns The third angle in degrees.
 */
export function calculateThirdAngle(angleA: number, angleB: number): number {
  if (angleA < 0 || angleB < 0 || angleA + angleB >= 180) {
    throw new Error('Invalid input angles. Angles must be positive and their sum less than 180.');
  }
  return 180 - angleA - angleB;
}

/**
 * Finds corresponding parts of two congruent triangles.
 * This is a placeholder and would need a more robust implementation
 * based on the specific congruence condition (SAS, ASA, etc.).
 * @param triangleA - The first triangle.
 * @param triangleB - The second triangle.
 * @param congruenceType - The type of congruence (e.g., 'SAS').
 * @returns A mapping of corresponding vertices, sides, and angles.
 */
export function findCorrespondingParts(
  triangleA: Triangle,
  triangleB: Triangle,
  congruenceType: 'SAS' | 'ASA' | 'SSS' | 'RHS' | 'RHA'
) {
  // NOTE: This is a simplified placeholder. A real implementation would
  // need to intelligently map parts based on the congruence condition.
  // For example, for SAS, it would map the side between the two corresponding angles.
  console.log(`Finding corresponding parts for ${congruenceType} congruence...`);
  return {
    vertices: { A: 'D', B: 'E', C: 'F' }, // Example mapping
    sides: { AB: 'DE', BC: 'EF', CA: 'FD' },
    angles: { A: 'D', B: 'E', C: 'F' },
  };
}

/**
 * Checks if a point lies on a line segment.
 * @param p - The point to check.
 * @param a - The start point of the line segment.
 * @param b - The end point of the line segment.
 * @param tolerance - A small tolerance for floating point comparisons.
 * @returns True if the point is on the segment, false otherwise.
 */
export function isPointOnSegment(p: Point, a: Point, b: Point, tolerance = 1e-9): boolean {
  const distAP = Math.hypot(p.x - a.x, p.y - a.y);
  const distPB = Math.hypot(p.x - b.x, p.y - b.y);
  const distAB = Math.hypot(b.x - a.x, b.y - a.y);
  return Math.abs(distAP + distPB - distAB) < tolerance;
}
