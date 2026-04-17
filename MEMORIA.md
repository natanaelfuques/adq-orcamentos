# Memória do Projeto — Áudio de Qualidade
*Atualizado: 2026-04-16 — versão estável confirmada por Natanael*

---

## Empresa
- **Nome:** Áudio de Qualidade
- **Dono:** Natanael (audiodequalidadebox@gmail.com)
- **Segmento:** Eventos (áudio, som, iluminação)
- **Preferência de resposta:** Prático e objetivo, foco no crescimento da empresa
- **Idioma:** Português (sempre)

---

## Projeto: App Web de Gestão

### Repositório GitHub
- URL: `https://github.com/natanaelfuques/adq-orcamentos`
- Branch: `main`
- Pasta de entrega: `AdQ` (montada no Cowork em `/sessions/.../mnt/AdQ`)
- Repo local para git: `/sessions/trusting-cool-shannon/git-push/`
- PAT mais recente: `ghp_****` (não salvar token aqui — pedir para Natanael quando precisar)
- Para subir: copiar arquivo para `/git-push/` → `git add` → `git commit` → `git push https://<PAT>@github.com/...`

### Firebase
- **Projeto:** `adq-orcamentos`
- **API Key:** `AIzaSyBX7qH0fY990F73VWlL7aTbSyG-OKsqkoY`
- **Auth Domain:** `adq-orcamentos.firebaseapp.com`
- **Project ID:** `adq-orcamentos`
- **App ID:** `1:3618259495:web:4b749f1c9124f9c243c402`
- **SDK:** Firebase 9.x/10.x compat. `orcamento-view.html` usa Firebase 8.x (manter separado)
- **Coleções Firestore:** `orcamentos`, `_contratos`, `_notas`, `eventos_campo`, `logs_ip`, `acessos_painel`, `configuracoes`

---

## Arquivos do Projeto

| Arquivo | Cor principal | Função |
|---|---|---|
| `index.html` | Amarelo `#C8A94A` | Orçamentos, contratos, eventos rápidos (app principal) |
| `painel_eventos.html` | Roxo | Painel kanban de eventos |
| `relatorios.html` | Verde | Relatórios financeiros e gestão de pagamentos |
| `estoque.html` | Azul | Controle de estoque |
| `orcamento-view.html` | Amarelo | Visualização pública de orçamentos (Firebase 8.x) |
| `firebase-config.js` | — | Config Firebase compartilhada |
| `utils.js` | — | Funções utilitárias compartilhadas |
| `styles.css` | — | CSS base compartilhado |

### Cada HTML:
- Importa `styles.css`, `firebase-config.js`, `utils.js`
- Sobrescreve `--gold` no `:root` com sua cor principal
- Mantém CSS e JS específicos inline

---

## Terminologia — IMPORTANTE

- **"nota"** foi renomeado para **"evento rápido"** em todos os textos visíveis ao usuário
- NÃO renomear: nomes de variáveis, coleções Firestore (`_notas`, `nota_id`), atributos HTML (`data-nota-id`), lógica JS
- Só trocar: textos de UI (labels, alerts, confirms, placeholders, toasts)

---

## utils.js — Funções disponíveis

```javascript
esc(str)          // Escape HTML
fmtData(str)      // YYYY-MM-DD → DD/MM/YYYY | '—' se vazio
formatBRL(n)      // número → "1.500,00" (sem R$)
frs(v)            // número → "R$ 1.500,00"
frsShort(v)       // número → "R$ 1,5K" ou "R$ 2M"
parseBRL(v)       // "R$ 1.500,00" → 1500
```

---

## Módulo de Pagamentos (relatorios.html)

### Campos no Firestore (por evento/contrato)
```
pgto_registros        // array: [{parcela_idx, valor, data, marcadoEm}]
pgto_alertas          // array: [{parcela_idx, motivo, data}]
pgto_parcelas_custom  // array: [{label, valor, vencimento}]
pgto_valor_avulso     // override manual do total pago
```

