import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StepProps } from '../types';
import { validateStepAnswer } from '@/lib/applications/services/StepValidator';

const MAX_ATTEMPTS = 3;

interface SortableItemProps {
  id: string;
  text: string;
  isCorrectState?: boolean | null;
}

function SortableItem({ id, text, isCorrectState }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'flex items-center gap-3 p-4 rounded-[var(--radius-common)] border-2 border-[var(--color-border)] bg-secondary-background',
        'shadow-[var(--shadow-x)_var(--shadow-y)_var(--shadow-blur)_var(--shadow-spread)_var(--color-shadow)]',
        'transition-all duration-150',
        isDragging && 'opacity-70 shadow-lg z-10',
        isCorrectState === true && 'border-green-600 bg-green-50',
        isCorrectState === false && 'border-red-500 bg-red-50',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className="cursor-grab text-lg text-foreground/60 hover:text-foreground px-1 py-0"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
      <span className="flex-1 text-foreground">{text}</span>
    </div>
  );
}

export function ReorderStep({ step, onAnswer, isCompleted, disabled }: StepProps) {
  const initialItems = (step.content.items as string[]) ?? [];
  const [items, setItems] = useState<string[]>(initialItems);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const isLocked = submitted || isCompleted || disabled || attempts >= MAX_ATTEMPTS;

  const handleDragEnd = (event: DragEndEvent) => {
    if (isLocked) return;

    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = () => {
    if (isLocked) return;

    const result = validateStepAnswer(step, items);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setFeedback({ message: result.feedback, isCorrect: result.isCorrect });

    if (result.isCorrect) {
      setSubmitted(true);
      onAnswer(true);
    } else if (newAttempts >= MAX_ATTEMPTS) {
      setSubmitted(true);
    }
  };

  const correctOrder = step.solution.correctOrder as string[];

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-base font-medium mb-4">{step.instruction}</p>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3 mb-4">
              {items.map((item) => {
                let itemCorrectState: boolean | null = null;
                if (submitted && feedback?.isCorrect) {
                  itemCorrectState = true;
                } else if (submitted && !feedback?.isCorrect) {
                  const correctIdx = correctOrder.indexOf(item);
                  const currentIdx = items.indexOf(item);
                  itemCorrectState = correctIdx === currentIdx;
                }

                return (
                  <SortableItem
                    key={item}
                    id={item}
                    text={item}
                    isCorrectState={submitted ? itemCorrectState : null}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        {feedback && (
          <div
            className={`p-3 rounded-[var(--radius-common)] border-2 mb-4 ${
              feedback.isCorrect
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'bg-red-50 border-red-500 text-red-700'
            }`}
          >
            <p className="font-medium">{feedback.message}</p>
            {!feedback.isCorrect && step.hints.length > 0 && (
              <p className="text-sm mt-1 opacity-80">
                💡 {step.hints[Math.min(attempts - 1, step.hints.length - 1)]}
              </p>
            )}
            {!feedback.isCorrect && attempts < MAX_ATTEMPTS && (
              <p className="text-sm mt-1 opacity-70">
                Percobaan {attempts}/{MAX_ATTEMPTS}
              </p>
            )}
            {!feedback.isCorrect && attempts >= MAX_ATTEMPTS && (
              <p className="text-sm mt-1 opacity-70">
                Batas percobaan tercapai. Urutan yang benar: {correctOrder.join(' → ')}
              </p>
            )}
          </div>
        )}

        {!submitted && !isCompleted && (
          <Button onClick={handleSubmit} disabled={disabled || attempts >= MAX_ATTEMPTS}>
            Periksa Jawaban
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
