import { NextRequest } from "next/server";
import { saveProduct } from "@/lib/admin-product-writer";

export const runtime = "nodejs";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return saveProduct(request, id);
}
