/**
 * 핵심 기하학 타입 및 인터페이스
 * 기하학적 개체에 대한 도메인 주도 설계 접근법
 * 
 * 이 파일은 애플리케이션 전반에서 사용되는 모든 기초 기하학 타입을 정의합니다.
 * 이러한 타입들은 수학적 개념을 컴퓨터가 이해할 수 있는 방식으로 표현합니다.
 * 기하학적 도형과 그 속성들을 설명하는 청사진이나 템플릿처럼 생각하시면 됩니다.
 */

/**
 * 2차원 공간에서 하나의 점을 나타냅니다 (컴퓨터 화면이나 종이 위의 한 점처럼)
 * 
 * 수학에서 점은 크기가 없는 위치만을 나타냅니다 - 점으로 한 지점을 표시하는 것과 같습니다.
 * 컴퓨터 그래픽에서는 좌표를 사용해서 이 점이 정확히 어디에 있는지 지정해야 합니다.
 * 
 * @example
 * ```typescript
 * const pointA: Point = { x: 100, y: 200 }; // 가로 위치 100, 세로 위치 200에 있는 점
 * const origin: Point = { x: 0, y: 0 };     // 좌표계의 중심점(원점)
 * ```
 * 
 * @interface Point
 * @property {number} x - 가로 위치(좌우). 숫자가 클수록 더 오른쪽에 위치
 * @property {number} y - 세로 위치(상하). 숫자가 클수록 화면에서 더 아래쪽에 위치
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 두 점 사이의 직선 선분을 나타냅니다
 * 
 * 선분은 종이 위에 두 점 사이에 그은 직선과 같습니다.
 * 무한히 연장되는 직선과 달리, 선분은 명확한 시작점과 끝점을 갖습니다.
 * 삼각형의 변, 접는 선, 기타 여러 용도로 사용됩니다.
 * 
 * @example
 * ```typescript
 * const sideAB: Segment = {
 *   start: { x: 0, y: 0 },    // 점 A
 *   end: { x: 100, y: 0 }     // 점 B - 길이 100인 가로 선분 생성
 * };
 * ```
 * 
 * @interface Segment
 * @property {Point} start - 선분의 시작점
 * @property {Point} end - 선분의 끝점
 */
export interface Segment {
  start: Point;
  end: Point;
}

/**
 * 세 점으로 형성되는 각을 나타냅니다
 * 
 * 각은 두 직선이 한 점에서 만날 때 형성됩니다. 책을 여는 것처럼 생각해보세요 -
 * 책장이 만나는 모서리가 꼭지점이고, 두 책장의 가장자리가
 * 각의 두 변을 형성합니다.
 * 
 * 기하학에서 각을 정의하려면 세 점이 필요합니다:
 * - 꼭지점 (두 직선이 만나는 모서리 점)
 * - 각 직선의 방향을 정의하는 두 다른 점
 * 
 * @example
 * ```typescript
 * const angleBAC: Angle = {
 *   vertex: { x: 50, y: 50 },   // 점 A (모서리)
 *   point1: { x: 0, y: 50 },    // 점 B (한 변을 정의)
 *   point2: { x: 50, y: 0 }     // 점 C (다른 변을 정의)
 * };
 * // 점 A에서 90도(직각)를 생성합니다
 * ```
 * 
 * @interface Angle
 * @property {Point} vertex - 두 직선이 만나는 모서리 점 (각 BAC에서 A점처럼)
 * @property {Point} point1 - 각의 첫 번째 변 위의 점 (각 BAC에서 B점처럼)
 * @property {Point} point2 - 각의 두 번째 변 위의 점 (각 BAC에서 C점처럼)
 */
export interface Angle {
  vertex: Point;
  point1: Point;
  point2: Point;
}

/**
 * 세 점을 사용하여 삼각형을 나타냅니다
 * 
 * 삼각형은 세 개의 직선 변과 세 개의 모서리(꼭지점)를 가진 도형입니다.
 * 삼각형의 성질, 특히 이등변삼각형에 대해 학습하는
 * 우리 애플리케이션에서 가장 중요한 도형입니다.
 * 
 * 한국 기하 교육에서:
 * - A = 꼭지각 - 이등변삼각형의 맨 위 점
 * - B, C = 밑각 - 밑변에 닿아 있는 아래쪽 두 모서리
 * 
 * @example
 * ```typescript
 * const isoscelesTriangle: Triangle = {
 *   A: { x: 100, y: 50 },   // 맨 위 점 (꼭지각)
 *   B: { x: 50, y: 150 },   // 왼쪽 아래 - 밑각 1
 *   C: { x: 150, y: 150 }   // 오른쪽 아래 - 밑각 2
 * };
 * // 변 AB와 AC가 같은 이등변삼각형을 생성합니다
 * ```
 * 
 * @interface Triangle
 * @property {Point} A - 삼각형의 꼭지점(맨 위), 일반적으로 이등변삼각형에서 두 등한 변이 만나는 곳 (꼭지각)
 * @property {Point} B - 첫 번째 밑점, 밑각 중 하나를 형성 (밑각 1)
 * @property {Point} C - 두 번째 밑점, 다른 밑각을 형성 (밑각 2)
 */
