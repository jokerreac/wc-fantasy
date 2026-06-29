// ─── State ───────────────────────────────────────────────────────────────────
let openPlayerId = null;

// ─── Render helpers ───────────────────────────────────────────────────────────

function recordStr(rec) {
  return `
    <span class="stat stat-w">${rec.wins}W</span>
    <span class="record-sep">·</span>
    <span class="stat stat-d">${rec.draws}D</span>
    <span class="record-sep">·</span>
    <span class="stat stat-l">${rec.losses}L</span>
  `;
}

function buildTeamCard(team) {
  const card = document.createElement('div');
  card.className = 'team-card';
  card.innerHTML = `
    <img
      class="team-crest"
      src="${escapeHtml(team.crest)}"
      alt="${escapeHtml(team.name)} crest"
      loading="lazy"
      onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 36 36%22><text y=%2228%22 font-size=%2228%22>⚽</text></svg>'"
    />
    <div class="team-info">
      <div class="team-name">${escapeHtml(team.name)}</div>
      <div class="team-record">${recordStr(team.record)}</div>
    </div>
    <div class="team-pts">
      <span class="team-pts-value">${team.record.points}</span>
      <span class="team-pts-label">pts</span>
    </div>
  `;
  return card;
}

function buildPlayerCard(player) {
  const isTop3 = player.rank <= 3;

  const card = document.createElement('div');
  card.className = 'player-card';
  card.setAttribute('role', 'listitem');

  // ── Summary button (always visible) ──────────────────
  const summary = document.createElement('button');
  summary.className = 'player-summary';
  summary.setAttribute('aria-expanded', 'false');
  summary.setAttribute('aria-controls', `teams-${player.id}`);
  summary.innerHTML = `
    <div class="player-rank">
      <span class="rank-num${isTop3 ? ' rank-top' : ''}">${player.rank}</span>
    </div>
    <div class="player-info">
      <div class="player-name">${escapeHtml(player.name)}</div>
      <div class="player-record">${recordStr(player.record)}</div>
    </div>
    <div class="player-right">
      <div class="player-pts">
        <span class="pts-value">${player.record.points}</span>
        <span class="pts-label">pts</span>
      </div>
      <svg class="chevron" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M5 7.5l5 5 5-5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  `;

  // ── Teams panel (collapsible) ─────────────────────────
  const panel = document.createElement('div');
  panel.className = 'teams-panel';
  panel.id = `teams-${player.id}`;
  panel.setAttribute('role', 'region');

  const inner = document.createElement('div');
  inner.className = 'teams-inner';

  const list = document.createElement('div');
  list.className = 'teams-list';
  list.innerHTML = `<div class="teams-label">Teams (${player.teams.length})</div>`;
  player.teams.forEach(team => list.appendChild(buildTeamCard(team)));

  inner.appendChild(list);
  panel.appendChild(inner);
  card.appendChild(summary);
  card.appendChild(panel);

  // ── Toggle logic ──────────────────────────────────────
  summary.addEventListener('click', () => {
    const isOpen = card.classList.contains('is-open');

    // Close any already-open card
    if (openPlayerId !== null && openPlayerId !== player.id) {
      const prev = document.querySelector(`.player-card.is-open`);
      if (prev) closeCard(prev);
    }

    if (isOpen) {
      closeCard(card);
    } else {
      openCard(card, summary);
    }
  });

  return card;
}

function openCard(card, summary) {
  card.classList.add('is-open');
  summary.setAttribute('aria-expanded', 'true');
  const idMatch = card.querySelector('.player-summary').getAttribute('aria-controls');
  openPlayerId = idMatch ? idMatch.replace('teams-', '') : null;
}

function closeCard(card) {
  card.classList.remove('is-open');
  const btn = card.querySelector('.player-summary');
  if (btn) btn.setAttribute('aria-expanded', 'false');
  openPlayerId = null;
}

// ─── Skeleton loading state ───────────────────────────────────────────────────

function renderSkeleton(container, count = 6) {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const row = document.createElement('div');
    row.className = 'skeleton-row';
    container.appendChild(row);
  }
}

// ─── Error state ──────────────────────────────────────────────────────────────

function renderError(container, message) {
  container.innerHTML = `
    <div class="error-card" role="alert">
      <div class="error-icon">⚠️</div>
      <div class="error-title">Couldn't load the leaderboard</div>
      <div class="error-msg">${escapeHtml(message)}</div>
      <button class="retry-btn" id="retry-btn">Try again</button>
    </div>
  `;
  document.getElementById('retry-btn').addEventListener('click', loadLeaderboard);
}

// ─── Safety ───────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Main fetch & render ──────────────────────────────────────────────────────

async function loadLeaderboard() {
  const container = document.getElementById('app');
  openPlayerId = null;

  renderSkeleton(container);

  try {
    const res = await fetch('/api/leaderboard');

    if (!res.ok) {
      throw new Error(`Server returned ${res.status} ${res.statusText}`);
    }

    const players = await res.json();

    if (!Array.isArray(players) || players.length === 0) {
      renderError(container, 'No players found in this leaderboard.');
      return;
    }

    container.innerHTML = '';
    players.forEach(player => container.appendChild(buildPlayerCard(player)));

  } catch (err) {
    renderError(container, err.message || 'An unexpected error occurred.');
  }
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

loadLeaderboard();
