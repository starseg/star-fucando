import { DomainError } from "@/domain/shared/errors/domain-error";

export class ReferenceMonthConflictError extends DomainError {
  constructor() {
    super("O mês de origem não pode ser igual ao mês de destino.");
  }
}
