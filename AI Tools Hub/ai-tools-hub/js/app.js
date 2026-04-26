// ============================================================
// AI TOOLS HUB — Main Application Logic
// ============================================================

// ── State ────────────────────────────────────────────────────
const state = {
  currentPage: 'home',
  currentCategory: 'all',
  searchQuery: '',
  currentTool: null,
  currentRoadmap: null,
  currentBranch: 'cse',
  theme: localStorage.getItem('theme') || 'dark'
};

// ── DOM Ready ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(state.theme);
  buildNav();
  buildHomePage();
  buildCategoryFilters();
  buildToolsGrid();
  buildRoadmapCards();
  buildProgrammingPaths();
  buildBranchRoadmaps();
  buildAboutPage();
  buildFuturePage();
  bindSearch();
  bindHamburger();
  showPage('home');
});

// ── Theme ─────────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', state.theme);
  applyTheme(state.theme);
}

// ── Navigation ────────────────────────────────────────────────
function buildNav() {
  const nav = document.getElementById('sidebarNav');
  const items = [
    { id:'home', label:'Home', icon:'🏠', section:'Main' },
    { id:'tools', label:'AI Tools Directory', icon:'🔧', badge:'120+', section:'Main' },
    { id:'roadmaps', label:'Career Roadmaps', icon:'🗺️', section:'Learning' },
    { id:'programming', label:'Programming Paths', icon:'💻', section:'Learning' },
    { id:'branches', label:'Branch Roadmaps', icon:'🎓', section:'Learning' },
    { id:'about', label:'About', icon:'ℹ️', section:'Info' },
    { id:'future', label:'Future Enhancements', icon:'🚀', section:'Info' }
  ];

  let html = '';
  let lastSection = '';
  items.forEach(item => {
    if (item.section !== lastSection) {
      html += `<div class="nav-section-title">${item.section}</div>`;
      lastSection = item.section;
    }
    html += `<div class="nav-item" data-page="${item.id}" onclick="showPage('${item.id}')">
      <span class="nav-icon">${item.icon}</span>
      <span>${item.label}</span>
      ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
    </div>`;
  });
  nav.innerHTML = html;
}

// ── Page Router ───────────────────────────────────────────────
function showPage(pageId, data) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const pageEl = document.getElementById(`page-${pageId}`);
  if (pageEl) pageEl.classList.add('active');

  const navEl = document.querySelector(`[data-page="${pageId}"]`);
  if (navEl) navEl.classList.add('active');

  state.currentPage = pageId;
  if (data) state.currentTool = data;

  // Always reset roadmap view when navigating to roadmaps page
  if (pageId === 'roadmaps') {
    const cards = document.getElementById('roadmapCards');
    const detail = document.getElementById('roadmapDetail');
    if (cards) cards.style.display = '';
    if (detail) { detail.style.display = 'none'; detail.classList.remove('active'); }
  }

  if (pageId === 'tool-detail' && data) renderToolDetail(data);
  if (pageId === 'roadmap-detail' && data) renderRoadmapDetail(data);

  window.scrollTo(0, 0);
  closeSidebar();
}

// ── Home Page ─────────────────────────────────────────────────
function buildHomePage() {
  const container = document.getElementById('homeFeatured');
  if (!container) return;
  const featured = TOOLS.slice(0, 6);
  container.innerHTML = featured.map(t => toolCardHTML(t)).join('');
}

// ── Category Filters ──────────────────────────────────────────
function buildCategoryFilters() {
  const container = document.getElementById('categoryFilters');
  if (!container) return;
  container.innerHTML = CATEGORIES.map(cat => {
    const count = cat.id === 'all' ? TOOLS.length : TOOLS.filter(t => t.category === cat.id).length;
    return `<button class="filter-btn ${cat.id === 'all' ? 'active' : ''}" onclick="filterTools('${cat.id}')">
      ${cat.icon} ${cat.label} <span class="filter-count">${count}</span>
    </button>`;
  }).join('');
}

function filterTools(categoryId) {
  state.currentCategory = categoryId;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.currentTarget.classList.add('active');
  buildToolsGrid();
}

