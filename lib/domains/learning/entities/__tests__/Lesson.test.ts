import { describe, it, expect } from 'vitest';
import { Lesson } from '../Lesson';
import { Step } from '../Step';

describe('Lesson', () => {
  const validProps = {
    unitId: 'unit-1',
    title: 'Pengenalan Tag HTML',
    slug: 'pengenalan-tag-html',
    description: 'Belajar tag HTML dasar',
    order: 1,
  };

  it('should create lesson with valid props', () => {
    const lesson = Lesson.create(validProps);
    expect(lesson.id).toBeDefined();
    expect(lesson.props.unitId).toBe('unit-1');
    expect(lesson.props.title).toBe('Pengenalan Tag HTML');
    expect(lesson.props.slug).toBe('pengenalan-tag-html');
    expect(lesson.props.steps).toEqual([]);
  });

  it('should create lesson with id', () => {
    const lesson = Lesson.create(validProps, 'lesson-1');
    expect(lesson.id).toBe('lesson-1');
  });

  it('should throw if title empty', () => {
    expect(() => Lesson.create({ ...validProps, title: '' })).toThrow();
  });

  it('should throw if slug empty', () => {
    expect(() => Lesson.create({ ...validProps, slug: '' })).toThrow();
  });

  it('should throw if unitId empty', () => {
    expect(() => Lesson.create({ ...validProps, unitId: '' })).toThrow();
  });

  it('should throw if order negative', () => {
    expect(() => Lesson.create({ ...validProps, order: -1 })).toThrow();
  });

  it('should set timestamps', () => {
    const lesson = Lesson.create(validProps);
    expect(lesson.props.createdAt).toBeInstanceOf(Date);
    expect(lesson.props.updatedAt).toBeInstanceOf(Date);
  });
});
