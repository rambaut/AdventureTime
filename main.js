let adventureData = null;
let currentPage = null;
let historyStack = [];
let statsStack = [];
let stats = { steps: 0 };

function renderPage(pageId, {pushHistory = true} = {}) {
  const root = document.getElementById('adventure-root');
  const page = adventureData.pages[pageId];
  if (pushHistory && currentPage) {
    historyStack.push(currentPage);
    statsStack.push({...stats});
    stats.steps++;
  }
  currentPage = pageId;
  if (!page) {
    root.innerHTML = `<div class=\"alert alert-danger\">Page not found.</div>`;
    return;
  }
  let html = `<div class=\"mb-4\">${marked.parse(page.text)}</div>`;
  if (page.choices && page.choices.length > 0) {
    html += '<div class=\"d-flex flex-column gap-3\">';
    page.choices.forEach((choice, idx) => {
      html += `\n        <div class=\"card p-3 d-flex flex-row align-items-center justify-content-between\">\n          <div class=\"me-3 flex-grow-1\">${choice.explanation ? marked.parseInline(choice.explanation) : ''}</div>\n          <button class=\"btn btn-primary ms-3\" onclick=\"chooseAdventure('${choice.target}')\">${choice.text}</button>\n        </div>\n      `;
    });
    html += '</div>';
  } else {
    html += '<div class=\"alert alert-info\">The End</div>';
  }
  root.innerHTML = html;
  updateStatusPanel();
}

window.chooseAdventure = function(target) {
  renderPage(target, {pushHistory: true});
};

function goBack() {
  if (historyStack.length > 0) {
    const prev = historyStack.pop();
    if (statsStack.length > 0) {
      stats = statsStack.pop();
    }
    renderPage(prev, {pushHistory: false});
  }
}

function restartAdventure() {
  historyStack = [];
  statsStack = [];
  stats = { steps: 0 };
  renderPage(adventureData.start, {pushHistory: false});
}

function updateStatusPanel() {
  // Enable/disable back button
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.disabled = historyStack.length === 0;
  }
  // Update stats display
  const statusPanel = document.getElementById('status-panel');
  if (statusPanel) {
    let statsDiv = statusPanel.querySelector('.stats-display');
    if (!statsDiv) {
      statsDiv = document.createElement('div');
      statsDiv.className = 'stats-display';
      statusPanel.querySelector('div.d-flex').prepend(statsDiv);
    }
    statsDiv.innerHTML = `<span class=\"badge bg-info text-dark\">Steps taken: ${stats.steps}</span>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('back-btn');
  const restartBtn = document.getElementById('restart-btn');
  if (backBtn) backBtn.addEventListener('click', goBack);
  if (restartBtn) restartBtn.addEventListener('click', restartAdventure);
});

fetch('adventure.json')
  .then(response => response.json())
  .then(data => {
    adventureData = data;
    stats = { steps: 0 };
    statsStack = [];
    renderPage(data.start, {pushHistory: false});
  });
