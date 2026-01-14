import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

Deno.serve(async (req) => {
  const { gameId, userId, rating, reviewText, existingReviewId } = await req.json()

  if (existingReviewId) {
    await supabase
      .from("reviews")
      .update({
        rating,
        review_text: reviewText,
        updated_at: new Date().toISOString(),
        updated: true,
      })
      .eq("id", existingReviewId)
      .eq("user_id", userId)
  } else {
    await supabase.from("reviews").insert({
      game_id: gameId,
      user_id: userId,
      rating,
      review_text: reviewText,
    })
  }

  return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } })
})
