"use client";

import { CompanyDetailsCard } from "@/presentation/company/components/company-details-card";
import { CnpjSearchForm } from "@/presentation/company/components/cnpj-search-form";
import { RequestFeedback } from "@/presentation/company/components/request-feedback";
import { useCompanySearch } from "@/presentation/company/hooks/use-company-search";

export function CompanySearchView() {
  const { input, loading, data, error, isValid, hasTyped, updateInput, search } = useCompanySearch();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-5 px-4 py-10">
      <header className="space-y-1 text-center sm:text-left">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">Star Emergency Ecosystem</p>
        <h1 className="text-3xl font-semibold text-zinc-100">Star Fuçando</h1>
        <p className="text-sm text-zinc-400">Consulta rápida de dados corporativos via CNPJ.</p>
      </header>
      <CnpjSearchForm
        value={input}
        loading={loading}
        isValid={isValid}
        hasTyped={hasTyped}
        onChange={updateInput}
        onSubmit={search}
      />
      {error && <RequestFeedback message={error} />}
      {data && <CompanyDetailsCard data={data} />}
    </main>
  );
}
