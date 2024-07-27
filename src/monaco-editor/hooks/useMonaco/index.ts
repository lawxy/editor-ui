import loader from '@monaco-editor/loader';
import { useState } from 'react';

import useMount from '../useMount';

export const useMonaco = () => {
  const [monaco, setMonaco] = useState(loader.__getMonacoInstance());

  useMount(() => {
    let cancelable: ReturnType<typeof loader.init>;

    if (!monaco) {
      cancelable = loader.init();

      cancelable.then((monaco) => {
        setMonaco(monaco);
      });
    }

    return () => cancelable?.cancel();
  });

  return monaco;
};
