import { DomainError } from "@/domain/shared/errors/domain-error";

export class DuplicateCommissionError extends DomainError {
  constructor() {
    super("Já existe uma comissão lançada para este técnico neste mês.");
  }
}
