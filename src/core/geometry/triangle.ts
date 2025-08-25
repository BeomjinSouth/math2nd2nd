/**
 * 삼각형 연산 및 측정
 * 기하학적 계산을 위한 순수 함수들
 * 
 * 이 파일은 삼각형과 작업하는 데 필요한 모든 수학적 함수들을 포함합니다.
 * 이들은 "순수" 함수들로, 아무것도 변경하지 않고 -
 * 단지 입력을 받아서 계산기처럼 답을 계산할 뼐입니다.
 * 
 * 우리를 도와주는 수학적 도구들로 생각해보세요:
 * - 거리와 각도 측정
 * - 삼각형이 특별한 종류인지 확인 (이등변삼각형처럼)
 * - 기하학적 연산 수행
 */

import { Point, Triangle, TriangleMeasurements } from './types';

/**
 * 두 점 사이의 직선 거리를 계산합니다
 * 
 * 피타고라스 정리(a² + b² = c²)를 사용하여 거리를 구합니다.
 * 종이 위에 두 점이 있다고 상상해보세요 - 이 함수는 두 점 사이에
 * 직선을 그었을 때 얼마나 떨어져 있는지 알려줍니다.
 * 
 * 공식: 거리 = √[(x₂-x₁)² + (y₂-y₁)²]
 * 
 * @example
 * ```typescript
 * const pointA = { x: 0, y: 0 };     // 왼쪽 아래 모서리
 * const pointB = { x: 3, y: 4 };     // 다른 어떤 점
 * const dist = distance(pointA, pointB); // 5를 반환 (3² + 4² = 9 + 16 = 25, √25 = 5이므로)
 * ```
 * 
 * @param {Point} p1 - 첫 번째 점 (시작점)
 * @param {Point} p2 - 두 번째 점 (끝점)
 * @returns {number} 두 점 사이의 거리 (항상 양수)
 */
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * 세 점으로 형성되는 각을 계산합니다 (라디안 단위)
 * 
 * 꼭지점에서 p1에서 p2로 보는 각도를 구합니다.
 * 꼭지점에 서서 p1을 보다가 p2로 돌아서는 것을 상상해보세요 -
 * 얼마나 돌았는지를 측정합니다.
 * 
 * 계산에는 벡터 수학을 사용합니다:
 * 1. 꼭지점에서 각 점으로의 벡터 생성
 * 2. atan2를 사용하여 각 벡터의 방향 찾기
 * 3. 뺄셈하여 둘 사이의 각 구하기
 * 
 * 주의: 결과는 라디안 단위입니다(수학적 단위). toDegrees()로 변환하세요.
 * 
 * @example
 * ```typescript
 * const A = { x: 0, y: 0 };      // 꼭지점 (모서리 점)
 * const B = { x: 1, y: 0 };      // 오른쪽 점
 * const C = { x: 0, y: 1 };      // 위쪽 점
 * const angleBAC = angle(A, B, C); // π/2 라디안(90도) 반환
 * ```
 * 
 * @param {Point} vertex - 각의 모서리 점 (두 직선이 만나는 곳)
 * @param {Point} p1 - 각의 한 변을 정의하는 첫 번째 점
 * @param {Point} p2 - 각의 다른 변을 정의하는 두 번째 점
 * @returns {number} 라디안 단위의 각 (방향에 따라 양수나 음수 가능)
 */
export function angle(vertex: Point, p1: Point, p2: Point): number {
  const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
  const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y };
  
  return Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);
}

/**
 * 각도를 라디안에서 도로 변환합니다
 * 
 * 컴퓨터는 각도 계산에 라디안을 자주 사용하지만, 인간은 보통
 * 도 단위로 생각합니다. 이것은 두 체계 사이를 변환합니다:
 * - 라디안: 전체 원 = 2π ≈ 6.28인 수학적 단위
 * - 도: 전체 원 = 360°인 일반적 단위
 * 
 * @example
 * ```typescript
 * const rightAngleInRadians = Math.PI / 2;  // π/2 라디안
 * const rightAngleInDegrees = toDegrees(rightAngleInRadians); // 90 반환
 * ```
 * 
 * @param {number} radians - 라디안 단위의 각도 측정값
 * @returns {number} 도 단위로 된 동일한 각도 측정값
 */
