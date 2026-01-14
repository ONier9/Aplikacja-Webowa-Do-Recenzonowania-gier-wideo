
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, banned")
    .eq("id", user.id)
    .single();

  if (profile?.banned) {
    redirect("/");
  }

  if (profile?.role !== "admin") {
    redirect("/");
  }

  const params = await searchParams;

  return <AdminDashboard searchParams={params} />;
}