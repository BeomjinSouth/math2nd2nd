/**
 * Geometry sample generators for demos/tests
 */

import { Triangle } from './types';

/**
 * Create a pair of congruent right triangles with right angle at A.
 * The second triangle is a translated copy to the right.
 */
export function createRightTrianglesPair(): { t1: Triangle; t2: Triangle } {
  const t1: Triangle = { A: { x: 1, y: 1 }, B: { x: 1, y: 2.5 }, C: { x: 3, y: 1 } };
  const t2: Triangle = { A: { x: 5, y: 1 }, B: { x: 5, y: 2.5 }, C: { x: 7, y: 1 } };
  return { t1, t2 };
}


