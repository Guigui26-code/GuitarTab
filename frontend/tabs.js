const STORAGE_KEY = 'guitartab-v1';

let tabs = [];
let editId = null;

const TEMPLATE = `e|--------------------------------|
B|--------------------------------|
G|--------------------------------|
D|--------------------------------|
A|--------------------------------|
E|--------------------------------|`;

function loadTabs() {
  try {
    tabs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    tabs = [];
  }
}

function saveTabs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function renderList() {
  const n = tabs.length;

  document.getElementById('count-label').textContent =
    n === 0
      ? 'Aucune partition'
      : `${n} partition${n > 1 ? 's' : ''} sauvegardée${n > 1 ? 's' : ''}`;

  document.getElementById('empty-state').style.display =
    n === 0 ? 'block' : 'none';

  const list = document.getElementById('tabs-list');
  list.innerHTML = '';

  tabs.forEach(t => {
    const card = document.createElement('div');
    card.className = 'tab-card';
    card.id = `card-${t.id}`;

    const info = document.createElement('div');
    info.className = 'tab-info';
    info.onclick = () => openTab(t.id);

    info.innerHTML = `
      <div class="tab-title">${esc(t.title)}</div>
      <div class="tab-preview">${esc((t.content || '').split('\n')[0])}</div>
      <div class="tab-date">Modifié le ${fmtDate(t.updatedAt)}</div>
    `;

    const actions = document.createElement('div');
    actions.className = 'tab-actions';
    actions.id = `actions-${t.id}`;

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-ghost';
    editBtn.textContent = '✏️ Éditer';
    editBtn.onclick = () => openTab(t.id);

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-ghost';
    delBtn.style.padding = '8px 11px';
    delBtn.title = 'Supprimer';
    delBtn.textContent = '🗑️';
    delBtn.onclick = () => askDelete(t.id);

    actions.append(editBtn, delBtn);
    card.append(info, actions);
    list.appendChild(card);
  });
}

function askDelete(id) {
  const actions = document.getElementById(`actions-${id}`);
  actions.innerHTML = '';

  const yes = document.createElement('button');
  yes.className = 'btn-danger';
  yes.textContent = 'Supprimer';

  yes.onclick = () => {
    tabs = tabs.filter(t => t.id !== id);
    saveTabs();
    renderList();
  };

  const no = document.createElement('button');
  no.className = 'btn-ghost';
  no.textContent = 'Annuler';
  no.onclick = renderList;

  actions.append(yes, no);
}

function openNew() {
  editId = null;

  document.getElementById('title-input').value = '';
  document.getElementById('tab-textarea').value = TEMPLATE;

  showEditor();
}

function openTab(id) {
  const tab = tabs.find(t => t.id === id);
  if (!tab) return;

  editId = id;

  document.getElementById('title-input').value = tab.title;
  document.getElementById('tab-textarea').value = tab.content;

  showEditor();
}

function showEditor() {
  document.getElementById('list-view').style.display = 'none';
  document.getElementById('editor-view').style.display = 'flex';

  document.getElementById('title-input').classList.remove('invalid');

  resetSaveBtn();
  stopPlayback();
  renderSavedChords();
}

function goBack() {
  stopPlayback();

  document.getElementById('editor-view').style.display = 'none';
  document.getElementById('list-view').style.display = 'block';

  renderList();
}

function getTabs() {
  return tabs;
}

function getEditId() {
  return editId;
}

function setEditId(id) {
  editId = id;
}

function initTabs() {
  loadTabs();
  renderList();

  document.getElementById('new-btn')?.addEventListener('click', openNew);

  document.getElementById('back-btn')?.addEventListener('click', goBack);
}

export {
  initTabs,
  getTabs,
  saveTabs,
  getEditId,
  setEditId,
  renderList
};
