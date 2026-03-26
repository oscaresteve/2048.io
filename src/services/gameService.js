import { state$ } from "./stateService.js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function saveGame() {
  const user = state$.value.user;
  if (!user) {
    return { success: false, error: new Error("No hay usuario logueado") };
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${user.email}`, {
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
    });

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
