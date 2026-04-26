import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { InvariantError } from '@kopiketuk/framework';

import type { GetUserStatsUseCase } from '@/lib/applications/usecases/gamification/GetUserStats';
import type { GetBadgesUseCase } from '@/lib/applications/usecases/gamification/GetBadges';
import { container } from '@/lib/infrastructures/container';

export class GamificationController {
  static getStats = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('userId');

      if (!userId) {
        return NextResponse.json(
          { status: 'fail', message: 'userId query parameter is required' },
          { status: 400 },
        );
      }

      const useCase = container.getInstance('GetUserStatsUseCase') as GetUserStatsUseCase;
      const result = await useCase.execute({ userId });

      return NextResponse.json(
        {
          status: 'success',
          data: {
            totalXP: result.totalXP,
            streak: result.streak ? {
              currentCount: result.streak.props.currentCount,
              longestCount: result.streak.props.longestCount,
              lastActivityDate: result.streak.props.lastActivityDate,
              freezeCount: result.streak.props.freezeCount,
            } : null,
            badgeCount: result.badgeCount,
            recentTransactions: result.recentTransactions.map((t) => ({
              id: t.id,
              amount: t.props.amount,
              source: t.props.source,
              sourceId: t.props.sourceId,
              description: t.props.description,
              createdAt: t.props.createdAt.toISOString(),
            })),
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return GamificationController.handleError(error);
    }
  };

  static getBadges = async (request: NextRequest): Promise<NextResponse> => {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('userId') ?? undefined;

      const useCase = container.getInstance('GetBadgesUseCase') as GetBadgesUseCase;
      const result = await useCase.execute({ userId });

      return NextResponse.json(
        {
          status: 'success',
          data: {
            allBadges: result.allBadges.map((b) => ({
              id: b.id,
              name: b.props.name,
              description: b.props.description,
              icon: b.props.icon,
              type: b.props.type,
              category: b.props.category,
              criteria: b.props.criteria,
              xpReward: b.props.xpReward,
              createdAt: b.props.createdAt.toISOString(),
            })),
            userBadges: result.userBadges.map((ub) => ({
              id: ub.id,
              badgeId: ub.props.badgeId,
              earnedAt: ub.props.earnedAt.toISOString(),
            })),
          },
        },
        { status: 200 },
      );
    } catch (error) {
      return GamificationController.handleError(error);
    }
  };

  private static handleError(error: unknown): NextResponse {
    if (error instanceof InvariantError) {
      return NextResponse.json(
        { status: 'fail', message: error.message },
        { status: 400 },
      );
    }

    console.error('Gamification controller error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 },
    );
  }
}
