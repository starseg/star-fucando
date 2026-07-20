import { NextResponse } from "next/server";
import { getCompanyByCnpj } from "@/application/company/get-company-by-cnpj";
import { CompanyError } from "@/domain/company/errors/company-errors";

const statusByCode = {
  invalid_cnpj: 400,
  not_found: 404,
  rate_limited: 429,
  service_unavailable: 503,
};

export async function GET(_: Request, context: { params: Promise<{ cnpj: string }> }) {
  try {
    const { cnpj } = await context.params;
    const data = await getCompanyByCnpj(cnpj);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof CompanyError) {
      return NextResponse.json({ error: error.message }, { status: statusByCode[error.code] });
    }
    return NextResponse.json({ error: "Falha inesperada ao processar a consulta." }, { status: 500 });
  }
}
