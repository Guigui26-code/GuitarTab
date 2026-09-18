import { initTabs } from "./tabs.js";
import { initEditor } from "./editor.js";
import { supabase } from "./supabase.js";

console.log("🔥 APP CHARGÉ");
console.log("🟢 Supabase chargé :", supabase);

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initEditor();

  console.log("🎸 GuitarTab initialisé !");
});
