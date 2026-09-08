import * as React from "react";

export function useRowSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const allSelected = items.length > 0 && selectedIds.length === items.length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? items.map((item) => item.id) : []);
  };

  const clearSelection = () => setSelectedIds([]);

  return { selectedIds, allSelected, toggleSelect, toggleSelectAll, clearSelection };
}
