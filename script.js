// ============================================================
// 📚 PLANNER LITERÁRIO — script.js
// Autor: Tainara Martins
// Todos os comentários descrevem a função de cada bloco/linha
// ============================================================


// ============================================================
// 🗃️ ESTADO GLOBAL — dados persistidos no localStorage
// ============================================================

// Lista de livros da seção "Leituras" (modal completo)
let books = JSON.parse(localStorage.getItem("books")) || [];

// Lista de livros da "Biblioteca" (input rápido + prateleiras)
let libraryBooks = JSON.parse(localStorage.getItem("libraryBooks")) || [];

// Quantidade de prateleiras criadas pelo usuário
let shelfCount = parseInt(localStorage.getItem("shelfCount")) || 3;

// Lista de livros do "Acervo" (catálogo completo físico/digital)
let acervo = JSON.parse(localStorage.getItem("acervo")) || [];

// Notas e citações da seção "Resumos"
let resumes = JSON.parse(localStorage.getItem("resumes")) || [];

// Dados do perfil do usuário
let profile = JSON.parse(localStorage.getItem("profile")) || {
  name: "Leitora Literária",
  bio: "Apaixonada por livros e histórias ✨",
  city: "📍 Brasil",
  avatar: null,  // URL da imagem do avatar
  socials: {}    // Objeto com links das redes sociais
};

// Constante: quantos livros cabem por prateleira
const BOOKS_PER_SHELF = 10;

// Paleta de cores pastel para os livros lidos (hsl definidos no JS)
// Cada índice representa um grupo de hue para distribuição equilibrada
const PASTEL_HUES = [350, 200, 140, 40, 270, 20, 185];


// ============================================================
// 💾 FUNÇÕES DE PERSISTÊNCIA — salvam no localStorage
// ============================================================

// Salva os livros da seção Leituras
function saveBooks()   { localStorage.setItem("books",        JSON.stringify(books)); }

// Salva os livros da Biblioteca (prateleiras)
function saveLibrary() { localStorage.setItem("libraryBooks", JSON.stringify(libraryBooks)); }

// Salva a quantidade de prateleiras
function saveShelfCount() { localStorage.setItem("shelfCount", shelfCount); }

// Salva os itens do Acervo
function saveAcervo()  { localStorage.setItem("acervo",  JSON.stringify(acervo)); }

// Salva os resumos e citações
function saveResumes() { localStorage.setItem("resumes", JSON.stringify(resumes)); }

// Salva os dados do perfil
function saveProfile() {
  // Lê os campos editáveis do DOM e atualiza o objeto de perfil
  profile.name   = document.getElementById("profileName").innerText.trim();
  profile.bio    = document.getElementById("profileBio").innerText.trim();
  profile.city   = document.getElementById("profileCity").innerText.trim();
  localStorage.setItem("profile", JSON.stringify(profile));
  alert("Perfil salvo! ✨"); // Confirmação visual
}


// ============================================================
// 🎨 VISUAL DINÂMICO — gera e persiste propriedades visuais
// ============================================================

// Gera variações visuais únicas para cada livro da biblioteca.
// Só gera uma vez por livro (verifica se já existe).
function generateVisual(book) {
  if (!book.visual) {
    // Seleciona um hue da paleta pastel de forma distribuída
    const hueIndex = libraryBooks.indexOf(book) % PASTEL_HUES.length;
    const hue = PASTEL_HUES[hueIndex >= 0 ? hueIndex : Math.floor(Math.random() * PASTEL_HUES.length)];

    book.visual = {
      hue,                                            // Controla a cor base
      height: 88 + Math.round(Math.random() * 22),   // Altura variável (88–110px)
      rotation: +(Math.random() * 4 - 2).toFixed(2)  // Leve inclinação (-2° a +2°)
    };
  }
}


// ============================================================
// ➕ ADICIONAR LIVRO — input rápido da Biblioteca
// ============================================================

function addBook() {
  const input = document.getElementById("bookInput"); // Referência ao campo de texto
  const title = input.value.trim();                    // Remove espaços desnecessários

  if (!title) return; // Valida: não adiciona livro sem título

  // Cria um novo objeto de livro simples (sem metadados do modal)
  const newBook = {
    id:    Date.now(), // ID único baseado no timestamp atual
    title,
    read:  false       // Começa como não lido (cinza)
  };

  generateVisual(newBook);   // Gera cor e forma visual
  libraryBooks.push(newBook); // Adiciona ao array
  input.value = "";           // Limpa o campo
  saveLibrary();              // Persiste no localStorage
  render();                   // Redesenha as prateleiras
  renderStats();              // Atualiza estatísticas
}


// ============================================================
// 🔁 TOGGLE LIDO — alterna estado lido/não lido na Biblioteca
// ============================================================

