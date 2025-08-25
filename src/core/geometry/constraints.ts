/**
 * Geometric constraints system
 * Manages and validates geometric relationships and conditions
 */

import { Triangle, Point, GeometricConstraint, ConstraintType } from './types';
import { distance, measureTriangle, isEqual, isAngleEqual } from './triangle';

/**
 * Create a geometric constraint
 */
export function createConstraint(
  id: string,
  type: ConstraintType,
  elements: string[],
  tolerance: number = 0.001
): GeometricConstraint {
  return {
    id,
    type,
    elements,
    satisfied: false,
    tolerance
  };
}

/**
 * Check if equal sides constraint is satisfied
 */
export function checkEqualSides(triangle: Triangle, sides: [string, string], tolerance: number = 0.001): boolean {
  const measurements = measureTriangle(triangle);
  const sideValues = measurements.sides;
  
  const sideMap: Record<string, number> = {
    'AB': sideValues.AB,
    'AC': sideValues.AC,
    'BC': sideValues.BC
  };
  
  const [side1, side2] = sides;
  return isEqual(sideMap[side1], sideMap[side2], tolerance);
}

/**
 * Check if equal angles constraint is satisfied
 */
export function checkEqualAngles(triangle: Triangle, angles: [string, string], tolerance: number = 0.001): boolean {
  const measurements = measureTriangle(triangle);
  const angleValues = measurements.angles;
  
  const angleMap: Record<string, number> = {
    'A': angleValues.A,
    'B': angleValues.B,
    'C': angleValues.C
  };
  
  const [angle1, angle2] = angles;
  return isAngleEqual(angleMap[angle1], angleMap[angle2], tolerance);
}

/**
 * Check if angle bisector constraint is satisfied
 */
export function checkAngleBisector(triangle: Triangle, vertex: string, bisectorPoint: Point, tolerance: number = 0.001): boolean {
  const measurements = measureTriangle(triangle);
  
  if (vertex !== 'A') {
    // Currently only supports angle bisector from vertex A
    return false;
  }
  
  // Create two sub-triangles
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
  
  const leftAngle = measureTriangle(leftTriangle).angles.A;
  const rightAngle = measureTriangle(rightTriangle).angles.A;
  
  return isAngleEqual(leftAngle, rightAngle, tolerance);
}

/**
 * Check if perpendicular constraint is satisfied
 */
export function checkPerpendicular(line1: [Point, Point], line2: [Point, Point], tolerance: number = 0.001): boolean {
  const [p1, p2] = line1;
  const [p3, p4] = line2;
  
  // Calculate direction vectors
  const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
  const v2 = { x: p4.x - p3.x, y: p4.y - p3.y };
  
  // Two lines are perpendicular if their dot product is zero
  const dotProduct = v1.x * v2.x + v1.y * v2.y;
  return Math.abs(dotProduct) < tolerance;
}

/**
 * Check if perpendicular bisector constraint is satisfied
 */
export function checkPerpendicularBisector(segment: [Point, Point], bisector: [Point, Point], tolerance: number = 0.001): boolean {
  const [segStart, segEnd] = segment;
  const [bisStart, bisEnd] = bisector;
  
  // Check if bisector is perpendicular to segment
  const isPerpendicular = checkPerpendicular(segment, bisector, tolerance);
  
  // Check if bisector passes through midpoint of segment
  const midpoint = {
    x: (segStart.x + segEnd.x) / 2,
    y: (segStart.y + segEnd.y) / 2
  };
  
  // Check if midpoint lies on bisector line (within tolerance)
  const distanceToLine = distanceFromPointToLine(midpoint, bisStart, bisEnd);
  const passesThroughMidpoint = distanceToLine < tolerance;
  
  return isPerpendicular && passesThroughMidpoint;
}

/**
 * Calculate distance from point to line
 */