export interface Triangle {
  A: Point; // 꼭지각 (apex angle)
  B: Point; // 밑각 1 (base angle 1)
  C: Point; // 밑각 2 (base angle 2)
}

/**
 * 기하학 증명에서 하나의 단계를 나타냅니다
 * 
 * 수학에서 증명은 어떤 것이 참임을 보이기 위해 단계별로 논리를 구축하는 것과 같습니다.
 * 각 단계는 이전 단계들 위에 구축되어, 마치 블록을 쌓는 것과 같습니다.
 * 
 * 친구에게 왜 어떤 것이 참인지 설명하는 것처럼 생각해보세요:
 * 1. "이것을 알고 있어 왜냐하면..." (given - 주어진 조건)
 * 2. "이 선을 그었어 왜냐하면..." (constructed - 작도된 것)
 * 3. "따라서 이것이 참이야 왜냐하면..." (inferred - 추론된 것)
 * 
 * @example
 * ```typescript
 * const proofStep: ProofStep = {
 *   id: "step-1",
 *   type: "given",
 *   statement: "삼각형 ABC는 AB = AC인 이등변삼각형이다",
 *   reason: "문제에서 주어진 조건",
 *   elements: ["AB", "AC"]
 * };
 * ```
 * 
 * @interface ProofStep
 * @property {string} id - 이 증명 단계의 고유 식별자 (컴퓨터 추적용)
 * @property {'given' | 'constructed' | 'inferred'} type - 이 단계의 종류:
 *   - 'given': 처음에 제공된 정보 ("삼각형 ABC는 이등변삼각형"처럼)
 *   - 'constructed': 우리가 그리거나 만든 것 ("각의 이등분선 그리기"처럼)
 *   - 'inferred': 이전 단계들로부터 알아낸 것 ("따라서 각이 같다"처럼)
 * @property {string} statement - 이 단계에서 주장하는 내용 (인간이 이해할 수 있는 언어로)
 * @property {string} reason - 이 말이 왜 참인지 이유 (논리적 근거)
 * @property {string[]} elements - 이 단계에 연관된 기하학적 요소들 목록 (점, 선, 각)
 */
export interface ProofStep {
  id: string;
  type: 'given' | 'constructed' | 'inferred';
  statement: string;
  reason: string;
  elements: string[];
}

/**
 * 삼각형 합동 조건의 유형들
 * 
 * 합동이란 두 삼각형이 크기와 모양이 정확히 같다는 뜻입니다 - 위치만 다를 뼐
 * 완전히 일치하는 둘입니다. 마치 두 개의 완벽하게 맞는 퍼즐 조각을 갖고 있는 것과 같습니다.
 * 
 * 이러한 약어들은 삼각형이 합동임을 증명하는 다른 방법들을 나타냅니다:
 * - S = Side (변), A = Angle (각), H = Hypotenuse (빗변), R = Right angle (직각)
 * 
 * @example
 * ```typescript
 * const congruenceRule: CongruenceType = 'SAS'; // 변-각-변 합동
 * ```
 * 
 * @type CongruenceType
 * @values
 *   - 'SSS': Side-Side-Side (세 변이 모두 같음)
 *   - 'SAS': Side-Angle-Side (두 변과 그 사이각이 같음)
 *   - 'ASA': Angle-Side-Angle (두 각과 그 사이변이 같음)
 *   - 'RHS': Right-Hypotenuse-Side (직각삼각형에서 빗변과 한 변이 같음)
 *   - 'RHA': Right-Hypotenuse-Angle (직각삼각형에서 빗변과 한 각이 같음)
 */
export type CongruenceType = 'SSS' | 'SAS' | 'ASA' | 'RHS' | 'RHA';

