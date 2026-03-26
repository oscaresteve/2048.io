import { BehaviorSubject } from "rxjs";

const initialState = {
  user: {
    email: null,
    token: null,
    nickname: null,
    avatar_url: null,
    max_score: 0,
    game: null,
  },
  route: "login",
};

const state$ = new BehaviorSubject(initialState);

function setState(partial) {
  const prev = state$.value;

  const next = {
    ...prev,
    ...partial,
    user: {
      ...prev.user,
      ...partial.user,
    },
  };

  state$.next(next);
  console.log("Estado Actualizado: ", next);
}


export { state$, setState };
