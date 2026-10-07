import { notFound } from "next/navigation";
import { ENTITIES } from "@/lib/admin-config";
import EntityManager from "@/components/admin/entity-manager";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return Object.keys(ENTITIES).map((entity) => ({ entity }));
}

export default async function AdminEntityPage({
  params,
}: {
  params: Promise<{ entity: string }>;
}) {
  const { entity } = await params;
  const config = ENTITIES[entity];
  if (!config) notFound();

  return <EntityManager slug={entity} config={config} />;
}
