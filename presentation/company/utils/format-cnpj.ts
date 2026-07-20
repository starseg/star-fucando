import { formatCnpjInput } from "@/domain/company/value-objects/cnpj";

export const formatDisplayCnpj = (value: string) => formatCnpjInput(value);
