// ═══════════════════════════════════════════════════
// utils.js — Áudio de Qualidade
// Funções utilitárias compartilhadas por todos os apps.
// ═══════════════════════════════════════════════════

// ── Escape HTML ──────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Formatação de data ───────────────────────────────
// Converte YYYY-MM-DD → DD/MM/YYYY. Retorna '—' se vazio.
function fmtData(str) {
  if (!str) return '—';
  try {
    var parts = str.split('-');
    if (parts.length === 3) return parts[2] + '/' + parts[1] + '/' + parts[0];
  } catch (e) {}
  return str;
}

// ── Formatação de moeda ──────────────────────────────
// Formata número como "1.500,00" (sem prefixo R$).
function formatBRL(n) {
  return Number(n).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Com prefixo R$: frs(1500) → "R$ 1.500,00"
function frs(v) {
  return 'R$ ' + formatBRL(v);
}

// Versão curta: 1.500 → R$ 1,5K | 2.000.000 → R$ 2M
function frsShort(v) {
  if (v >= 1000000) return 'R$ ' + (v / 1000000).toFixed(1).replace('.', ',') + 'M';
  if (v >= 1000)    return 'R$ ' + (v / 1000).toFixed(1).replace('.', ',') + 'K';
  return frs(v);
}

// ── Parse de valor monetário ─────────────────────────
// Aceita: "R$ 1.500,00" | "1500.00" | "1500,00" → 1500
function parseBRL(v) {
  if (!v) return 0;
  var clean = String(v).trim().replace(/[^\d,.]/g, '').replace(/\./g, '').replace(',', '.');
  return parseFloat(clean) || 0;
}

// ── Tema dia / noite ─────────────────────────────────
var _svgSol = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
var _svgLua = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

function toggleTheme() {
  var isLight = document.documentElement.classList.toggle('light-theme');
  localStorage.setItem('adq-tema', isLight ? 'light' : 'dark');
  _syncBtnTema(isLight);
}

function _syncBtnTema(isLight) {
  document.querySelectorAll('.btn-tema').forEach(function(btn) {
    btn.innerHTML = isLight ? _svgLua : _svgSol;
    btn.title = isLight ? 'Tema escuro' : 'Tema claro';
  });
}

// Anti-flash: aplica classe antes do render
(function() {
  if (localStorage.getItem('adq-tema') === 'light') {
    document.documentElement.classList.add('light-theme');
  }
})();

// Sincroniza ícone do botão após DOM pronto
document.addEventListener('DOMContentLoaded', function() {
  _syncBtnTema(document.documentElement.classList.contains('light-theme'));
});
