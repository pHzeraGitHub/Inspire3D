import { SalesManager } from "@/features/admin/SalesManager";
import { getAdminProducts } from "@/lib/admin-data";
import { getAdminSales, getFinishedStockMovements, getReservedProductQuantities } from "@/lib/sales";

export const dynamic = "force-dynamic";

export default async function VendasPage() {
  const [sales, products, reserved, stockMovements] = await Promise.all([
    getAdminSales(), getAdminProducts(), getReservedProductQuantities(), getFinishedStockMovements(),
  ]);
  const productOptions = products.map(({ id, name, price, finishedStock }) => ({ id, name, price, finishedStock }));
  return <SalesManager sales={sales} products={productOptions} reserved={reserved} stockMovements={stockMovements} />;
}
