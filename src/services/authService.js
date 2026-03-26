import { setState } from "./stateService.js";
import { fetchUser, getAvatar } from "./userService.js";

const SUPABASE_URL = "https://ypfxbsnqfpdkwzrhmkoa.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZnhic25xZnBka3d6cmhta29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTc0MTgsImV4cCI6MjA3NjA5MzQxOH0.ZhyDd2DzaJTR_2lE7T361rwiubFLG7dV0QiJzu6Ie8w";

async function fetchSupabase(endpoint, body) {
  try {
    const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        data.error_description || data.msg || "Error desconocido con Supabase";

      console.error("Supabase error:", message);

      return { data: null, error: new Error(message) };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Supabase fetch error:", err);
    return { data: null, error: new Error("Error de conexión con Supabase") };
  }
}

export async function login(email, password) {
  const { data, error } = await fetchSupabase(
    "/auth/v1/token?grant_type=password",
    { email, password }
  );

  if (error) return { error: error.message };

  const token = data.access_token;
  if (!token) return { error: "Email o contraseña incorrectos" };

  await ensureUserExists(email, token);
  console.log(token);
  

  const { success, data: user } = await fetchUser(email, token);
  if (!success) return { error: "No se pudo obtener información del usuario" };

  setState({
    user: {
      email: user.email,
      token,
      nickname: user.nickname,
      avatar_url: user.avatar_url,
      max_score: user.max_score,
      game: user.game,
    },
    route: "game",
  });

  localStorage.setItem(
    "user",
    JSON.stringify({
      email: user.email,
      token,
    })
  );

  return { success: true };
}

export async function register(email, password) {
  const { data, error } = await fetchSupabase("/auth/v1/signup", {
    email,
    password,
  });

  if (error) return { error: error.message };

  return {
    success: true,
    message: "Registro exitoso. Revisa tu email para confirmar la cuenta.",
  };
}

export async function ensureUserExists(email, token, nickname = "Player") {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Prefer: "resolution=ignore-duplicates",
      },
      body: JSON.stringify({
        email,
        nickname,
        max_score: 0,
        game: null,
      }),
    });
    console.log(`Usuario asegurado en Supabase: ${email}`);
  } catch (err) {
    console.error("Error asegurando usuario:", err);
  }
}

export async function restoreSession() {
  const saved = localStorage.getItem("user");
  if (!saved) return { restored: false };
  console.log("saved", saved);

  const { email, token } = JSON.parse(saved);

  const { success, data: user } = await fetchUser(email, token);

  if (!success) {
    localStorage.removeItem("user");
    return { restored: false };
  }

  setState({
    user: {
      email: user.email,
      token,
      nickname: user.nickname,
      avatar_url: user.avatar_url,
      max_score: user.max_score,
      game: user.game,
    },
    route: "game",
  });

  return { restored: true };
}

export function logout() {
  localStorage.removeItem("user");

  setState({
    user: null,
    route: "login",
  });
}
