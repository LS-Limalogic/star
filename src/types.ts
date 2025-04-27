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

// Represents the actual input values
export interface StoredSettings {
  mode: AngleMode | string; // Allow string during parse, validate later
  angle: string;
  lines: string;
  length: string;
  delay: string;
}

// Represents a snapshot saved by the user
export interface NamedSetting {
  id: number; // Timestamp as unique ID
  name: string; // Display name (e.g., timestamp string)
  settings: StoredSettings;
} 