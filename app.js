// Data layer
const STORAGE_KEY = 'roadmap-projects';
const API_KEY_STORAGE = 'roadmap-openai-api-key';
const REVIEWED_RISKS_STORAGE = 'roadmap-reviewed-risks';

function getSeedProjects() {
  const ids = {};
  for (let i = 1; i <= 18; i++) ids[`p${i}`] = `proj_seed_${i}`;
  return [
    // Cluster 1 (Jan 6–31): 4 projects overlapping
    { id: ids.p1, name: 'API Migration', owner: 'Platform Team', start_date: '2025-01-06', end_date: '2025-02-14', depends_on: [] },
    { id: ids.p2, name: 'Billing System Overhaul', owner: 'Finance Engineering', start_date: '2025-01-13', end_date: '2025-03-21', depends_on: [] },
    { id: ids.p4, name: 'Data Retention Compliance', owner: null, start_date: '2025-01-20', end_date: '2025-02-28', depends_on: [] },
    { id: ids.p5, name: 'Security Audit', owner: 'Infrastructure', start_date: '2025-01-27', end_date: '2025-02-14', depends_on: [] },
    // Cluster 2 (Feb 3–28): 6 projects overlapping
    { id: ids.p3, name: 'Customer Portal v2', owner: 'Product', start_date: '2025-02-03', end_date: '2025-03-14', depends_on: [ids.p1] },
    { id: ids.p6, name: 'Infrastructure Upgrade', owner: 'Infrastructure', start_date: '2025-02-10', end_date: '2025-04-25', depends_on: [ids.p5] },
    { id: ids.p7, name: 'Mobile App Redesign', owner: 'Mobile Team', start_date: '2025-02-17', end_date: '2025-03-07', depends_on: [ids.p1] },
    { id: ids.p8, name: 'SSO Integration', owner: 'Platform Team', start_date: '2025-02-17', end_date: '2025-04-11', depends_on: [ids.p1] },
    { id: ids.p9, name: 'Reporting Dashboard', owner: 'Analytics', start_date: '2025-02-24', end_date: '2025-04-04', depends_on: [ids.p2, ids.p3] },
    { id: ids.p10, name: 'Documentation Refresh', owner: null, start_date: '2025-02-24', end_date: '2025-03-14', depends_on: [ids.p1, ids.p2] },
    // Cluster 3 (Mar 3–28): 6 projects overlapping
    { id: ids.p11, name: 'Onboarding Flow Redesign', owner: 'Product', start_date: '2025-03-03', end_date: '2025-04-18', depends_on: [ids.p3] },
    { id: ids.p12, name: 'Performance Optimization', owner: 'Platform Team', start_date: '2025-03-10', end_date: '2025-05-23', depends_on: [ids.p6] },
    { id: ids.p13, name: 'GDPR Tooling', owner: 'Legal & Engineering', start_date: '2025-03-10', end_date: '2025-05-02', depends_on: [ids.p4] },
    { id: ids.p14, name: 'Webhook v2', owner: 'Platform Team', start_date: '2025-03-17', end_date: '2025-05-09', depends_on: [ids.p1, ids.p8] },
    { id: ids.p15, name: 'Support Ticket Integration', owner: 'Customer Success', start_date: '2025-03-17', end_date: '2025-04-25', depends_on: [ids.p3, ids.p9] },
    { id: ids.p16, name: 'Rate Limit Overhaul', owner: null, start_date: '2025-03-24', end_date: '2025-04-04', depends_on: [ids.p1] },
    // Cluster 4 (Apr 7–May 9): 6 projects overlapping
    { id: ids.p17, name: 'Audit Logging', owner: 'Infrastructure', start_date: '2025-04-07', end_date: '2025-05-30', depends_on: [ids.p5, ids.p6] },
    { id: ids.p18, name: 'Q3 Launch Prep', owner: 'Product', start_date: '2025-04-14', end_date: '2025-05-16', depends_on: [ids.p7, ids.p11, ids.p14] },
  ];
}

