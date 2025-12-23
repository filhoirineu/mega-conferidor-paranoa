// ✅ Jogos cadastrados (6 a 8 dezenas)
const jogos = [
  [3, 9, 17, 24, 33, 41, 52, 60],
  [1, 8, 14, 22, 29, 37, 45, 56],
  [5, 12, 19, 26, 32, 40, 49, 58],
  [2, 11, 16, 23, 31, 38, 47, 55],
  [4, 10, 18, 25, 34, 42, 50, 59],
  [6, 13, 20, 27, 35, 43, 48, 57],
  [7, 15, 21, 28, 36, 44, 51, 54]

];

const MIN_DEZENAS = 6;
const MAX_DEZENAS = 15;

const ids = ["r1", "r2", "r3", "r4", "r5", "r6"];
const elMsg = document.getElementById("msg");
const elResultado = document.getElementById("resultado");
const btnLimpar = document.getElementById("btnLimpar");

btnLimpar?.addEventListener("click", limpar);

// 🔥 dispara ao digitar (conferência parcial)
ids.forEach((id, idx) => {
  const input = document.getElementById(id);
  if (!input) return;

  input.addEventListener("input", () => {
    // só dígitos, no máximo 2
    const cleaned = String(input.value).replace(/\D/g, "").slice(0, 2);
    input.value = cleaned;

    // auto-avança quando digita 2 dígitos (melhora muito no celular)
    if (cleaned.length === 2 && idx < ids.length - 1) {
      document.getElementById(ids[idx + 1])?.focus();
    }

    atualizarConferencia();
  });
});

// primeira renderização
renderJogosIniciais();
elMsg.textContent = "Digite as dezenas do resultado.";

/* =========================
   FUNÇÕES
========================= */

function limpar() {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  elMsg.textContent = "Digite as dezenas do resultado.";
  renderJogosIniciais();
}

function atualizarConferencia() {
  const resultado = lerResultadoParcial();

  if (!resultado.ok) {
    elMsg.textContent = resultado.erro;
    renderJogosIniciais();
    return;
  }

  if (resultado.valores.length === 0) {
    elMsg.textContent = "Digite as dezenas do resultado.";
    renderJogosIniciais();
    return;
  }

  elMsg.textContent = `🎯 Dezenas informadas: ${formatLista(resultado.valores)}`;
  const sorteioSet = new Set(resultado.valores);

  const linhas = jogos.map((jogo, idx) => {
    const jogoInfo = normalizarJogo(jogo);
    if (!jogoInfo.ok) return linhaVazia(idx, jogo);

    const acertosLista = jogoInfo.valores.filter(n => sorteioSet.has(n));
    const acertos = acertosLista.length;

    return {
      idx,
      dezenas: jogoInfo.valores.length,
      jogo: jogoInfo.valores,
      acertos,
      premio: classificarPremio(acertos),
      acertosLista
    };
  });

  linhas.sort((a, b) => (b.acertos - a.acertos) || (b.dezenas - a.dezenas));
  renderTabela(linhas);
}

function linhaVazia(idx, jogo) {
  const arr = Array.isArray(jogo) ? jogo.map(Number).filter(n => Number.isFinite(n)) : [];
  arr.sort((a, b) => a - b);
  return {
    idx,
    dezenas: Array.isArray(jogo) ? jogo.length : 0,
    jogo: arr,
    acertos: 0,
    premio: "—",
    acertosLista: []
  };
}

function lerResultadoParcial() {
  const raw = ids
    .map(id => String(document.getElementById(id)?.value ?? "").trim())
    .filter(v => v !== "");

  if (raw.length === 0) return { ok: true, valores: [] };

  const nums = raw.map(v => parseInt(v, 10));

  if (nums.some(n => Number.isNaN(n)))
    return { ok: false, erro: "⚠️ Apenas números são permitidos." };

  if (nums.some(n => n < 1 || n > 60))
    return { ok: false, erro: "⚠️ As dezenas devem estar entre 1 e 60." };

  if (new Set(nums).size !== nums.length)
    return { ok: false, erro: "⚠️ Não pode repetir dezenas no resultado." };

  return { ok: true, valores: nums.sort((a, b) => a - b) };
}

function classificarPremio(acertos) {
  if (acertos === 6) return "SENA";
  if (acertos === 5) return "QUINA";
  if (acertos === 4) return "QUADRA";
  return "—";
}

function renderJogosIniciais() {
  const linhas = jogos.map((jogo, idx) => {
    const jogoInfo = normalizarJogo(jogo);
    const valores = jogoInfo.ok ? jogoInfo.valores : [];
    return {
      idx,
      dezenas: Array.isArray(jogo) ? jogo.length : 0,
      jogo: valores,
      acertos: "-",
      premio: "—",
      acertosLista: []
    };
  });

  renderTabela(linhas, true);
}

function normalizarJogo(jogo) {
  if (!Array.isArray(jogo)) return { ok: false };

  if (jogo.length < MIN_DEZENAS || jogo.length > MAX_DEZENAS) return { ok: false };

  const nums = jogo.map(Number);

  if (nums.some(n => Number.isNaN(n) || n < 1 || n > 60)) return { ok: false };
  if (new Set(nums).size !== nums.length) return { ok: false };

  nums.sort((a, b) => a - b);
  return { ok: true, valores: nums };
}

function renderTabela(linhas, inicial = false) {
  let html = `
    <table class="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Jogo</th>
          <th>Dezenas</th>
          <th>Acertos</th>
          <th>Situação</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const row of linhas) {
    const numeros = (row.jogo || []).map(n => {
      const ok = row.acertosLista.includes(n);
      return `<span class="num ${ok ? "ok" : ""}">${pad2(n)}</span>`;
    }).join("");

    const acertosCell = inicial ? "-" : row.acertos;
    const situacaoClass = row.premio !== "—" ? "hit" : "badge accent";

    html += `
      <tr>
        <td>${row.idx + 1}</td>
        <td>${numeros}</td>
        <td><span class="badge">${row.dezenas}</span></td>
        <td><span class="badge">${acertosCell}</span></td>
        <td><span class="badge ${situacaoClass}">${row.premio}</span></td>
      </tr>
    `;
  }

  html += `</tbody></table>`;
  elResultado.innerHTML = html;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatLista(arr) {
  return arr.map(pad2).join(" - ");
}
