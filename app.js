// ── AthletX Admin — app.js ────────────────────────────────────────────────────

// ════════════════════════════════════════════════════════
//  1. Alpine: App Shell (mobile sidebar)
// ════════════════════════════════════════════════════════
document.addEventListener('alpine:init', () => {
  Alpine.data('appShell', () => ({
    sidebarOpen: false,
    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; },
    closeSidebar()  { this.sidebarOpen = false; },
  }));
});

// ════════════════════════════════════════════════════════
//  2. Sidebar Accordion
// ════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  const collapsible = [
    'Coach Management', 'Analytics', 'Revenue',
    'Coach Tiers', 'Shop', 'Support', 'Settings',
  ];

  let openWrapper = null;
  let openArrow   = null;

  sidebar.querySelectorAll('.sb-section').forEach(section => {
    const label = section.querySelector('.sb-label');
    if (!label || !collapsible.includes(label.textContent.trim())) return;

    const items = Array.from(section.children).filter(
      el => !el.classList.contains('sb-label')
    );
    const wrapper = document.createElement('div');
    wrapper.className = 'sb-collapse';
    items.forEach(item => wrapper.appendChild(item));
    section.appendChild(wrapper);

    const arrow = document.createElement('span');
    arrow.className = 'sb-arrow';
    label.appendChild(arrow);
    label.classList.add('sb-label-toggle');

    if (wrapper.querySelector('.active')) {
      wrapper.classList.add('open');
      arrow.textContent = '▾';
      openWrapper = wrapper;
      openArrow   = arrow;
    } else {
      arrow.textContent = '›';
    }

    label.addEventListener('click', () => {
      const isOpen = wrapper.classList.contains('open');
      if (openWrapper && openWrapper !== wrapper) {
        openWrapper.classList.remove('open');
        if (openArrow) openArrow.textContent = '›';
      }
      if (!isOpen) {
        wrapper.classList.add('open');
        arrow.textContent = '▾';
        openWrapper = wrapper;
        openArrow   = arrow;
      } else {
        wrapper.classList.remove('open');
        arrow.textContent = '›';
        openWrapper = null;
        openArrow   = null;
      }
    });
  });
});

// ════════════════════════════════════════════════════════
//  3. Toolbar search DIVs → real inputs
// ════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('div.toolbar-search').forEach(div => {
    const input = document.createElement('input');
    input.type        = 'text';
    input.placeholder = 'Search…';
    input.className   = 'toolbar-search-input-sm';
    div.parentNode.replaceChild(input, div);
  });
});

// ════════════════════════════════════════════════════════
//  4. Live table row filtering
// ════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  function findNearestTable(input) {
    let el = input.parentElement;
    while (el) {
      const tbl = el.querySelector('table');
      if (tbl) return tbl;
      el = el.nextElementSibling;
    }
    return document.querySelector('table');
  }

  function wireSearch(input) {
    const table = findNearestTable(input);
    if (!table) return;
    const paginationSpan = document.querySelector('.pagination > span');
    const originalCount  = paginationSpan ? paginationSpan.textContent : '';

    input.addEventListener('input', function () {
      const q = this.value.toLowerCase().trim();
      let visible = 0;
      table.querySelectorAll('tbody tr').forEach(row => {
        const match = !q || row.textContent.toLowerCase().includes(q);
        row.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      if (paginationSpan) {
        paginationSpan.textContent = q
          ? `${visible} result${visible !== 1 ? 's' : ''} for "${this.value}"`
          : originalCount;
      }
    });
  }

  const topbarInput = document.querySelector('.topbar-search-input');
  if (topbarInput) wireSearch(topbarInput);
  document.querySelectorAll('.toolbar-search-input-sm').forEach(wireSearch);
});