function loadProjects() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    if (parsed.length === 0) {
      const seed = getSeedProjects();
      saveProjects(seed);
      return seed;
    }
    return parsed;
  } catch {
    return [];
  }
}

function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  localStorage.removeItem(REVIEWED_RISKS_STORAGE);
}

function loadReviewedRisks() {
  try {
    const data = localStorage.getItem(REVIEWED_RISKS_STORAGE);
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReviewedRisks(ids) {
  localStorage.setItem(REVIEWED_RISKS_STORAGE, JSON.stringify([...ids]));
}

function generateId() {
  return 'proj_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}

// State
let projects = loadProjects();
let currentRisks = [];
let dismissedRiskIds = new Set();

// DOM elements
const addProjectBtn = document.getElementById('add-project-btn');
const addFirstProjectBtn = document.getElementById('add-first-project');
const listEmptyState = document.getElementById('list-empty-state');
const listContainer = document.getElementById('list-container');
const projectsTbody = document.getElementById('projects-tbody');
const timelineEmptyState = document.getElementById('timeline-empty-state');
const timelineContainer = document.getElementById('timeline-container');
const timelineHeader = document.getElementById('timeline-header');
const timelineBody = document.getElementById('timeline-body');
const modalOverlay = document.getElementById('modal-overlay');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalClose = document.getElementById('modal-close');
const modalCancel = document.getElementById('modal-cancel');
const projectForm = document.getElementById('project-form');
const switchToListBtn = document.getElementById('switch-to-list');
const flagRiskBtn = document.getElementById('flag-risk-btn');
const settingsBtn = document.getElementById('settings-btn');
const riskModalOverlay = document.getElementById('risk-modal-overlay');
const riskModalClose = document.getElementById('risk-modal-close');
const riskLoading = document.getElementById('risk-loading');
const riskContent = document.getElementById('risk-content');
const riskCards = document.getElementById('risk-cards');
const riskEmpty = document.getElementById('risk-empty');
const riskError = document.getElementById('risk-error');
const settingsModalOverlay = document.getElementById('settings-modal-overlay');
const settingsModalClose = document.getElementById('settings-modal-close');
const apiKeyInput = document.getElementById('api-key');
const settingsSave = document.getElementById('settings-save');

// View switching
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`${view}-view`).classList.add('active');
    if (view === 'timeline') renderTimeline();
  });
});

// Modal
function openModal(project = null) {
  modalTitle.textContent = project ? 'Edit Project' : 'Add Project';
  projectForm.reset();
  document.getElementById('project-id').value = project?.id || '';

  if (project) {
    document.getElementById('project-name').value = project.name;
    document.getElementById('project-owner').value = project.owner || '';
    document.getElementById('project-start').value = project.start_date;
    document.getElementById('project-end').value = project.end_date;
  } else {
    document.getElementById('project-start').value = '';
    document.getElementById('project-end').value = '';
  }

  // Populate dependencies select (exclude self when editing)
  const depsSelect = document.getElementById('project-deps');
  depsSelect.innerHTML = '';
  const others = projects.filter(p => p.id !== project?.id);
  if (others.length === 0) {
    const opt = document.createElement('option');
    opt.disabled = true;
    opt.textContent = 'No other projects yet';
    depsSelect.appendChild(opt);
  } else {
    others.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      if (project?.depends_on?.includes(p.id)) opt.selected = true;
      depsSelect.appendChild(opt);
    });
  }

  modalOverlay.classList.add('visible');
  document.getElementById('project-name').focus();
}

function closeModal() {
  modalOverlay.classList.remove('visible');
}

