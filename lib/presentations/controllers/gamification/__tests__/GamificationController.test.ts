import { describe, it, expect, vi, beforeAll } from 'vitest';
import { NextRequest } from 'next/server';
import { GamificationController } from '../GamificationController';

const describeIntegration = process.env.DATABASE_URL ? describe : describe.skip;

describe('GamificationController', () => {
  describe('getStats', () => {
    it('should return 400 when userId is missing', async () => {
      const request = new NextRequest(new URL('http://localhost/api/gamification/stats'));
      const response = await GamificationController.getStats(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.status).toBe('fail');
    });
  });
});

describeIntegration('GamificationController (integration)', () => {
  it('should return stats when userId is provided', async () => {
    const request = new NextRequest(
      new URL('http://localhost/api/gamification/stats?userId=user-1'),
    );
    const response = await GamificationController.getStats(request);

    // Log the error body for debugging if not 200
    if (response.status !== 200) {
      const body = await response.json();
      console.log('getStats error response:', JSON.stringify(body));
    }

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('success');
    expect(body.data).toHaveProperty('totalXP');
    expect(body.data).toHaveProperty('streak');
    expect(body.data).toHaveProperty('badgeCount');
    expect(body.data).toHaveProperty('recentTransactions');
  });

  it('should return badges with empty userBadges when no userId', async () => {
    const request = new NextRequest(new URL('http://localhost/api/gamification/badges'));
    const response = await GamificationController.getBadges(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('success');
    expect(body.data).toHaveProperty('allBadges');
    expect(body.data).toHaveProperty('userBadges');
  });
});