export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * 각도를 도에서 라디안으로 변환합니다
 * 
 * toDegrees()의 반대 - 인간친화적인 도에서
 * 수학적 계산을 위한 컴퓨터친화적인 라디안으로 변환합니다.
 * 
 * @example
 * ```typescript
 * const rightAngleInDegrees = 90;
 * const rightAngleInRadians = toRadians(rightAngleInDegrees); // π/2 ≈ 1.57 반환
 * ```
 * 
 * @param {number} degrees - 도 단위의 각도 측정값
 * @returns {number} 라디안 단위로 된 동일한 각도 측정값
 */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * 삼각형의 포괄적인 측정값을 구합니다 (모든 변과 각)
 * 
 * 자와 각도기로 삼각형에 대한 모든 것을 측정하는 것과 같습니다.
 * 다음을 계산합니다:
 * - 세 변 모두의 길이
 * - 세 각 모두의 크기 (도 단위)
 * 
 * 다음에 매우 유용합니다:
 * - 삼각형이 이등변삼각형인지 확인 (두 등한 변)
 * - 밑각들이 같은지 검증
 * - 기하학적 증명을 위한 데이터 얻기
 * 
 * @example
 * ```typescript
 * const triangle = {
 *   A: { x: 100, y: 50 },  // 맨 위 점
 *   B: { x: 50, y: 150 },  // 왼쪽 아래
 *   C: { x: 150, y: 150 } // 오른쪽 아래
 * };
 * 
 * const measurements = measureTriangle(triangle);
 * console.log(measurements);
 * // 결과: {
 * //   sides: { AB: 111.8, AC: 111.8, BC: 100 },
 * //   angles: { A: 53.13, B: 63.43, C: 63.43 }
 * // }
 * // 이것은 이등변삼각형임을 보여줍니다: AB = AC 그리고 각 B = 각 C!
 * ```
 * 
 * @param {Triangle} triangle - 측정할 삼각형
 * @returns {TriangleMeasurements} 모든 변의 길이와 각의 크기를 포함하는 객체
 */
export function measureTriangle(triangle: Triangle): TriangleMeasurements {
  const sides = {
    AB: distance(triangle.A, triangle.B),
    AC: distance(triangle.A, triangle.C),
    BC: distance(triangle.B, triangle.C)
  };
  
  const angles = {
    A: Math.abs(toDegrees(angle(triangle.A, triangle.B, triangle.C))),
    B: Math.abs(toDegrees(angle(triangle.B, triangle.A, triangle.C))),
    C: Math.abs(toDegrees(angle(triangle.C, triangle.A, triangle.B)))
  };
  
  return { sides, angles };
}

/**
 * 삼각형이 이등변삼각형인지 확인합니다 (두 변이 같음)
 * 
 * 이등변삼각형은 두 변의 길이가 같습니다. 우리 앱에서는
 * AB = AC인 삼각형(꼭지점 A에서 나오는 두 변이 같은)에 초점을 맞춘니다.
 * 
 * 컴퓨터는 작은 반올림 오차 때문에 항상 정확히 같은 숫자를 계산할 수 없으므로,
 * "허용 오차"를 사용합니다 - 차이가 이 허용 오차보다 작으면 같다고 간주합니다.
 * 
 * @example
 * ```typescript
 * const triangle1 = {
 *   A: { x: 100, y: 50 },
 *   B: { x: 50, y: 150 },
 *   C: { x: 150, y: 150 }
 * };
 * 
 * const triangle2 = {
 *   A: { x: 100, y: 50 },
 *   B: { x: 60, y: 150 },
 *   C: { x: 150, y: 150 }
 * };
 * 
 * console.log(isIsosceles(triangle1)); // true - AB ≈ AC
 * console.log(isIsosceles(triangle2)); // false - AB ≠ AC
 * ```
 * 
 * @param {Triangle} triangle - 확인할 삼각형
 * @param {number} [tolerance=0.001] - 얼마나 가까우면 "충분히 가까운" 것인지 (기본값: 0.001)
 * @returns {boolean} 삼각형이 이등변삼각형이면 (AB ≈ AC) true, 그렇지 않으면 false
 */
export function isIsosceles(triangle: Triangle, tolerance: number = 0.001): boolean {
  const { sides } = measureTriangle(triangle);
  
  return Math.abs(sides.AB - sides.AC) < tolerance;
}

