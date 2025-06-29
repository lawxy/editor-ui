// import { MonacoReact } from '@tsword/editor-cmp';
import { MonacoEditor } from '../../src/monaco-editor';
import React from 'react';

const Comp = () => {
  return (
    <div>
      <MonacoEditor
        style={{
          height: 100,
        }}
        defaultLanguage="css"
        options={{
          tabSize: 2,
        }}
        onChange={(v) => {
          console.log('change');
          console.log(v);
        }}
      />
    </div>
  );
};

export default Comp;
