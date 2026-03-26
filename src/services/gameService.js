import { state$ } from "./stateService.js";

const SUPABASE_URL = "https://ypfxbsnqfpdkwzrhmkoa.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZnhic25xZnBka3d6cmhta29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTc0MTgsImV4cCI6MjA3NjA5MzQxOH0.ZhyDd2DzaJTR_2lE7T361rwiubFLG7dV0QiJzu6Ie8w";

export async function saveGame() {
  const user = state$.value.user;
  if (!user) {
    return { success: false, error: new Error("No hay usuario logueado") };
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users?email=eq.${user.email}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
        max_score: user.max_score,
        game: user.game,
      }),
      }
    );

    if (!response.ok) {
      let errorMsg = "Error desconocido con Supabase";
      try {
        const errData = await response.json();
        errorMsg = errData.error_description || errData.msg || errorMsg;
      } catch {}
      console.error("Supabase error:", errorMsg);
      return { success: false, error: new Error(errorMsg) };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("Supabase fetch error:", err);
    return { success: false, error: new Error("Error de conexión con Supabase") };
  }
}