// ════════════════════════════════════════════════════════
//  5. Sortable table columns
// ════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('table').forEach(table => {
    const tbody   = table.querySelector('tbody');
    const headers = table.querySelectorAll('thead th');
    if (!tbody || !headers.length) return;

    let sortCol = -1;
    let sortDir = 1;

    headers.forEach((th, i) => {
      if (!th.textContent.trim()) return;
      th.classList.add('sortable');
      const indicator = document.createElement('span');
      indicator.className = 'sort-indicator';
      th.appendChild(indicator);

      th.addEventListener('click', () => {
        headers.forEach(h => {
          const ind = h.querySelector('.sort-indicator');
          if (ind) ind.textContent = '';
          h.classList.remove('sort-asc', 'sort-desc');
        });
        sortDir = (sortCol === i) ? sortDir * -1 : 1;
        sortCol = i;
        indicator.textContent = sortDir === 1 ? ' ↑' : ' ↓';
        th.classList.add(sortDir === 1 ? 'sort-asc' : 'sort-desc');

        const rows = Array.from(tbody.querySelectorAll('tr'));
        rows.sort((a, b) => {
          const aVal = (a.cells[i]?.textContent || '').trim();
          const bVal = (b.cells[i]?.textContent || '').trim();
          const aNum = parseFloat(aVal.replace(/[$,%\s]/g, '').replace(/,/g, ''));
          const bNum = parseFloat(bVal.replace(/[$,%\s]/g, '').replace(/,/g, ''));
          if (!isNaN(aNum) && !isNaN(bNum)) return (aNum - bNum) * sortDir;
          return aVal.localeCompare(bVal) * sortDir;
        });
        rows.forEach(row => tbody.appendChild(row));
      });
    });
  });
});

// ════════════════════════════════════════════════════════
//  6. Pagination
// ════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.pagination').forEach(pagination => {
    const allBtns = Array.from(pagination.querySelectorAll('.page-btn'));
    if (!allBtns.length) return;

    function setActive(btn) {
      allBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    allBtns.forEach(btn => {
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', () => {
        const t = btn.textContent.trim();
        if (t === '›') {
          const cur  = pagination.querySelector('.page-btn.active');
          const idx  = allBtns.indexOf(cur);
          const next = allBtns.slice(idx + 1).find(b => !isNaN(parseInt(b.textContent.trim())));
          if (next) setActive(next);
        } else if (t === '‹') {
          const cur  = pagination.querySelector('.page-btn.active');
          const idx  = allBtns.indexOf(cur);
          const prev = allBtns.slice(0, idx).reverse().find(b => !isNaN(parseInt(b.textContent.trim())));
          if (prev) setActive(prev);
        } else if (!isNaN(parseInt(t))) {
          setActive(btn);
        }
      });
    });
  });
});

// ════════════════════════════════════════════════════════
//  PHASE 5 — Dashboard Live Feel
// ════════════════════════════════════════════════════════

// ── 5a. KPI count-up animation (all pages with .kpi-value) ──
document.addEventListener('DOMContentLoaded', function () {
  function countUp(el) {
    const raw     = el.textContent.trim();
    const prefix  = raw.startsWith('$') ? '$' : '';
    const suffix  = raw.endsWith('%')   ? '%' : (raw.endsWith('mo') ? 'mo' : (raw.endsWith('d') && !raw.includes('.') ? 'd' : ''));
    const cleaned = raw.replace(/[$,%]/g, '').replace(/[a-z]/g, '').replace(/,/g, '');
    const target  = parseFloat(cleaned);
    if (isNaN(target)) return;

    const isDecimal = raw.includes('.');
    const duration  = 900; // ms
    const start     = performance.now();

    el.textContent = prefix + '0' + suffix;

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current  = target * ease;
      const formatted = current >= 1000
        ? Math.round(current).toLocaleString()
        : isDecimal ? current.toFixed(1) : Math.round(current).toString();
      el.textContent = prefix + formatted + suffix;
      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = raw; // restore original exact text
    }
    requestAnimationFrame(frame);
  }

  // Small stagger so cards animate in sequence
  document.querySelectorAll('.kpi-value, .snap-value').forEach((el, i) => {
    setTimeout(() => countUp(el), i * 80);
  });
});

