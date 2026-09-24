import { writable } from "svelte/store";

function createTabView() {
  const { subscribe, update, set } = writable<Types.Dic<string>>({});
  let id = 0;

  return {
    update,
    subscribe,
    createId: () => id++,
    set: (id: number | string, item: string) =>
      update((store) => {
        store[id] = item;
        return store;
      }),
  };
}

export const tabView = createTabView();
