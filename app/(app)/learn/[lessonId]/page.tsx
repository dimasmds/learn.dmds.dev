'use client';

import { use } from 'react';
import { LessonPlayer } from '@/features/lesson-player/components/LessonPlayer';

export default function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = use(params);
  return <LessonPlayer lessonId={lessonId} />;
}
