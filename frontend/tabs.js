const STORAGE_KEY = 'guitartab-v1';

let tabs = [];

function loadData() {
  try {
    tabs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    tabs = [];
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
}

function renderList() {
  const list = document.getElementById('tabs-list');
  if (!list) return;

  list.innerHTML = '';

  if (tabs.length === 0) return;

  tabs.forEach(t => {
    const div = document.createElement('div');
    div.className = 'tab-card';

    div.innerHTML = `
      <div class="tab-info">
        <div class="tab-title">${t.title}</div>
        <div class="tab-preview">${(t.content || '').split('\n')[0]}</div>
      </div>
    `;

    div.onclick = () => openTab(t.id);

    list.appendChild(div);
  });
}

function openTab(id) {
  const tab = tabs.find(t => t.id === id);
  if (!tab) return;

  document.getElementById('list-view').style.display = 'none';
  document.getElementById('editor-view').style.display = 'flex';

  document.getElementById('title-input').value = tab.title;
  document.getElementById('tab-textarea').value = tab.content;
}

function openNew() {
  document.getElementById('list-view').style.display = 'none';
  document.getElementById('editor-view').style.display = 'flex';

  document.getElementById('title-input').value = '';
  document.getElementById('tab-textarea').value = '';
}

function initTabs() {
  loadData();
  renderList();

  document.getElementById('new-btn')?.addEventListener('click', openNew);

  document.getElementById('back-btn')?.addEventListener('click', () => {
    document.getElementById('editor-view').style.display = 'none';
    document.getElementById('list-view').style.display = 'block';
    renderList();
  });
}

export { initTabs };