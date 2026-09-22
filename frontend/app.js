import { initTabs } from "./tabs.js";
import { initEditor } from "./editor.js";
import { supabase } from "./supabase.js";

console.log("🔥 APP CHARGÉ");
console.log("🟢 Supabase chargé :", supabase);

supabase
  .from("tabs")
  .select("id")
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error("🔴 Erreur Supabase :", error);
    } else {
      console.log("🟢 Connexion à la table tabs réussie :", data);
    }
  });
const loginBtn = document.getElementById("login-btn");

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    alert("🔐 Connexion / Inscription");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initEditor();

  console.log("🎸 GuitarTab initialisé !");
});