modalClose.addEventListener('click', closeModal);
modalCancel.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// Form submit
projectForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('project-id').value;
  const name = document.getElementById('project-name').value.trim();
  const owner = document.getElementById('project-owner').value.trim();
  const start_date = document.getElementById('project-start').value;
  const end_date = document.getElementById('project-end').value;

  const selectedDeps = Array.from(document.getElementById('project-deps').selectedOptions)
    .map(o => o.value)
    .filter(Boolean);

  if (new Date(end_date) < new Date(start_date)) {
    alert('End date must be after start date.');
    return;
  }

  const project = { name, owner: owner || null, start_date, end_date, depends_on: selectedDeps };

  if (id) {
    const idx = projects.findIndex(p => p.id === id);
    if (idx >= 0) {
      project.id = id;
      projects[idx] = project;
    }
  } else {
    project.id = generateId();
    projects.push(project);
  }

  saveProjects(projects);
  closeModal();
  renderList();
  renderTimeline();
});

// Add project buttons
addProjectBtn.addEventListener('click', () => openModal());
addFirstProjectBtn.addEventListener('click', () => openModal());
switchToListBtn.addEventListener('click', () => {
  document.querySelector('.nav-btn[data-view="list"]').click();
});

// Settings
settingsBtn.addEventListener('click', () => {
  apiKeyInput.value = localStorage.getItem(API_KEY_STORAGE) || '';
  settingsModalOverlay.classList.add('visible');
});
settingsModalClose.addEventListener('click', () => settingsModalOverlay.classList.remove('visible'));
settingsModalOverlay.addEventListener('click', (e) => {
  if (e.target === settingsModalOverlay) settingsModalOverlay.classList.remove('visible');
});
settingsSave.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (key) localStorage.setItem(API_KEY_STORAGE, key);
  else localStorage.removeItem(API_KEY_STORAGE);
  settingsModalOverlay.classList.remove('visible');
});

// Risk modal
riskModalClose.addEventListener('click', () => riskModalOverlay.classList.remove('visible'));
riskModalOverlay.addEventListener('click', (e) => {
  if (e.target === riskModalOverlay) riskModalOverlay.classList.remove('visible');
});

// Flag Risk Areas
flagRiskBtn.addEventListener('click', async () => {
  const apiKey = localStorage.getItem(API_KEY_STORAGE);
  if (!apiKey) {
    settingsBtn.click();
    return;
  }

  if (projects.length === 0) {
    alert('Add projects before running risk analysis.');
    return;
  }

  riskModalOverlay.classList.add('visible');
  riskLoading.style.display = 'block';
  riskContent.style.display = 'none';
  riskError.style.display = 'none';

  const roadmapData = projects.map(p => ({
    id: p.id,
    name: p.name,
    owner: p.owner,
    start_date: p.start_date,
    end_date: p.end_date,
    depends_on: (p.depends_on || []).map(id => projects.find(x => x.id === id)?.name).filter(Boolean)
  }));

  const prompt = `Analyze this roadmap data. Identify ONLY potential risks. Do not suggest solutions or modifications.

Roadmap data (JSON):
${JSON.stringify(roadmapData, null, 2)}

Risk types to check:
1. unowned_dependency: Projects that have dependencies but no owner assigned
2. week_convergence: Multiple projects (3+) that start or end in the same calendar week
3. tight_overlapping_chain: Dependency chains where a dependent project starts before its dependency ends (overlapping timelines in the chain)

Return a JSON object with this exact structure. Use project IDs (not names) in affected_projects for reliable identification.
{
  "risks": [
    {
      "type": "unowned_dependency" | "week_convergence" | "tight_overlapping_chain",
      "affected_projects": ["proj_123", "proj_456"],
      "explanation": "One sentence factual description."
    }
  ]
}

If no risks found, return {"risks": []}.`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message || 'API error');

    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('No response from API');

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error('Invalid JSON in API response');
    }

    const reviewed = loadReviewedRisks();
    dismissedRiskIds = new Set();
    const risks = (parsed.risks || [])
      .map(normalizeRisk)
      .filter(Boolean)
      .filter(r => !reviewed.has(getRiskId(r)));
    currentRisks = risks;

    riskLoading.style.display = 'none';
    renderRiskCards(risks);
    riskContent.style.display = 'block';
    renderList();
    renderTimeline();
  } catch (err) {
    riskLoading.style.display = 'none';
    riskError.textContent = err.message || 'Analysis failed.';
    riskError.style.display = 'block';
  }
});

