"use client";

import * as React from "react";
import { formatCurrency } from "@/lib/utils";

interface AttendanceReceiptProps {
  award: {
    id: string;
    referenceMonth: Date | string;
    bonusValue: number;
    employee: {
      name: string;
      department: string | null;
      role: string | null;
      admissionDate: Date | string | null;
    };
  };
}

export function AttendanceReceipt({ award }: AttendanceReceiptProps) {
  const bonusFormatted =
    award.bonusValue && award.bonusValue > 0
      ? formatCurrency(award.bonusValue)
      : "R$";

  return (
    <div className="receipt-page bg-white text-black border border-gray-300 shadow-md max-w-[210mm] mx-auto min-h-[145mm] p-10 sm:p-14 mb-8 print:mb-0 print:border-0 print:shadow-none print:p-8 flex flex-col justify-between">
      <div>
        <div className="pt-2 pb-8 text-left">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif uppercase tracking-tight text-black leading-tight">
            RECIBO DE PRÊMIO DE
            <br />
            ASSIDUIDADE
          </h1>
        </div>

        <div className="text-sm sm:text-base font-bold font-sans text-black mb-8">
          Colaborador(a): {award.employee?.name ? award.employee.name.toUpperCase() : ""}
        </div>

        <p className="text-sm sm:text-[15px] leading-[1.8] text-black font-sans text-justify mb-6">
          Recebi da empresa o valor de{" "}
          <strong className="font-bold">{bonusFormatted}</strong> referente ao{" "}
          <strong className="font-bold">Prêmio de Assiduidade</strong>, concedido de forma parcial em
          razão do não atendimento integral de um ou mais critérios estabelecidos pela empresa para o
          período avaliado.
        </p>

        <p className="text-sm sm:text-[15px] leading-[1.8] font-bold text-black font-sans text-justify mb-6">
          Reconhecemos seu empenho e dedicação durante o período. O valor parcial reflete o cumprimento
          parcial dos requisitos previstos na política de assiduidade vigente.
        </p>

        <p className="text-sm sm:text-[15px] text-black font-sans mb-10">
          Valor recebido: <strong className="font-bold">{bonusFormatted}</strong>
        </p>
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
