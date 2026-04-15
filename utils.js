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
