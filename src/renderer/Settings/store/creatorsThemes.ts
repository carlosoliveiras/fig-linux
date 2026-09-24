import { writable, get } from "svelte/store";

function createCreatorsThemes() {
  const { subscribe, set, update } = writable<Themes.Theme[]>([]);

  return {
    subscribe,
    update,
    set,
    // `exceptId`: the theme being edited may keep its own name.
    exists: (name: string, exceptId?: string) =>
      get(creatorsThemes).some((theme) => theme.name === name && theme.id !== exceptId),
  };
}

export const creatorsThemes = createCreatorsThemes();
