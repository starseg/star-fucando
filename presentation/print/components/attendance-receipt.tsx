"use client";

import * as React from "react";
import { formatCurrency, formatDate, formatMonthYear } from "@/lib/utils";
import { COMPANY_CONFIG } from "@/lib/constants/company";

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
  const currentDateFormatted = formatDate(new Date());

  return (
    <div className="receipt-page bg-white text-black p-8 font-sans text-xs border border-gray-300 shadow-sm max-w-[210mm] mx-auto min-h-[280mm] flex flex-col justify-between mb-8 print:mb-0 print:border-0 print:shadow-none print:p-6 print:min-h-0 print:h-screen">
      <div>
        {/* Header da Empresa */}
        <div className="border-b-2 border-black pb-3 mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-base font-black tracking-wide uppercase">{COMPANY_CONFIG.corporateName}</h1>
            <p className="text-[10px] text-gray-600">CNPJ: {COMPANY_CONFIG.cnpj} • {COMPANY_CONFIG.department}</p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-gray-100 border border-gray-300 px-3 py-1 text-[11px] font-bold uppercase rounded">
              Prêmio Assiduidade
            </span>
          </div>
        </div>

        {/* Título do Recibo */}
        <div className="text-center bg-gray-100 border border-gray-300 py-2 px-4 rounded mb-4">
          <h2 className="text-sm font-bold tracking-tight uppercase">
            RECIBO DE PAGAMENTO - PRÊMIO DE ASSIDUIDADE
          </h2>
          <p className="text-[11px] text-gray-700 font-medium">
            Competência: <span className="font-bold">{formatMonthYear(award.referenceMonth)}</span>
          </p>
        </div>

        {/* Dados do Colaborador */}
        <div className="border border-gray-300 rounded p-3 mb-4 space-y-1.5 bg-gray-50/50">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-500 font-semibold uppercase text-[10px]">Colaborador:</span>
              <p className="font-bold text-xs text-gray-900">{award.employee.name}</p>
            </div>
            <div>
              <span className="text-gray-500 font-semibold uppercase text-[10px]">Departamento:</span>
              <p className="font-medium text-xs text-gray-800">{award.employee.department || "Operacional"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200">
            <div>
              <span className="text-gray-500 font-semibold uppercase text-[10px]">Cargo / Função:</span>
              <p className="font-medium text-xs text-gray-800">{award.employee.role || "-"}</p>
            </div>
            <div>
              <span className="text-gray-500 font-semibold uppercase text-[10px]">Data de Admissão:</span>
              <p className="font-medium text-xs text-gray-800">{formatDate(award.employee.admissionDate)}</p>
            </div>
          </div>
        </div>

        {/* Detalhamento da Premiação */}
        <div className="mb-4">
          <h3 className="font-bold text-[11px] uppercase tracking-wider mb-1.5 text-gray-800">
            Discriminação da Bonificação
          </h3>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 text-left">
                <th className="border-r border-gray-300 p-2 font-bold">Descrição do Evento</th>
                <th className="border-r border-gray-300 p-2 font-bold text-center w-36">Competência</th>
                <th className="p-2 font-bold text-right w-36">Valor do Prêmio</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="border-r border-gray-300 p-3 font-medium">
                  Bonificação por Assiduidade e Pontualidade Integral (CLT / Regulamento Interno)
                </td>
                <td className="border-r border-gray-300 p-3 text-center text-xs">
                  {formatMonthYear(award.referenceMonth)}
                </td>
                <td className="p-3 text-right font-black text-sm text-gray-900">
                  {formatCurrency(award.bonusValue)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold border-t-2 border-gray-300">
                <td colSpan={2} className="border-r border-gray-300 p-2.5 text-right uppercase text-sm">
                  Total a Receber:
                </td>
                <td className="p-2.5 text-right font-black text-base text-gray-900">
                  {formatCurrency(award.bonusValue)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Termo de Declaração */}
        <div className="border-t border-b border-gray-300 py-3 mb-6 text-[10.5px] leading-relaxed text-gray-700">
          <p>
            Recebi da empresa <strong>{COMPANY_CONFIG.corporateName}</strong> a importância líquida acima discriminada
            a título de <strong>Prêmio de Assiduidade</strong> relativo à competência indicada, em reconhecimento ao
            cumprimento integral e pontual da jornada de trabalho estabelecida, outorgando plena, rasa e geral quitação.
          </p>
        </div>
      </div>

      {/* Assinaturas */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-end mb-8">
          <p className="text-[11px] text-gray-600">
            Local e Data: _______________________, {currentDateFormatted}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-12 text-center pt-6">
          <div>
            <div className="border-t border-black pt-1.5">
              <p className="font-bold text-xs">{award.employee.name}</p>
              <p className="text-[10px] text-gray-600">Assinatura do Colaborador</p>
            </div>
          </div>
          <div>
            <div className="border-t border-black pt-1.5">
              <p className="font-bold text-xs">{COMPANY_CONFIG.corporateName}</p>
              <p className="text-[10px] text-gray-600">{COMPANY_CONFIG.department}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
