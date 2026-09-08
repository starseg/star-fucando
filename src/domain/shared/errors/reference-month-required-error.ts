import { DomainError } from "@/domain/shared/errors/domain-error";

export class ReferenceMonthRequiredError extends DomainError {
  constructor() {
    super("Mês de referência é obrigatório.");
  }
}
