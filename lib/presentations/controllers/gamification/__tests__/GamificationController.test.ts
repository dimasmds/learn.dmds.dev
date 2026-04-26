import { describe, it, expect, vi, beforeAll } from 'vitest';
import { NextRequest } from 'next/server';
import { GamificationController } from '../GamificationController';

const describeIntegration = process.env.DATABASE_URL ? describe : describe.skip;

describeIntegration('GamificationController (integration)', () => {
  describe('getStats', () => {
    it('should return 400 when userId is missing', async () => {
      const request = new NextRequest(new URL('http://localhost/api/gamification/stats'));
      const response = await GamificationController.getStats(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.status).toBe('fail');
    });

    it('should return stats when userId is provided', async () => {
      const request = new NextRequest(
        new URL('http://localhost/api/gamification/stats?userId=user-1'),
      );
      const response = await GamificationController.getStats(request);

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.status).toBe('success');
      expect(body.data).toHaveProperty('totalXP');
      expect(body.data).toHaveProperty('streak');
      expect(body.data).toHaveProperty('badgeCount');
      expect(body.data).toHaveProperty('recentTransactions');
    });
  });

  describe('getBadges', () => {
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
});
