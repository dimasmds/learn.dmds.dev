import { describe, it, expect, beforeEach } from 'vitest';
import { useCodeEditorStore } from '../code-editor-store';

describe('CodeEditorStore', () => {
  beforeEach(() => {
    useCodeEditorStore.setState({
      code: '',
      language: 'html',
      readOnly: false,
      highlightedLines: [],
    });
  });

  it('should have correct initial state', () => {
    const state = useCodeEditorStore.getState();
    expect(state.code).toBe('');
    expect(state.language).toBe('html');
    expect(state.readOnly).toBe(false);
    expect(state.highlightedLines).toEqual([]);
  });

  it('should set code', () => {
    const { setCode } = useCodeEditorStore.getState();
    setCode('<h1>Hello</h1>');
    expect(useCodeEditorStore.getState().code).toBe('<h1>Hello</h1>');
  });

  it('should set language', () => {
    const { setLanguage } = useCodeEditorStore.getState();
    setLanguage('css');
    expect(useCodeEditorStore.getState().language).toBe('css');
  });

  it('should set language to javascript', () => {
    const { setLanguage } = useCodeEditorStore.getState();
    setLanguage('javascript');
    expect(useCodeEditorStore.getState().language).toBe('javascript');
  });

  it('should set readOnly', () => {
    const { setReadOnly } = useCodeEditorStore.getState();
    setReadOnly(true);
    expect(useCodeEditorStore.getState().readOnly).toBe(true);
  });

  it('should set highlighted lines', () => {
    const { setHighlightedLines } = useCodeEditorStore.getState();
    setHighlightedLines([1, 3, 5]);
    expect(useCodeEditorStore.getState().highlightedLines).toEqual([1, 3, 5]);
  });
});
