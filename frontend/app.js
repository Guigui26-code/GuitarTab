import { initTabs } from "./tabs.js";
import { initEditor } from "./editor.js";

console.log("🔥 APP CHARGÉ");

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initEditor();

  console.log("🎸 GuitarTab initialisé !");
});
