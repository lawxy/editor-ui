import { type ReactNode, type RefObject } from 'react';

export type ContainerProps = {
  style: {
    width?: number | string;
    height?: number | string;
  };
  isEditorReady: boolean;
  loading: ReactNode | string;
  _ref: RefObject<HTMLDivElement>;
  className?: string;
  wrapperProps?: object;
};
