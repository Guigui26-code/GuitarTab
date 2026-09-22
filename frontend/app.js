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
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const modal = document.getElementById("auth-modal");
  const closeBtn = document.getElementById("auth-close");
  const login = document.getElementById("auth-login");
  const signup = document.getElementById("auth-signup");
  const email = document.getElementById("auth-email");
  const password = document.getElementById("auth-password");
  const message = document.getElementById("auth-message");

  loginBtn?.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  closeBtn?.addEventListener("click", () => {
    modal.style.display = "none";
  });

  login?.addEventListener("click", async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    });

    message.textContent = error
      ? "❌ " + error.message
      : "✅ Connexion réussie !";

    if (!error) {
      setTimeout(() => {
        modal.style.display = "none";
      }, 1000);
    }
  });

  signup?.addEventListener("click", async () => {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    });

    message.textContent = error
      ? "❌ " + error.message
      : "📧 Compte créé ! Vérifie ton e-mail.";
  });

  initTabs();
  initEditor();

  console.log("🎸 GuitarTab initialisé !");
});
