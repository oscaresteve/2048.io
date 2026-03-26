const SUPABASE_URL = import.meta.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY;

export async function fetchGlobalRanking(limit = 100) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users?select=email,nickname,max_score&order=max_score.desc&limit=${limit}`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      },
    );

    if (!response.ok) {
      let errorMsg = "Error desconocido con Supabase";
      try {
        const errData = await response.json();
        errorMsg = errData.error_description || errData.msg || errorMsg;
      } catch {}
      console.error("Supabase error:", errorMsg);
      return { success: false, data: [], error: new Error(errorMsg) };
    }

    const data = await response.json();
    return { success: true, data, error: null };
  } catch (err) {
    console.error("Supabase fetch error:", err);
    return { success: false, data: [], error: new Error("Error de conexión con Supabase") };
  }
}
