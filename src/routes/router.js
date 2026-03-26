import { state$, setState } from "../services/stateService.js";

export const router = {
  init() {
    /*window.addEventListener("hashchange", () => {
      let route = location.hash.replace("#", "") || "login";

      const user = state$.value.user;

      const protectedRoutes = ["game"];
      if (protectedRoutes.includes(route) && !user) {
        route = "login";
        location.hash = "#login";
      }

      setState({ route });
    });*/

    if (!state$.value.user) {
      const route = location.hash.replace("#", "") || "login";
      setState({ route });
    }
  },
};
