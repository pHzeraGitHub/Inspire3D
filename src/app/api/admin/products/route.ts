import { NextResponse } from "next/server";
import { apiError, requireAdminApi } from "@/lib/admin-api";
import { getAdminProducts } from "@/lib/admin-data";
import { saveProduct } from "@/lib/admin-product-writer";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireAdminApi();
  if (auth.response) return auth.response;
  try {
    return NextResponse.json(await getAdminProducts());
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Parameters<typeof saveProduct>[0]) {
  return saveProduct(request);
}
