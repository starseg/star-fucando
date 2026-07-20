"use client";

import Image from "next/image";
import { CompanyDetailsCard } from "@/presentation/company/components/company-details-card";
import { CnpjSearchForm } from "@/presentation/company/components/cnpj-search-form";
import { RequestFeedback } from "@/presentation/company/components/request-feedback";
import { useCompanySearch } from "@/presentation/company/hooks/use-company-search";

export function CompanySearchView() {
  const { input, loading, data, error, isValid, hasTyped, updateInput, search } = useCompanySearch();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-4 py-10">
      <header className="flex flex-col items-center justify-between gap-4 border-b border-yellow-500/20 pb-6 sm:flex-row sm:items-end">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Image src="/logo.svg" alt="Logo Star Fuçando" width={276} height={37} priority={true} />
          <p className="text-sm text-zinc-400">Consulta rápida de dados corporativos via CNPJ</p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
          Star Fuçando
        </p>
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
