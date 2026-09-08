import { DomainError } from "@/domain/shared/errors/domain-error";

export class EmployeeNotFoundError extends DomainError {
  constructor() {
    super("Colaborador não encontrado.");
  }
}

export class InvalidEmployeeNameError extends DomainError {
  constructor() {
    super("O nome do colaborador é obrigatório.");
  }
}

