import { register } from "../services/authService.js";
import { setState } from "../services/stateService.js";

export function renderRegisterView(root) {
  root.innerHTML = `
    <div class="flex items-center justify-center h-screen bg-gray-100">
      <form id="register-form" class="bg-white p-8 rounded-lg shadow-md w-96 flex flex-col gap-4">
        <h2 class="text-2xl font-bold text-center mb-4">Crea tu cuenta</h2>
        <input type="email" id="email" placeholder="Email" required
          class="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"/>
        <input type="password" id="password" placeholder="Contraseña" required
          class="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"/>
        <input type="password" id="confirm-password" placeholder="Repite tu contraseña" required
          class="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"/>
        <button type="submit"
          class="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition">Registrarse</button>
        <p id="register-error" class="text-red-500 text-sm text-center mt-2"></p>
        <p id="register-success" class="text-green-500 text-sm text-center mt-2"></p>
        <p class="text-sm text-gray-500 text-center mt-2">
          ¿Tienes ya tu cuenta? 
          <span id="login-link" class="text-blue-500 cursor-pointer hover:underline">Inicia sesión</span>
        </p>
      </form>
    </div>
  `;

  const form = root.querySelector("#register-form");
  const emailInput = root.querySelector("#email");
  const passwordInput = root.querySelector("#password");
  const confirmInput = root.querySelector("#confirm-password");
  const loginLink = root.querySelector("#login-link");
  const errorEl = root.querySelector("#register-error");
  const succesEl = root.querySelector("#register-success");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    succesEl.textContent = "";

    if (passwordInput.value !== confirmInput.value) {
      errorEl.textContent = "Las contraseñas no coinciden";
      setTimeout(() => {errorEl.textContent = "";}, 3000);
      return;
    }

    const result = await register(emailInput.value, passwordInput.value);

    if (result.error) {
      errorEl.textContent = result.error;
      setTimeout(() => {errorEl.textContent = "";}, 3000);
      return;
    }

    emailInput.value = "";
    passwordInput.value = "";
    confirmInput.value = "";

    succesEl.textContent = result.message;
    setTimeout(() => {succesEl.textContent = "";}, 3000);
  });

  loginLink.addEventListener("click", () => {
    setState({ route: "login" });
  });
}
