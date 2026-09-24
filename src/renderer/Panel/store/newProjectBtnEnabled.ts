import { writable } from "svelte/store";

// The "Show new project button" setting.
export const newProjectBtnEnabled = writable<boolean>(true);