// ── Tools Grid ────────────────────────────────────────────────
function buildToolsGrid() {
  const container = document.getElementById('toolsGrid');
  if (!container) return;

  let filtered = TOOLS;
  if (state.currentCategory !== 'all') filtered = filtered.filter(t => t.category === state.currentCategory);
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.tagline.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      (t.features || []).some(f => f.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">🔍</div>
      <h3>No tools found</h3>
      <p>Try a different search term or category</p>
    </div>`;
    return;
  }

  container.innerHTML = filtered.map(t => toolCardHTML(t)).join('');
}

function toolCardHTML(tool) {
  const stars = '★'.repeat(Math.floor(tool.rating)) + (tool.rating % 1 >= 0.5 ? '½' : '');
  const catLabel = CATEGORIES.find(c => c.id === tool.category)?.label || tool.category;
  return `<div class="tool-card" onclick="openTool('${tool.id}')">
    <div class="tool-card-header">
      <div class="tool-icon-wrap">${tool.icon}</div>
      <div class="tool-meta">
        <div class="tool-name">${tool.name}</div>
        <div class="tool-category-tag">${catLabel}</div>
      </div>
      <div class="tool-badge">${tool.badge}</div>
    </div>
    <div class="tool-tagline">${tool.tagline}</div>
    <div class="tool-card-footer">
      <div class="tool-rating">
        <span class="stars">${'★'.repeat(Math.floor(tool.rating))}</span>
        <span class="rating-val">${tool.rating}</span>
        <span class="rating-users">(${tool.users})</span>
      </div>
      <div class="tool-pricing">${tool.pricing}</div>
    </div>
  </div>`;
}

// ── Tool Detail ───────────────────────────────────────────────
function openTool(toolId) {
  const tool = TOOLS.find(t => t.id === toolId);
  if (!tool) return;
  renderToolDetail(tool);
  showPage('tool-detail');
}

function renderToolDetail(tool) {
  const container = document.getElementById('toolDetailContent');
  if (!container) return;

  const catLabel = CATEGORIES.find(c => c.id === tool.category)?.label || tool.category;
  container.innerHTML = `
    <div class="tool-detail-header">
      <button class="detail-back-btn" onclick="showPage('tools')">← Back to Tools</button>
      <div class="detail-hero-grid">
        <div class="detail-icon-big">${tool.icon}</div>
        <div>
          <div class="detail-title">${tool.name}</div>
          <div class="detail-tagline">${tool.tagline}</div>
          <div class="detail-pills">
            <span class="pill pill-badge">${tool.badge}</span>
            <span class="pill pill-rating">⭐ ${tool.rating}/5</span>
            <span class="pill pill-users">👥 ${tool.users}</span>
            <span class="pill pill-price">💰 ${tool.pricing}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-content-grid">
      <div>
        <div class="detail-description">
          <div class="section-title">📖 About ${tool.name}</div>
          <p>${tool.description}</p>
        </div>

        <div style="margin-top:20px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:24px;">
          <div class="section-title">🎯 Use Cases</div>
          <div class="use-case-grid">
            ${(tool.useCases||[]).map(u => `<span class="use-case-tag">${u}</span>`).join('')}
          </div>
        </div>

        <div class="pros-cons-grid" style="margin-top:20px;">
          <div class="pros-card">
            <div class="pros-title">✅ Pros</div>
            ${(tool.pros||[]).map(p => `<div class="pc-item">${p}</div>`).join('')}
          </div>
          <div class="cons-card">
            <div class="cons-title">❌ Cons</div>
            ${(tool.cons||[]).map(c => `<div class="pc-item">${c}</div>`).join('')}
          </div>
        </div>

        <div style="margin-top:20px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:24px;">
          <div class="section-title">💼 Career Opportunities</div>
          <div style="margin-bottom:14px;">
            <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">Salary Range</div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--green)">${tool.salary || '$70K–$150K'}</div>
          </div>
          <div class="section-title" style="font-size:0.85rem;">Job Roles</div>
          <div class="job-roles-row">
            ${(tool.jobRoles||[]).map(r => `<span class="job-role-chip">${r}</span>`).join('')}
          </div>
        </div>
      </div>

      <div>
        <div class="detail-sidebar-card">
          <div class="section-title">⚡ Key Features</div>
          <div class="feature-list">
            ${(tool.features||[]).map(f => `<div class="feature-item">${f}</div>`).join('')}
          </div>
        </div>

        <div class="detail-sidebar-card">
          <div class="section-title">🔗 Try It Out</div>
          <a href="${tool.link}" target="_blank" class="visit-btn" style="display:flex;justify-content:center;">
            Visit ${tool.name} ↗
          </a>
          <div style="font-size:0.72rem;color:var(--text-muted);text-align:center;margin-top:10px;">Opens in new tab</div>
        </div>

        <div class="detail-sidebar-card" style="background:rgba(99,102,241,0.08);border-color:rgba(99,102,241,0.2);">
          <div class="section-title">📊 Tool Stats</div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;justify-content:space-between;font-size:0.82rem;">
              <span style="color:var(--text-muted)">Category</span>
              <span style="font-weight:700;color:var(--accent-hover)">${catLabel}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.82rem;">
              <span style="color:var(--text-muted)">Rating</span>
              <span style="font-weight:700;color:var(--amber)">⭐ ${tool.rating}/5</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.82rem;">
              <span style="color:var(--text-muted)">Users</span>
              <span style="font-weight:700">${tool.users}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.82rem;">
              <span style="color:var(--text-muted)">Pricing</span>
              <span style="font-weight:700;color:var(--green)">${tool.pricing}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── Roadmap Cards ─────────────────────────────────────────────
function buildRoadmapCards() {
  const container = document.getElementById('roadmapCards');
  if (!container) return;
  container.innerHTML = Object.values(ROADMAPS).map(rm => `
    <div class="roadmap-card" onclick="openRoadmap('${rm.id}')">
      <div class="roadmap-card-icon">${rm.icon}</div>
      <div class="roadmap-card-title">${rm.title}</div>
      <div class="roadmap-card-meta">
        <span>⏱ ${rm.duration}</span>
        <span>📚 ${rm.stages.length} stages</span>
      </div>
      <div class="roadmap-card-salary">${rm.salary}</div>
      <div class="roadmap-card-roles">
        ${rm.jobRoles.slice(0,3).map(r => `<span class="role-tag">${r}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

function openRoadmap(roadmapId) {
  const rm = ROADMAPS[roadmapId];
  if (!rm) return;
  renderRoadmapDetail(rm);
  // Hide only the cards grid, NOT its parent (which also contains the detail panel)
  document.getElementById('roadmapCards').style.display = 'none';
  document.getElementById('roadmapDetail').style.display = 'block';
  document.getElementById('roadmapDetail').classList.add('active');
}

function renderRoadmapDetail(rm) {
  const container = document.getElementById('roadmapDetail');
  if (!container) return;

  container.innerHTML = `
    <button class="detail-back-btn" onclick="closeRoadmapDetail()">← Back to Roadmaps</button>
    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:28px;margin-bottom:24px;">
      <div style="font-size:2.5rem;margin-bottom:10px;">${rm.icon}</div>
      <h2 style="font-size:1.8rem;font-weight:900;margin-bottom:6px;">${rm.title}</h2>
      <div style="display:flex;flex-wrap:wrap;gap:16px;color:var(--text-secondary);font-size:0.85rem;margin-bottom:12px;">
        <span>⏱ ${rm.duration}</span>
        <span style="color:var(--green);font-weight:700;">💰 ${rm.salary}</span>
      </div>
      <div class="job-roles-row">
        ${rm.jobRoles.map(r => `<span class="job-role-chip">${r}</span>`).join('')}
      </div>
    </div>

    <div class="stages-timeline">
      ${rm.stages.map((stage, i) => `
        <div class="stage-item">
          <div class="stage-left">
            <div class="stage-level" style="color:${stage.color}">${stage.level}</div>
            <div class="stage-duration">${stage.duration}</div>
          </div>
          <div class="stage-dot" style="background:${stage.color}"></div>
          <div class="stage-content" style="border-left-color:${stage.color}">
            <div class="stage-section">
              <div class="stage-section-title">📚 Topics to Learn</div>
              <div class="topic-tags">${stage.topics.map(t => `<span class="topic-tag">${t}</span>`).join('')}</div>
            </div>
            <div class="stage-section">
              <div class="stage-section-title">🛠 Tools</div>
              <div class="topic-tags">${stage.tools.map(t => `<span class="topic-tag" style="border-color:${stage.color}40;color:var(--text-primary)">${t}</span>`).join('')}</div>
            </div>
            <div class="stage-section">
              <div class="stage-section-title">🎯 Project</div>
              <div class="project-box">${stage.project}</div>
            </div>
            <div class="stage-section">
              <div class="stage-section-title">📖 Resources</div>
              <div class="feature-list">
                ${stage.resources.map(r => `<div class="feature-item" style="font-size:0.78rem;">${r}</div>`).join('')}
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function closeRoadmapDetail() {
  document.getElementById('roadmapCards').style.display = '';
  document.getElementById('roadmapDetail').style.display = 'none';
  document.getElementById('roadmapDetail').classList.remove('active');
}

// ── Programming Paths ─────────────────────────────────────────
function buildProgrammingPaths() {
  const container = document.getElementById('programmingPaths');
  if (!container) return;
  container.innerHTML = PROG_PATHS.map((path, pi) => `
    <div class="path-card">
      <div class="path-header">
        <div class="path-icon">${path.icon}</div>
        <div>
          <div class="path-title">${path.title}</div>
          <div class="path-meta">
            <span>⏱ ${path.duration}</span>
          </div>
          <div class="path-salary">${path.salary}</div>
        </div>
      </div>
      <div class="path-timeline">
        ${path.steps.map((step, si) => `
          <div class="path-step">
            <div class="step-header">
              <div class="step-dot" style="background:${path.color}">${si+1}</div>
              <div class="step-info">
                <div class="step-month">Month ${step.month}</div>
                <div class="step-title">${step.title}</div>
              </div>
            </div>
            <div class="step-body">
              <div class="step-topics">
                ${step.topics.map(t => `<div class="step-topic">${t}</div>`).join('')}
              </div>
              <div class="step-tools-wrap">
                ${step.tools.map(t => `<span class="step-tool">${t}</span>`).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ── Branch Roadmaps ───────────────────────────────────────────
function buildBranchRoadmaps() {
  const tabsContainer = document.getElementById('branchTabs');
  const contentContainer = document.getElementById('branchContent');
  if (!tabsContainer || !contentContainer) return;

  const branches = Object.entries(BRANCH_ROADMAPS);

  tabsContainer.innerHTML = branches.map(([key, br]) => `
    <div class="branch-tab ${key === 'cse' ? 'active' : ''}" onclick="switchBranch('${key}')">
      <span class="tab-icon">${br.icon}</span>
      ${br.title.split(' ')[0]}
    </div>
  `).join('');

  contentContainer.innerHTML = branches.map(([key, br]) => `
    <div class="branch-content ${key === 'cse' ? 'active' : ''}" id="branch-${key}">
      <div class="branch-overview" style="border-left-color:${br.color}">
        <h3>${br.icon} ${br.title}</h3>
        <p>${br.overview}</p>
        <div class="branch-salary">💰 Expected Salary: <span style="color:${br.color}">${br.salary}</span></div>
      </div>

      <div class="branch-paths-grid">
        ${br.paths.map(path => `
          <div class="branch-path-card" style="border-top:3px solid ${br.color}">
            <div class="branch-path-title">${path.title}</div>
            <div class="branch-path-items">
              ${path.items.map(item => `<div class="branch-path-item">${item}</div>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:20px;">
        <div class="section-title">💼 Target Job Roles</div>
        <div class="jobs-grid">${br.jobRoles.map(r => `<div class="job-card">${r}</div>`).join('')}</div>
      </div>

      <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;">
        <div class="section-title">🏢 Top Companies Hiring</div>
        <div class="companies-row">${br.topCompanies.map(c => `<span class="company-chip">${c}</span>`).join('')}</div>
      </div>
    </div>
  `).join('');
}

function switchBranch(branchKey) {
  state.currentBranch = branchKey;
  document.querySelectorAll('.branch-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.branch-content').forEach(c => c.classList.remove('active'));
  event.currentTarget.classList.add('active');
  document.getElementById(`branch-${branchKey}`)?.classList.add('active');
}

// ── About Page ────────────────────────────────────────────────
function buildAboutPage() {
  const container = document.getElementById('aboutContent');
  if (!container) return;

  const team = [
    { avatar:'👨‍💻', name:'Arjun Sharma', role:'Founder & AI Lead', bio:'MS CS from IIT Delhi. 8 years in ML research and applied AI. Previously at Google Brain.' },
    { avatar:'👩‍🎨', name:'Priya Nair', role:'UX/Design Director', bio:'Award-winning designer with expertise in design systems and AI product experience.' },
    { avatar:'🧑‍💼', name:'Rohan Verma', role:'Content & Research', bio:'PhD candidate in AI Ethics. Writes about the intersection of AI, education, and society.' },
    { avatar:'👩‍💻', name:'Sneha Patel', role:'Full-Stack Developer', bio:'React & Node.js specialist. Built scalable platforms serving millions of users.' }
  ];

  const mission = [
    { icon:'🎯', title:'Democratize AI Education', desc:'Make cutting-edge AI knowledge accessible to every student regardless of background or resources.' },
    { icon:'🗺️', title:'Clear Career Pathways', desc:'Provide structured, practical roadmaps that actually lead to employment and career growth.' },
    { icon:'🔍', title:'Unbiased Tool Reviews', desc:'Honest, comprehensive assessments of every AI tool—no paid placements or hidden agendas.' },
    { icon:'🌱', title:'Always Evolving', desc:'Updated weekly to reflect the rapidly changing AI landscape. Never outdated.' }
  ];

  container.innerHTML = `
    <div class="about-hero">
      <h2>🚀 Empowering the Next Generation of AI Professionals</h2>
      <p>AI Tools Hub was born from a simple frustration: there was no single, trustworthy resource that helped students and early professionals understand the AI landscape, choose the right tools, and build careers in this transformative field. We built what we wished had existed.</p>
    </div>

    <div class="section-header" style="margin-bottom:20px;">
      <h2 class="gradient-text">Our Mission</h2>
    </div>
    <div class="mission-grid" style="margin-bottom:32px;">
      ${mission.map(m => `
        <div class="mission-card">
          <div class="mission-icon">${m.icon}</div>
          <div class="mission-title">${m.title}</div>
          <div class="mission-desc">${m.desc}</div>
        </div>
      `).join('')}
    </div>

    <div class="section-header" style="margin-bottom:20px;">
      <h2 class="gradient-text">Meet the Team</h2>
    </div>
    <div class="team-grid" style="margin-bottom:32px;">
      ${team.map(m => `
        <div class="team-card">
          <div class="team-avatar">${m.avatar}</div>
          <div class="team-name">${m.name}</div>
          <div class="team-role">${m.role}</div>
          <div class="team-bio">${m.bio}</div>
        </div>
      `).join('')}
    </div>

    <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:32px;text-align:center;">
      <div style="font-size:2rem;margin-bottom:12px;">📊</div>
      <h3 style="font-size:1.3rem;font-weight:800;margin-bottom:20px;">Platform by the Numbers</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:20px;">
        ${[['120+','AI Tools','🔧'],['4','Career Roadmaps','🗺️'],['4','Programming Paths','💻'],['3','Branch Roadmaps','🎓'],['6','Categories','📂'],['Free','Always','✅']].map(([val,lbl,ico]) => `
          <div>
            <div style="font-size:1.8rem;font-weight:900;margin-bottom:4px;">${ico} ${val}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">${lbl}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ── Future Page ───────────────────────────────────────────────
function buildFuturePage() {
  const container = document.getElementById('futureContent');
  if (!container) return;

  const statusClass = { 'In Design':'status-design', 'Planned':'status-planned', 'Research':'status-research' };

  container.innerHTML = `
    <div style="background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1));border:1px solid var(--border);border-radius:var(--radius-lg);padding:32px;margin-bottom:28px;text-align:center;">
      <div style="font-size:2rem;margin-bottom:10px;">🔭</div>
      <h2 style="font-size:1.5rem;font-weight:900;margin-bottom:10px;">What's Coming Next</h2>
      <p style="color:var(--text-secondary);max-width:500px;margin:0 auto;">We're continuously improving AI Tools Hub. Here's a transparent look at our planned features and timeline.</p>
    </div>
    <div class="future-grid">
      ${FUTURE_FEATURES.map(f => `
        <div class="future-card">
          <div class="future-icon">${f.icon}</div>
          <div class="future-title">${f.title}</div>
          <div class="future-desc">${f.desc}</div>
          <div>
            <span class="future-status ${statusClass[f.status] || 'status-planned'}">
              ${f.status === 'In Design' ? '🎨' : f.status === 'Planned' ? '📋' : '🔬'} ${f.status}
            </span>
            <div class="future-quarter">Target: ${f.quarter}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ── Search ────────────────────────────────────────────────────
function bindSearch() {
  const input = document.getElementById('globalSearch');
  if (!input) return;
  input.addEventListener('input', e => {
    state.searchQuery = e.target.value;
    if (state.searchQuery.length > 0) {
      showPage('tools');
      buildToolsGrid();
    } else {
      buildToolsGrid();
    }
  });
}

// ── Hamburger ─────────────────────────────────────────────────
function bindHamburger() {
  const btn = document.getElementById('hamburger');
  const overlay = document.getElementById('sidebarOverlay');
  if (btn) btn.addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('open');
    overlay?.classList.toggle('show');
  });
  overlay?.addEventListener('click', closeSidebar);
}
function closeSidebar() {
  document.querySelector('.sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('show');
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(message, icon = '✅') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerHTML = `<span class="toast-icon">${icon}</span>${message}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
