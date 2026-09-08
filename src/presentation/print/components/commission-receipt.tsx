"use client";

import * as React from "react";
import {
  formatCurrency,
  formatDate,
  formatCommissionPeriod,
  formatReceiptDate,
  numberToCurrencyWords,
} from "@/lib/utils";
import { COMPANY_CONFIG } from "@/lib/constants/company";

interface CommissionReceiptProps {
  commission: {
    id: string;
    referenceMonth: Date | string;
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    commissionValue: number;
    employee: {
      name: string;
      department: string | null;
      role: string | null;
      admissionDate: Date | string | null;
    };
  };
}

export function CommissionReceipt({ commission }: CommissionReceiptProps) {
  let periodStart: string;
  let periodEnd: string;

  if (commission.startDate && commission.endDate) {
    periodStart = formatDate(commission.startDate);
    periodEnd = formatDate(commission.endDate);
  } else {
    const calculated = formatCommissionPeriod(commission.referenceMonth);
    periodStart = calculated.periodStart;
    periodEnd = calculated.periodEnd;
  }

  const valueFormatted = formatCurrency(commission.commissionValue);
  const valueWords = numberToCurrencyWords(commission.commissionValue);
  const dateFormatted = formatReceiptDate(commission.referenceMonth);

  return (
    <div className="receipt-page bg-white text-black border border-gray-300 shadow-md max-w-[210mm] mx-auto min-h-[145mm] p-10 sm:p-14 mb-8 print:mb-0 print:border-0 print:shadow-none print:p-8 flex flex-col justify-between">
      <div>
        <div className="pt-2 pb-8 text-left">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif uppercase tracking-tight text-black leading-tight">
            RECIBO DE COMISSÃO
          </h1>
        </div>

        <div className="text-sm sm:text-base font-bold font-sans text-black mb-8">
          Nome: {commission.employee?.name ? commission.employee.name.toUpperCase() : ""}
        </div>

        <p className="text-sm sm:text-[15px] leading-[1.8] text-black font-sans text-justify mb-10">
          Declaro, para os devidos fins, que recebi da empresa{" "}
          <strong className="font-bold">{COMPANY_CONFIG.corporateName}</strong>, a título de comissão
          referente ao período de <strong className="font-bold">{periodStart}</strong> a{" "}
          <strong className="font-bold">{periodEnd}</strong>, o valor de{" "}
          <strong className="font-bold">
            {valueFormatted} ({valueWords})
          </strong>
          .
        </p>

        <p className="text-sm sm:text-[15px] text-black font-sans mb-10">
          Por ser verdade, firmo o presente recibo.
        </p>

        <div className="text-center text-sm sm:text-[15px] text-black">
          <u>{dateFormatted}</u>
        </div>
      </div>

      <div className="pt-8 space-y-2">
        <div className="w-full border-b border-black" />
        <p className="text-sm sm:text-[15px] text-black font-sans py-1">
          Assinatura do(a) Colaborador(a)
        </p>
        <div className="w-full border-b border-black" />
      </div>
    </div>
  );
}
