/**
 * 삼각형 합동 검출 및 검증
 * 
 * 이 파일은 두 삼각형이 "합동"인지(정확히 같은 크기와 모양)를 판단하는
 * 모든 수학적 규칙을 구현합니다. 이것들은 중고등학교에서 습니다다
 * 기하학의 기본 정리들입니다.
 * 
 * **구현된 합동 조건들:**
 * - **SAS**: 변-각-변 (두 변과 그 사이각이 같음)
 * - **ASA**: 각-변-각 (두 각과 그 사이변이 같음)
 * - **SSS**: 변-변-변 (세 변이 모두 같음)
 * - **RHS**: 직각-빗변-변 (직각삼각형에서 빗변과 한 변이 같음)
 * - **RHA**: 직각-빗변-각 (직각삼각형에서 빗변과 한 각이 같음)
 * 
 * **교육적 맥락:**
 * 우리 이등변삼각형 모듈에서 학생들은 삼각형을 접어서
 * 생결되는 두 삼각형이 합동임을 깨닫어 SAS 합동을 발견합니다.
 * 이것이 밑각들이 같을 수밖에 없음을 증명합니다.
 */

import { Triangle, Point, CongruenceCondition } from './types';
import { distance, measureTriangle, isEqual, isAngleEqual } from './triangle';

/**
 * 두 삼각형 간의 SAS(변-각-변) 합동 조건을 확인합니다
 * 
 * SAS 합동의 의미: 두 삼각형이 두 변과 그 사이각이
 * 같다놈, 그 삼각형들은 합동입니다(크기와 모양이 동일).
 * 
 * "사이각"이란 두 등한 변 사이에 있는 각을 의미합니다.
 * 
 * **수학적 규칙:**
 * 삼각형 ABC ≅ 삼각형 DEF라면:
 * - AB = DE (첫 번째 변)
 * - AC = DF (두 번째 변)
 * - ∠A = ∠D (두 변 사이의 각)
 * 
 * **교육 예시:**
 * 우리 이등변삼각형 접기 활동에서 학생들이 발견하는 것:
 * - AB = AC (주어진 조건 - 이등변삼각형)
 * - AD = AD (접은 후 공통변)
 * - ∠BAD = ∠CAD (각의 이등분선이 같은 각들을 만듬)
 * 따라서, 삼각형 ABD ≅ 삼각형 ACD (SAS에 의해)!
 * 
 * @param {Triangle} triangle1 - 비교할 첫 번째 삼각형
 * @param {Triangle} triangle2 - 비교할 두 번째 삼각형
 * @param {number} [tolerance=0.001] - "같음"으로 간주될 측정값들의 근사 정도
 * @returns {CongruenceCondition | null} SAS 조건이 찾아지면 세부 정보, SAS로 합동이 아니면 null
 */
export function checkSAS(triangle1: Triangle, triangle2: Triangle, tolerance: number = 0.001): CongruenceCondition | null {
  const measurements1 = measureTriangle(triangle1);
  const measurements2 = measureTriangle(triangle2);
  
  const sides1 = measurements1.sides;
  const sides2 = measurements2.sides;
  const angles1 = measurements1.angles;
  const angles2 = measurements2.angles;
  
  // SAS patterns to check
  const patterns = [
    // AB-A-AC = DE-D-DF pattern
    {
      sides: [sides1.AB, sides1.AC],
      angle: angles1.A,
      otherSides: [sides2.AB, sides2.AC],
      otherAngle: angles2.A,
      elements: ['AB', 'AC', 'angle A']
    },
    // AB-B-BC = DE-E-EF pattern
    {
      sides: [sides1.AB, sides1.BC],
      angle: angles1.B,
      otherSides: [sides2.AB, sides2.BC],
      otherAngle: angles2.B,
      elements: ['AB', 'BC', 'angle B']
    },
    // AC-C-BC = DF-F-EF pattern
    {
      sides: [sides1.AC, sides1.BC],
      angle: angles1.C,
      otherSides: [sides2.AC, sides2.BC],
      otherAngle: angles2.C,
      elements: ['AC', 'BC', 'angle C']
    }
  ];
  
  for (const pattern of patterns) {
    if (isEqual(pattern.sides[0], pattern.otherSides[0], tolerance) &&
        isEqual(pattern.sides[1], pattern.otherSides[1], tolerance) &&
        isAngleEqual(pattern.angle, pattern.otherAngle, tolerance)) {
      return {
        type: 'SAS',
        elements: pattern.elements,
        isValid: true
      };
    }
  }
  
  return null;
}

