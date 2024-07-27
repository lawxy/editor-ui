import React from 'react';

import styles from './styles';
import { type ContainerProps } from './types';

function MonacoContainer({
  style,
  isEditorReady,
  _ref,
  className,
  wrapperProps,
}: ContainerProps) {
  return (
    <section
      style={{
        ...styles.wrapper,
        width: style.width ?? '100%',
        height: style.height ?? '100%',
      }}
      {...wrapperProps}
    >
      <div
        ref={_ref}
        style={{ ...styles.fullWidth, ...(!isEditorReady && styles.hide) }}
        className={className}
      />
    </section>
  );
}

export default MonacoContainer;
