import * as React from "react";
import { Table, TableBody } from "@/components/ui/table";
import { PrintAccountingTableHeader } from "./print-accounting-table-header";
import { PrintAccountingTableRow } from "./print-accounting-table-row";
import type { PrintAccountingItem } from "../print-accounting-view";

interface PrintAccountingTableProps {
  tipo: string;
  data: PrintAccountingItem[];
  badgeColor: string;
}

export function PrintAccountingTable({ tipo, data, badgeColor }: PrintAccountingTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-800/90 bg-[#12100e]/80">
      <Table>
        <PrintAccountingTableHeader tipo={tipo} />
        <TableBody>
          {data.map((item) => (
            <PrintAccountingTableRow key={item.id} tipo={tipo} item={item} badgeColor={badgeColor} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
