"use client";

import * as React from "react";
import { formatCurrency, formatReceiptDate, getMonthAndYear, numberToCurrencyWords } from "@/lib/utils";
import { COMPANY_CONFIG } from "@/lib/constants/company";

interface TransportReceiptProps {
  voucher: {
    id: string;
    referenceMonth: Date | string;
    inboundValue: number;
    outboundValue: number;
    weekendHolidayValue: number | null;
    workingDays: number;
    weekendHolidayDays: number;
    nightJokerIndicator: boolean;
    totalVouchers: number;
    totalValue: number;
    discountPercentage: number | null;
    observations: string | null;
    employee: {
      name: string;
      department: string | null;
      role: string | null;
      admissionDate: Date | string | null;
    };
    modals: {
      id: string;
      name: string;
      unitValue: number;
      quantity: number;
      subtotal: number;
    }[];
  };
}

export function TransportReceipt({ voucher }: TransportReceiptProps) {
  const { monthName, year } = getMonthAndYear(voucher.referenceMonth);
  const totalValueStr = formatCurrency(voucher.totalValue);
  const totalValueWords = numberToCurrencyWords(voucher.totalValue);
  const discount = voucher.discountPercentage ?? 6;
  const dateFormatted = formatReceiptDate(voucher.referenceMonth);

  return (
    <div className="receipt-page bg-white text-black font-sans border border-gray-300 shadow-md max-w-[210mm] mx-auto min-h-[145mm] p-10 sm:p-14 mb-8 print:mb-0 print:border-0 print:shadow-none print:p-8 flex flex-col justify-between">
      <div>
        {/* Título do Recibo */}
        <div className="text-center pt-2 pb-10">
          <h1 className="text-base sm:text-lg font-bold uppercase tracking-wide text-black">
            RECIBO DE VALE TRANSPORTE
          </h1>
        </div>

        {/* Textos de Declaração e Autorização */}
        <div className="text-sm sm:text-[15px] leading-[2.2] text-black text-justify space-y-4 mb-8">
          <p>
            Declaro ter recebido da empresa{" "}
            <strong className="font-bold">{COMPANY_CONFIG.corporateName}</strong>, inscrição{" "}
            {COMPANY_CONFIG.cnpj}, a quantidade de {voucher.totalVouchers} Vales Transporte, totalizando{" "}
            <u>
              {totalValueStr} ({totalValueWords})
            </u>
            , no mês de {monthName} de {year}.
          </p>

          <p>
            Autorizo o desconto no valor de{" "}
            <strong className="font-bold">
              <u>{discount}%</u>
            </strong>{" "}
            conforme previsto em legislação, na folha mensal do mês {monthName} de {year}.
          </p>
        </div>

        {/* Tabela de Modais em Caixa delimitada */}
        <div className="border border-black p-4 text-xs sm:text-sm font-sans mb-8">
          <div className="space-y-2">
            {voucher.modals && voucher.modals.length > 0 ? (
              voucher.modals.map((modal, idx) => (
                <div key={modal.id || idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3 uppercase font-medium">
                    {modal.name.split(" ")[0].toUpperCase()}
                  </div>
                  <div className="col-span-4 uppercase text-stone-800">
                    {modal.name.toUpperCase()}
                  </div>
                  <div className="col-span-2 text-right font-medium">
                    {modal.quantity} VALES
                  </div>
                  <div className="col-span-3 text-right font-medium">
                    {formatCurrency(modal.subtotal)}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-7 uppercase font-medium">VALE TRANSPORTE MENSAL</div>
                <div className="col-span-2 text-right font-medium">{voucher.totalVouchers} VALES</div>
                <div className="col-span-3 text-right font-medium">{totalValueStr}</div>
              </div>
            )}
          </div>

          <div className="text-right pt-4 mt-2">
            <strong className="font-bold text-sm">
              <u>TOTAL: {totalValueStr}.</u>
            </strong>
          </div>
        </div>

        {/* Data Centralizada e Sublinhada */}
        <div className="text-center text-sm sm:text-[15px] text-black pt-4">
          <u>{dateFormatted}</u>
        </div>
      </div>
    </div>
  );
}
