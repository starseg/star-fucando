import { DomainError } from "@/domain/shared/errors/domain-error";

export class EmployeeRequiredError extends DomainError {
  constructor() {
    super("Colaborador é obrigatório.");
  }
}
