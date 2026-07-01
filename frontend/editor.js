function initEditor() {
  const saveBtn = document.getElementById("save-btn");

  if (!saveBtn) return;

  saveBtn.addEventListener("click", () => {
    const title = document.getElementById("title-input").value;
    const content = document.getElementById("tab-textarea").value;

    if (!title) {
      alert("Titre obligatoire");
      return;
    }

    console.log("Sauvegarde :", title, content);
  });
}

export { initEditor };