/**
 * 두 숫자 값이 근사적으로 같은지 확인합니다
 * 
 * 컴퓨터 정밀도 한계 때문에, 소수점 계산을 할 때
 * 정확히 같은 숫자를 얻는 경우는 거의 없습니다. 이 함수는 두 숫자가
 * 같다고 간주될 만큼 "충분히 가까운지" 확인합니다.
 * 
 * @example
 * ```typescript
 * const side1 = 5.0000001;
 * const side2 = 5.0000002;
 * 
 * console.log(side1 === side2);          // false (정확한 비교)
 * console.log(isEqual(side1, side2));    // true (허용 오차 범위 내)
 * console.log(isEqual(5.0, 6.0));        // false (차이가 너무 큼)
 * ```
 * 
 * @param {number} value1 - 비교할 첫 번째 숫자
 * @param {number} value2 - 비교할 두 번째 숫자
 * @param {number} [tolerance=0.001] - 여전히 "같음"으로 간주될 최대 허용 차이
 * @returns {boolean} 두 숫자가 서로 허용 오차 범위 내에 있으면 true
 */
export function isEqual(value1: number, value2: number, tolerance: number = 0.001): boolean {
  return Math.abs(value1 - value2) < tolerance;
}

/**
 * 두 각도 측정값이 근사적으로 같은지 확인합니다
 * 
 * 이것은 각도를 비교하는 전용 함수입니다. isEqual()과 같지만
 * 각도를 다룰 때 더 명확해지도록 이름을 지었습니다.
 * 
 * 우리 앱에서는 이등변삼각형의 밑각들이 같은지 확인하는 데
 * 필수적입니다 (이는 이등변삼각형의 성질을 증명합니다).
 * 
 * @example
 * ```typescript
 * const measurements = measureTriangle(isoscelesTriangle);
 * const baseAnglesEqual = isAngleEqual(measurements.angles.B, measurements.angles.C);
 * 
 * if (baseAnglesEqual) {
 *   console.log("밑각들이 같음 - 이등변삼각형 성질을 확인!");
 * }
 * ```
 * 
 * @param {number} angle1 - 도 단위의 첫 번째 각
 * @param {number} angle2 - 도 단위의 두 번째 각
 * @param {number} [tolerance=0.001] - 도 단위로 허용되는 최대 차이
 * @returns {boolean} 각도들이 서로 허용 오차 범위 내에 있으면 true
 */
export function isAngleEqual(angle1: number, angle2: number, tolerance: number = 0.001): boolean {
  return Math.abs(angle1 - angle2) < tolerance;
}

/**
 * 삼각형의 무게중심(중점)을 계산합니다
 * 
 * 무게중심은 삼각형의 "균형점"입니다 - 만약 판지에서 삼각형을 오려내고
 * 연필 끝에 균형을 맞추려고 한다면, 무게중심이 연필을 놆아야 할 곳입니다.
 * 
 * 수학적으로는 단순히 세 꼭지점의 평균입니다:
 * - x좌표: (A.x + B.x + C.x) ÷ 3
 * - y좌표: (A.y + B.y + C.y) ÷ 3
 * 
 * @example
 * ```typescript
 * const triangle = {
 *   A: { x: 0, y: 0 },
 *   B: { x: 6, y: 0 },
 *   C: { x: 3, y: 6 }
 * };
 * 
 * const center = getCentroid(triangle);
 * console.log(center); // { x: 3, y: 2 } - 균형점
 * ```
 * 
 * @param {Triangle} triangle - 중심을 구할 삼각형
 * @returns {Point} 무게중심점 (삼각형의 기하학적 중심)
 */
export function getCentroid(triangle: Triangle): Point {
  return {
    x: (triangle.A.x + triangle.B.x + triangle.C.x) / 3,
    y: (triangle.A.y + triangle.B.y + triangle.C.y) / 3
  };
}

/**
 * 외적 방법을 사용하여 삼각형의 넓이를 계산합니다
 * 
 * 이것은 "외적"이나 "신발끄 공식"이라고 불리는 수학적 기법을 사용하여
 * 넓이를 구합니다. 삼각형이 차지하는 공간의 크기를 계산하는 것과 같습니다.
 * 
 * 공식은 다음과 같이 작동합니다:
 * 1. 점 A에서 점 B와 C로의 두 벡터 생성
 * 2. 둘의 외적 계산 (넓이의 2배가 나옴)
 * 3. 2로 나누어 실제 넓이 구하기
 * 4. 절대값을 취하여 양수 결과 보장
 * 
 * @example
 * ```typescript
 * const triangle = {
 *   A: { x: 0, y: 0 },
 *   B: { x: 4, y: 0 },  // 밑변이 4 단위 길이
 *   C: { x: 2, y: 3 }   // 높이가 3 단위
 * };
 * 
 * const area = getArea(triangle);
 * console.log(area); // 6 (½ × 밑변 × 높이 = ½ × 4 × 3 = 6이므로)
 * ```
 * 
 * @param {Triangle} triangle - 측정할 삼각형
 * @returns {number} 삼각형의 넓이 (항상 양수, 제곱 단위)
 */
