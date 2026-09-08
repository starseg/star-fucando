import * as React from "react";

export interface OptionItem {
  id: string;
  name: string;
}

export function createOptionsHook(
  fetcher: () => Promise<{ success: boolean; data?: { id: string; name: string }[] }>
) {
  return function useOptions(isOpen: boolean): OptionItem[] {
    const [options, setOptions] = React.useState<OptionItem[]>([]);

    React.useEffect(() => {
      async function loadOptions() {
        const res = await fetcher();
        if (res.success && res.data) {
          setOptions(res.data.map((e) => ({ id: e.id, name: e.name })));
        }
      }
      if (isOpen) {
        loadOptions();
      }
    }, [isOpen]);

    return options;
  };
}