/**
 * 두 삼각형 간의 ASA(각-변-각) 합동 조건을 확인합니다
 * 
 * ASA 합돐의 의미: 두 삼각형이 두 각과 그 사이변이
 * 같다면, 그 삼각형들은 합동입니다.
 * 
 * "사이변"이란 두 등한 각 사이에 있는 변을 의미합니다.
 * 
 * **수학적 규칙:**
 * 삼각형 ABC ≅ 삼각형 DEF라면:
 * - ∠A = ∠D (첫 번째 각)
 * - AB = DE (각들 사이의 변)
 * - ∠B = ∠E (두 번째 각)
 * 
 * **실생활 적용:**
 * 각도는 알지만 변의 길이를 하나만 알 때 유용합니다.
 * 예를 들어, 지붕 트러스를 만들 때 양 끝의 각도와
 * 밑변의 길이를 알면, 정확한 삼각형 모양을 결정할 수 있습니다.
 * 
 * @param {Triangle} triangle1 - 비교할 첫 번째 삼각형
 * @param {Triangle} triangle2 - 비교할 두 번째 삼각형
 * @param {number} [tolerance=0.001] - "같음"으로 간주될 측정값들의 근사 정도
 * @returns {CongruenceCondition | null} ASA 조건이 찾아지면 세부 정보, ASA로 합동이 아니면 null
 */
export function checkASA(triangle1: Triangle, triangle2: Triangle, tolerance: number = 0.001): CongruenceCondition | null {
  const measurements1 = measureTriangle(triangle1);
  const measurements2 = measureTriangle(triangle2);
  
  const sides1 = measurements1.sides;
  const sides2 = measurements2.sides;
  const angles1 = measurements1.angles;
  const angles2 = measurements2.angles;
  
  const patterns = [
    // A-AB-B = D-DE-E pattern
    {
      angles: [angles1.A, angles1.B],
      side: sides1.AB,
      otherAngles: [angles2.A, angles2.B],
      otherSide: sides2.AB,
      elements: ['angle A', 'AB', 'angle B']
    },
    // B-BC-C = E-EF-F pattern
    {
      angles: [angles1.B, angles1.C],
      side: sides1.BC,
      otherAngles: [angles2.B, angles2.C],
      otherSide: sides2.BC,
      elements: ['angle B', 'BC', 'angle C']
    },
    // A-AC-C = D-DF-F pattern
    {
      angles: [angles1.A, angles1.C],
      side: sides1.AC,
      otherAngles: [angles2.A, angles2.C],
      otherSide: sides2.AC,
      elements: ['angle A', 'AC', 'angle C']
    }
  ];
  
  for (const pattern of patterns) {
    if (isAngleEqual(pattern.angles[0], pattern.otherAngles[0], tolerance) &&
        isAngleEqual(pattern.angles[1], pattern.otherAngles[1], tolerance) &&
        isEqual(pattern.side, pattern.otherSide, tolerance)) {
      return {
        type: 'ASA',
        elements: pattern.elements,
        isValid: true
      };
    }
  }
  
  return null;
}

/**
 * 두 삼각형 간의 SSS(변-변-변) 합동 조건을 확인합니다
 * 
 * SSS 합동의 의미: 두 삼각형이 세 변이 모두 같다면,
 * 그 삼각형들은 합동입니다. 각도 측정이 필요 없기 때문에
 * 가장 강력한 합동 조건입니다.
 * 
 * **수학적 규칙:**
 * 삼각형 ABC ≅ 삼각형 DEF라면:
 * - AB = DE (첫 번째 변)
 * - AC = DF (두 번째 변)
 * - BC = EF (세 번째 변)
 * 
 * **실생활 적용:**
 * 건설에서 삼각형 버팀의 원리입니다.
 * 고정된 길이의 부품들로 삼각형 프레임을 만들면,
 * 만들 수 있는 모양은 단 하나뿌입니다 - 삼각형은 강체 구조입니다.
 * 
 * @param {Triangle} triangle1 - 비교할 첫 번째 삼각형
 * @param {Triangle} triangle2 - 비교할 두 번째 삼각형
 * @param {number} [tolerance=0.001] - "같음"으로 간주될 측정값들의 근사 정도
 * @returns {CongruenceCondition | null} SSS 조건이 찾아지면 세부 정보, SSS로 합동이 아니면 null
 */
