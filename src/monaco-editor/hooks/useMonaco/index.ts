// import loader from '@monaco-editor/loader';
// import { useState } from 'react';

// import useMount from '../useMount';

// export const useMonaco = () => {
//   const [monaco, setMonaco] = useState(loader.__getMonacoInstance());

//   useMount(() => {
//     let cancelable: ReturnType<typeof loader.init>;

//     if (!monaco) {
//       cancelable = loader.init();

//       cancelable.then((monaco) => {
//         setMonaco(monaco);
//       });
//     }

//     return () => cancelable?.cancel();
//   });

//   return monaco;
// };

import { useState } from 'react';
import useMount from '../useMount';

export const useMonaco = () => {
  const [monaco, setMonaco] = useState<any>(null);

  useMount(() => {
    let cancelable: any;

    const load = async () => {
      const loader = await import('@monaco-editor/loader');
      const instance = loader.default.__getMonacoInstance();

      if (!instance) {
        cancelable = loader.default.init();
        const monacoInstance = await cancelable;
        setMonaco(monacoInstance);
      } else {
        setMonaco(instance);
      }
    };

    load();

    return () => {
      cancelable?.cancel?.();
    };
  });

  return monaco;
};