function toggleRead(id) {
  const book = libraryBooks.find(b => b.id === id); // Busca o livro pelo ID
  if (!book) return;                                  // Proteção: livro não encontrado

  book.read = !book.read; // Inverte o estado de leitura

  // Se acabou de marcar como lido, salva a data atual (mês/ano) para estatísticas
  if (book.read) {
    book.readMonth = new Date().getMonth();     // 0–11
    book.readYear  = new Date().getFullYear();  // ex: 2025
  } else {
    // Remove as datas se desmarcar
    delete book.readMonth;
    delete book.readYear;
  }

  saveLibrary();   // Persiste
  render();        // Redesenha prateleiras
  renderStats();   // Atualiza painel de estatísticas
}


// ============================================================
// 🧱 RENDER PRATELEIRAS — desenha a biblioteca visual
// ============================================================

function render() {
  const shelvesContainer = document.getElementById("shelves");
  if (!shelvesContainer) return; // Proteção contra elemento ausente

  shelvesContainer.innerHTML = ""; // Limpa o conteúdo anterior

  // Distribui os livros em prateleiras de BOOKS_PER_SHELF cada
  for (let i = 0; i < shelfCount; i++) {

    // Recorte do array para esta prateleira
    const slice = libraryBooks.slice(i * BOOKS_PER_SHELF, (i + 1) * BOOKS_PER_SHELF);

    // Cria o elemento da prateleira
    const shelf = document.createElement("div");
    shelf.classList.add("shelf");

    // Renderiza cada livro da fatia
    slice.forEach(book => {
      generateVisual(book); // Garante propriedades visuais existentes

      const el = document.createElement("div");
      el.classList.add("book");

      // Se o livro foi lido, adiciona classe CSS que remove a dessaturação
      if (book.read) el.classList.add("read");

      const { hue, height, rotation } = book.visual;

      // Cor base pastel (usada apenas quando livro está lido)
      const baseColor   = `hsl(${hue}, 65%, 80%)`; // Pastel claro
      const darkerColor = `hsl(${hue}, 65%, 70%)`; // Lombada mais escura

      // Aplica gradiente simulando profundidade da lombada
      el.style.background = `linear-gradient(to right, ${baseColor} 75%, ${darkerColor})`;
      el.style.height      = `${height}px`;    // Altura variada
      el.style.transform   = `rotate(${rotation}deg)`; // Inclinação leve

      // Atributo usado pelo tooltip CSS (::after do .book:hover)
      el.dataset.title = book.title;

      // Clique alterna estado lido/não lido
      el.onclick = () => toggleRead(book.id);

      shelf.appendChild(el); // Insere o livro na prateleira
    });

    // Rótulo da prateleira (número)
    const label = document.createElement("span");
    label.classList.add("shelf-label");
    label.textContent = `Prateleira ${i + 1}`;
    shelf.appendChild(label);

    shelvesContainer.appendChild(shelf); // Insere a prateleira no DOM
  }
}


// ============================================================
// ➕ ADICIONAR PRATELEIRA — expande a biblioteca manualmente
// ============================================================

function addShelf() {
  shelfCount++;      // Incrementa o contador de prateleiras
  saveShelfCount();  // Persiste a nova quantidade
  render();          // Redesenha mostrando a nova prateleira vazia
}


// ============================================================
// 🪟 MODAL — controles de abertura e fechamento
// ============================================================

const modal   = document.getElementById("modal");       // Overlay do modal
const openBtn = document.getElementById("openModalBtn"); // Botão do header
const closeBtn = document.getElementById("closeModalBtn"); // Botão ×

// Abre o modal ao clicar no botão do header
openBtn.addEventListener("click", () => {
  modal.classList.remove("hidden"); // Remove a classe que esconde
  document.body.style.overflow = "hidden"; // Impede scroll do body
});

// Fecha o modal ao clicar no botão ×
closeBtn.addEventListener("click", closeModal);

// Fecha o modal ao clicar fora da caixa (no overlay escuro)
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal(); // Só fecha se clicar no overlay, não dentro da caixa
});

// Fecha o modal e restaura o scroll da página
function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = ""; // Restaura o scroll
}


// ============================================================
// 📝 FORMULÁRIO DO MODAL — cadastro completo de livro
// ============================================================

const form = document.getElementById("bookForm");

