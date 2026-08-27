"use client";

import * as React from "react";
import { formatCurrency, formatReceiptDate, getMonthAndYear, numberToCurrencyWords } from "@/lib/utils";
import { COMPANY_CONFIG } from "@/lib/constants/company";

interface MealReceiptProps {
  voucher: {
    id: string;
    referenceMonth: Date | string;
    unitValue: number;
    workedDays: number;
    voucherCount: number;
    totalValue: number;
    discounts?: number | null;
    netValue?: number;
    employee: {
      name: string;
      department?: string | null;
      role?: string | null;
      admissionDate?: Date | string | null;
      pis?: string | null;
    };
  };
}

export function MealReceipt({ voucher }: MealReceiptProps) {
  const { monthName, year } = getMonthAndYear(voucher.referenceMonth);
  const unitValueStr = formatCurrency(voucher.unitValue);
  const unitValueWords = numberToCurrencyWords(voucher.unitValue);
  const totalValueStr = formatCurrency(voucher.totalValue);
  const totalValueWords = numberToCurrencyWords(voucher.totalValue);
  const dateFormatted = formatReceiptDate(voucher.referenceMonth);
  const employeeNameUpper = voucher.employee?.name ? voucher.employee.name.toUpperCase() : "";
  const rawPis = (voucher.employee as { pis?: string | null })?.pis || "163.20933.97-7";
  const pisFormatted = rawPis.endsWith(".") ? rawPis : `${rawPis}.`;

  return (
    <div className="receipt-page bg-white text-black font-sans border border-gray-300 shadow-md max-w-[210mm] mx-auto min-h-[145mm] p-10 sm:p-14 mb-8 print:mb-0 print:border-0 print:shadow-none print:p-8 flex flex-col justify-between">
      <div>
        {/* Título do Recibo */}
        <div className="text-center pt-2 pb-10">
          <h1 className="text-base sm:text-lg font-bold uppercase tracking-wide text-black">
            RECIBO DE VALE ALIMENTAÇÃO
          </h1>
        </div>

        {/* Texto do Recibo */}
        <p className="text-sm sm:text-[15px] leading-[2.2] text-black text-justify mb-8">
          Declaro ter recebido da empresa{" "}
          <strong className="font-bold">{COMPANY_CONFIG.corporateName}</strong>, inscrição{" "}
          {COMPANY_CONFIG.cnpj}, a quantidade de{" "}
          <u>{voucher.voucherCount} Vales Alimentação</u>, com o valor unitário de{" "}
          <u>
            {unitValueStr} ({unitValueWords})
          </u>
          , totalizando{" "}
          <u>
            {totalValueStr} ({totalValueWords})
          </u>
          , no mês de {monthName} de {year}.
        </p>

        {/* Data */}
        <p className="text-sm sm:text-[15px] text-black">
          {dateFormatted}
        </p>
      </div>

      {/* Assinatura e Dados do Colaborador */}
      <div className="pt-20">
        <div className="w-80 max-w-full border-b border-black mb-3" />
        <p className="text-sm sm:text-[15px] text-black">
          Colaborador: <strong className="font-bold">{employeeNameUpper}.</strong>
        </p>
        <p className="text-sm sm:text-[15px] text-black mt-1">
          PIS: <strong className="font-bold">{pisFormatted}</strong>
        </p>
      </div>
    </div>
  );
}