export function getArea(triangle: Triangle): number {
  const { A, B, C } = triangle;
  return Math.abs(
    (B.x - A.x) * (C.y - A.y) - (C.x - A.x) * (B.y - A.y)
  ) / 2;
}

/**
 * 넓이 방법을 사용하여 점이 삼각형 내부에 있는지 확인합니다
 * 
 * 주어진 점이 삼각형 내부, 외부, 또는 가장자리에 있는지 판단합니다.
 * 넓이를 비교하는 방식으로 작동합니다:
 * 
 * 점 P가 삼각형 ABC 내부에 있다면:
 * 넓이(ABC) = 넓이(PBC) + 넓이(APC) + 넓이(ABP)
 * 
 * P가 외부에 있으면, 세 부분 넓이의 합이
 * 원래 삼각형 넓이보다 클 것입니다.
 * 
 * @example
 * ```typescript
 * const triangle = {
 *   A: { x: 0, y: 0 },
 *   B: { x: 6, y: 0 },
 *   C: { x: 3, y: 6 }
 * };
 * 
 * const pointInside = { x: 3, y: 2 };   // 중심 근처
 * const pointOutside = { x: 10, y: 10 }; // 멀리 떨어진 곳
 * 
 * console.log(isPointInTriangle(pointInside, triangle));  // true
 * console.log(isPointInTriangle(pointOutside, triangle)); // false
 * ```
 * 
 * @param {Point} point - 테스트할 점
 * @param {Triangle} triangle - 테스트할 대상 삼각형
 * @returns {boolean} 점이 삼각형 내부 또는 가장자리에 있으면 true
 */
export function isPointInTriangle(point: Point, triangle: Triangle): boolean {
  const { A, B, C } = triangle;
  const area = getArea(triangle);
  
  const areaABC = getArea({ A: point, B, C });
  const areaABC2 = getArea({ A, B: point, C });
  const areaABC3 = getArea({ A, B, C: point });
  
  const totalArea = areaABC + areaABC2 + areaABC3;
  
  return Math.abs(totalArea - area) < 0.001;
}

/**
 * A에서 나오는 각의 이등분선이 맞은편 변 BC와 만나는 지점을 찾습니다
 * 
 * 각의 이등분선은 각을 정확히 반으로 나누는 선입니다. 우리
 * 이등변삼각형 학습 활동에서는 꼭지점 A에서 밑변 BC로 내려오는
 * 각의 이등분선을 따라 접습니다.
 * 
 * 이 함수는 각의 이등분선이 BC와 만나는 정확한 지점 D를 찾습니다.
 * 이등변삼각형에서 이 지점 D는 BC의 중점입니다.
 * 
 * 계산 과정:
 * 1. A에서 B와 C 방향으로 가리키는 단위벡터(길이 1) 찾기
 * 2. 이 벡터들을 더하여 이등분선 방향 구하기
 * 3. 이등분선이 BC 선과 만나는 지점 찾기
 * 
 * @example
 * ```typescript
 * const isoscelesTriangle = {
 *   A: { x: 100, y: 50 },  // 꼭지점
 *   B: { x: 50, y: 150 },  // 왼쪽 밑점
 *   C: { x: 150, y: 150 } // 오른쪽 밑점
 * };
 * 
 * const intersection = getAngleBisectorIntersection(isoscelesTriangle);
 * console.log(intersection); // { x: 100, y: 150 } (BC의 중점)이어야 함
 * ```
 * 
 * @param {Triangle} triangle - 각의 이등분선을 찾을 삼각형
 * @returns {Point} A에서 나온 각의 이등분선이 변 BC와 만나는 지점
 */
