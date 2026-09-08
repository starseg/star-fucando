import { CompanyError } from "@/domain/company/errors/company-errors";

const CNPJ_LENGTH = 14;

export const sanitizeCnpj = (value: string) => value.replace(/\D/g, "");

export const formatCnpjInput = (value: string) => {
  const digits = sanitizeCnpj(value).slice(0, CNPJ_LENGTH);
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

const checkDigit = (base: number[], factors: number[]) => {
  const total = base.reduce((sum, value, index) => sum + value * factors[index], 0);
  const result = 11 - (total % 11);
  return result > 9 ? 0 : result;
};

export const isValidCnpj = (value: string) => {
  const digits = sanitizeCnpj(value);
  if (digits.length !== CNPJ_LENGTH || /^(\d)\1+$/.test(digits)) return false;

  const base = digits.split("").map(Number);
  const digit1 = checkDigit(base.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const digit2 = checkDigit(base.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return base[12] === digit1 && base[13] === digit2;
};

export const assertValidCnpj = (value: string) => {
  if (!isValidCnpj(value)) {
    throw new CompanyError("invalid_cnpj", "Informe um CNPJ válido.");
  }
  return sanitizeCnpj(value);
};
