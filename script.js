const BASE_URL = "https://pokeapi.co/api/v2/pokemon/";

const form = document.getElementById("form-busca");
const campoBusca = document.getElementById("campo-busca");
const resultado = document.getElementById("resultado");

const NOMES_STATS = {
  hp: "HP",
  attack: "Ataque",
  defense: "Defesa",
  "special-attack": "Ataque Esp.",
  "special-defense": "Defesa Esp.",
  speed: "Velocidade",
};

const NOMES_TIPOS = {
  fire: "Fogo",
  water: "Água",
  grass: "Planta",
  electric: "Elétrico",
  psychic: "Psíquico",
  ice: "Gelo",
  dragon: "Dragão",
  dark: "Sombrio",
  fairy: "Fada",
  normal: "Normal",
  fighting: "Lutador",
  poison: "Veneno",
  ground: "Terra",
  flying: "Voador",
  bug: "Inseto",
  rock: "Pedra",
  ghost: "Fantasma",
  steel: "Aço",
};

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const termo = campoBusca.value.trim().toLowerCase();
  if (!termo) return;
  buscarPokemon(termo);
});

async function buscarPokemon(termo) {
  mostrarCarregando();
  try {
    const resposta = await fetch(`${BASE_URL}${encodeURIComponent(termo)}`);
    if (!resposta.ok) {
      throw new Error("Pokémon não encontrado");
    }
    const dados = await resposta.json();
    exibirPokemon(dados);
  } catch (erro) {
    exibirErro(termo);
  }
}

function mostrarCarregando() {
  resultado.innerHTML = `<p class="screen__hint">Escaneando...</p>`;
}

function exibirErro(termo) {
  resultado.innerHTML = `
    <div class="screen__erro">
      <p>Nenhum Pokémon encontrado para “${escaparHTML(termo)}”.</p>
      <p>Verifique o nome ou número e tente de novo. Se o problema continuar, a PokeAPI pode estar fora do ar no momento.</p>
    </div>
  `;
}

function exibirPokemon(dados) {
  const numero = String(dados.id).padStart(4, "0");
  const nome = capitalizar(dados.name);
  const imagem =
    dados.sprites?.other?.["official-artwork"]?.front_default ||
    dados.sprites?.front_default ||
    "";

  const tipos = dados.types
    .map((t) => {
      const tipo = t.type.name;
      const label = NOMES_TIPOS[tipo] || capitalizar(tipo);
      return `<span class="badge badge--${tipo}">${label}</span>`;
    })
    .join("");

  const stats = dados.stats.map(renderStat).join("");

  resultado.innerHTML = `
    <div class="card">
      <div class="card__top">
        <img class="card__img" src="${imagem}" alt="${nome}" />
        <div>
          <span class="card__numero">Nº ${numero}</span>
          <h2 class="card__nome">${nome}</h2>
          <div class="card__tipos">${tipos}</div>
        </div>
      </div>

      <div class="card__medidas">
        <div>
          <span>Altura</span>
          <strong>${(dados.height / 10).toFixed(1)} m</strong>
        </div>
        <div>
          <span>Peso</span>
          <strong>${(dados.weight / 10).toFixed(1)} kg</strong>
        </div>
      </div>

      <div class="card__stats">${stats}</div>
    </div>
  `;
}

function renderStat(stat) {
  const nome = NOMES_STATS[stat.stat.name] || stat.stat.name;
  const valor = stat.base_stat;
  const porcentagem = Math.min(100, Math.round((valor / 180) * 100));
  return `
    <div class="stat">
      <span class="stat__nome">${nome}</span>
      <div class="stat__barra">
        <div class="stat__preenchimento" style="width:${porcentagem}%"></div>
      </div>
      <span class="stat__valor">${valor}</span>
    </div>
  `;
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}
