import { CompanyData } from "@/domain/company/entities/company-data";
import { formatDisplayCnpj } from "@/presentation/company/utils/format-cnpj";

interface CompanyDetailsCardProps {
  data: CompanyData;
}

const rowStyle = "grid gap-1 border-t border-zinc-800 py-3 sm:grid-cols-[180px_1fr]";

export function CompanyDetailsCard({ data }: CompanyDetailsCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
      <h2 className="text-base font-semibold text-zinc-100">Resultado da consulta</h2>
      <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
        <p className="text-xs uppercase tracking-wide text-cyan-300">Inscrição Estadual (IE)</p>
        <p className="mt-1 text-xl font-semibold text-cyan-100">{data.inscricaoEstadual}</p>
      </div>
      <dl className="mt-4 text-sm text-zinc-200">
        <div className={rowStyle}>
          <dt className="text-zinc-400">CNPJ</dt>
          <dd>{formatDisplayCnpj(data.cnpj)}</dd>
        </div>
        <div className={rowStyle}>
          <dt className="text-zinc-400">Razão Social</dt>
          <dd>{data.razaoSocial}</dd>
        </div>
        <div className={rowStyle}>
          <dt className="text-zinc-400">Nome Fantasia</dt>
          <dd>{data.nomeFantasia}</dd>
        </div>
        <div className={rowStyle}>
          <dt className="text-zinc-400">CNAE Principal</dt>
          <dd>{data.cnaePrincipal}</dd>
        </div>
        <div className={rowStyle}>
          <dt className="text-zinc-400">Situação Cadastral</dt>
          <dd>{data.situacaoCadastral}</dd>
        </div>
        <div className={rowStyle}>
          <dt className="text-zinc-400">Endereço</dt>
          <dd>{data.endereco}</dd>
        </div>
      </dl>
    </section>
  );
}
