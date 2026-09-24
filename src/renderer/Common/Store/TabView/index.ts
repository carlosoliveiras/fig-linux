import { writable } from "svelte/store";

function createTabView() {
  const { subscribe, update } = writable<Types.Dic<string>>({});

  return {
    subscribe,
    set: (id: number | string, item: string) =>
      update((store) => {
        store[id] = item;
        return store;
      }),
  };
}

export const tabView = createTabView();