export function checkSSS(triangle1: Triangle, triangle2: Triangle, tolerance: number = 0.001): CongruenceCondition | null {
  const sides1 = measureTriangle(triangle1).sides;
  const sides2 = measureTriangle(triangle2).sides;
  
  if (isEqual(sides1.AB, sides2.AB, tolerance) &&
      isEqual(sides1.AC, sides2.AC, tolerance) &&
      isEqual(sides1.BC, sides2.BC, tolerance)) {
    return {
      type: 'SSS',
      elements: ['AB', 'AC', 'BC'],
      isValid: true
    };
  }
  
  return null;
}

/**
 * 직각삼각형에 대한 RHS(직각-빗변-변) 합동 조건을 확인합니다
 * 
 * RHS 합동은 직각삼각형(90° 각을 가진 삼각형)에만
 * 적용되는 특별한 규칙입니다. 두 직각삼각형이 빗변과
 * 한 쌍의 등한 변을 가지면 합동입니다.
 * 
 * **왜 이것이 작동하는가:**
 * 직각삼각형에서 빗변은 항상 가장 긴 변입니다.
 * 빗변과 다른 한 변이 같다면, 세 번째 변도
 * 반드시 같아야 합니다(피타고라스 정리에 의해), 따라서 삼각형들은 동일합니다.
 * 
 * **수학적 규칙:**
 * 삼각형 ABC ≅ 삼각형 DEF (둘 다 직각삼각형)라면:
 * - 둘 다 90° 각을 가짐
 * - 빗변 AB = 빗변 DE
 * - 다른 한 변 AC = DF (또는 BC = EF)
 * 
 * **실생활 적용:**
 * 건물 모서리, 직사각형 프레임 등과 같이 직각 구조물을
 * 다룰 때 건축 및 공학에서 유용합니다.
 * 
 * @param {Triangle} triangle1 - 비교할 첫 번째 직각삼각형
 * @param {Triangle} triangle2 - 비교할 두 번째 직각삼각형
 * @param {number} [tolerance=0.001] - "같음"으로 간주될 측정값들의 근사 정도
 * @returns {CongruenceCondition | null} RHS 조건이 찾아지면 세부 정보, 직각삼각형이 아니거나 합동이 아니면 null
 */
export function checkRHS(triangle1: Triangle, triangle2: Triangle, tolerance: number = 0.001): CongruenceCondition | null {
  const angles1 = measureTriangle(triangle1).angles;
  const angles2 = measureTriangle(triangle2).angles;
  
  // Check if both triangles have right angles
  const hasRightAngle1 = isAngleEqual(angles1.A, 90, tolerance) || 
                         isAngleEqual(angles1.B, 90, tolerance) || 
                         isAngleEqual(angles1.C, 90, tolerance);
  
  const hasRightAngle2 = isAngleEqual(angles2.A, 90, tolerance) || 
                         isAngleEqual(angles2.B, 90, tolerance) || 
                         isAngleEqual(angles2.C, 90, tolerance);
  
  if (!hasRightAngle1 || !hasRightAngle2) {
    return null;
  }
  
  const sides1 = measureTriangle(triangle1).sides;
  const sides2 = measureTriangle(triangle2).sides;
  
  // Find hypotenuse (longest side) for each triangle
  const hypotenuse1 = Math.max(sides1.AB, sides1.AC, sides1.BC);
  const hypotenuse2 = Math.max(sides2.AB, sides2.AC, sides2.BC);
  
  // Check hypotenuse equality and one other side
  if (isEqual(hypotenuse1, hypotenuse2, tolerance)) {
    const otherSides1 = [sides1.AB, sides1.AC, sides1.BC].filter(s => s !== hypotenuse1);
    const otherSides2 = [sides2.AB, sides2.AC, sides2.BC].filter(s => s !== hypotenuse2);
    
    for (const side1 of otherSides1) {
      for (const side2 of otherSides2) {
        if (isEqual(side1, side2, tolerance)) {
          return {
            type: 'RHS',
            elements: ['right angle', 'hypotenuse', 'one side'],
            isValid: true
          };
        }
      }
    }
  }
  
  return null;
}