// Risk helpers
function normalizeRisk(risk) {
  const raw = risk.affected_projects || [];
  const ids = raw.map(x => {
    const byId = projects.find(p => p.id === x);
    if (byId) return byId.id;
    const byName = projects.find(p => p.name === x);
    return byName?.id || x;
  }).filter(Boolean);
  return { ...risk, affected_projects: ids };
}

function getRiskId(risk) {
  const ids = (risk.affected_projects || []).slice().sort();
  return `${risk.type}:${ids.join(',')}`;
}

function getAffectedProjectIds() {
  const ids = new Set();
  currentRisks.forEach(r => {
    if (dismissedRiskIds.has(getRiskId(r))) return;
    (r.affected_projects || []).forEach(id => ids.add(id));
  });
  return ids;
}

function renderRiskCards(risks) {
  const visible = risks.filter(r => !dismissedRiskIds.has(getRiskId(r)));
  riskEmpty.style.display = visible.length === 0 ? 'block' : 'none';
  riskCards.style.display = visible.length === 0 ? 'none' : 'block';

  riskCards.innerHTML = visible.map(risk => {
    const riskId = getRiskId(risk);
    const names = (risk.affected_projects || [])
      .map(id => projects.find(p => p.id === id)?.name || id)
      .filter(Boolean);
    const typeLabel = {
      unowned_dependency: 'Unowned dependency',
      week_convergence: 'Week convergence',
      tight_overlapping_chain: 'Tight overlapping chain'
    }[risk.type] || risk.type;
    return `
      <div class="risk-card" data-risk-id="${escapeHtml(riskId)}">
        <button class="risk-card-header" type="button">
          <span class="risk-type">${escapeHtml(typeLabel)}</span>
          <span class="risk-projects">${escapeHtml(names.join(', '))}</span>
          <span class="risk-expand-icon">▾</span>
        </button>
        <div class="risk-card-body">
          <p class="risk-explanation">${escapeHtml(risk.explanation || '')}</p>
          <div class="risk-actions">
            <button class="btn btn-secondary btn-sm risk-dismiss" type="button">Dismiss</button>
            <button class="btn btn-secondary btn-sm risk-reviewed" type="button">Mark as reviewed</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  riskCards.querySelectorAll('.risk-card-header').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.risk-card').classList.toggle('expanded');
    });
  });
  riskCards.querySelectorAll('.risk-dismiss').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.risk-card');
      const id = card.dataset.riskId;
      dismissedRiskIds.add(id);
      card.remove();
      if (riskCards.children.length === 0) riskEmpty.style.display = 'block';
      renderList();
      renderTimeline();
    });
  });
  riskCards.querySelectorAll('.risk-reviewed').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.risk-card');
      const id = card.dataset.riskId;
      const reviewed = loadReviewedRisks();
      reviewed.add(id);
      saveReviewedRisks(reviewed);
      dismissedRiskIds.add(id);
      card.remove();
      if (riskCards.children.length === 0) riskEmpty.style.display = 'block';
      renderList();
      renderTimeline();
    });
  });
}

// List view
function renderList() {
  if (projects.length === 0) {
    listEmptyState.style.display = 'block';
    listContainer.style.display = 'none';
    return;
  }

  listEmptyState.style.display = 'none';
  listContainer.style.display = 'block';

  const affectedIds = getAffectedProjectIds();

  projectsTbody.innerHTML = projects.map(p => {
    const deps = (p.depends_on || [])
      .map(id => projects.find(x => x.id === id)?.name)
      .filter(Boolean);
    const rowClass = affectedIds.has(p.id) ? ' risk-affected' : '';
    return `
      <tr data-project-id="${escapeHtml(p.id)}" class="${rowClass}">
        <td><strong>${escapeHtml(p.name)}</strong></td>
        <td>${escapeHtml(p.owner || '—')}</td>
        <td>${formatDate(p.start_date)}</td>
        <td>${formatDate(p.end_date)}</td>
        <td>${deps.length ? deps.join(', ') : '—'}</td>
        <td>
          <div class="actions">
            <button class="btn btn-secondary btn-sm edit-btn" data-id="${p.id}">Edit</button>
            <button class="btn btn-secondary btn-sm delete-btn" data-id="${p.id}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  projectsTbody.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal(projects.find(p => p.id === btn.dataset.id)));
  });
  projectsTbody.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteProject(btn.dataset.id));
  });
}