export function getAngleBisectorIntersection(triangle: Triangle): Point {
  const A = triangle.A;
  const B = triangle.B;
  const C = triangle.C;
  
  // Direction vectors from A to B and A to C
  const AB = { x: B.x - A.x, y: B.y - A.y };
  const AC = { x: C.x - A.x, y: C.y - A.y };
  
  // Normalize to unit vectors
  const lenAB = Math.sqrt(AB.x * AB.x + AB.y * AB.y);
  const lenAC = Math.sqrt(AC.x * AC.x + AC.y * AC.y);
  
  const unitAB = { x: AB.x / lenAB, y: AB.y / lenAB };
  const unitAC = { x: AC.x / lenAC, y: AC.y / lenAC };
  
  // Angle bisector direction
  const bisectorDir = {
    x: unitAB.x + unitAC.x,
    y: unitAB.y + unitAC.y
  };
  
  // Find intersection with BC using parametric line equations
  // BC line: P = B + t(C - B)
  // Bisector: P = A + s(bisectorDir)
  
  const BC = { x: C.x - B.x, y: C.y - B.y };
  const AB_to_bisector = { x: A.x - B.x, y: A.y - B.y };
  
  // Solve for parameter t where lines intersect
  const denominator = BC.x * bisectorDir.y - BC.y * bisectorDir.x;
  
  if (Math.abs(denominator) < 0.0001) {
    // Lines are parallel (shouldn't happen in valid triangle)
    return { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };
  }
  
  const t = (AB_to_bisector.x * bisectorDir.y - AB_to_bisector.y * bisectorDir.x) / denominator;
  
  return {
    x: B.x + t * BC.x,
    y: B.y + t * BC.y
  };
}

/**
 * 세 점이 유효한 삼각형을 형성할 수 있는지 확인합니다
 * 
 * 모든 세 점의 집합이 유효한 삼각형을 만드는 것은 아닙니다. 이 함수는
 * "삼각형 부등식 정리"를 사용하는데, 이는 임의의 두 변의 합이
 * 세 번째 변보다 커야 한다는 것입니다.
 * 
 * 이렇게 생각해보세요: 세 개의 막대기가 있고 삼각형을 만들고 싶다면,
 * 한 막대기가 다른 두 막대기를 합친 것보다 길면 삼각형을 만들 수 없습니다.
 * 
 * @example
 * ```typescript
 * const validTriangle = {
 *   A: { x: 0, y: 0 },
 *   B: { x: 3, y: 0 },
 *   C: { x: 0, y: 4 }
 * };
 * // 변들: AB=3, AC=4, BC=5. 각 쌍의 합이 세 번째보다 큼: ✓
 * 
 * const invalidTriangle = {
 *   A: { x: 0, y: 0 },
 *   B: { x: 1, y: 0 },
 *   C: { x: 10, y: 0 }
 * };
 * // 모든 점이 같은 선 위에 - 삼각형이 아님: ✗
 * 
 * console.log(isValidTriangle(validTriangle));   // true
 * console.log(isValidTriangle(invalidTriangle)); // false
 * ```
 * 
 * @param {Triangle} triangle - 검증할 삼각형
 * @returns {boolean} 세 점이 유효한 삼각형을 형성하면 true
 */
export function isValidTriangle(triangle: Triangle): boolean {
  const { sides } = measureTriangle(triangle);
  const { AB, AC, BC } = sides;
  
  // Triangle inequality theorem
  return (AB + AC > BC) && (AB + BC > AC) && (AC + BC > AB);
}

/**
 * 지정된 치수로 완벽한 이등변삼각형을 만듭니다
 * 
 * 이것은 정확한 측정값을 가진 이등변삼각형을 만드는 도우미 함수입니다.
 * 테스트나 데모 삼각형을 만드는 데 유용합니다.
 * 
 * 삼각형은 다음과 같이 만들어집니다:
 * - A는 맨 위(꼭지점)
 * - B와 C는 아래쪽(밑변), 중심에서 같은 거리
 * - AB = AC (두 등한 변)
 * 
 * @example
 * ```typescript
 * const triangle = createIsoscelesTriangle(100, 80, 200);
 * console.log(triangle);
 * // 결과: {
 * //   A: { x: 200, y: 80 },   // 맨 위 중심
 * //   B: { x: 150, y: 0 },    // 아래 왼쪽
 * //   C: { x: 250, y: 0 }     // 아래 오른쪽
 * // }
 * ```
 * 
 * @param {number} baseWidth - 밑변의 너비 (거리 BC)
 * @param {number} height - 밑변에서 꼭지점까지의 높이 (BC 선에서 A까지의 거리)
 * @param {number} [centerX=0] - 중심의 가로 위치 (기본값: 0)
 * @returns {Triangle} 완벽하게 구성된 이등변삼각형
 */
export function createIsoscelesTriangle(baseWidth: number, height: number, centerX: number = 0): Triangle {
  return {
    A: { x: centerX, y: height },           // Apex
    B: { x: centerX - baseWidth / 2, y: 0 }, // Left base
    C: { x: centerX + baseWidth / 2, y: 0 }  // Right base
  };
}