form.addEventListener("submit", (e) => {
  e.preventDefault(); // Impede o envio/reload padrão do formulário

  // Monta o objeto com todos os dados do formulário
  const newBook = {
    id:        Date.now(), // ID único
    cover:     document.getElementById("cover").value.trim(),
    title:     document.getElementById("title").value.trim(),
    author:    document.getElementById("author").value.trim(),
    publisher: document.getElementById("publisher").value.trim(),
    year:      document.getElementById("year").value,
    genre:     document.getElementById("genre").value,
    pages:     document.getElementById("pages").value,
    rating:    document.getElementById("rating").value,
    startDate: document.getElementById("startDate").value,
    endDate:   document.getElementById("endDate").value,
    notes:     document.getElementById("notes").value.trim(),
    reread:    document.getElementById("reread").checked,
    favorite:  document.getElementById("favorite").checked,
    read:      false, // Estado inicial: não lido

    // Salva o mês e ano de cadastro para estatísticas mensais
    addedMonth: new Date().getMonth(),
    addedYear:  new Date().getFullYear()
  };

  // Valida título mínimo
  if (!newBook.title) {
    alert("O título do livro é obrigatório.");
    return;
  }

  books.push(newBook); // Adiciona ao array de livros
  saveBooks();         // Persiste no localStorage
  renderCards();       // Redesenha os cards de leituras
  renderStats();       // Atualiza estatísticas
  updateResumeSelect(); // Atualiza o select de livros no formulário de resumos

  closeModal();  // Fecha o modal
  form.reset(); // Limpa todos os campos
});


// ============================================================
// 🃏 RENDER CARDS — seção Leituras com flip 3D
// ============================================================

// Detecta se o dispositivo suporta hover (distingue desktop de mobile)
const isDesktop = window.matchMedia("(hover: hover)").matches;

function renderCards() {
  const cardsContainer = document.getElementById("cardsContainer");
  const emptyState     = document.getElementById("emptyReader");
  if (!cardsContainer) return;

  cardsContainer.innerHTML = ""; // Limpa o container

  // Alterna estado vazio vs. cards
  if (books.length === 0) {
    emptyState?.classList.remove("hidden"); // Mostra mensagem de vazio
    return;
  }
  emptyState?.classList.add("hidden"); // Esconde mensagem de vazio

  // Cria um card para cada livro cadastrado
  books.forEach(book => {
    const card  = document.createElement("div");
    card.classList.add("card");

    const inner = document.createElement("div");
    inner.classList.add("card-inner");

    // ── FRENTE DO CARD ──────────────────────────────────────
    const front = document.createElement("div");
    front.classList.add("card-front");

    // Imagem da capa: usa a URL fornecida ou um placeholder roxo
    const coverSrc = book.cover
      ? book.cover
      : `https://via.placeholder.com/160x210/8867d6/ffffff?text=${encodeURIComponent(book.title.substring(0,10))}`;

    front.innerHTML = `
      <img src="${coverSrc}" alt="Capa de ${book.title}" loading="lazy">
      <h3>${book.title}</h3>
      <p class="rating">⭐ ${book.rating || 'N/A'} ${book.favorite ? '· ❤️' : ''}</p>
    `;

    // ── VERSO DO CARD ────────────────────────────────────────
    const back = document.createElement("div");
    back.classList.add("card-back");

    back.innerHTML = `
      <p><strong>Autor:</strong> ${book.author || '—'}</p>
      <p><strong>Gênero:</strong> ${book.genre || '—'}</p>
      <p><strong>Editora:</strong> ${book.publisher || '—'}</p>
      <p><strong>Ano:</strong> ${book.year || '—'}</p>
      <p><strong>Páginas:</strong> ${book.pages || '—'}</p>
      <p><strong>Início:</strong> ${formatDate(book.startDate)}</p>
      <p><strong>Fim:</strong> ${formatDate(book.endDate)}</p>
      <p><strong>Reler:</strong> ${book.reread ? 'Sim ✓' : 'Não'}</p>
      ${book.notes ? `<p><strong>Nota:</strong> ${book.notes.substring(0, 80)}${book.notes.length > 80 ? '…' : ''}</p>` : ''}
    `;

    // Botão "Ver mais" exclusivo para mobile (aparece via CSS)
    const flipBtn = document.createElement("button");
    flipBtn.classList.add("btn-flip-mobile");
    flipBtn.textContent = "Ver detalhes ↩";
    flipBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Impede propagação para o card
      inner.classList.toggle("flip"); // Alterna o flip
    });
    front.appendChild(flipBtn);

    // Monta o card
    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    // Em mobile (sem hover), o clique no card inteiro faz o flip
    if (!isDesktop) {
      card.addEventListener("click", () => {
        inner.classList.toggle("flip");
      });
    }

    cardsContainer.appendChild(card); // Insere no container
  });
}


// ============================================================
// 📊 CÁLCULO DE ESTATÍSTICAS — processa dados de livros e biblioteca
// ============================================================

