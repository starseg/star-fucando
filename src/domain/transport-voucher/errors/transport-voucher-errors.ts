import { DomainError } from "@/domain/shared/errors/domain-error";

export class DuplicateTransportVoucherError extends DomainError {
  constructor() {
    super("Já existe um lançamento de Vale Transporte para este colaborador neste mês.");
  }
}
