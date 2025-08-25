/**
 * Features Module Exports
 * Central hub for all learning features in the Math Explorer application
 */

// Chapter 1: Isosceles Triangle Properties
export * from './ch1/m1-discover-base-angles';
// ... more modules from chapter 1 will be exported here

// Feature registry for dynamic loading (will be more useful as more modules are added)
export const FEATURE_REGISTRY = {
  'ch1-m1': {
    name: '이등변삼각형의 두 밑각',
    path: './ch1/m1-discover-base-angles',
    component: 'IsoscelesBaseAnglesFeature',
    route: '/ch1/m1',
  },
  'ch3-m1': {
    name: '직각삼각형 RHA',
    path: './ch3/m1-rha',
    component: 'RhaFeature',
    route: '/ch3/m1'
  },
  'ch3-m2': {
    name: '직각삼각형 RHS',
    path: './ch3/m2-rhs',
    component: 'RhsFeature',
    route: '/ch3/m2'
  }
};

// ... other utility functions can be added later as needed