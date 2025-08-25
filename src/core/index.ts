/**
 * Core Module Exports
 */

// Geometry
export * from './geometry/types';
export * from './geometry/triangle';
export * from './geometry/fold';
export * from './geometry/congruence';
export * from './geometry/constraints';

// Engine (여기 안에 activityMachine, createActivityService 포함)
export * from './engine';

// Learning engine helper
export { createLearningEngine } from './engine';
