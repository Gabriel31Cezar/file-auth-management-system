'use strict';
/* global Chart */

/* ---------- Acesso aos elementos da página (cada um é buscado uma única vez) ---------- */
/** @returns {any} */
const porId = id => document.getElementById(id);
/** @returns {any} */
const primeiro = seletor => document.querySelector(seletor);

const el = {
  themeBtn: porId('themeBtn'),
  authView: porId('authView'),
  dashView: porId('dashView'),
  authForm: porId('authForm'),
  formMsg: porId('formMsg'),
  submitBtn: porId('submitBtn'),
  identifier: porId('identifier'),
  email: porId('email'),
  user: porId('user'),
  pass: porId('pass'),
  welcome: porId('welcome'),
  tokenChip: porId('tokenChip'),
  logoutBtn: porId('logoutBtn'),
  sTotal: porId('sTotal'),
  sSize: porId('sSize'),
  sTop: porId('sTop'),
  catFilter: porId('catFilter'),
  search: porId('search'),
  rows: porId('rows'),
  drop: porId('drop'),
  fileInput: porId('fileInput'),
  queue: porId('queue'),
  chartWrap: primeiro('.chart-wrap'),
  card: primeiro('.auth-card')
};
const abas = document.querySelectorAll('.tab');
const camposDoForm = document.querySelectorAll('.auth-card label');
const root = document.documentElement;

/* ---------- Estado ---------- */
const api = { token: null };
/** @type {any[]} */
let arquivos = [];
/** @type {any} */
let chart = null;
let busca = '';
let filtroCat = 'Todas';
let modo = 'login';

/* ---------- Categorias (as mesmas do backend) ---------- */
const CATEGORIAS = [
  { nome: 'Documentos', cor: '#4f7cff' },
  { nome: 'Apresentações', cor: '#e0703a' },
  { nome: 'Planilhas', cor: '#3fae6a' },
  { nome: 'Imagens', cor: '#e8a33d' },
  { nome: 'Design e 3D', cor: '#c24fd6' },
  { nome: 'Vídeos', cor: '#d64f7a' },
  { nome: 'Áudio', cor: '#1f8a8a' },
  { nome: 'Compactados', cor: '#9a6bd6' },
  { nome: 'Bancos de dados', cor: '#2f6f9f' },
  { nome: 'Código', cor: '#6b7f94' },
  { nome: 'Executáveis e instaladores', cor: '#8a5a44' },
  { nome: 'Fontes', cor: '#b0a030' },
  { nome: 'Outros', cor: '#a8b3bd' }
];
const nomesCats = CATEGORIAS.map(c => c.nome);
const corDe = nome => {
  const achada = CATEGORIAS.find(c => c.nome === nome);
  return achada ? achada.cor : '#a8b3bd';
};

/* ---------- Utilidades ---------- */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = b => b >= 1e9 ? (b / 1e9).toFixed(1) + ' GB' : b >= 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1e3)) + ' KB';
const dataBr = iso => {
  const texto = /[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : iso + 'Z';
  return new Date(texto).toLocaleDateString('pt-BR');
};
const falhou = err => console.error(err);
const mostrarMsg = texto => { el.formMsg.textContent = texto; };

/* ---------- Tema ---------- */
try {
  const guardado = localStorage.getItem('theme');
  if (guardado) root.dataset.theme = guardado;
} catch (e) { /* armazenamento indisponível: segue com o tema do sistema */ }

el.themeBtn.onclick = () => {
  const escuro = matchMedia('(prefers-color-scheme:dark)').matches;
  const atual = root.dataset.theme || (escuro ? 'dark' : 'light');
  const novo = atual === 'dark' ? 'light' : 'dark';
  root.dataset.theme = novo;
  try { localStorage.setItem('theme', novo); } catch (e) { /* ignora */ }
  if (chart) desenharGrafico();
};

/* ---------- Comunicação com a API ---------- */
/**
 * @param {string} path
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
async function request(path, options = {}) {
  const headers = new Headers(options.headers);
  if (api.token) headers.set('Authorization', 'Bearer ' + api.token);
  let res;
  try {
    res = await fetch(path, { ...options, headers });
  } catch (e) {
    throw new Error('Não foi possível conectar à API. Confira se o servidor está ligado.');
  }
  let dados = null;
  try { dados = await res.json(); } catch (e) { /* resposta sem corpo */ }
  if (res.status === 401 && api.token) {
    sair();
    throw new Error('Sua sessão expirou. Entre novamente.');
  }
  if (!res.ok) {
    const detalhe = dados && dados.detail;
    const msg = Array.isArray(detalhe)
      ? 'Dados inválidos: ' + detalhe.map(d => d.msg).join('; ')
      : detalhe || 'Algo deu errado. Tente novamente.';
    throw new Error(msg);
  }
  return dados;
}

