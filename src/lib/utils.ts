import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { COMPANY_CONFIG } from "./constants/company";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "R$ 0,00";
  const num = typeof value === "string" ? parseFloat(value) : Number(value);
  if (isNaN(num)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatMonthYear(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(d);
}

const UNITS = [
  "", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove",
  "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"
];

const TENS = [
  "", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"
];

const HUNDREDS = [
  "", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"
];

function convertGroup(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";

  const c = Math.floor(n / 100);
  const remainder = n % 100;
  const parts: string[] = [];

  if (c > 0) {
    parts.push(HUNDREDS[c]);
  }

  if (remainder > 0) {
    if (remainder < 20) {
      parts.push(UNITS[remainder]);
    } else {
      const d = Math.floor(remainder / 10);
      const u = remainder % 10;
      parts.push(TENS[d]);
      if (u > 0) {
        parts.push(UNITS[u]);
      }
    }
  }

  return parts.join(" e ");
}

export function numberToWords(n: number): string {
  if (n === 0) return "zero";

  const thousands = Math.floor(n / 1000);
  const units = n % 1000;

  const parts: string[] = [];

  if (thousands > 0) {
    if (thousands === 1) {
      parts.push("mil");
    } else {
      parts.push(`${convertGroup(thousands)} mil`);
    }
  }

  if (units > 0) {
    parts.push(convertGroup(units));
  }

  return parts.join(" e ");
}

export function numberToCurrencyWords(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "string" ? parseFloat(value) : Number(value);
  if (isNaN(num)) return "";

  const rounded = Math.round(num * 100) / 100;
  const integerPart = Math.floor(rounded);
  const decimalPart = Math.round((rounded - integerPart) * 100);

  const parts: string[] = [];

  if (integerPart > 0) {
    const intWords = numberToWords(integerPart);
    const currencyName = integerPart === 1 ? "real" : "reais";
    parts.push(`${intWords} ${currencyName}`);
  } else if (decimalPart === 0) {
    return "Zero reais";
  }

  if (decimalPart > 0) {
    const decWords = numberToWords(decimalPart);
    const centavoName = decimalPart === 1 ? "centavo" : "centavos";
    parts.push(`${decWords} ${centavoName}`);
  }

  const result = parts.join(" e ");
  if (!result) return "";
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function getMonthAndYear(date: Date | string | null | undefined): { monthName: string; year: number } {
  if (!date) {
    const now = new Date();
    return {
      monthName: now.toLocaleDateString("pt-BR", { month: "long" }),
      year: now.getFullYear(),
    };
  }
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    const now = new Date();
    return {
      monthName: now.toLocaleDateString("pt-BR", { month: "long" }),
      year: now.getFullYear(),
    };
  }
  const monthName = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    month: "long",
  }).format(d);
  const year = d.getUTCFullYear();
  return { monthName, year };
}

export function formatCommissionPeriod(referenceMonth: Date | string | null | undefined): { periodStart: string; periodEnd: string } {
  const d = !referenceMonth ? new Date() : typeof referenceMonth === "string" ? new Date(referenceMonth) : referenceMonth;
  const safeDate = isNaN(d.getTime()) ? new Date() : d;
  const year = safeDate.getUTCFullYear();
  const month = safeDate.getUTCMonth();
  const periodStartDate = new Date(Date.UTC(year, month - 1, 21));
  const periodEndDate = new Date(Date.UTC(year, month, 20));
  return {
    periodStart: formatDate(periodStartDate),
    periodEnd: formatDate(periodEndDate),
  };
}

export function getCommissionDefaultPeriod(referenceMonth: Date | string | null | undefined): { startDate: string; endDate: string } {
  const d = !referenceMonth ? new Date() : typeof referenceMonth === "string" ? new Date(referenceMonth) : referenceMonth;
  const safeDate = isNaN(d.getTime()) ? new Date() : d;
  const year = safeDate.getUTCFullYear();
  const month = safeDate.getUTCMonth();
  const periodStartDate = new Date(Date.UTC(year, month - 1, 21));
  const periodEndDate = new Date(Date.UTC(year, month, 20));
  return {
    startDate: periodStartDate.toISOString().split("T")[0],
    endDate: periodEndDate.toISOString().split("T")[0],
  };
}

export function formatReceiptDate(referenceDate: Date | string | null | undefined, city: string = COMPANY_CONFIG.city): string {
  const { monthName, year } = getMonthAndYear(referenceDate);
  const d = typeof referenceDate === "string" ? new Date(referenceDate) : (referenceDate || new Date());
  const monthIndex = isNaN(d.getTime()) ? new Date().getMonth() : d.getUTCMonth();
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0).getDate();
  const todayDay = new Date().getDate();
  const day = Math.min(todayDay, lastDayOfMonth);
  return `${city}, ${day} de ${monthName} de ${year}.`;
}
