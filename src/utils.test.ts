// No need to import globals if @types/jest is installed and working
// import { describe, expect, test } from '@jest/globals'; 
import { degToRad } from './utils.js'; // Use .js extension for ESM compatibility

describe('degToRad function', () => {
  test('should convert 0 degrees to 0 radians', () => {
    expect(degToRad(0)).toBe(0);
  });

  test('should convert 180 degrees to PI radians', () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI); // Use toBeCloseTo for floating point
  });

  test('should convert 90 degrees to PI/2 radians', () => {
    expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
  });

  test('should convert -90 degrees to -PI/2 radians', () => {
    expect(degToRad(-90)).toBeCloseTo(-Math.PI / 2);
  });

  test('should convert 360 degrees to 2*PI radians', () => {
    expect(degToRad(360)).toBeCloseTo(2 * Math.PI);
  });
}); 