function getStats() {
  const now          = new Date();
  const currentMonth = now.getMonth();    // Mês atual (0–11)
  const currentYear  = now.getFullYear(); // Ano atual (ex: 2025)

  // Contadores iniciais
  let totalBooks     = books.length;       // Total da seção Leituras
  let totalLibrary   = libraryBooks.length; // Total da Biblioteca
  let readThisMonth  = 0;
  let readThisYear   = 0;
  let pagesThisYear  = 0;
  let sumRatings     = 0;
  let ratingCount    = 0;

  // Contagem de gêneros lidos (para card de gênero favorito)
  const genreCount = {};

  // Processa livros da seção Leituras (com data de fim)
  books.forEach(book => {
    // Contabiliza notas para média
    if (book.rating) {
      sumRatings += Number(book.rating);
      ratingCount++;
    }

    // Contabiliza gêneros
    if (book.genre) {
      genreCount[book.genre] = (genreCount[book.genre] || 0) + 1;
    }

    // Só conta livros com data de término definida
    if (!book.endDate) return;

    const end        = new Date(book.endDate);
    const sameYear   = end.getFullYear() === currentYear;
    const sameMonth  = sameYear && end.getMonth() === currentMonth;

    if (sameMonth) readThisMonth++;
    if (sameYear)  {
      readThisYear++;
      pagesThisYear += Number(book.pages) || 0;
    }
  });

  // Processa livros da Biblioteca marcados como lidos no ano atual
  libraryBooks.forEach(book => {
    if (book.read && book.readYear === currentYear) {
      readThisYear++;
      if (book.readMonth === currentMonth) readThisMonth++;
    }
  });

  // Ordena gêneros por quantidade (maior primeiro)
  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4); // Pega os 4 mais frequentes

  // Calcula média de notas
  const avgRating = ratingCount > 0
    ? (sumRatings / ratingCount).toFixed(1)
    : "—";

  // Monta o histórico mensal (últimos 12 meses)
  const monthlyData = buildMonthlyData();

  return {
    totalBooks,
    totalLibrary,
    readThisMonth,
    readThisYear,
    pagesThisYear,
    topGenres,
    avgRating,
    monthlyData
  };
}


// Constrói dados mensais dos últimos 12 meses para o gráfico de barras
function buildMonthlyData() {
  const now    = new Date();
  const result = []; // Array de { label, count }

  // Nomes abreviados dos meses em português
  const monthNames = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

  for (let i = 11; i >= 0; i--) {
    // Calcula mês/ano retroativamente
    const d    = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m    = d.getMonth();
    const y    = d.getFullYear();
    let count  = 0;

    // Conta livros da seção Leituras terminados neste mês
    books.forEach(book => {
      if (!book.endDate) return;
      const end = new Date(book.endDate);
      if (end.getMonth() === m && end.getFullYear() === y) count++;
    });

    // Conta livros da Biblioteca marcados como lidos neste mês
    libraryBooks.forEach(book => {
      if (book.read && book.readMonth === m && book.readYear === y) count++;
    });

    result.push({ label: monthNames[m], count });
  }

  return result;
}


// ============================================================
// 📊 RENDER STATS — preenche o painel de estatísticas
// ============================================================

function renderStats() {
  const stats = getStats();

  // Meta anual configurável (padrão: 12 livros)
  const yearlyGoal = 12;

  // Progresso em porcentagem, limitado a 100%
  const progress = Math.min((stats.readThisYear / yearlyGoal) * 100, 100).toFixed(0);

  // ── CARD PRINCIPAL: total no acervo + barra de meta ──────
  const mainStat = document.getElementById("mainStat");
  if (mainStat) {
    mainStat.innerHTML = `
      <h3>📚 Total na estante</h3>
      <p>${stats.totalBooks + stats.totalLibrary}</p>
      <div class="progress">
        <div class="progress-bar" style="width: ${progress}%"></div>
      </div>
      <small>${stats.readThisYear} de ${yearlyGoal} livros lidos este ano · ${progress}%</small>
    `;
  }

  // ── CARD: livros lidos este mês ───────────────────────────
  const monthStat = document.getElementById("monthStat");
  if (monthStat) {
    monthStat.innerHTML = `
      <h3>📖 Lidos este mês</h3>
      <p>${stats.readThisMonth}</p>
    `;
  }

  // ── CARD: livros lidos este ano ───────────────────────────
  const yearStat = document.getElementById("yearStat");
  if (yearStat) {
    yearStat.innerHTML = `
      <h3>📅 Lidos este ano</h3>
      <p>${stats.readThisYear}</p>
    `;
  }

  // ── CARD: páginas lidas este ano ─────────────────────────
  const pagesStat = document.getElementById("pagesStat");
  if (pagesStat) {
    pagesStat.innerHTML = `
      <h3>📄 Páginas este ano</h3>
      <p>${stats.pagesThisYear.toLocaleString("pt-BR")}</p>
    `;
  }

  // ── CARD: gêneros mais lidos (pílulas coloridas) ─────────
  const genreStat = document.getElementById("genreStat");
  if (genreStat) {
    const pillsHtml = stats.topGenres.length
      ? stats.topGenres.map(([g, c]) =>
          `<span class="genre-pill">${g} <strong>${c}</strong></span>`
        ).join("")
      : "<span style='opacity:.6;font-size:.85rem'>Ainda sem dados de gênero</span>";

    genreStat.innerHTML = `
      <h3>🎭 Gêneros mais lidos</h3>
      <div class="genre-pills">${pillsHtml}</div>
    `;
  }

  // ── CARD: média de notas ──────────────────────────────────
  const ratingStat = document.getElementById("ratingStat");
  if (ratingStat) {
    ratingStat.innerHTML = `
      <h3>⭐ Nota média</h3>
      <p>${stats.avgRating}</p>
    `;
  }

  // ── MINI GRÁFICO DE BARRAS MENSAIS ────────────────────────
  renderMonthlyChart(stats.monthlyData);
}


