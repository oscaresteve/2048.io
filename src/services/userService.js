const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function fetchUser(email, token) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${email}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMsg = "Error desconocido con Supabase";
      try {
        const errData = await response.json();
        errorMsg = errData.error_description || errData.msg || errorMsg;
      } catch {}
      console.error("Supabase error:", errorMsg);
      return { success: false, data: null, error: new Error(errorMsg) };
    }

    const data = await response.json();
    const avatar_url = await getAvatar(email, token);

    if (!data[0]) {
      return { success: false, data: null, error: "No user data found" };
    }

    return { success: true, data: { ...data[0], avatar_url }, error: null };
  } catch (err) {
    console.error("Supabase fetch error:", err);
    return {
      success: false,
      data: null,
      error: new Error("Error de conexión con Supabase"),
    };
  }
}

export async function updateNickname(email, token, newNickname) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${email}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ nickname: newNickname }),
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
    return {
      success: false,
      error: new Error("Error de conexión con Supabase"),
    };
  }
}

export async function uploadAvatar(formData, email, token) {
  try {
    const file = formData.get("avatar");
    if (!file) {
      throw new Error('No se encontró el archivo "image" en el FormData');
    }

    const encodedEmail = email.replace(/@/g, "").replace(/\./g, "");
    const filePath = `avatars/${encodedEmail}/profile.png`;

    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${filePath}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": file.type,
        "x-upsert": "true",
      },
      body: file,
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
    return {
      success: false,
      error: new Error("Error de conexión con Supabase"),
    };
  }
}

export async function getAvatar(email, token, expiresIn = 3000) {
  const encodedEmail = email.replace(/@/g, "").replace(/\./g, "");
  const filePath = `avatars/${encodedEmail}/profile.png`;

  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${filePath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiresIn }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const url = `${SUPABASE_URL}/storage/v1${data.signedURL}`;
  return url;
}
