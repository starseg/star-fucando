"use client";

import { useMemo, useState } from "react";
import { CompanyData } from "@/domain/company/entities/company-data";
import { formatCnpjInput, isValidCnpj, sanitizeCnpj } from "@/domain/company/value-objects/cnpj";

export function useCompanySearch() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CompanyData | null>(null);

  const isValid = useMemo(() => isValidCnpj(input), [input]);

  const updateInput = (value: string) => {
    setInput(formatCnpjInput(value));
    setError(null);
  };

  const search = async () => {
    if (!isValid || loading) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const cleanCnpj = sanitizeCnpj(input);
      const response = await fetch(`/api/company/${cleanCnpj}`, { cache: "no-store" });
      const payload = (await response.json()) as { data?: CompanyData; error?: string };
      if (!response.ok || !payload.data) throw new Error(payload.error ?? "Erro ao consultar CNPJ.");
      setData(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado ao consultar CNPJ.");
    } finally {
      setLoading(false);
    }
  };

  return { input, loading, data, error, isValid, hasTyped: input.length > 0, updateInput, search };
}