// Desenha o gráfico de barras mensais
function renderMonthlyChart(data) {
  const chart = document.getElementById("monthlyChart");
  if (!chart) return;

  chart.innerHTML = ""; // Limpa o gráfico anterior

  // Valor máximo para normalizar a altura das barras
  const max = Math.max(...data.map(d => d.count), 1);

  data.forEach(({ label, count }) => {
    const col = document.createElement("div");
    col.classList.add("bar-col");

    // Altura proporcional ao máximo (mínimo de 4px)
    const heightPct = Math.max((count / max) * 64, count > 0 ? 8 : 4);

    col.innerHTML = `
      <div class="bar" style="height:${heightPct}px" title="${count} livro(s) em ${label}"></div>
      <span class="bar-label">${label}</span>
    `;

    chart.appendChild(col);
  });
}


// ============================================================
// ✍️ RESUMOS & CITAÇÕES — seção de notas
// ============================================================

// Atualiza o select de livros disponíveis no formulário de resumos
function updateResumeSelect() {
  const sel = document.getElementById("resumeBook");
  if (!sel) return;

  sel.innerHTML = '<option value="">Selecione um livro...</option>';

  // Combina livros do modal e da biblioteca para o select
  const allTitles = [
    ...books.map(b => b.title),
    ...libraryBooks.map(b => b.title)
  ];

  // Remove duplicatas e ordena alfabeticamente
  [...new Set(allTitles)].sort().forEach(title => {
    const opt = document.createElement("option");
    opt.value = title;
    opt.textContent = title;
    sel.appendChild(opt);
  });
}

// Adiciona uma nova nota/citação ao array
function addResume() {
  const book = document.getElementById("resumeBook").value; // Título do livro selecionado
  const text = document.getElementById("resumeText").value.trim(); // Texto da nota
  const type = document.getElementById("resumeType").value; // Tipo: citação, resumo, reflexão

  if (!text) { alert("Escreva algo antes de salvar!"); return; }

  // Cria o objeto da nota
  const resume = {
    id:   Date.now(),
    book: book || "Sem livro",
    text,
    type,
    date: new Date().toLocaleDateString("pt-BR") // Data formatada em pt-BR
  };

  resumes.push(resume); // Adiciona ao array
  saveResumes();        // Persiste
  renderResumes();      // Redesenha a lista

  // Limpa os campos do formulário
  document.getElementById("resumeText").value = "";
}

// Renderiza a lista de resumos/citações
function renderResumes() {
  const list = document.getElementById("resumeList");
  if (!list) return;

  list.innerHTML = ""; // Limpa a lista

  if (resumes.length === 0) {
    list.innerHTML = `<p style="color:var(--text-mid);opacity:.7">Nenhuma nota ainda. Comece registrando uma citação!</p>`;
    return;
  }

  // Renderiza do mais recente para o mais antigo (ordem inversa)
  [...resumes].reverse().forEach(r => {
    const card = document.createElement("div");
    card.classList.add("resume-card");

    // Mapeia tipo para emoji/label amigável
    const typeLabel = { citacao: "💬 Citação", resumo: "📝 Resumo", reflexao: "💭 Reflexão" };

    card.innerHTML = `
      <span class="resume-type-badge">${typeLabel[r.type] || r.type}</span>
      <p class="resume-book-title">${r.book}</p>
      <p>${r.text}</p>
      <small style="color:var(--text-mid);opacity:.7;font-size:.72rem;margin-top:8px;display:block">${r.date}</small>
      <button class="resume-delete" onclick="deleteResume(${r.id})" title="Excluir nota">✕</button>
    `;

    list.appendChild(card);
  });
}

// Exclui uma nota pelo ID
function deleteResume(id) {
  if (!confirm("Excluir esta nota?")) return; // Confirmação do usuário
  resumes = resumes.filter(r => r.id !== id); // Remove do array
  saveResumes();
  renderResumes();
}


// ============================================================
// 👤 PERFIL DO USUÁRIO
// ============================================================