// ── 5b. Chart bar grow animation ─────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  const bars = document.querySelectorAll('.bar-a, .bar-b');
  if (!bars.length) return;

  // Store target heights and reset to 0
  bars.forEach(bar => {
    bar.dataset.targetH = bar.style.height || '0px';
    bar.style.height    = '0px';
    bar.style.transition = 'height 0.5s ease';
  });

  // Stagger grow-in
  bars.forEach((bar, i) => {
    setTimeout(() => {
      bar.style.height = bar.dataset.targetH;
    }, 100 + i * 40);
  });
});

// ── 5c. Dashboard-specific wiring ────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  const isDashboard = !!document.querySelector('.chart-bars');
  if (!isDashboard) return;

  // Alert banner: inject dismiss X button
  const alertBar = document.querySelector('a.alert-bar');
  if (alertBar) {
    const closeBtn = document.createElement('span');
    closeBtn.textContent = '✕';
    closeBtn.className   = 'alert-close';
    alertBar.appendChild(closeBtn);

    closeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      alertBar.style.transition = 'opacity 0.25s, max-height 0.3s, margin 0.3s, padding 0.3s';
      alertBar.style.opacity    = '0';
      alertBar.style.maxHeight  = alertBar.offsetHeight + 'px';
      requestAnimationFrame(() => {
        alertBar.style.maxHeight = '0';
        alertBar.style.padding   = '0';
        alertBar.style.margin    = '0';
        alertBar.style.overflow  = 'hidden';
      });
      setTimeout(() => alertBar.remove(), 320);
      showToast('Alert dismissed', 'info');
    });
  }

  // "Full analytics →" → coach-performance
  const fullAnalytics = document.querySelector('.chart-total');
  if (fullAnalytics) {
    fullAnalytics.style.cursor = 'pointer';
    fullAnalytics.style.textDecoration = 'none';
    fullAnalytics.addEventListener('click', () => {
      window.location.href = 'coach-performance.html';
    });
  }

  // "View all →" in Top Coaches card-head → coach-list
  document.querySelectorAll('.card-head-sub').forEach(el => {
    if (el.textContent.includes('View all')) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => window.location.href = 'coach-list.html');
    }
  });

  // "All pending actions →" in snapshot → pending.html
  document.querySelectorAll('.snap-row + *, [style*="border-top"]').forEach(el => {
    if (el.textContent.includes('All pending actions')) {
      el.style.cursor = 'pointer';
      el.querySelector('span') && (el.querySelector('span').style.cursor = 'pointer');
      el.addEventListener('click', () => window.location.href = 'pending.html');
    }
  });

  // "View All 23 Pending Actions" btn-all
  document.querySelectorAll('.btn-all').forEach(btn => {
    if (btn.textContent.includes('Pending Actions')) {
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', () => window.location.href = 'pending.html');
    }
  });

  // Pending Actions "Review →" spans → respective pages
  const paLinks = {
    'Coach Verification': 'pending-verifications.html',
    'Refund':             'refunds.html',
    'Reported Content':   'reported-content.html',
    'Inventory':          'inventory-alerts.html',
    'Support Ticket':     'support-tickets.html',
    'Price Change':       'price-changes.html',
  };
  document.querySelectorAll('.pa-row').forEach(row => {
    const text    = row.querySelector('.pa-left')?.textContent || '';
    const reviewEl = row.querySelector('.pa-link');
    if (!reviewEl) return;

    for (const [key, url] of Object.entries(paLinks)) {
      if (text.includes(key)) {
        reviewEl.style.cursor = 'pointer';
        reviewEl.style.textDecoration = 'none';
        reviewEl.addEventListener('click', () => window.location.href = url);
        row.style.cursor = 'pointer';
        row.addEventListener('click', (e) => {
          if (!e.target.closest('a')) window.location.href = url;
        });
        break;
      }
    }
  });

  // Snapshot rows → clickable links
  const snapLinks = {
    'New Players':            'player-list.html',
    'New Coaches':            'coach-list.html',
    'Pending Verifications':  'pending-verifications.html',
    'Open Support Tickets':   'support-tickets.html',
    'Inventory Alerts':       'inventory-alerts.html',
    'Reported Content':       'reported-content.html',
  };
  document.querySelectorAll('.snap-row').forEach(row => {
    const label = row.querySelector('.snap-label')?.textContent.trim();
    const url   = snapLinks[label];
    if (!url) return;
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => window.location.href = url);
    row.classList.add('snap-row-link');
  });
});

