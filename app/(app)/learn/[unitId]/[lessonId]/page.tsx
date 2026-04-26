'use client';

import { useParams } from 'next/navigation';
import { LessonPlayer } from '@/components/lesson/LessonPlayer';

export default function LessonDetailPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;

  return <LessonPlayer lessonId={lessonId} />;
}
