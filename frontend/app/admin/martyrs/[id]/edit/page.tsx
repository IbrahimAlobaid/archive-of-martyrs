import { AdminMartyrForm } from "@/components/admin/AdminMartyrForm";

type EditMartyrPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditMartyrPage({ params }: EditMartyrPageProps) {
  const { id } = await params;
  const martyrId = Number(id);
  return <AdminMartyrForm martyrId={martyrId} />;
}