/**
 * 요소들과 유효성을 포함한 특정 합동 조건을 나타냅니다
 * 
 * 이것은 두 삼각형 사이에서 합동을 증명할 수 있는 일치하는 부분들의
 * 유효한 집합을 찾았는지 추적합니다. 다음을 보여주는 체크리스트와 같습니다:
 * - 어떤 종류의 합동을 확인하고 있는지 (SAS, SSS 등)
 * - 어떤 구체적인 삼각형 부분들이 포함되어 있는지
 * - 합동을 결론지을 충분한 정보가 있는지
 * 
 * @example
 * ```typescript
 * const sasCondition: CongruenceCondition = {
 *   type: 'SAS',
 *   elements: ['AB', 'angle-A', 'AC'],  // 두 변과 그 사이각
 *   isValid: true  // SAS 합동에 필요한 모든 부분을 가지고 있음
 * };
 * ```
 * 
 * @interface CongruenceCondition
 * @property {CongruenceType} type - 적용할 합동 법칙 (SAS, SSS, ASA 등)
 * @property {string[]} elements - 포함된 삼각형 부분들의 이름 (['AB', 'angle-A', 'AC']처럼)
 * @property {boolean} isValid - 이 합동 유형에 필요한 모든 부분들을 가지고 있는지 여부
 */
export interface CongruenceCondition {
  type: CongruenceType;
  elements: string[];
  isValid: boolean;
}

/**
 * 삼각형의 모든 측정값들을 포함합니다 (변의 길이와 각도)
 * 
 * 삼각형을 분석하고 싶을 때 정확한 측정값들을 알아야 합니다.
 * 이것은 자로 변의 길이를 재고 각도기로 각도를 재는 것과 같습니다.
 * 컴퓨터는 삼각형의 점 좌표들로부터 이러한 값들을 자동으로 계산합니다.
 * 
 * @example
 * ```typescript
 * const measurements: TriangleMeasurements = {
 *   sides: {
 *     AB: 5.0,    // 점 A에서 점 B까지의 거리
 *     AC: 5.0,    // 점 A에서 점 C까지의 거리 (AB와 같음 = 이등변!)
 *     BC: 6.0     // 점 B에서 점 C까지의 거리 (밑변)
 *   },
 *   angles: {
 *     A: 53.13,   // 점 A에서의 각 (꼭지각), 단위: 도
 *     B: 63.43,   // 점 B에서의 각 (밑각), 단위: 도
 *     C: 63.43    // 점 C에서의 각 (밑각, B와 같음!)
 *   }
 * };
 * ```
 * 
 * @interface TriangleMeasurements
 * @property {object} sides - 삼각형의 세 변 모두의 길이
 * @property {number} sides.AB - 점 A에서 점 B까지의 변 길이
 * @property {number} sides.AC - 점 A에서 점 C까지의 변 길이
 * @property {number} sides.BC - 점 B에서 점 C까지의 변 길이 (밑변)
 * @property {object} angles - 삼각형의 세 각 모두의 크기
 * @property {number} angles.A - 점 A에서의 각 (꼭지각) 단위: 도
 * @property {number} angles.B - 점 B에서의 각 (밑각) 단위: 도
 * @property {number} angles.C - 점 C에서의 각 (밑각) 단위: 도
 */
export interface TriangleMeasurements {
  sides: {
    AB: number;
    AC: number;
    BC: number;
  };
  angles: {
    A: number; // degrees
    B: number;
    C: number;
  };
}

/**
 * 선을 따라 삼각형을 접은 결과
 * 
 * 이것은 종이를 접는 것처럼 선을 따라 삼각형을 "접을" 때 일어나는 일을 나타냅니다.
 * 이것은 학생들이 이등변삼각형을 접어서 밑각들이 같다는 것을 발견하는
 * 우리 학습 활동의 핵심 부분입니다.
 * 
 * A에서 밑변 BC로의 각의 이등분선을 따라 접을 때:
 * - 삼각형이 두 부분(왼쪽과 오른쪽)으로 나뉘어짐
 * - 삼각형이 이등변삼각형이라면 이 부분들이 완벽하게 겹쳐야 함
 * - 겹침 넓이가 둘이 얼마나 잘 맞는지 알려줌
 * 
 * @example
 * ```typescript
 * const foldResult: FoldResult = {
 *   foldLine: {
 *     start: { x: 100, y: 50 },  // 점 A (꼭지점)
 *     end: { x: 100, y: 150 }    // BC 위의 점 (밑변)
 *   },
 *   leftTriangle: { A: {...}, B: {...}, D: {...} },  // 접은 후 왼쪽 부분
 *   rightTriangle: { A: {...}, C: {...}, D: {...} }, // 접은 후 오른쪽 부분
 *   overlapArea: 245.5,  // 접을 때 겹치는 넓이
 *   isValid: true        // 이 접기 작업이 의미가 있는지 여부
 * };
 * ```
 * 
 * @interface FoldResult
 * @property {Segment} foldLine - 접는 선 (보통 꼭지점 A에서 밑변 BC로)
 * @property {Triangle} leftTriangle - 접은 후 삼각형의 왼쪽 부분
 * @property {Triangle} rightTriangle - 접은 후 삼각형의 오른쪽 부분
 * @property {number} overlapArea - 두 부분을 접을 때 겹치는 넓이 (클수록 = 더 잘 맞음)
 * @property {boolean} isValid - 이 접기 작업이 기하학적으로 유효하고 의미가 있는지
 */