### Funções-chave
```javascript
getTotalPagoAuto(ev)              // total pago = registros + vencimentos passados automáticos
isParcelaPagaAuto(parcela,ev,hoje)// true se pago por data ou em pgto_registros
getStatusPgto(ev)                 // 'quitado' | 'parcial' | 'pendente' | 'alerta'
toggleAlertaChip(e,docId,idx)     // chip 4 estados: alerta→resolve, manual→desmarca, data→problema, pendente→marca
toggleParcelaModal(docId,idx)     // mesma lógica, fecha+reabre modal após ação
distribuirAutomatico(docId,total) // auto-calcula parcelas mensais até (data evento - 5 dias)
_pgtoRefreshCardDOM(docId)        // atualiza card in-place sem re-render
filtroPgto(filtro)                // filtra lista; sem botões, usa só cards KPI
```

### Lógica de cores dos cards de pagamento
```javascript
const isQuitado = restante <= 0 || status === 'quitado'; // trata floating point
const valPagoCor = pago <= 0 ? 'var(--muted)' : isQuitado ? 'var(--green)' : '#F5A623'; // âmbar=parcial
const valRestaCor = isQuitado ? 'var(--green)' : (status === 'alerta' ? '#e05c5c' : 'var(--muted)');
```

### Status de pagamento
| Status | Cor | Descrição |
|---|---|---|
| `quitado` | Verde `#25D366` | Pago integralmente |
| `parcial` | Âmbar `#F5A623` | Algum valor recebido, mas incompleto |
| `pendente` | Cinza muted | Nenhum valor recebido |
| `alerta` | Vermelho `#e05c5c` | Monitoramento ativo |

---

## Estado Atual da UI (relatorios.html)

### Aba Pagamentos
- **Filtros:** Removidos. Apenas cards KPI clicáveis + busca por cliente
- **KPI cards (filtram a lista ao clicar):**
  - Total a faturar (neutro) → filtro `todos` — padrão inicial
  - Total recebido (verde) → filtro `quitados`
  - A receber (azul) → filtro `pendentes`
  - Parcial (âmbar) → filtro `parcial`
  - Monitoramento (vermelho) → filtro `monitoramento`
- **Cards de evento:** cor do valor recebido = âmbar se parcial, verde se quitado, cinza se zero
- **Modal:** valor total em destaque ao lado do nome; sem calculadora; parcelas clicáveis com toggle
- **Distribuir restante:** auto-calcula parcelas mensais; última = data evento − 5 dias; não pergunta número

### Aba Eventos
- **KPIs:** Total de eventos | Quitados (+ valor recebido) | A receber (valor + counts) | Monitoramento
- **Badge de status:** usa status de pagamento (Quitado/Parcial/Pendente/Monitorar), não mais contrato
- **Tabela:** badge `.pgto-status-badge` com mesmas cores da aba Pagamentos

### index.html
- Botão "Abrir Estoque" adicionado na aba Orçamentos (estilo azul)
- "Evento rápido" substituído nos textos visíveis (modal edição, confirm exclusão, alert de erro, fallback de nome)

---

## Decisões de Arquitetura

- Código compartilhado em `firebase-config.js`, `utils.js`, `styles.css`
- Lógica de negócio permanece inline em cada HTML
- `fmtData` em index.html retorna `'_____/_____/_________'` para vazios (usado em contratos em branco) — intencional
- `orcamento-view.html` usa aliases `escHtml`, `_parseBRL`, `_formatBRL` para compatibilidade

---

## Fluxo de Dados Principal

```
index.html → coletarDadosContrato() → Firebase: _contratos
           → buildEventoFromContrato() → Firebase: eventos_campo
           → painel_eventos.html (lê eventos_campo)
           → sincronizarPainel() (mantém eventos_campo em sync)
```

