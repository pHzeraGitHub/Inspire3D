import { NextRequest, NextResponse } from "next/server";
import { apiError, requireAdminApi, sameOrigin } from "@/lib/admin-api";
import { importAdminWorkbook, ImportValidationError } from "@/lib/admin-import";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origem inválida." }, { status: 403 });

  try {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json({ error: "Não consegui ler o envio. Selecione novamente o arquivo .xlsx." }, { status: 400 });
    }
    const workbook = form.get("workbook");
    if (!(workbook instanceof File)) return NextResponse.json({ error: "Selecione um arquivo .xlsx para importar." }, { status: 400 });
    return NextResponse.json(await importAdminWorkbook(workbook));
  } catch (error) {
    if (error instanceof ImportValidationError) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: 400 });
    }
    return apiError(error);
  }
}
