"use client";

import * as React from "react";
import { formatCurrency, formatDate, formatMonthYear } from "@/lib/utils";
import { COMPANY_CONFIG } from "@/lib/constants/company";

interface MealReceiptProps {
  voucher: {
    id: string;
    referenceMonth: Date | string;
    unitValue: number;
    workedDays: number;
    voucherCount: number;
    totalValue: number;
    discounts: number;
    netValue: number;
    employee: {
      name: string;
      department: string | null;
      role: string | null;
      admissionDate: Date | string | null;
    };
  };
}

export function MealReceipt({ voucher }: MealReceiptProps) {
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
              Vale Alimentação
            </span>
          </div>
        </div>

        {/* Título do Recibo */}
        <div className="text-center bg-gray-100 border border-gray-300 py-2 px-4 rounded mb-4">
          <h2 className="text-sm font-bold tracking-tight uppercase">
            RECIBO DE BENEFÍCIO - VALE ALIMENTAÇÃO / REFEIÇÃO
          </h2>
          <p className="text-[11px] text-gray-700 font-medium">
            Competência: <span className="font-bold">{formatMonthYear(voucher.referenceMonth)}</span>
          </p>
        </div>

        {/* Dados do Colaborador */}
        <div className="border border-gray-300 rounded p-3 mb-4 space-y-1.5 bg-gray-50/50">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-500 font-semibold uppercase text-[10px]">Colaborador:</span>
              <p className="font-bold text-xs text-gray-900">{voucher.employee.name}</p>
            </div>
            <div>
              <span className="text-gray-500 font-semibold uppercase text-[10px]">Departamento:</span>
              <p className="font-medium text-xs text-gray-800">{voucher.employee.department || "Operacional"}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-200">
            <div>
              <span className="text-gray-500 font-semibold uppercase text-[10px]">Cargo:</span>
              <p className="font-medium text-xs text-gray-800">{voucher.employee.role || "-"}</p>
            </div>
            <div>
              <span className="text-gray-500 font-semibold uppercase text-[10px]">Data de Admissão:</span>
              <p className="font-medium text-xs text-gray-800">{formatDate(voucher.employee.admissionDate)}</p>
            </div>
            <div>
              <span className="text-gray-500 font-semibold uppercase text-[10px]">Dias Trabalhados:</span>
              <p className="font-medium text-xs text-gray-800">{voucher.workedDays} dias</p>
            </div>
          </div>
        </div>

        {/* Detalhamento dos Valores */}
        <div className="mb-4">
          <h3 className="font-bold text-[11px] uppercase tracking-wider mb-1.5 text-gray-800">
            Detalhamento do Benefício
          </h3>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 text-left">
                <th className="border-r border-gray-300 p-2 font-bold">Descrição do Item</th>
                <th className="border-r border-gray-300 p-2 font-bold text-center w-28">Valor Diário</th>
                <th className="border-r border-gray-300 p-2 font-bold text-center w-24">Qtd. Diárias</th>
                <th className="p-2 font-bold text-right w-32">Total Bruto</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="border-r border-gray-300 p-2 font-medium">
                  Vale Alimentação / Refeição Mensal
                </td>
                <td className="border-r border-gray-300 p-2 text-center">
                  {formatCurrency(voucher.unitValue)}
                </td>
                <td className="border-r border-gray-300 p-2 text-center font-bold">
                  {voucher.voucherCount}
                </td>
                <td className="p-2 text-right font-medium">
                  {formatCurrency(voucher.totalValue)}
                </td>
              </tr>
              {voucher.discounts > 0 && (
                <tr className="border-b border-gray-200 text-red-700 bg-red-50/40">
                  <td colSpan={3} className="border-r border-gray-300 p-2 text-right font-medium">
                    Desconto de Coparticipação em Folha:
                  </td>
                  <td className="p-2 text-right font-bold">
                    -{formatCurrency(voucher.discounts)}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold border-t-2 border-gray-300">
                <td colSpan={3} className="border-r border-gray-300 p-2 text-right uppercase text-sm">
                  Valor Líquido Creditado / Recebido:
                </td>
                <td className="p-2 text-right font-black text-base text-gray-900">
                  {formatCurrency(voucher.netValue)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Termo de Quitação e Declaração */}
        <div className="border-t border-b border-gray-300 py-3 mb-6 text-[10.5px] leading-relaxed text-gray-700">
          <p>
            Declaro ter recebido da empresa <strong>{COMPANY_CONFIG.corporateName}</strong> o crédito/valor referente ao
            Vale Alimentação/Refeição do mês de competência acima mencionado, para custeio de minhas despesas de
            alimentação durante a jornada de trabalho, outorgando plena quitação dos respectivos valores.
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
              <p className="font-bold text-xs">{voucher.employee.name}</p>
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