function salvarToken(token) {
  api.token = token;
  try { sessionStorage.setItem('token', token); } catch (e) { /* ignora */ }
}

/* ---------- Login e cadastro ---------- */
abas.forEach(aba => {
  aba.onclick = () => {
    modo = aba.dataset.mode;
    abas.forEach(outra => outra.classList.toggle('on', outra === aba));
    el.card.classList.toggle('login', modo === 'login');
    el.card.classList.toggle('register', modo === 'register');
    el.submitBtn.textContent = modo === 'login' ? 'Entrar' : 'Criar conta';
    camposDoForm.forEach(label => {
      label.classList.remove('bad');
      label.querySelector('small').textContent = '';
    });
    mostrarMsg('');
  };
});

const regras = {
  identifier: v => v.length >= 3 || 'Informe seu e-mail ou usuário.',
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Informe um e-mail válido, como voce@exemplo.com.',
  user: v => /^[a-zA-Z0-9_]{3,20}$/.test(v) || 'Use 3 a 20 letras, números ou _.',
  pass: v => (v.length >= 8 && /\d/.test(v) && /[a-zA-Z]/.test(v)) || 'A senha precisa de 8+ caracteres, com letras e números.',
  passLogin: v => v.length > 0 || 'Informe sua senha.'
};

function validar() {
  const campos = modo === 'login'
    ? [['identifier', 'identifier'], ['pass', 'passLogin']]
    : [['email', 'email'], ['user', 'user'], ['pass', 'pass']];
  return campos.map(([id, regra]) => {
    const campo = el[id];
    const valor = id === 'pass' ? campo.value : campo.value.trim();
    const resultado = regras[regra](valor);
    const label = campo.closest('label');
    label.classList.toggle('bad', resultado !== true);
    label.querySelector('small').textContent = resultado === true ? '' : resultado;
    return resultado === true;
  }).every(Boolean);
}

el.authForm.addEventListener('submit', async e => {
  e.preventDefault();
  mostrarMsg('');
  if (!validar()) return;
  el.submitBtn.disabled = true;
  try {
    if (modo === 'register') {
      await request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: el.email.value.trim(),
          username: el.user.value.trim(),
          password: el.pass.value
        })
      });
    }
    const identificador = modo === 'login' ? el.identifier.value.trim() : el.user.value.trim();
    const resposta = await request('/auth/login', {
      method: 'POST',
      body: new URLSearchParams({ username: identificador, password: el.pass.value })
    });
    salvarToken(resposta.access_token);
    await entrar();
  } catch (err) {
    mostrarMsg(err.message);
  } finally {
    el.submitBtn.disabled = false;
  }
});

/* ---------- Sessão ---------- */
async function entrar() {
  const usuario = await request('/auth/me');
  el.authView.hidden = true;
  el.dashView.hidden = false;
  el.welcome.textContent = `Olá, ${usuario.username}. Sua sessão está autenticada.`;
  el.tokenChip.textContent = 'JWT ' + api.token.slice(0, 14) + '…';
  el.pass.value = '';
  await carregarHistorico();
}

function sair() {
  api.token = null;
  try { sessionStorage.removeItem('token'); } catch (e) { /* ignora */ }
  arquivos = [];
  el.queue.innerHTML = '';
  if (chart) {
    chart.destroy();
    chart = null;
  }
  el.dashView.hidden = true;
  el.authView.hidden = false;
}
el.logoutBtn.onclick = sair;

/* ---------- Histórico, números e gráfico ---------- */
el.catFilter.innerHTML = ['Todas', ...nomesCats].map(c => `<option>${esc(c)}</option>`).join('');
el.search.oninput = e => {
  busca = e.target.value.toLowerCase();
  desenharTabela();
};
el.catFilter.onchange = e => {
  filtroCat = e.target.value;
  desenharTabela();
};

async function carregarHistorico() {
  try {
    arquivos = await request('/files?limite=500');
  } catch (err) {
    arquivos = [];
    el.rows.innerHTML = `<tr><td colspan="5" class="empty">${esc(err.message)}</td></tr>`;
    return;
  }
  desenharNumeros();
  desenharTabela();
  desenharGrafico();
}

function contagem() {
  return nomesCats.map(nome => arquivos.filter(a => a.category === nome).length);
}

function desenharNumeros() {
  el.sTotal.textContent = arquivos.length;
  el.sSize.textContent = fmt(arquivos.reduce((soma, a) => soma + a.size, 0));
  const numeros = contagem();
  const maior = Math.max(0, ...numeros);
  el.sTop.textContent = maior ? `${nomesCats[numeros.indexOf(maior)]} (${maior})` : '–';
}

