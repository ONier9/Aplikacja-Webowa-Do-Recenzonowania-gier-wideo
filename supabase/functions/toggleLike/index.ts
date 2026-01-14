import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

Deno.serve(async (req) => {
  const { reviewId, userId, currentlyLiked } = await req.json()

  const action = currentlyLiked
    ? supabase.from("review_likes").delete().eq("review_id", reviewId).eq("user_id", userId)
    : supabase.from("review_likes").insert({ review_id: reviewId, user_id: userId })

  await action

  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } })
})