function distanceFromPointToLine(point: Point, lineStart: Point, lineEnd: Point): number {
  const lineLength = distance(lineStart, lineEnd);
  
  if (lineLength === 0) {
    return distance(point, lineStart);
  }
  
  const t = Math.max(0, Math.min(1, 
    ((point.x - lineStart.x) * (lineEnd.x - lineStart.x) + 
     (point.y - lineStart.y) * (lineEnd.y - lineStart.y)) / (lineLength * lineLength)
  ));
  
  const projection = {
    x: lineStart.x + t * (lineEnd.x - lineStart.x),
    y: lineStart.y + t * (lineEnd.y - lineStart.y)
  };
  
  return distance(point, projection);
}

/**
 * Validate constraint against triangle
 */
export function validateConstraint(constraint: GeometricConstraint, triangle: Triangle, additionalData?: any): boolean {
  switch (constraint.type) {
    case 'equal_sides':
      if (constraint.elements.length >= 2) {
        return checkEqualSides(triangle, [constraint.elements[0], constraint.elements[1]], constraint.tolerance);
      }
      return false;
      
    case 'equal_angles':
      if (constraint.elements.length >= 2) {
        return checkEqualAngles(triangle, [constraint.elements[0], constraint.elements[1]], constraint.tolerance);
      }
      return false;
      
    case 'angle_bisector':
      if (constraint.elements.length >= 1 && additionalData?.bisectorPoint) {
        return checkAngleBisector(triangle, constraint.elements[0], additionalData.bisectorPoint, constraint.tolerance);
      }
      return false;
      
    case 'perpendicular_bisector':
      if (additionalData?.segment && additionalData?.bisector) {
        return checkPerpendicularBisector(additionalData.segment, additionalData.bisector, constraint.tolerance);
      }
      return false;
      
    default:
      return false;
  }
}

/**
 * Constraint manager for learning modules
 */
export class ConstraintManager {
  private constraints: Map<string, GeometricConstraint> = new Map();
  
  addConstraint(constraint: GeometricConstraint): void {
    this.constraints.set(constraint.id, constraint);
  }
  
  removeConstraint(id: string): void {
    this.constraints.delete(id);
  }
  
  getConstraint(id: string): GeometricConstraint | undefined {
    return this.constraints.get(id);
  }
  
  getAllConstraints(): GeometricConstraint[] {
    return Array.from(this.constraints.values());
  }
  
  validateAll(triangle: Triangle, additionalData?: any): Map<string, boolean> {
    const results = new Map<string, boolean>();
    
    for (const [id, constraint] of this.constraints) {
      const isValid = validateConstraint(constraint, triangle, additionalData);
      results.set(id, isValid);
      
      // Update constraint satisfaction status
      constraint.satisfied = isValid;
    }
    
    return results;
  }
  
  getSatisfiedConstraints(): GeometricConstraint[] {
    return this.getAllConstraints().filter(c => c.satisfied);
  }
  
  getUnsatisfiedConstraints(): GeometricConstraint[] {
    return this.getAllConstraints().filter(c => !c.satisfied);
  }
  
  clear(): void {
    this.constraints.clear();
  }
}

/**
 * Predefined constraint templates for common scenarios
 */
export const CONSTRAINT_TEMPLATES = {
  ISOSCELES_EQUAL_SIDES: (tolerance = 0.001): GeometricConstraint => ({
    id: 'isosceles-equal-sides',
    type: 'equal_sides',
    elements: ['AB', 'AC'],
    satisfied: false,
    tolerance
  }),
  
  ISOSCELES_EQUAL_BASE_ANGLES: (tolerance = 0.001): GeometricConstraint => ({
    id: 'isosceles-equal-base-angles',
    type: 'equal_angles',
    elements: ['B', 'C'],
    satisfied: false,
    tolerance
  }),
  
  APEX_ANGLE_BISECTOR: (tolerance = 0.001): GeometricConstraint => ({
    id: 'apex-angle-bisector',
    type: 'angle_bisector',
    elements: ['A'],
    satisfied: false,
    tolerance
  }),
  
  PERPENDICULAR_BISECTOR_BASE: (tolerance = 0.001): GeometricConstraint => ({
    id: 'perpendicular-bisector-base',
    type: 'perpendicular_bisector',
    elements: ['BC', 'AD'],
    satisfied: false,
    tolerance
  })
} as const;