/**
 * 직각삼각형에 대한 RHA(직각-빗변-각) 합동 조건을 확인합니다
 * 
 * RHA 합동은 직각삼각형에 대한 또 다른 특별한 규칙입니다. 두 직각삼각형이
 * 빗변과 한 쌍의 등한 예각을 가지면 합동입니다.
 * 
 * **왜 이것이 작동하는가:**
 * 직각삼각형에서 빗변과 한 예각을 알면,
 * 다른 예각은 자동으로 결정됩니다(각의 합이 180°이고 한 각이 90°이므로).
 * 두 각과 빗변이 있으면, 삼각형이 완전히 정의됩니다.
 * 
 * **수학적 규칙:**
 * 삼각형 ABC ≅ 삼각형 DEF (둘 다 직각삼각형)라면:
 * - 둘 다 90° 각을 가짐
 * - 빗변 AB = 빗변 DE
 * - 한 예각 ∠A = ∠D (또는 ∠B = ∠E)
 * 
 * **교육적 참고사항:**
 * 이것은 본질적으로 ASA 합동의 특별한 경우이지만,
 * 빗변을 알고 있는 직각삼각형에 맞게 최적화되어 있습니다.
 * 
 * @param {Triangle} triangle1 - 비교할 첫 번째 직각삼각형
 * @param {Triangle} triangle2 - 비교할 두 번째 직각삼각형
 * @param {number} [tolerance=0.001] - "같음"으로 간주될 측정값들의 근사 정도
 * @returns {CongruenceCondition | null} RHA 조건이 찾아지면 세부 정보, 직각삼각형이 아니거나 합동이 아니면 null
 */
export function checkRHA(triangle1: Triangle, triangle2: Triangle, tolerance: number = 0.001): CongruenceCondition | null {
  const measurements1 = measureTriangle(triangle1);
  const measurements2 = measureTriangle(triangle2);
  
  const angles1 = measurements1.angles;
  const angles2 = measurements2.angles;
  
  // Check if both triangles have right angles
  const hasRightAngle1 = isAngleEqual(angles1.A, 90, tolerance) || 
                         isAngleEqual(angles1.B, 90, tolerance) || 
                         isAngleEqual(angles1.C, 90, tolerance);
  
  const hasRightAngle2 = isAngleEqual(angles2.A, 90, tolerance) || 
                         isAngleEqual(angles2.B, 90, tolerance) || 
                         isAngleEqual(angles2.C, 90, tolerance);
  
  if (!hasRightAngle1 || !hasRightAngle2) {
    return null;
  }
  
  const sides1 = measurements1.sides;
  const sides2 = measurements2.sides;
  
  // Find hypotenuses
  const hypotenuse1 = Math.max(sides1.AB, sides1.AC, sides1.BC);
  const hypotenuse2 = Math.max(sides2.AB, sides2.AC, sides2.BC);
  
  // Check hypotenuse equality and one acute angle
  if (isEqual(hypotenuse1, hypotenuse2, tolerance)) {
    const acuteAngles1 = [angles1.A, angles1.B, angles1.C].filter(a => a < 89);
    const acuteAngles2 = [angles2.A, angles2.B, angles2.C].filter(a => a < 89);
    
    for (const angle1 of acuteAngles1) {
      for (const angle2 of acuteAngles2) {
        if (isAngleEqual(angle1, angle2, tolerance)) {
          return {
            type: 'RHA',
            elements: ['right angle', 'hypotenuse', 'one acute angle'],
            isValid: true
          };
        }
      }
    }
  }
  
  return null;
}