// Carrega os dados do perfil salvo no DOM
function loadProfile() {
  // Preenche os campos editáveis com os dados persistidos
  const nameEl = document.getElementById("profileName");
  const bioEl  = document.getElementById("profileBio");
  const cityEl = document.getElementById("profileCity");

  if (nameEl) nameEl.innerText = profile.name;
  if (bioEl)  bioEl.innerText  = profile.bio;
  if (cityEl) cityEl.innerText = profile.city;

  // Restaura o avatar salvo (base64 ou URL)
  if (profile.avatar) {
    const img = document.getElementById("avatarImg");
    if (img) img.src = profile.avatar;
  }

  renderBadges();     // Calcula e exibe conquistas
  renderProfileGenres(); // Exibe gêneros lidos
}

// Altera o avatar via upload de arquivo
function changeAvatar(event) {
  const file   = event.target.files[0]; // Arquivo selecionado
  if (!file) return;

  const reader = new FileReader(); // Leitor de arquivo assíncrono

  // Quando a leitura terminar, atualiza a imagem e salva
  reader.onload = (e) => {
    const base64 = e.target.result; // Imagem em base64
    document.getElementById("avatarImg").src = base64;
    profile.avatar = base64;        // Salva no objeto do perfil
    localStorage.setItem("profile", JSON.stringify(profile)); // Persiste
  };

  reader.readAsDataURL(file); // Inicia a leitura como URL de dados
}

// Abre um prompt para o usuário inserir o link de uma rede social
function openSocial(network) {
  const current = profile.socials[network] || ""; // Link atual (se houver)
  const url = prompt(`Link do ${network} (deixe vazio para remover):`, current);

  if (url === null) return; // Usuário cancelou

  if (url.trim()) {
    profile.socials[network] = url.trim(); // Salva o link
    window.open(url.trim(), "_blank");     // Abre em nova aba
  } else {
    delete profile.socials[network]; // Remove o link se vazio
  }

  localStorage.setItem("profile", JSON.stringify(profile)); // Persiste
}

// Calcula e exibe badges de conquistas baseadas nos dados
function renderBadges() {
  const container = document.getElementById("badgesContainer");
  if (!container) return;

  container.innerHTML = ""; // Limpa badges anteriores

  const total = books.length + libraryBooks.filter(b => b.read).length;

  // Define os critérios das badges
  const badgeDefs = [
    { icon: "📖", label: "1º livro",       condition: total >= 1 },
    { icon: "📚", label: "5 livros",        condition: total >= 5 },
    { icon: "🏆", label: "10 livros",       condition: total >= 10 },
    { icon: "🌟", label: "25 livros",       condition: total >= 25 },
    { icon: "💫", label: "50 livros",       condition: total >= 50 },
    { icon: "🎭", label: "Multi-gêneros",   condition: new Set(books.map(b => b.genre).filter(Boolean)).size >= 3 },
    { icon: "⭐", label: "Crítica literária",condition: books.filter(b => b.rating).length >= 5 },
    { icon: "✍️",  label: "Anotadora",       condition: resumes.length >= 3 },
    { icon: "❤️", label: "Colecionadora",   condition: books.filter(b => b.favorite).length >= 3 },
    { icon: "📅", label: "Leitora do Mês",  condition: getStats().readThisMonth >= 2 },
  ];

  // Filtra e exibe somente badges conquistadas
  const earned = badgeDefs.filter(b => b.condition);

  if (earned.length === 0) {
    container.innerHTML = `<p style="color:var(--text-mid);font-size:.85rem">Leia mais para desbloquear conquistas! 🔒</p>`;
    return;
  }

  earned.forEach(b => {
    const el = document.createElement("div");
    el.classList.add("badge");
    el.innerHTML = `${b.icon} ${b.label}`;
    container.appendChild(el);
  });
}

// Exibe as tags de gêneros que o usuário mais lê
function renderProfileGenres() {
  const container = document.getElementById("genreTags");
  if (!container) return;

  container.innerHTML = "";

  // Conta ocorrências de cada gênero
  const genreCount = {};
  books.forEach(b => {
    if (b.genre) genreCount[b.genre] = (genreCount[b.genre] || 0) + 1;
  });
  acervo.forEach(b => {
    if (b.genre) genreCount[b.genre] = (genreCount[b.genre] || 0) + 1;
  });

  // Ordena por frequência
  const sorted = Object.entries(genreCount).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    container.innerHTML = `<span style="color:var(--text-mid);font-size:.85rem">Adicione livros com gênero para ver aqui!</span>`;
    return;
  }

  sorted.forEach(([genre]) => {
    const tag = document.createElement("span");
    tag.classList.add("genre-tag");
    tag.textContent = genre;
    container.appendChild(tag);
  });
}


// ============================================================
// 🗂️ ACERVO — catálogo completo de livros físicos e digitais
// ============================================================

