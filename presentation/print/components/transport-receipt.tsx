"use client";

import * as React from "react";
import { formatCurrency, formatDate, formatMonthYear } from "@/lib/utils";
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
              Vale Transporte
            </span>
          </div>
        </div>

        {/* Título do Recibo */}
        <div className="text-center bg-gray-100 border border-gray-300 py-2 px-4 rounded mb-4">
          <h2 className="text-sm font-bold tracking-tight uppercase">
            RECIBO DE ENTREGA DE VALE TRANSPORTE
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
              <span className="text-gray-500 font-semibold uppercase text-[10px]">Dias Previstos:</span>
              <p className="font-medium text-xs text-gray-800">{voucher.workingDays} dias úteis</p>
            </div>
          </div>
        </div>

        {/* Detalhamento dos Modais de Transporte */}
        <div className="mb-4">
          <h3 className="font-bold text-[11px] uppercase tracking-wider mb-1.5 text-gray-800">
            Detalhamento dos Modais e Tarifas
          </h3>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 text-left">
                <th className="border-r border-gray-300 p-2 font-bold">Modal / Linha / Itinerário</th>
                <th className="border-r border-gray-300 p-2 font-bold text-center w-24">Tarifa Unitária</th>
                <th className="border-r border-gray-300 p-2 font-bold text-center w-20">Qtd. Vales</th>
                <th className="p-2 font-bold text-right w-28">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {voucher.modals.map((modal, idx) => (
                <tr key={modal.id || idx} className="border-b border-gray-200">
                  <td className="border-r border-gray-300 p-2 font-medium">{modal.name}</td>
                  <td className="border-r border-gray-300 p-2 text-center">{formatCurrency(modal.unitValue)}</td>
                  <td className="border-r border-gray-300 p-2 text-center font-bold">{modal.quantity}</td>
                  <td className="p-2 text-right font-medium">{formatCurrency(modal.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold border-t-2 border-gray-300">
                <td colSpan={2} className="border-r border-gray-300 p-2 text-right uppercase">
                  Total Geral:
                </td>
                <td className="border-r border-gray-300 p-2 text-center font-black">
                  {voucher.totalVouchers}
                </td>
                <td className="p-2 text-right font-black text-sm">
                  {formatCurrency(voucher.totalValue)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Informações Complementares */}
        <div className="grid grid-cols-2 gap-3 border border-gray-300 rounded p-3 mb-4 bg-gray-50/30 text-[11px]">
          <div>
            <p><span className="font-semibold">Tarifa Ida:</span> {formatCurrency(voucher.inboundValue)} | <span className="font-semibold">Tarifa Volta:</span> {formatCurrency(voucher.outboundValue)}</p>
            {voucher.discountPercentage && (
              <p><span className="font-semibold">Desconto Legal Aplicado em Folha:</span> {voucher.discountPercentage}%</p>
            )}
            {voucher.nightJokerIndicator && (
              <p className="text-amber-800 font-semibold">• Colaborador em escala com adicional noturno/plantão.</p>
            )}
          </div>
          <div>
            {voucher.observations && (
              <p><span className="font-semibold">Observações:</span> {voucher.observations}</p>
            )}
          </div>
        </div>

        {/* Termo de Declaração */}
        <div className="border-t border-b border-gray-300 py-3 mb-6 text-[10.5px] leading-relaxed text-gray-700">
          <p>
            Declaro ter recebido da empresa <strong>{COMPANY_CONFIG.corporateName}</strong> a quantidade de vales-transporte
            acima discriminada, destinada exclusivamente para o meu deslocamento residência-trabalho e vice-versa, nos
            termos da Lei nº 7.418/85 e Decreto nº 95.247/87, ciente de que o uso indevido constitui falta grave.
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
