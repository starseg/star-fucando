import * as React from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppMobileHeaderProps {
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}

export function AppMobileHeader({ isMenuOpen, onToggleMenu }: AppMobileHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-stone-800 bg-[#141210]/95 px-4 md:hidden">
      <div className="flex items-center">
        <span className="font-bold text-stone-100 text-base">Star Seg</span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleMenu}
        className="text-stone-400 hover:text-stone-100"
      >
        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
    </header>
  );
}