// Adiciona um livro ao acervo a partir do formulário
function addToAcervo() {
  const title = document.getElementById("acTitle").value.trim();
  if (!title) { alert("Informe o título do livro!"); return; }

  // Monta o objeto do livro do acervo
  const item = {
    id:        Date.now(),
    title,
    author:    document.getElementById("acAuthor").value.trim(),
    publisher: document.getElementById("acPublisher").value.trim(),
    year:      document.getElementById("acYear").value,
    pages:     document.getElementById("acPages").value,
    type:      document.getElementById("acType").value,      // "fisico" ou "digital"
    genre:     document.getElementById("acGenre").value,
    status:    document.getElementById("acStatus").value,    // "lido", "nao_lido", etc.
    favorite:  document.getElementById("acFavorite").checked
  };

  acervo.push(item);  // Adiciona ao array
  saveAcervo();       // Persiste
  renderAcervo();     // Redesenha a lista
  renderAcervoStats(); // Atualiza métricas
  renderProfileGenres(); // Atualiza gêneros do perfil
  renderAcervoClassificacao(); // Atualiza badge de classificação

  // Limpa o formulário de acervo
  ["acTitle","acAuthor","acPublisher","acYear","acPages"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("acType").value     = "fisico";
  document.getElementById("acGenre").value    = "";
  document.getElementById("acStatus").value   = "nao_lido";
  document.getElementById("acFavorite").checked = false;
}

// Alterna o favorito de um item do acervo
function toggleAcervoFavorite(id) {
  const item = acervo.find(a => a.id === id);
  if (!item) return;
  item.favorite = !item.favorite; // Inverte
  saveAcervo();
  renderAcervo();
}

// Remove um item do acervo após confirmação
function deleteAcervo(id) {
  if (!confirm("Remover este livro do acervo?")) return;
  acervo = acervo.filter(a => a.id !== id); // Remove pelo ID
  saveAcervo();
  renderAcervo();
  renderAcervoStats();
  renderAcervoClassificacao();
}

// Renderiza a lista filtrada do acervo
function renderAcervo() {
  const list = document.getElementById("acervoList");
  if (!list) return;

  // Lê os valores dos filtros ativos
  const filterType    = document.getElementById("filterType")?.value    || "";
  const filterGenre   = document.getElementById("filterGenre")?.value   || "";
  const filterStatus  = document.getElementById("filterStatus")?.value  || "";
  const filterSearch  = document.getElementById("filterSearch")?.value.toLowerCase()  || "";
  const filterFav     = document.getElementById("filterFavorite")?.checked || false;

  // Filtra o acervo conforme os critérios selecionados
  const filtered = acervo.filter(item => {
    if (filterType   && item.type   !== filterType)   return false;
    if (filterGenre  && item.genre  !== filterGenre)  return false;
    if (filterStatus && item.status !== filterStatus)  return false;
    if (filterFav    && !item.favorite)               return false;
    // Filtro de busca por texto (título, autor ou editora)
    if (filterSearch) {
      const haystack = `${item.title} ${item.author} ${item.publisher}`.toLowerCase();
      if (!haystack.includes(filterSearch)) return false;
    }
    return true; // Passou todos os filtros
  });

  list.innerHTML = ""; // Limpa a lista

  if (filtered.length === 0) {
    list.innerHTML = `<p style="color:var(--text-mid);opacity:.7;grid-column:1/-1">Nenhum livro encontrado com esses filtros.</p>`;
    return;
  }

  // Cria um card para cada item filtrado
  filtered.forEach(item => {
    const card = document.createElement("div");
    card.classList.add("acervo-card");

    // Gera os chips de tipo e status
    const typeLabel   = item.type === "fisico" ? "📗 Físico" : "💻 Digital";
    const statusMap   = {
      lido:     "✅ Lido",
      nao_lido: "📌 Não lido",
      lendo:    "📖 Lendo",
      pausado:  "⏸️ Pausado"
    };

    card.innerHTML = `
      <button class="btn-ac-delete" onclick="deleteAcervo(${item.id})" title="Remover">✕</button>
      <p class="ac-title">${item.title}</p>
      <p class="ac-author">${item.author || '—'}</p>
      <div class="ac-chips">
        <span class="ac-chip chip-${item.type}">${typeLabel}</span>
        <span class="ac-chip chip-${item.status}">${statusMap[item.status] || item.status}</span>
        ${item.genre ? `<span class="ac-chip chip-genre">${item.genre}</span>` : ""}
        ${item.year  ? `<span class="ac-chip" style="background:rgba(0,0,0,0.06)">${item.year}</span>` : ""}
        ${item.publisher ? `<span class="ac-chip" style="background:rgba(0,0,0,0.06)">${item.publisher}</span>` : ""}
      </div>
      <div class="ac-footer">
        <span class="ac-pages">${item.pages ? item.pages + " págs." : ""}</span>
        <button class="btn-fav-toggle" onclick="toggleAcervoFavorite(${item.id})" title="Favorito">
          ${item.favorite ? "⭐" : "☆"}
        </button>
      </div>
    `;

    list.appendChild(card);
  });
}

// Calcula e exibe as métricas do painel do acervo
function renderAcervoStats() {
  const container = document.getElementById("acervoStats");
  if (!container) return;

  const total    = acervo.length;                                   // Total de livros
  const fisicos  = acervo.filter(a => a.type === "fisico").length;  // Físicos
  const digitais = acervo.filter(a => a.type === "digital").length; // Digitais
  const lidos    = acervo.filter(a => a.status === "lido").length;  // Lidos
  const naoLidos = acervo.filter(a => a.status === "nao_lido").length; // Não lidos
  const favoritos = acervo.filter(a => a.favorite).length;          // Favoritos
  const totalPags = acervo.reduce((sum, a) => sum + (Number(a.pages) || 0), 0); // Total páginas

  // Gênero mais frequente no acervo
  const genreCount = {};
  acervo.forEach(a => { if (a.genre) genreCount[a.genre] = (genreCount[a.genre] || 0) + 1; });
  const topGenre = Object.entries(genreCount).sort((a,b) => b[1]-a[1])[0]?.[0] || "—";

  // Monta os cards de métrica
  const metrics = [
    { val: total,    label: "Total" },
    { val: fisicos,  label: "Físicos 📗" },
    { val: digitais, label: "Digitais 💻" },
    { val: lidos,    label: "Lidos ✅" },
    { val: naoLidos, label: "Não lidos 📌" },
    { val: favoritos,label: "Favoritos ⭐" },
    { val: totalPags.toLocaleString("pt-BR"), label: "Páginas" },
    { val: topGenre, label: "Gênero #1" }
  ];

  container.innerHTML = metrics.map(m => `
    <div class="acervo-stat-card">
      <div class="ac-val">${m.val}</div>
      <div class="ac-label">${m.label}</div>
    </div>
  `).join("");
}

// Classifica a biblioteca e exibe badges automáticas
function renderAcervoClassificacao() {
  const container = document.getElementById("acervoClassificacao");
  if (!container) return;

  const total = acervo.length + libraryBooks.length + books.length; // Total global

  // Critérios de classificação pelo tamanho da coleção
  let classificacao = "";
  if (total < 10)       classificacao = "🌱 Biblioteca Nascente";
  else if (total < 30)  classificacao = "📚 Biblioteca em Crescimento";
  else if (total < 60)  classificacao = "🏛️ Biblioteca Estabelecida";
  else if (total < 100) classificacao = "🌟 Grande Biblioteca";
  else                  classificacao = "👑 Biblioteca Magistral";

  const hasDigital = acervo.some(a => a.type === "digital");
  const hasFisico  = acervo.some(a => a.type === "fisico");

  // Monta os badges a exibir
  const badges = [
    { show: true,       text: classificacao },
    { show: hasDigital, text: "💻 Acervo Digital" },
    { show: hasFisico,  text: "📗 Acervo Físico" },
    { show: acervo.filter(a => a.favorite).length > 0, text: "⭐ Tem Favoritos" }
  ].filter(b => b.show);

  container.innerHTML = badges.map(b =>
    `<span class="acervo-badge">${b.text}</span>`
  ).join("");
}


// ============================================================
// 🛠️ UTILITÁRIOS
// ============================================================

// Formata uma data ISO (YYYY-MM-DD) para o formato brasileiro (DD/MM/AAAA)
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}


