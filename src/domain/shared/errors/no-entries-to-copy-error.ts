import { DomainError } from "@/domain/shared/errors/domain-error";

export class NoEntriesToCopyError extends DomainError {
  constructor() {
    super("Nenhum lançamento encontrado no mês de origem para copiar.");
  }
}