export interface FoldResult {
  foldLine: Segment;
  leftTriangle: Triangle;
  rightTriangle: Triangle;
  overlapArea: number;
  isValid: boolean;
}

/**
 * 도형에 적용할 수 있는 기하학적 제약 조건들의 유형
 * 
 * 제약은 기하학적 도형들이 따라야 하는 규칙이나 조건들입니다.
 * "이 두 변은 길이가 같아야 한다"나 "이 선은 저 다른 선에 수직이어야 한다"와 같은
 * 요구 사항들로 생각해보세요.
 * 
 * 이러한 제약들은 특별한 종류의 삼각형(이등변삼각형 같은)을 정의하고
 * 그들의 성질을 이해하는 데 도움을 줍니다.
 * 
 * @type ConstraintType
 * @values
 *   - 'equal_sides': 두 개 이상의 변이 같은 길이를 가져야 함 (같은 길이의 변)
 *   - 'equal_angles': 두 개 이상의 각이 같은 크기를 가져야 함 (같은 크기의 각)
 *   - 'perpendicular': 두 선이 정확히 90도로 만나야 함 (수직)
 *   - 'parallel': 두 선이 절대 만나지 않고 항상 같은 거리를 유지해야 함 (평행)
 *   - 'angle_bisector': 각을 정확히 반으로 나누는 선 (각의 이등분선)
 *   - 'perpendicular_bisector': 다른 선을 90도로 반으로 나누는 선 (수직이등분선)
 */
export type ConstraintType = 
  | 'equal_sides'
  | 'equal_angles' 
  | 'perpendicular'
  | 'parallel'
  | 'angle_bisector'
  | 'perpendicular_bisector';

/**
 * 특정 기하학적 제약과 그것이 만족되고 있는지를 나타냅니다
 * 
 * 이것은 기하학적 요소들에 대한 특정 규칙이나 요구 사항을 추적하고
 * 그 규칙이 현재 따라지고 있는지 확인합니다. 조건들이 만족되는지
 * 지속적으로 모니터링하는 스마트한 검사기와 같습니다.
 * 
 * 예를 들어, 이등변삼각형에서 두 변이 같은지 확인하고 싶다면,
 * 이 제약은 AB와 AC가 같은 길이를 갖는지 지속적으로 확인할 것입니다.
 * 
 * @example
 * ```typescript
 * const isoscelesConstraint: GeometricConstraint = {
 *   id: 'isosceles-sides',
 *   type: 'equal_sides',
 *   elements: ['AB', 'AC'],  // 이 두 변이 같아야 함
 *   satisfied: true,         // 현재 AB와 AC가 같음 (허용 오차 범위 내에서)
 *   tolerance: 0.001         // 작은 차이 허용 (컴퓨터 정밀도를 위한 0.1% 오차 범위)
 * };
 * ```
 * 
 * @interface GeometricConstraint
 * @property {string} id - 이 제약의 고유 이름 (컴퓨터 추적용)
 * @property {ConstraintType} type - 이것이 어떤 종류의 기하학적 규칙인지 (equal_sides, equal_angles 등)
 * @property {string[]} elements - 이 제약이 적용되는 기하학적 요소들 목록 (변, 각, 점)
 * @property {boolean} satisfied - 이 제약이 현재 만족되고 있는지 여부 (true = 규칙이 따라짐)
 * @property {number} tolerance - 이 제약에 대해 얼마나 가까우면 "충분히 가까운" 것인지 (컴퓨터 정밀도 한계 수용)
 */
export interface GeometricConstraint {
  id: string;
  type: ConstraintType;
  elements: string[];
  satisfied: boolean;
  tolerance: number;
}