function desenharTabela() {
  if (!arquivos.length) {
    el.rows.innerHTML = '<tr><td colspan="5" class="empty">Nenhum arquivo ainda. Envie o primeiro na área acima.</td></tr>';
    return;
  }
  const lista = arquivos.filter(a =>
    a.original_name.toLowerCase().includes(busca) &&
    (filtroCat === 'Todas' || a.category === filtroCat)
  );
  if (!lista.length) {
    el.rows.innerHTML = '<tr><td colspan="5" class="empty">Nenhum arquivo encontrado. Ajuste a busca ou o filtro.</td></tr>';
    return;
  }
  el.rows.innerHTML = lista.map(a => {
    const ok = a.status === 'Organizado';
    return `<tr>
      <td>${esc(a.original_name)}<br><small class="muted">${dataBr(a.created_at)}</small></td>
      <td><span class="badge" style="--c:${corDe(a.category)}">${esc(a.category)}</span></td>
      <td class="path">${esc(a.stored_path)}</td>
      <td>${fmt(a.size)}</td>
      <td class="${ok ? 's-ok' : 's-warn'}">${ok ? '✓ ' : '! '}${esc(a.status)}</td>
    </tr>`;
  }).join('');
}

function desenharGrafico() {
  if (chart) {
    chart.destroy();
    chart = null;
  }
  if (typeof Chart === 'undefined') {
    el.chartWrap.innerHTML = '<p class="empty">Não foi possível carregar o Chart.js. Verifique sua conexão.</p>';
    return;
  }
  el.chartWrap.innerHTML = '<canvas></canvas>';
  const estilo = getComputedStyle(root);
  const muted = estilo.getPropertyValue('--muted').trim();
  const surface = estilo.getPropertyValue('--surface').trim();
  chart = new Chart(el.chartWrap.querySelector('canvas'), {
    type: 'doughnut',
    data: {
      labels: nomesCats,
      datasets: [{
        data: contagem(),
        backgroundColor: CATEGORIAS.map(c => c.cor),
        borderColor: surface,
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: { legend: { position: 'bottom', labels: { color: muted, boxWidth: 12, usePointStyle: true } } }
    }
  });
}

/* ---------- Envio de arquivos ---------- */
function destacarArea(e) {
  e.preventDefault();
  el.drop.classList.add('over');
}

function apagarDestaque(e) {
  e.preventDefault();
  el.drop.classList.remove('over');
}

el.drop.onclick = () => el.fileInput.click();
el.drop.onkeydown = e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    el.fileInput.click();
  }
};
el.fileInput.onchange = () => {
  const escolhidos = [...el.fileInput.files];
  el.fileInput.value = '';
  enviarLista(escolhidos).catch(falhou);
};
el.drop.addEventListener('dragenter', destacarArea);
el.drop.addEventListener('dragover', destacarArea);
el.drop.addEventListener('dragleave', apagarDestaque);
el.drop.addEventListener('drop', e => {
  apagarDestaque(e);
  enviarLista([...e.dataTransfer.files]).catch(falhou);
});

async function enviarLista(lista) {
  for (const arquivo of lista) await enviar(arquivo);
  await carregarHistorico();
}

async function enviar(arquivo) {
  const item = document.createElement('li');
  item.className = 'q';
  item.innerHTML = `<span>${esc(arquivo.name)}</span><span class="st">Enviando…</span><div class="bar"><i></i></div>`;
  el.queue.prepend(item);
  const estado = item.querySelector('.st');
  const barra = item.querySelector('i');
  requestAnimationFrame(() => { barra.style.width = '60%'; });
  try {
    const dados = new FormData();
    dados.append('arquivo', arquivo);
    const resultado = await request('/files/upload', { method: 'POST', body: dados });
    barra.style.width = '100%';
    barra.style.background = corDe(resultado.category);
    const classe = resultado.status === 'Organizado' ? 's-ok' : 's-warn';
    estado.innerHTML = `<span class="badge" style="--c:${corDe(resultado.category)}">${esc(resultado.category)}</span> ` +
      `<span class="${classe}">${esc(resultado.status.toLowerCase())}</span>`;
  } catch (err) {
    item.classList.add('erro');
    barra.style.width = '100%';
    barra.style.background = 'var(--err)';
    estado.textContent = err.message;
  }
  setTimeout(() => item.remove(), 12000);
}

/* ---------- Ao abrir a página ---------- */
async function iniciar() {
  try {
    const guardado = sessionStorage.getItem('token');
    if (!guardado) return;
    api.token = guardado;
    await entrar();
  } catch (e) {
    api.token = null;
  }
}
iniciar().catch(falhou);