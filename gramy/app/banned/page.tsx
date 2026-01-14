
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Ban, Mail } from "lucide-react";

export default async function BannedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("banned, username")
    .eq("id", user.id)
    .single();

  if (!profile?.banned) {
    redirect("/");
  }

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-900 border border-red-900/50 rounded-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
            <Ban className="w-8 h-8 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            Account Suspended
          </h1>

          <p className="text-gray-400 mb-6">
            Your account (<span className="text-white">{profile.username}</span>
            ) has been suspended by an administrator.
          </p>

          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3 text-left">
              <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-300 mb-1">
                  If you believe this is a mistake, please contact support.
                </p>
                <p className="text-xs text-gray-500">
                  You will not be able to access your account until the ban is
                  lifted.
                </p>
              </div>
            </div>
          </div>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}