// ════════════════════════════════════════════════════════
//  PHASE 4 — Forms & Toggles
// ════════════════════════════════════════════════════════

// ── 4a. Toggle switches (.toggle-box) ────────────────────
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.toggle-box').forEach(toggle => {
    toggle.style.cursor = 'pointer';
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('on');
      const isOn = toggle.classList.contains('on');
      // Find the label next to the toggle
      const row  = toggle.closest('.force-row, div');
      const label = row ? (row.textContent.trim().split('\n').pop().trim() || '') : '';
      showToast(isOn ? `Enabled` : `Disabled`, 'info');
    });
  });
});

// ── 4b. Doc tabs (legal-editor, about-editor) ────────────
document.addEventListener('click', function (e) {
  if (!e.target.classList.contains('doc-tab')) return;
  const tabsContainer = e.target.closest('.doc-tabs');
  if (!tabsContainer) return;
  tabsContainer.querySelectorAll('.doc-tab').forEach(t => t.classList.remove('active'));
  e.target.classList.add('active');
  showToast(`Switched to ${e.target.textContent.trim()}`, 'info');
});

// ── 4c. Toolbar selects → real <select> elements ─────────
document.addEventListener('DOMContentLoaded', function () {
  // Generic option sets per position in toolbar
  const optSets = [
    ['All Statuses', 'Active', 'Pending', 'Inactive', 'Expired'],
    ['All Sports',   'Football', 'Basketball', 'Tennis', 'Soccer', 'Fitness', 'Swimming'],
  ];

  document.querySelectorAll('div.toolbar-select').forEach((div, idx) => {
    const sel = document.createElement('select');
    sel.className = 'toolbar-select-real';
    const opts = optSets[idx % optSets.length];
    opts.forEach(o => {
      const opt = document.createElement('option');
      opt.textContent = o;
      sel.appendChild(opt);
    });
    div.parentNode.replaceChild(sel, div);
  });
});

// ── 4d. Meta inputs → real <input> elements ───────────────
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('div.meta-input').forEach(div => {
    const input   = document.createElement('input');
    input.type    = 'text';
    input.className = 'meta-input-real';
    div.parentNode.replaceChild(input, div);
  });
});

// ── 4e. Inline filter button groups ──────────────────────
//  (btn-outline siblings with 2+ buttons — act as radio tabs)
document.addEventListener('click', function (e) {
  const btn = e.target;
  if (btn.tagName === 'A') return;
  if (!btn.classList.contains('btn-outline') && !btn.classList.contains('btn-solid')) return;

  const parent   = btn.parentElement;
  const siblings = Array.from(parent.children).filter(c =>
    (c.classList.contains('btn-outline') || c.classList.contains('btn-solid')) &&
    c.tagName !== 'A'
  );
  if (siblings.length < 2) return;

  // Reset all siblings
  siblings.forEach(s => {
    s.style.background   = '#e8e8e8';
    s.style.borderColor  = '#ccc';
    s.style.fontWeight   = '400';
    s.style.color        = '#444';
  });
  // Activate clicked
  btn.style.background  = '#bbb';
  btn.style.borderColor = '#999';
  btn.style.fontWeight  = '600';
  btn.style.color       = '#111';
});