/**
 * 두 삼각형 사이의 모든 가능한 합동 조건을 확인합니다
 * 
 * 이것은 다섯 개의 합동 조건(SAS, ASA, SSS, RHS, RHA)을 모두 시도하여
 * 두 삼각형이 합동인지 판단하는 "마스터 함수"입니다.
 * 처음 찾은 일치 조건을 반환합니다.
 * 
 * **사용 전략:**
 * 1. SAS 먼저 시도 (우리 교육 모듈에서 가장 일반적)
 * 2. ASA 시도 (각도 중심 문제)
 * 3. SSS 시도 (모든 변을 알 때)
 * 4. RHS 시도 (빗변을 가진 직각삼각형)
 * 5. RHA 시도 (각도를 가진 직각삼각형)
 * 
 * **교육적 가치:**
 * 이 함수는 합동을 증명하는 여러 방법이 있음을 보여줍니다.
 * 다른 문제들은 사용 가능한 정보에 따라
 * 다른 접근법을 사용할 수 있습니다.
 * 
 * @param {Triangle} triangle1 - 비교할 첫 번째 삼각형
 * @param {Triangle} triangle2 - 비교할 두 번째 삼각형
 * @param {number} [tolerance=0.001] - "같음"으로 간주될 측정값들의 근사 정도
 * @returns {CongruenceCondition | null} 처음 찾은 일치하는 합동 조건, 합동이 아니면 null
 */
export function checkCongruence(triangle1: Triangle, triangle2: Triangle, tolerance: number = 0.001): CongruenceCondition | null {
  // Try each congruence condition in order
  const conditions = [
    () => checkSAS(triangle1, triangle2, tolerance),
    () => checkASA(triangle1, triangle2, tolerance),
    () => checkSSS(triangle1, triangle2, tolerance),
    () => checkRHS(triangle1, triangle2, tolerance),
    () => checkRHA(triangle1, triangle2, tolerance)
  ];
  
  for (const checkCondition of conditions) {
    const result = checkCondition();
    if (result) return result;
  }
  
  return null;
}

/**
 * 접은 이등변삼각형에 대한 SAS 합동을 확인합니다 (우리 학습 활동 전용)
 * 
 * 이것은 학생들이 이등변삼각형을 각의 이등분선을 따라 접는
 * 우리 교육 모듈을 위한 전문 함수입니다. 접기로 만들어진
 * 두 부분 삼각형이 SAS 조건을 사용하여 합동인지 검증합니다.
 * 
 * **교육적 맥락:**
 * 학생들이 삼각형 ABC를 A에서 BC 위의 점 D로의 각의 이등분선을 따라 접을 때:
 * - 왼쪽 삼각형: ABD
 * - 오른쪽 삼각형: ACD
 * - 이것들이 합동이어야 하어, ∠B = ∠C임을 증명
 * 
 * **SAS 증명 요소들:**
 * 1. AB = AC (주어진 조건 - 이등변삼각형 성질)
 * 2. AD = AD (공통변 - 같은 접는 선)
 * 3. ∠BAD = ∠CAD (접는 선이 각의 이등분선)
 * 
 * **왜 이것이 중요한가:**
 * 이 함수는 우리 학습 활동의 핵심 통찰에 대한 수학적
 * 검증을 제공합니다: 접기가 합동을 드러내고, 이것이
 * 밑각들이 같음을 증명합니다.
 * 
 * @param {Triangle} originalTriangle - 원래 이등변삼각형 ABC
 * @param {Point} foldPoint - 각의 이등분선이 밑변 BC와 만나는 점 D
 * @param {number} [tolerance=0.001] - "같음"으로 간주될 측정값들의 근사 정도
 * @returns {CongruenceCondition | null} 접은 삼각형들이 합동이면 SAS 조건 세부 정보
 */
export function checkFoldedTriangleCongruence(
  originalTriangle: Triangle, 
  foldPoint: Point,
  tolerance: number = 0.001
): CongruenceCondition | null {
  
  // Create the two sub-triangles formed by folding
  const leftTriangle: Triangle = {
    A: originalTriangle.A,
    B: originalTriangle.B,
    C: foldPoint // D point
  };
  
  const rightTriangle: Triangle = {
    A: originalTriangle.A,
    B: foldPoint, // D point
    C: originalTriangle.C
  };
  
  // Check SAS condition: AB = AC (given), AD = AD (common), ∠BAD = ∠CAD (bisector)
  const AB = distance(originalTriangle.A, originalTriangle.B);
  const AC = distance(originalTriangle.A, originalTriangle.C);
  const AD = distance(originalTriangle.A, foldPoint);
  
  // Calculate angles
  const leftMeasurements = measureTriangle(leftTriangle);
  const rightMeasurements = measureTriangle(rightTriangle);
  const angleBAD = leftMeasurements.angles.A;
  const angleCAD = rightMeasurements.angles.A;
  
  if (isEqual(AB, AC, tolerance) && 
      isEqual(AD, AD, tolerance) && // Always true but logically complete
      isAngleEqual(angleBAD, angleCAD, tolerance)) {
    return {
      type: 'SAS',
      elements: ['AB=AC (given)', 'AD=AD (common)', '∠BAD=∠CAD (fold line)'],
      isValid: true
    };
  }
  
  return null;
}

