import * as React from "react";

export function createScopedContext<T>(displayName: string) {
  const Context = React.createContext<T | null>(null);

  function Provider({ value, children }: { value: T; children: React.ReactNode }) {
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useScopedContext(): T {
    const context = React.use(Context);
    if (!context) {
      throw new Error(`use${displayName} must be used within a ${displayName}Provider`);
    }
    return context;
  }

  return {
    Provider,
    useScopedContext,
  };
}