// ── 4f. FAQ "Add Item" button ─────────────────────────────
document.addEventListener('click', function (e) {
  const btn = e.target;
  if (btn.textContent.trim() !== '+ Add FAQ Item') return;

  const faqList = document.querySelector('.faq-row')?.parentElement;
  if (!faqList) return;

  const row = document.createElement('div');
  row.className = 'faq-row';
  row.innerHTML = `
    <div class="faq-q" contenteditable="true" style="outline:1px dashed #ccc; padding:2px 4px; min-width:160px;">New FAQ question…</div>
    <div class="faq-a-bar"></div>
    <div class="faq-a-bar short"></div>
    <div class="faq-actions">
      <div class="faq-btn">Edit</div>
      <div class="faq-btn">Move Up</div>
      <div class="faq-btn">Delete</div>
    </div>`;

  // Insert before the Add button's parent
  faqList.insertBefore(row, btn.closest('div'));
  row.querySelector('[contenteditable]').focus();
  showToast('New FAQ item added', 'info');
});

// ── 4g. Editor toolbar buttons (B, I, H1, H2…) ───────────
document.addEventListener('click', function (e) {
  if (!e.target.classList.contains('et-btn')) return;
  const label = e.target.textContent.trim();
  const map   = { B:'Bold', I:'Italic', H1:'Heading 1', H2:'Heading 2',
                  List:'List', Link:'Link', Image:'Image', Preview:'Preview mode' };
  showToast(map[label] || label, 'info');
});

// ════════════════════════════════════════════════════════
//  7. Chip / Tab toggling
// ════════════════════════════════════════════════════════
document.addEventListener('click', function (e) {
  const chipTypes = ['date-chip', 'month-chip', 'window-chip', 'chip'];
  for (const type of chipTypes) {
    if (e.target.classList.contains(type)) {
      e.target.parentElement.querySelectorAll('.' + type)
        .forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      break;
    }
  }
});

// ════════════════════════════════════════════════════════
//  8. PHASE 3 — Toast Notifications
// ════════════════════════════════════════════════════════
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: '✓', warning: '⚠', info: 'ℹ' };
  toast.textContent = `${icons[type] || '✓'}  ${message}`;
  container.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => toast.classList.add('toast-show'));

  setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ════════════════════════════════════════════════════════
//  9. PHASE 3 — Confirm Modal
// ════════════════════════════════════════════════════════
function showConfirm(message, confirmLabel, onConfirm) {
  let overlay = document.querySelector('.confirm-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-box">
        <div class="confirm-message"></div>
        <div class="confirm-note">This action cannot be undone.</div>
        <div class="confirm-actions">
          <button class="confirm-cancel">Cancel</button>
          <button class="confirm-ok"></button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('.confirm-cancel').addEventListener('click', () => {
      overlay.classList.remove('open');
    });
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  }

  overlay.querySelector('.confirm-message').textContent = message;
  const okBtn = overlay.querySelector('.confirm-ok');
  okBtn.textContent = confirmLabel;

  // Clone to remove old listeners
  const newOk = okBtn.cloneNode(true);
  okBtn.replaceWith(newOk);
  newOk.addEventListener('click', () => {
    overlay.classList.remove('open');
    onConfirm();
  });

  overlay.classList.add('open');
}

// ════════════════════════════════════════════════════════
//  10. PHASE 3 — Action Helpers
// ════════════════════════════════════════════════════════
function dimRow(el) {
  const row = el.closest('tr');
  if (row) {
    row.style.transition = 'opacity 0.3s';
    row.style.opacity = '0.45';
    row.querySelectorAll('.btn-approve, .btn-reject, .btn-outline, .btn-solid, button')
      .forEach(b => { b.style.opacity = '0.3'; b.style.pointerEvents = 'none'; });
  }
}

function removeCard(el) {
  const card = el.closest('.verification-card, .alert-card, .pa-row, tr');
  if (!card) return;
  card.style.transition = 'opacity 0.25s, max-height 0.3s, padding 0.3s, margin 0.3s';
  card.style.opacity    = '0';
  card.style.maxHeight  = card.offsetHeight + 'px';
  requestAnimationFrame(() => {
    card.style.maxHeight = '0';
    card.style.padding   = '0';
    card.style.margin    = '0';
    card.style.overflow  = 'hidden';
  });
  setTimeout(() => card.remove(), 350);
}

