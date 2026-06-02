// ── AthletX Alpine.js Global Components ───────────────────────────────────────

document.addEventListener('alpine:init', () => {

  // ── App Shell (mobile sidebar toggle) ─────────────────────────────────────
  Alpine.data('appShell', () => ({
    sidebarOpen: false,
    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; },
    closeSidebar() { this.sidebarOpen = false; },
  }));

});

// ── Sidebar Accordion ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  // Only these sections are collapsible (Main & Players always visible)
  const collapsible = [
    'Coach Management',
    'Analytics',
    'Revenue',
    'Coach Tiers',
    'Shop',
    'Support',
    'Settings',
  ];

  let openWrapper = null;
  let openArrow   = null;

  sidebar.querySelectorAll('.sb-section').forEach(section => {
    const label = section.querySelector('.sb-label');
    if (!label) return;
    if (!collapsible.includes(label.textContent.trim())) return;

    // ── Wrap all non-label children ──────────────────────────────────────────
    const items = Array.from(section.children).filter(
      el => !el.classList.contains('sb-label')
    );
    const wrapper = document.createElement('div');
    wrapper.className = 'sb-collapse';
    items.forEach(item => wrapper.appendChild(item));
    section.appendChild(wrapper);

    // ── Arrow indicator ──────────────────────────────────────────────────────
    const arrow = document.createElement('span');
    arrow.className = 'sb-arrow';
    label.appendChild(arrow);
    label.classList.add('sb-label-toggle');

    // ── Auto-open if this section contains the active page ───────────────────
    if (wrapper.querySelector('.active')) {
      wrapper.classList.add('open');
      arrow.textContent = '▾';
      openWrapper = wrapper;
      openArrow   = arrow;
    } else {
      arrow.textContent = '›';
    }

    // ── Click to accordion-toggle ────────────────────────────────────────────
    label.addEventListener('click', () => {
      const isOpen = wrapper.classList.contains('open');

      // Close the currently open section
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

// ── Chip / Tab toggling (date-chip, month-chip, window-chip, .chip) ───────────
document.addEventListener('click', function (e) {
  const chipTypes = ['date-chip', 'month-chip', 'window-chip', 'chip'];
  for (const type of chipTypes) {
    if (e.target.classList.contains(type)) {
      const siblings = e.target.parentElement.querySelectorAll('.' + type);
      siblings.forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      break;
    }
  }
});

// ── Inline filter button groups ───────────────────────────────────────────────
document.addEventListener('click', function (e) {
  const btn = e.target.closest('.filter-group .btn-outline');
  if (!btn) return;
  btn.closest('.filter-group').querySelectorAll('.btn-outline').forEach(b => {
    b.style.background   = '#e8e8e8';
    b.style.borderColor  = '#ccc';
    b.style.fontWeight   = '400';
  });
  btn.style.background  = '#bbb';
  btn.style.borderColor = '#999';
  btn.style.fontWeight  = '600';
});
