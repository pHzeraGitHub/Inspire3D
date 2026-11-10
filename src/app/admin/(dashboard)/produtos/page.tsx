import { ProductManager } from "@/features/admin/ProductManager";
import { getAdminMaterials, getAdminProducts } from "@/lib/admin-data";
import { getReservedProductQuantities } from "@/lib/sales";

export const dynamic = "force-dynamic";

export default async function ProdutosAdminPage() {
  const [products, materials, reserved] = await Promise.all([
    getAdminProducts(), getAdminMaterials(), getReservedProductQuantities(),
  ]);
  return <ProductManager products={products} materials={materials} reserved={reserved} />;
}
