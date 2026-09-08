import * as React from "react";
import type { Session } from "next-auth";

export interface AppLayoutContextValue {
  user: Session["user"] | undefined;
  onSignOut: () => void;
}

const AppLayoutContext = React.createContext<AppLayoutContextValue | null>(null);

export interface AppLayoutProviderProps {
  value: AppLayoutContextValue;
  children: React.ReactNode;
}

export function AppLayoutProvider({ value, children }: AppLayoutProviderProps) {
  return (
    <AppLayoutContext.Provider value={value}>
      {children}
    </AppLayoutContext.Provider>
  );
}

export function useAppLayoutUser(): AppLayoutContextValue {
  const context = React.use(AppLayoutContext);
  if (!context) {
    throw new Error("useAppLayoutUser must be used within an AppLayoutProvider");
  }
  return context;
}