function updateStatusTag(el, label) {
  const row = el.closest('tr');
  if (!row) return;
  const tag = row.querySelector('.status-tag, .pa-tag');
  if (tag) { tag.textContent = label; tag.style.background = '#d0d0d0'; tag.style.color = '#333'; }
}

// ════════════════════════════════════════════════════════
//  11. PHASE 3 — Action Button Event Delegation
// ════════════════════════════════════════════════════════
document.addEventListener('click', function (e) {
  const target = e.target;

  // Skip real navigation links
  if (target.tagName === 'A' || target.closest('a[href]')) return;

  const text = target.textContent.trim();
  const cls  = target.className || '';

  // ── Approve ────────────────────────────────────────────
  if (text === 'Approve' || cls.includes('btn-approve')) {
    updateStatusTag(target, 'Approved');
    dimRow(target);
    showToast('Approved successfully');
    return;
  }

  // ── Approve Refund / Approve Selected ─────────────────
  if (text === 'Approve Refund' || text.startsWith('Approve $')) {
    showConfirm('Approve this refund?', 'Approve', () => {
      dimRow(target);
      showToast('Refund approved');
    });
    return;
  }
  if (text === 'Approve Selected') {
    showConfirm('Approve all selected applications?', 'Approve All', () => {
      showToast('Selected coaches approved');
    });
    return;
  }

  // ── Reject ─────────────────────────────────────────────
  if (text === 'Reject' || cls.includes('btn-reject')) {
    showConfirm('Reject this application?', 'Reject', () => {
      updateStatusTag(target, 'Rejected');
      dimRow(target);
      showToast('Application rejected', 'warning');
    });
    return;
  }
  if (text === 'Reject Selected') {
    showConfirm('Reject all selected applications?', 'Reject All', () => {
      showToast('Selected coaches rejected', 'warning');
    });
    return;
  }
  if (text === 'Reject Application') {
    showConfirm('Reject this coach application?', 'Reject', () => {
      showToast('Application rejected', 'warning');
    });
    return;
  }

  // ── Dismiss ────────────────────────────────────────────
  if (text === 'Dismiss') {
    removeCard(target);
    showToast('Alert dismissed', 'info');
    return;
  }
  if (text === 'Dismiss All') {
    showConfirm('Dismiss all alerts?', 'Dismiss All', () => {
      document.querySelectorAll('.alert-card').forEach(c => {
        c.style.transition = 'opacity 0.3s';
        c.style.opacity = '0';
        setTimeout(() => c.remove(), 300);
      });
      showToast('All alerts dismissed', 'info');
    });
    return;
  }

  // ── Remove (reported content) ──────────────────────────
  if (text === 'Remove') {
    showConfirm('Remove this content from the platform?', 'Remove', () => {
      removeCard(target);
      showToast('Content removed', 'warning');
    });
    return;
  }

  // ── Suspend ────────────────────────────────────────────
  if (text === 'Suspend') {
    showConfirm('Suspend this account? They will lose access immediately.', 'Suspend', () => {
      dimRow(target);
      showToast('Account suspended', 'warning');
    });
    return;
  }

  // ── Save Changes ───────────────────────────────────────
  if (text === 'Save Changes' || text === 'Save Settings') {
    showToast('Changes saved successfully');
    return;
  }

  // ── Save Draft ─────────────────────────────────────────
  if (text === 'Save Draft') {
    showToast('Draft saved', 'info');
    return;
  }

  // ── Publish ────────────────────────────────────────────
  if (text === 'Publish') {
    showConfirm('Publish this page? It will be visible to all users.', 'Publish', () => {
      showToast('Published successfully');
    });
    return;
  }
  if (text === 'Publish Now') {
    showConfirm('Publish this post now?', 'Publish Now', () => {
      showToast('Post published');
    });
    return;
  }
  if (text === 'Publish Product') {
    showConfirm('Publish this product to the shop?', 'Publish', () => {
      showToast('Product published to shop');
    });
    return;
  }

  // ── Mark All Paid ──────────────────────────────────────
  if (text === 'Mark All Paid') {
    showConfirm('Mark all pending commissions as paid?', 'Confirm', () => {
      document.querySelectorAll('.status-tag').forEach(tag => {
        if (tag.textContent.trim() === 'Pending') {
          tag.textContent = 'Paid';
          tag.style.background = '#d0d0d0';
        }
      });
      showToast('All commissions marked as paid');
    });
    return;
  }

  // ── Mark Resolved ──────────────────────────────────────
  if (text === 'Mark Resolved') {
    showToast('Ticket marked as resolved');
    dimRow(target);
    return;
  }

  // ── Close Ticket ───────────────────────────────────────
  if (text === 'Close Ticket') {
    showConfirm('Close this support ticket?', 'Close Ticket', () => {
      showToast('Ticket closed', 'info');
    });
    return;
  }

  // ── Send Reply ─────────────────────────────────────────
  if (text === 'Send Reply') {
    showToast('Reply sent');
    return;
  }

  // ── Send Now (push notification) ───────────────────────
  if (text === 'Send Now') {
    showConfirm('Send this push notification to all users?', 'Send Now', () => {
      showToast('Push notification sent');
    });
    return;
  }

  // ── Approve & Schedule (payout) ────────────────────────
  if (text === 'Approve & Schedule' || text === 'Approve &amp; Schedule') {
    showConfirm('Approve and schedule this payout run?', 'Confirm', () => {
      showToast('Payout scheduled successfully');
    });
    return;
  }

  // ── Cancel Plan ────────────────────────────────────────
  if (text === 'Cancel Plan') {
    showConfirm('Cancel this subscription plan? The player will lose access at period end.', 'Cancel Plan', () => {
      showToast('Plan cancelled', 'warning');
    });
    return;
  }

  // ── Disable Auto-Renew ─────────────────────────────────
  if (text === 'Disable Auto-Renew') {
    showConfirm('Disable auto-renewal for this subscription?', 'Disable', () => {
      showToast('Auto-renewal disabled', 'warning');
    });
    return;
  }

  // ── Run Reset (tier settings) ──────────────────────────
  if (text === 'Run Reset') {
    showConfirm('Run a full tier reset? This will re-evaluate all coaches against current thresholds.', 'Run Reset', () => {
      showToast('Tier reset running…', 'info');
    });
    return;
  }

  // ── Restore (reported content) ─────────────────────────
  if (text === 'Restore') {
    showToast('Content restored', 'info');
    dimRow(target);
    return;
  }

  // ── Deactivate ─────────────────────────────────────────
  if (text === 'Deactivate') {
    showConfirm('Deactivate this item?', 'Deactivate', () => {
      dimRow(target);
      showToast('Deactivated', 'warning');
    });
    return;
  }

  // ── Purge Cache ────────────────────────────────────────
  if (text === 'Purge Cache') {
    showConfirm('Purge the platform cache?', 'Purge', () => {
      showToast('Cache purged successfully', 'info');
    });
    return;
  }

  // ── Notify Customer / Notify Referrers ─────────────────
  if (text === 'Notify Customer' || text === 'Notify Referrers') {
    showToast('Notification sent', 'info');
    return;
  }

  // ── Generate Report ────────────────────────────────────
  if (text === 'Generate Report') {
    showToast('Generating report…', 'info');
    return;
  }

  // ── Run Payout Now ─────────────────────────────────────
  if (text === 'Run Payout Now') {
    showConfirm('Run payouts now for all pending coaches?', 'Run Payout', () => {
      showToast('Payout run initiated');
    });
    return;
  }

  // ── Issue Refund (already a link, but just in case) ────
  if (text === 'Issue Refund') {
    showToast('Refund initiated', 'info');
    return;
  }
});