// ============================================================
// 🍔 HAMBÚRGUER — menu mobile recolhível
// ============================================================

const hamburgerBtn = document.getElementById("hamburgerBtn"); // Botão hambúrguer
const navMenu      = document.getElementById("navMenu");      // Container dos links

// Alterna abertura/fechamento do menu
hamburgerBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // Impede que o clique propague para o document
  const isOpen = navMenu.classList.toggle("is-open"); // Adiciona/remove .is-open
  hamburgerBtn.classList.toggle("is-open", isOpen);   // Anima os tracinhos
  hamburgerBtn.setAttribute("aria-expanded", isOpen); // Acessibilidade
});

// Fecha o menu ao clicar em qualquer lugar fora dele
document.addEventListener("click", (e) => {
  if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
    closeMenu();
  }
});

// Fecha o menu (chamado pelos links e pelo clique fora)
function closeMenu() {
  navMenu.classList.remove("is-open");
  hamburgerBtn.classList.remove("is-open");
  hamburgerBtn.setAttribute("aria-expanded", "false");
}


// ============================================================
// 🚀 INICIALIZAÇÃO — roda ao carregar a página
// ============================================================

// Renderiza todas as seções com os dados do localStorage
render();           // Prateleiras da biblioteca
renderCards();      // Cards de leituras
renderStats();      // Estatísticas
renderResumes();    // Notas e citações
loadProfile();      // Dados do perfil
renderAcervo();     // Lista do acervo
renderAcervoStats(); // Métricas do acervo
renderAcervoClassificacao(); // Classificação da biblioteca
updateResumeSelect(); // Popula o select de livros nos resumos
