import { writable, get } from "svelte/store";

function createCreatorsThemes() {
  const { subscribe, set } = writable<Themes.Theme[]>([]);

  return {
    subscribe,
    set,
    // `exceptId`: the theme being edited may keep its own name.
    exists: (name: string, exceptId?: string) =>
      get(creatorsThemes).some((theme) => theme.name === name && theme.id !== exceptId),
  };
}

export const creatorsThemes = createCreatorsThemes();
