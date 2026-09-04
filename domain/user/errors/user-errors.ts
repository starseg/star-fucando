import { DomainError } from "@/domain/shared/errors/domain-error";

export class UnauthorizedAccessError extends DomainError {
  constructor() {
    super("Acesso não autorizado. Faça login novamente.");
  }
}

export class ForbiddenAdminAccessError extends DomainError {
  constructor() {
    super("Acesso restrito para administradores.");
  }
}

export class CannotRejectOwnAccountError extends DomainError {
  constructor() {
    super("Você não pode rejeitar seu próprio usuário.");
  }
}

export class CannotRevokeOwnAdminRoleError extends DomainError {
  constructor() {
    super("Você não pode revogar seus próprios privilégios de administrador.");
  }
}