function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  projects = projects.filter(p => p.id !== id);
  // Remove from other projects' depends_on
  projects.forEach(p => {
    if (p.depends_on) p.depends_on = p.depends_on.filter(d => d !== id);
  });
  saveProjects(projects);
  renderList();
  renderTimeline();
}

// Timeline view
function getWeeksInRange(start, end) {
  const weeks = [];
  const d = new Date(start);
  d.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  // Start from Monday of the week containing start
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);

  while (d <= endDate) {
    const weekStart = new Date(d);
    const weekEnd = new Date(d);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weeks.push({
      start: new Date(weekStart),
      end: new Date(weekEnd),
      label: formatWeekLabel(weekStart)
    });
    d.setDate(d.getDate() + 7);
  }
  return weeks;
}

function formatWeekLabel(date) {
  const d = new Date(date);
  const start = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  d.setDate(d.getDate() + 6);
  const end = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${start} – ${end}`;
}

function renderTimeline() {
  const withDates = projects.filter(p => p.start_date && p.end_date);

  if (withDates.length === 0) {
    timelineEmptyState.style.display = 'block';
    timelineContainer.style.display = 'none';
    return;
  }

  timelineEmptyState.style.display = 'none';
  timelineContainer.style.display = 'block';

  const minDate = new Date(Math.min(...withDates.map(p => new Date(p.start_date).getTime())));
  const maxDate = new Date(Math.max(...withDates.map(p => new Date(p.end_date).getTime())));
  minDate.setDate(minDate.getDate() - 7);
  maxDate.setDate(maxDate.getDate() + 7);

  const weeks = getWeeksInRange(minDate, maxDate);
  const totalDays = (maxDate - minDate) / (24 * 60 * 60 * 1000);
  const weekWidth = 120;

  timelineHeader.innerHTML = weeks.map(w => 
    `<div class="timeline-week" style="min-width: ${weekWidth}px">${w.label}</div>`
  ).join('');

  const affectedIds = getAffectedProjectIds();

  timelineBody.innerHTML = withDates.map((p, i) => {
    const start = new Date(p.start_date).getTime();
    const end = new Date(p.end_date).getTime();
    const left = ((start - minDate.getTime()) / (24 * 60 * 60 * 1000) / 7) * weekWidth;
    const width = Math.max(((end - start) / (24 * 60 * 60 * 1000) / 7 + 1) * weekWidth, 60);
    const rowClass = affectedIds.has(p.id) ? ' risk-affected' : '';
    return `
      <div class="timeline-row${rowClass}" data-project-id="${escapeHtml(p.id)}">
        <div class="timeline-label">
          <div>${escapeHtml(p.name)}</div>
          ${p.owner ? `<div class="owner">${escapeHtml(p.owner)}</div>` : ''}
        </div>
        <div class="timeline-bars" style="width: ${weeks.length * weekWidth}px">
          <div class="timeline-bar" style="left: ${left}px; width: ${width}px; min-width: ${width}px" title="${escapeHtml(p.name)}">
            ${escapeHtml(p.name)}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Helpers
function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Init
renderList();
renderTimeline();
