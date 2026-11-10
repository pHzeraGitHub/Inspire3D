import { MaterialManager } from "@/features/admin/MaterialManager";
import { getAdminMaterials } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function MateriaisPage() {
  const materials = await getAdminMaterials();
  return <MaterialManager materials={materials} />;
}
