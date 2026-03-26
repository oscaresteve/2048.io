import { login } from "../services/authService.js";
import { setState } from "../services/stateService.js";

export function renderLoginView(root) {
  root.innerHTML = `
    <div class="flex items-center justify-center h-screen bg-gray-100">
      <form id="login-form" class="bg-white p-8 rounded-lg shadow-md w-96 flex flex-col gap-4">
        <h2 class="text-2xl font-bold text-center mb-4">Inicia sesión con tu cuenta</h2>
        <input type="email" id="email" placeholder="Email" required
          class="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"/>
        <input type="password" id="password" placeholder="Contraseña" required
          class="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"/>
        <button type="submit"
          class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition">Iniciar sesión</button>
        <p id="login-error" class="text-red-500 text-sm text-center mt-2"></p>
        <p class="text-sm text-gray-500 text-center mt-2">
          ¿Aún no tienes cuenta?
          <span id="register-link" class="text-blue-500 cursor-pointer hover:underline">Crea tu cuenta</span>
        </p>
      </form>
    </div>
  `;

  const form = root.querySelector("#login-form");
  const emailInput = root.querySelector("#email");
  const passwordInput = root.querySelector("#password");
  const registerLink = root.querySelector("#register-link");
  const errorEl = root.querySelector("#login-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorEl.textContent = "";

    const result = await login(emailInput.value, passwordInput.value);
    
    if (result.error) {
      errorEl.textContent = result.error;
      return;
    }
  });

  registerLink.addEventListener("click", () => {
    setState({ route: "register" });
  });
}
