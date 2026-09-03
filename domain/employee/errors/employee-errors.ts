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

export class InvalidEmployeePixError extends DomainError {
  constructor() {
    super("A chave PIX do colaborador é obrigatória.");
  }
}
