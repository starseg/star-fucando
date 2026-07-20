export class CompanyError extends Error {
  constructor(
    public readonly code: "invalid_cnpj" | "not_found" | "rate_limited" | "service_unavailable",
    message: string,
  ) {
    super(message);
    this.name = "CompanyError";
  }
}
