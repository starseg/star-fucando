import * as React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0c0a09] p-4 text-stone-100 selection:bg-amber-500 selection:text-stone-950">
      {children}
    </div>
  );
}
