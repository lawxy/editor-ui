// import loader from '@monaco-editor/loader';
// export { loader };

export * from './hooks/useMonaco';

export * from './Editor';

// Monaco
import type * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
export type Monaco = typeof monaco;

// Default themes
export type Theme = 'vs-dark' | 'light';
