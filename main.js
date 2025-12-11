let adventureData = null;
let currentPage = null;
let historyStack = [];
let statsStack = [];
let stats = { steps: 0 };
let initialStats = { steps: 0 };

function applyStatChanges(changes) {
  if (!changes) return;
  for (const key in changes) {
    if (typeof stats[key] === 'number') {
      stats[key] += changes[key];
    } else {
      stats[key] = changes[key];
    }
  }
}

function renderPage(pageId, {pushHistory = true, choiceStatChanges = null} = {}) {
  const root = document.getElementById('adventure-root');
  const page = adventureData.pages[pageId];

  // Prevent stat changes and history updates if rendering the death page
  const isDeathPage = pageId === 'death';

  if (!isDeathPage) {
    if (pushHistory && currentPage) {
      historyStack.push(currentPage);
      statsStack.push({...stats});
      stats.steps++;
      // Apply stat changes from the choice that led here
      applyStatChanges(choiceStatChanges);
    }
    // Apply stat changes from the page itself
    if (page && page.statChanges) {
      applyStatChanges(page.statChanges);
    }
    // Check for death (but not if already on death page)
    if (stats.hunger <= 0 || stats.tiredness <= 0) {
      currentPage = 'death';
      renderPage('death', {pushHistory: false});
      return;
    }
  }

  currentPage = pageId;
  if (!page) {
    root.innerHTML = `<div class="alert alert-danger">Page not found.</div>`;
    return;
  }
  let html = `<div class="mb-4">${marked.parse(page.text)}</div>`;
  if (page.choices && page.choices.length > 0) {
    html += '<div class="d-flex flex-column gap-3">';
    page.choices.forEach((choice, idx) => {
      const statChangesStr = encodeURIComponent(JSON.stringify(choice.statChanges || {}));
      html += `
        <div class="card p-3 d-flex flex-row align-items-center justify-content-between">
          <div class="me-3 flex-grow-1">${choice.explanation ? marked.parseInline(choice.explanation) : ''}</div>
          <button class="btn btn-primary ms-3 choice-btn" data-target="${choice.target}" data-stat-changes="${statChangesStr}">${choice.text}</button>
        </div>
      `;
    });
    html += '</div>';
  } else {
    html += '<div class="alert alert-info">The End</div>';
  }
  root.innerHTML = html;
  // No per-button event listeners; handled by event delegation below
  updateStatusPanel();
}

window.chooseAdventure = function(target, statChanges) {
  renderPage(target, {pushHistory: true, choiceStatChanges: statChanges});
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
  stats = {...initialStats};
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
    let statsHtml = `<span class="badge bg-info text-dark me-2">Steps taken: ${stats.steps}</span>`;
    for (const key in stats) {
      if (key !== 'steps') {
        statsHtml += `<span class="badge bg-secondary text-light me-2">${key.charAt(0).toUpperCase() + key.slice(1)}: ${stats[key]}</span>`;
      }
    }
    statsDiv.innerHTML = statsHtml;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('back-btn');
  const restartBtn = document.getElementById('restart-btn');
  if (backBtn) backBtn.addEventListener('click', goBack);
  if (restartBtn) restartBtn.addEventListener('click', restartAdventure);

  // Event delegation for choice buttons
  const root = document.getElementById('adventure-root');
  if (root) {
    root.addEventListener('click', function(e) {
      const btn = e.target.closest('.choice-btn');
      if (btn) {
        const target = btn.getAttribute('data-target');
        let statChanges = {};
        try {
          statChanges = JSON.parse(decodeURIComponent(btn.getAttribute('data-stat-changes')));
        } catch (e) {}
        chooseAdventure(target, statChanges);
      }
    });
  }
});

fetch('adventure.json')
  .then(response => response.json())
  .then(data => {
    adventureData = data;
    // Initialize stats from top-level JSON
    initialStats = { steps: 0, ...(data.stats || {}) };
    stats = {...initialStats};
    statsStack = [];
    renderPage(data.start, {pushHistory: false});
  });
