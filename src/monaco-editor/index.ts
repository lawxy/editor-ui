import loader from '@monaco-editor/loader';
export { loader };

export * from './hooks/useMonaco';

export * from './Editor';

export {
  DOMRect,
  Direction,
  GroupOptions,
  MoveEvent,
  Options,
  PullResult,
  PutResult,
  default as Sortable,
  SortableEvent,
  SortableOptions,
  Utils,
} from 'sortablejs';

// Monaco
import type * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
export type Monaco = typeof monaco;

// Default themes
export type Theme = 'vs-dark' | 'light';
