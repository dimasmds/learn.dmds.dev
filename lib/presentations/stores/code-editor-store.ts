import { create } from 'zustand';

interface CodeEditorState {
  code: string;
  language: 'html' | 'css' | 'javascript';
  readOnly: boolean;
  highlightedLines: number[];
}

interface CodeEditorActions {
  setCode: (code: string) => void;
  setLanguage: (lang: 'html' | 'css' | 'javascript') => void;
  setReadOnly: (readOnly: boolean) => void;
  setHighlightedLines: (lines: number[]) => void;
}

export const useCodeEditorStore = create<CodeEditorState & CodeEditorActions>()((set) => ({
  code: '',
  language: 'html',
  readOnly: false,
  highlightedLines: [],

  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setReadOnly: (readOnly) => set({ readOnly }),
  setHighlightedLines: (highlightedLines) => set({ highlightedLines }),
}));
