import { NextResponse } from "next/server";
import { getCompanyByCnpj } from "@/use-cases/company/get-company-by-cnpj";
import { CompanyError } from "@/domain/company/errors/company-errors";
import { auth } from "@/auth";

const statusByCode = {
  invalid_cnpj: 400,
  not_found: 404,
  rate_limited: 429,
  service_unavailable: 503,
};

export async function GET(_: Request, context: { params: Promise<{ cnpj: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.status !== "APPROVED") {
    return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
  }

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
