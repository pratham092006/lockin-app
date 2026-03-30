import { describe, expect, it } from 'vitest';
import { calculateTDEE } from './tdee';

describe('calculateTDEE', () => {
  it('calculates male TDEE with Mifflin-St Jeor formula', () => {
    const result = calculateTDEE({
      age: 25,
      gender: 'male',
      height: 175,
      weight: 75,
      activityLevel: 1.55,
    });

    expect(result).toBe(2672);
  });

  it('calculates female TDEE with Mifflin-St Jeor formula', () => {
    const result = calculateTDEE({
      age: 30,
      gender: 'female',
      height: 165,
      weight: 60,
      activityLevel: 1.375,
    });

    expect(result).toBe(1815);
  });
});