/**
 * Data structure for gamified condition discovery
 * 
 * In our learning activity, students "collect" mathematical conditions like
 * collecting items in a game. Each condition is represented as a "chip"
 * that students can click to collect.
 * 
 * This makes abstract mathematical concepts tangible and engaging.
 * 
 * @interface ConditionChips
 */
// Deprecated: chip extraction is handled by engine/chip-system
export interface ConditionChips {
  sideChips: Array<{ id: string; label: string; description: string; isAvailable: boolean }>;
  angleChips: Array<{ id: string; label: string; description: string; isAvailable: boolean }>;
}

/**
 * Generate collectible condition chips for the isosceles triangle learning activity
 * 
 * This function creates the "items" that students can discover and collect
 * during the discovery phase. Each chip represents a mathematical fact
 * needed to prove SAS congruence.
 * 
 * **Generated Chips:**
 * - Side AB: One of the equal sides (주어진 조건)
 * - Side AC: Other equal side (주어진 조건)
 * - Common AD: Shared side after folding (공통변)
 * - Angle BAD: Left angle created by fold line (각의 이등분선)
 * - Angle CAD: Right angle created by fold line (각의 이등분선)
 * 
 * **Gamification Purpose:**
 * Makes mathematical discovery feel like treasure hunting.
 * Students "find" the proof elements rather than being told them.
 * 
 * @param {Triangle} triangle - The isosceles triangle being analyzed
 * @param {Point} foldPoint - Where the angle bisector intersects the base
 * @returns {ConditionChips} Available chips for collection
 */
// Deprecated: use engine chip-system definitions instead
export function extractConditionChips(triangle: Triangle, foldPoint: Point): ConditionChips {
  const AB = distance(triangle.A, triangle.B);
  const AC = distance(triangle.A, triangle.C);
  const isIsoscelesValid = isEqual(AB, AC);
  
  return {
    sideChips: [
      {
        id: 'side-AB',
        label: '변 AB',
        description: '주어진 조건 (이등변삼각형)',
        isAvailable: isIsoscelesValid
      },
      {
        id: 'side-AC',
        label: '변 AC',
        description: '주어진 조건 (이등변삼각형)',
        isAvailable: isIsoscelesValid
      },
      {
        id: 'common-AD',
        label: '공통변 AD',
        description: '두 삼각형이 공유하는 변',
        isAvailable: true
      }
    ],
    angleChips: [
      {
        id: 'angle-BAD',
        label: '∠BAD',
        description: '접은 선이 만드는 각',
        isAvailable: true
      },
      {
        id: 'angle-CAD',
        label: '∠CAD',
        description: '접은 선이 만드는 각 (각의 이등분선)',
        isAvailable: true
      }
    ]
  };
}

/**
 * Validate if the chips collected by the student form a complete congruence proof
 * 
 * This function checks whether the student has collected enough mathematical
 * conditions to prove SAS congruence. It's like checking if they have all
 * the pieces of a puzzle.
 * 
 * **Required for SAS Congruence:**
 * - Two equal sides: 'side-AB' and 'side-AC'
 * - The included angle: either 'angle-BAD' or 'angle-CAD'
 * - The common side: 'common-AD'
 * 
 * **Educational Purpose:**
 * - Guides students toward complete mathematical reasoning
 * - Provides feedback on what's missing from their proof
 * - Celebrates when they've found all necessary elements
 * - Teaches logical structure of geometric proofs
 * 
 * **Feedback System:**
 * - isValid: true when student has complete proof
 * - congruenceType: which type of congruence they proved
 * - missingChips: what they still need to find
 * 
 * @param {string[]} collectedChipIds - Array of chip IDs the student has collected
 * @returns {object} Validation results with success status and feedback
 */
// Deprecated: SAS validation now lives in engine/chip-system
export function validateChipCombination(collectedChipIds: string[]): {
  isValid: boolean;
  congruenceType: CongruenceCondition['type'] | null;
  missingChips: string[];
} {
  return { isValid: false, congruenceType: null, missingChips: [] };
}