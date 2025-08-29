import { describe, it, expect } from 'vitest';
import { haversineMeters } from '../src/lib/location';

describe('haversineMeters', () => {
	it('computes zero for same point', () => {
		expect(haversineMeters(0,0,0,0)).toBeCloseTo(0, 6);
	});
	it('computes distance between NYC and LA within tolerance', () => {
		const d = haversineMeters(40.7128, -74.0060, 34.0522, -118.2437);
		expect(d/1000).toBeGreaterThan(3900);
		expect(d/1000).toBeLessThan(4600);
	});
});
