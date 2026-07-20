import { CompanyData } from "@/domain/company/entities/company-data";
import { assertValidCnpj } from "@/domain/company/value-objects/cnpj";
import { fetchCnpjWsCompany } from "@/infrastructure/cnpj-ws/fetch-cnpj-ws-company";

const text = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value : fallback;

const resolveInscricaoEstadual = (inscricoes: unknown) => {
  if (!Array.isArray(inscricoes) || inscricoes.length === 0) return "Não informada";
  const first = inscricoes[0] as { inscricao_estadual?: string };
  return text(first?.inscricao_estadual, "Não informada");
};

const resolveAddress = (est: Record<string, unknown>) => {
  const city = (est.cidade as { nome?: string } | undefined)?.nome;
  const state = (est.estado as { sigla?: string } | undefined)?.sigla;
  const parts = [est.logradouro, est.numero, est.bairro, city, state]
    .filter((part) => typeof part === "string" && part.trim())
    .join(", ");
  return text(parts, "Endereço não informado");
};

export const getCompanyByCnpj = async (cnpj: string): Promise<CompanyData> => {
  const normalized = assertValidCnpj(cnpj);
  const payload = await fetchCnpjWsCompany(normalized);
  const est = ((payload as { estabelecimento?: Record<string, unknown> }).estabelecimento ?? {}) as Record<
    string,
    unknown
  >;

  return {
    cnpj: normalized,
    inscricaoEstadual: resolveInscricaoEstadual(est.inscricoes_estaduais),
    razaoSocial: text((payload as { razao_social?: unknown }).razao_social, "Não informada"),
    nomeFantasia: text(est.nome_fantasia, "Não informado"),
    cnaePrincipal: text((est.atividade_principal as { descricao?: string })?.descricao, "Não informado"),
    situacaoCadastral: text(est.situacao_cadastral, "Não informada"),
    endereco: resolveAddress(est),
  };
};
