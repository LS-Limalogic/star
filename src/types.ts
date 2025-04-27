import { AngleMode } from './config.js';

export interface DrawingSettings {
  mode: AngleMode;
  angleValue?: number;
  angleSteps?: number[];
  lines: number;
  length: number;
  delayMs: number;
  startX: number;
  startY: number;
}

export interface DrawingBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface DrawOptions {
  simulate?: boolean;
  scaleFactor?: number;
  bounds?: DrawingBounds;
} 