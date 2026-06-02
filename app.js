// ── AthletX Admin — app.js ────────────────────────────────────────────────────

// ── 1. Alpine: App Shell (mobile sidebar) ─────────────────────────────────────
document.addEventListener('alpine:init', () => {
  Alpine.data('appShell', () => ({
    sidebarOpen: false,
    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; },
    closeSidebar()  { this.sidebarOpen = false; },
  }));
});

// ── 2. Sidebar Accordion ──────────────────────────────────────────────────────
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

    // Wrap non-label children
    const items = Array.from(section.children).filter(
      el => !el.classList.contains('sb-label')
    );
    const wrapper = document.createElement('div');
    wrapper.className = 'sb-collapse';
    items.forEach(item => wrapper.appendChild(item));
    section.appendChild(wrapper);

    // Arrow
    const arrow = document.createElement('span');
    arrow.className = 'sb-arrow';
    label.appendChild(arrow);
    label.classList.add('sb-label-toggle');

    // Auto-open active section
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

// ── 3. Convert toolbar-search DIVs → real inputs ──────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('div.toolbar-search').forEach(div => {
    const input = document.createElement('input');
    input.type        = 'text';
    input.placeholder = 'Search…';
    input.className   = 'toolbar-search-input-sm';
    div.parentNode.replaceChild(input, div);
  });
});

// ── 4. Live table row filtering ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  // Find the table closest to a search input in the DOM
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
    let originalCount = '';
    if (paginationSpan) originalCount = paginationSpan.textContent;

    input.addEventListener('input', function () {
      const q = this.value.toLowerCase().trim();
      let visible = 0;

      table.querySelectorAll('tbody tr').forEach(row => {
        const match = !q || row.textContent.toLowerCase().includes(q);
        row.style.display = match ? '' : 'none';
        if (match) visible++;
      });

      // Update pagination text
      if (paginationSpan) {
        if (q) {
          paginationSpan.textContent =
            `${visible} result${visible !== 1 ? 's' : ''} for "${this.value}"`;
        } else {
          paginationSpan.textContent = originalCount;
        }
      }
    });
  }

  // Wire the topbar search input (already an <input>)
  const topbarInput = document.querySelector('.topbar-search-input');
  if (topbarInput) wireSearch(topbarInput);

  // Wire all toolbar search inputs (converted above)
  document.querySelectorAll('.toolbar-search-input-sm').forEach(wireSearch);
});

// ── 5. Sortable table columns ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('table').forEach(table => {
    const tbody   = table.querySelector('tbody');
    const headers = table.querySelectorAll('thead th');
    if (!tbody || !headers.length) return;

    let sortCol = -1;
    let sortDir = 1; // 1 = asc, -1 = desc

    headers.forEach((th, i) => {
      const text = th.textContent.trim();
      if (!text) return; // skip empty/action columns

      th.classList.add('sortable');

      // Sort indicator span
      const indicator = document.createElement('span');
      indicator.className = 'sort-indicator';
      indicator.textContent = '';
      th.appendChild(indicator);

      th.addEventListener('click', () => {
        // Reset all indicators
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

          // Numeric sort (handles $, %, commas)
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

// ── 6. Pagination ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.pagination').forEach(pagination => {
    const allBtns = Array.from(pagination.querySelectorAll('.page-btn'));
    if (!allBtns.length) return;

    const numberedBtns = allBtns.filter(b => !isNaN(parseInt(b.textContent.trim())));

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

// ── 7. Chip / Tab toggling ────────────────────────────────────────────────────
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

// ── 8. Inline filter button groups ───────────────────────────────────────────
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.filter-group .btn-outline');
  if (!btn) return;
  btn.closest('.filter-group').querySelectorAll('.btn-outline').forEach(b => {
    b.style.background  = '#e8e8e8';
    b.style.borderColor = '#ccc';
    b.style.fontWeight  = '400';
  });
  btn.style.background  = '#bbb';
  btn.style.borderColor = '#999';
  btn.style.fontWeight  = '600';
});
