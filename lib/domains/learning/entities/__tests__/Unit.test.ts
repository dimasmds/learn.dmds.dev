import { describe, it, expect } from 'vitest';
import { Unit } from '../Unit';

describe('Unit', () => {
  const validProps = {
    title: 'Unit 1: HTML Dasar',
    description: 'Belajar dasar-dasar HTML',
    slug: 'unit-1-html-dasar',
    order: 1,
  };

  it('should create unit with valid props', () => {
    const unit = Unit.create(validProps);
    expect(unit.id).toBeDefined();
    expect(unit.props.title).toBe('Unit 1: HTML Dasar');
    expect(unit.props.description).toBe('Belajar dasar-dasar HTML');
    expect(unit.props.slug).toBe('unit-1-html-dasar');
    expect(unit.props.order).toBe(1);
    expect(unit.props.lessonIds).toEqual([]);
  });

  it('should create unit with id', () => {
    const id = 'unit-123';
    const unit = Unit.create(validProps, id);
    expect(unit.id).toBe(id);
  });

  it('should throw if title empty', () => {
    expect(() => Unit.create({ ...validProps, title: '' })).toThrow();
  });

  it('should throw if slug empty', () => {
    expect(() => Unit.create({ ...validProps, slug: '' })).toThrow();
  });

  it('should throw if order negative', () => {
    expect(() => Unit.create({ ...validProps, order: -1 })).toThrow();
  });

  it('should set timestamps', () => {
    const unit = Unit.create(validProps);
    expect(unit.props.createdAt).toBeInstanceOf(Date);
    expect(unit.props.updatedAt).toBeInstanceOf(Date);
  });
});