---

## Estado Atual — index.html

### Swipe mobile (abas Orçamento / Salvos / Contrato)
- Swipe horizontal com `e.preventDefault()` só quando `isHorizontal === true` → scroll vertical nativo funciona normalmente
- `getTrackWidth()` usa `getBoundingClientRect().width` do `#swipe-container` (não `window.innerWidth`)
- Listener `resize` reposiciona o painel ao rotacionar a tela
- `touchstart` ignora toques que começam em `#salvos-swipe-track` ou `#meta-notif-banner`
- `touchend` sempre chama `goToVirtual(currentIdx, true)` para snap-back, inclusive no painel salvos (phys=1)
- **ATENÇÃO:** botão dia/noite (tema claro) foi **removido** de todos os apps — causava bugs no swipe. Commit de referência: `e0ed665` (versão pré-tema)

### Campo Data de Término (orçamento)
- Checkbox "Evento com mais de um dia" **removido**
- Campo `data_fim` sempre visível ao lado de `data_evento` (grid 2 colunas: `data | datafim`, depois `whats` full-width)
- Funciona igual no mobile (grid 2 colunas, não flex-column)
- Se `data_fim` vazio → comportamento idêntico ao anterior
- `multidia` nos dados salvos = `!!data_fim.value` (sem checkbox)
- `_atualizarDuracaoEvento()` não depende mais do checkbox

---

## Bugs Corrigidos (histórico)

| Data | Bug | Correção |
|---|---|---|
| 2026-04 | `ev_data_fim` não aparecia no painel | Adicionado mapeamento em `buildEventoFromContrato` e `sincronizarPainel` |
| 2026-04 | Badge de data fim em roxo fixo | Aplicado `badgeStyle` dinâmico no segundo badge |
| 2026-04 | `criadoEm: new Date()` | Corrigido para `FieldValue.serverTimestamp()` |
| 2026-04 | Editor não atualizava após salvar parcelas sem data | `salvarParcelasCustom` agora reconstrói também o editor HTML |
| 2026-04 | `distribuirAutomatico` criava 14 parcelas em 8 dias | Trocado `diffDias` por `Math.round(diffDias/30)` para usar meses |
| 2026-04 | `registros` undefined no modal | Adicionado `const registros = getPgtoRegistros(ev)` antes do loop |
| 2026-04 | Quitado com floating point mostrava "Falta R$ 0,00" âmbar | `isQuitado = restante <= 0 \|\| status === 'quitado'` |
| 2026-04 | Badge de status aba Eventos mostrava confirmado/concluído | Trocado para `getStatusPgto` com `.pgto-status-badge` |
| 2026-04 | Swipe mobile travando / painéis desalinhados | `getTrackWidth()` com `getBoundingClientRect()`, `preventDefault` só horizontal |
| 2026-04 | Notificação arrastada movia painel de abas | `touchstart` ignora toques em `#meta-notif-banner` |
| 2026-04 | Botão dia/noite causava bugs no swipe mobile | Removido de todos os apps (index, painel, relatorios, estoque, styles, utils) |
| 2026-04 | Data de término só aparecia com checkbox | Removido checkbox, campo sempre visível ao lado da data de início |

---

## Convenções de Entrega

- Sempre entregar arquivos atualizados na pasta **AdQ**
- Sempre fazer push ao GitHub após cada alteração
- **Base para edição:** usar os arquivos de `/sessions/trusting-cool-shannon/git-push/` OU `/sessions/trusting-cool-shannon/mnt/AdQ/` — ambos são confiáveis, pois Natanael sempre sobe as alterações que faz localmente
- **Durante uma sessão de edição:** sempre usar a versão mais recente do arquivo — se já editei o arquivo na sessão atual, a versão em memória já está atualizada; não usar cópia antiga
- Push: copiar para `/sessions/trusting-cool-shannon/git-push/` → commit → push com PAT
