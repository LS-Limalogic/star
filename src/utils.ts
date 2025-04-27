// src/utils.ts

export const delay = (ms: number): Promise<void> => new Promise(res => setTimeout(res, ms));

export const degToRad = (degrees: number): number => degrees * (Math.PI / 180); 