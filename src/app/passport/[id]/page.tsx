import { redirect } from "next/navigation";
import type { Route } from "next";

export default async function LegacyPassportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/app/passport/${id}` as Route);
}
