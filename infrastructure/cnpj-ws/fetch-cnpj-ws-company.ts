import { CompanyError } from "@/domain/company/errors/company-errors";

export const fetchCnpjWsCompany = async (cnpj: string) => {
  const response = await fetch(`https://publica.cnpj.ws/cnpj/${cnpj}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (response.status === 404) {
    throw new CompanyError("not_found", "CNPJ não encontrado na base pública.");
  }

  if (response.status === 429) {
    throw new CompanyError("rate_limited", "Limite de consultas excedido. Tente novamente.");
  }

  if (!response.ok) {
    throw new CompanyError("service_unavailable", "Serviço externo indisponível no momento.");
  }

  return response.json();
};
