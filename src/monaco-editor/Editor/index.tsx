'use client';

import loader from '@monaco-editor/loader';
import { editor, type IDisposable } from 'monaco-editor';
import * as apiMonaco from 'monaco-editor/esm/vs/editor/editor.api';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { type Monaco } from '..';
import useMount from '../hooks/useMount';
import usePrevious from '../hooks/usePrevious';
import useUpdate from '../hooks/useUpdate';
import MonacoContainer from '../MonacoContainer';
import { getOrCreateModel, noop } from '../utils';
import { type EditorProps } from './types';

loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/gh/lawxy/workers@2.0/vs',
  },
});

export * from './types';

const viewStates = new Map();

export const MonacoEditor = memo(
  ({
    defaultValue,
    defaultLanguage,
    defaultPath,
    value,
    language,
    path,
    theme = 'light',
    line,
    loading = 'Loading...',
    options = {},
    overrideServices = {},
    saveViewState = true,
    keepCurrentModel = false,
    style = {},
    className,
    wrapperProps = {},
    beforeMount = noop,
    onMount = noop,
    onChange,
    onValidate = noop,
    onFocus = noop,
    onBlur = noop,
  }: EditorProps) => {
    const [isEditorReady, setIsEditorReady] = useState(false);
    const [isMonacoMounting, setIsMonacoMounting] = useState(true);
    const monacoRef = useRef<Monaco | null>(null);
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const onMountRef = useRef(onMount);
    const beforeMountRef = useRef(beforeMount);
    const subscriptionRef = useRef<IDisposable>();
    const valueRef = useRef(value);
    const previousPath = usePrevious(path);
    const preventCreation = useRef(false);
    const preventTriggerChangeEvent = useRef<boolean>(false);

    function disposeEditor() {
      subscriptionRef.current?.dispose();

      if (keepCurrentModel) {
        /* eslint-disable */
        saveViewState &&
          viewStates.set(path, editorRef.current!.saveViewState());
      } else {
        editorRef.current!.getModel()?.dispose();
      }

      editorRef.current!.dispose();
    }

    useMount(() => {
      const cancelable = loader.init();

      cancelable
        .then(
          (monaco) =>
            (monacoRef.current = monaco) && setIsMonacoMounting(false),
        )
        .catch((error) => {
          monacoRef.current = apiMonaco;
          setIsMonacoMounting(false);
        });

      return () => (editorRef.current ? disposeEditor() : cancelable.cancel());
    });

    useUpdate(
      () => {
        const model = getOrCreateModel(
          monacoRef.current!,
          defaultValue || value || '',
          defaultLanguage || language || '',
          path || defaultPath || '',
        );

        if (model !== editorRef.current?.getModel()) {
          if (saveViewState)
            viewStates.set(previousPath, editorRef.current?.saveViewState());
          editorRef.current?.setModel(model);
          if (saveViewState)
            editorRef.current?.restoreViewState(viewStates.get(path));
        }
      },
      [path],
      isEditorReady,
    );

    useUpdate(
      () => {
        editorRef.current?.updateOptions(options);
      },
      [options],
      isEditorReady,
    );

    useUpdate(
      () => {
        if (!editorRef.current || value === undefined) return;
        if (
          editorRef.current.getOption(
            monacoRef.current!.editor.EditorOption.readOnly,
          )
        ) {
          editorRef.current.setValue(value);
        } else if (value !== editorRef.current.getValue()) {
          preventTriggerChangeEvent.current = true;
          editorRef.current.executeEdits('', [
            {
              range: editorRef.current.getModel()!.getFullModelRange(),
              text: value,
              forceMoveMarkers: true,
            },
          ]);

          editorRef.current.pushUndoStop();
          preventTriggerChangeEvent.current = false;
        }
      },
      [value],
      isEditorReady,
    );

    useUpdate(
      () => {
        const model = editorRef.current?.getModel();
        if (model && language)
          monacoRef.current?.editor.setModelLanguage(model, language);
      },
      [language],
      isEditorReady,
    );

    useUpdate(
      () => {
        // reason for undefined check: https://github.com/suren-atoyan/monaco-react/pull/188
        if (line !== undefined) {
          editorRef.current?.revealLine(line);
        }
      },
      [line],
      isEditorReady,
    );

    useUpdate(
      () => {
        monacoRef.current?.editor.setTheme(theme);
      },
      [theme],
      isEditorReady,
    );

    const createEditor = useCallback(() => {
      if (!containerRef.current || !monacoRef.current) return;
      if (!preventCreation.current) {
        beforeMountRef.current(monacoRef.current);
        const autoCreatedModelPath = path || defaultPath;

        const defaultModel = getOrCreateModel(
          monacoRef.current,
          value || defaultValue || '',
          defaultLanguage || language || '',
          autoCreatedModelPath || '',
        );

        editorRef.current = monacoRef.current?.editor.create(
          containerRef.current,
          {
            model: defaultModel,
            automaticLayout: true,
            ...options,
          },
          overrideServices,
        );

        saveViewState &&
          editorRef.current.restoreViewState(
            viewStates.get(autoCreatedModelPath),
          );

        monacoRef.current.editor.setTheme(theme);

        if (line !== undefined) {
          editorRef.current.revealLine(line);
        }

        setIsEditorReady(true);
        preventCreation.current = true;
      }
    }, [
      defaultValue,
      defaultLanguage,
      defaultPath,
      value,
      language,
      path,
      options,
      overrideServices,
      saveViewState,
      theme,
      line,
    ]);

    useEffect(() => {
      if (isEditorReady) {
        onMountRef.current(editorRef.current!, monacoRef.current!);
      }
    }, [isEditorReady]);

    useEffect(() => {
      !isMonacoMounting && !isEditorReady && createEditor();
    }, [isMonacoMounting, isEditorReady, createEditor]);

    // subscription
    // to avoid unnecessary updates (attach - dispose listener) in subscription
    valueRef.current = value;

    // onChange
    useEffect(() => {
      if (isEditorReady && onChange) {
        subscriptionRef.current?.dispose();
        subscriptionRef.current = editorRef.current?.onDidChangeModelContent(
          (event) => {
            if (!preventTriggerChangeEvent.current) {
              onChange(editorRef.current!.getValue(), event);
            }
          },
        );
      }
    }, [isEditorReady, onChange]);

    // onValidate
    useEffect(() => {
      if (isEditorReady) {
        const changeMarkersListener =
          monacoRef.current!.editor.onDidChangeMarkers((uris) => {
            const editorUri = editorRef.current!.getModel()?.uri;

            if (editorUri) {
              const currentEditorHasMarkerChanges = uris.find(
                (uri) => uri.path === editorUri.path,
              );
              if (currentEditorHasMarkerChanges) {
                const markers = monacoRef.current!.editor.getModelMarkers({
                  resource: editorUri,
                });
                onValidate?.(markers);
              }
            }
          });

        return () => {
          changeMarkersListener?.dispose();
        };
      }
      return () => {
        // eslint happy
      };
    }, [isEditorReady, onValidate]);

    useEffect(() => {
      if (!isEditorReady || !editorRef.current) return;
      // 监听编辑器聚焦事件
      editorRef.current?.onDidFocusEditorText(() => {
        onFocus?.();
      });

      // 监听编辑器失去焦点事件
      editorRef.current?.onDidBlurEditorText(() => {
        onBlur?.();
      });
    }, [isEditorReady]);

    return (
      <MonacoContainer
        style={style}
        isEditorReady={isEditorReady}
        loading={loading}
        _ref={containerRef}
        className={className}
        wrapperProps={wrapperProps}
      />
    );
  },
);
