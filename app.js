// ── AthletX Alpine.js Global Components ───────────────────────────────────────

document.addEventListener('alpine:init', () => {

  // ── App Shell (sidebar toggle) ─────────────────────────────────────────────
  Alpine.data('appShell', () => ({
    sidebarOpen: false,
    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; },
    closeSidebar() { this.sidebarOpen = false; },
  }));

});

// ── Chip / Tab toggling (date-chip, month-chip, window-chip, .chip) ───────────
document.addEventListener('click', function(e) {
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

// ── Inline filter button groups (All Types / Coach Only etc.) ─────────────────
// These are btn-outline buttons with a shared parent .toolbar or similar
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.filter-group .btn-outline');
  if (!btn) return;
  btn.closest('.filter-group').querySelectorAll('.btn-outline').forEach(b => {
    b.style.background = '#e8e8e8';
    b.style.borderColor = '#ccc';
    b.style.fontWeight = '400';
  });
  btn.style.background = '#bbb';
  btn.style.borderColor = '#999';
  btn.style.fontWeight = '600';
});
