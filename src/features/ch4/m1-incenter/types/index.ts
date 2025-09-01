/**
 * 이 파일은 '삼각형의 내심' 학습 모듈에서만 사용하는 전용 타입 정의를 제공합니다
 * 의도는 모듈 내부에서 사용하는 좌표, 선, 작은 삼각형, 짝 그룹 등의 자료구조를 명확히 선언하여
 * 복잡한 상호작용 로직을 타입 안정성과 가독성을 유지한 채 구현하도록 돕는 것입니다
 * 학생이 단계별로 내심과 내접원의 성질을 체험하는 동안 컴포넌트 간 교환되는 데이터의 형태를 표준화합니다
 */

export interface Point {
  x: number;
  y: number;
}

export interface Line {
  start: Point;
  end: Point;
}

export interface Vertices {
  A: Point;
  B: Point;
  C: Point;
}

export enum TrianglePair {
  PAIR_A = 'PAIR_A',
  PAIR_B = 'PAIR_B',
  PAIR_C = 'PAIR_C',
}

export interface SmallTriangle {
  id: string;
  pair: TrianglePair;
  vertices: [Point, Point, Point];
  path: string;
}


