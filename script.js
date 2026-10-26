import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// TODO: troque pelos dados do SEU projeto Supabase (Project Settings → API).
const SUPABASE_URL = "https://SEU-PROJETO.supabase.co";
const SUPABASE_ANON_KEY = "SUA_CHAVE_ANON";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TABELA_TIME = "time_pokemon";
const TAMANHO_MAX_TIME = 6;

const BASE_URL = "https://pokeapi.co/api/v2/pokemon/";

const form = document.getElementById("form-busca");
const campoBusca = document.getElementById("campo-busca");
const resultado = document.getElementById("resultado");
const listaTime = document.getElementById("lista-time");
const timeVazio = document.getElementById("time-vazio");
const timeContador = document.getElementById("time-contador");

let pokemonAtual = null;
let timeAtual = [];

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
  if (!validarBusca(termo)) {
    exibirErro(termo);
    return;
  }
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
  const nome = formatarNome(dados.name);
  const imagem =
    dados.sprites?.other?.["official-artwork"]?.front_default ||
    dados.sprites?.front_default ||
    "";

  const tipos = dados.types
    .map((t) => {
      const tipo = t.type.name;
      const label = NOMES_TIPOS[tipo] || formatarNome(tipo);
      return `<span class="badge badge--${tipo}">${label}</span>`;
    })
    .join("");

  const stats = dados.stats.map(renderStat).join("");

  pokemonAtual = { numero, nome, imagem, tipos: dados.types.map((t) => t.type.name) };

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

      <div class="card__acoes">
        <button type="button" id="botao-add-time" class="botao-time">+ Adicionar ao time</button>
        <span class="card__aviso" id="aviso-time"></span>
      </div>
    </div>
  `;

  document
    .getElementById("botao-add-time")
    .addEventListener("click", () => adicionarAoTime(pokemonAtual));
}

// CREATE — salva o Pokémon atual no time (Supabase)
async function adicionarAoTime(pokemon) {
  if (!pokemon) return;
  const aviso = document.getElementById("aviso-time");
  const botao = document.getElementById("botao-add-time");

  if (!podeAdicionarAoTime(timeAtual, pokemon, TAMANHO_MAX_TIME)) {
    aviso.textContent =
      timeAtual.length >= TAMANHO_MAX_TIME
        ? "Time completo (6/6)."
        : "Esse Pokémon já está no time.";
    return;
  }

  botao.disabled = true;
  const { error } = await supabase.from(TABELA_TIME).insert({
    nome_item: pokemon.nome,
    dados_extra: {
      numero: pokemon.numero,
      imagem: pokemon.imagem,
      tipos: pokemon.tipos,
    },
  });

  if (error) {
    console.error(error);
    aviso.textContent = "Erro ao salvar. Veja o console (F12).";
    botao.disabled = false;
    return;
  }

  aviso.textContent = "Adicionado ao time!";
  await listarTime();
}

// READ — carrega e desenha o time salvo
async function listarTime() {
  const { data, error } = await supabase
    .from(TABELA_TIME)
    .select("*")
    .order("criado_em", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  timeAtual = data.map((item) => ({ nome: item.nome_item }));
  timeContador.textContent = `${data.length}/${TAMANHO_MAX_TIME}`;

  if (data.length === 0) {
    listaTime.innerHTML = `<li class="team__vazio" id="time-vazio">Nenhum Pokémon no time ainda.</li>`;
    return;
  }

  listaTime.innerHTML = data
    .map((item) => {
      const extra = item.dados_extra || {};
      return `
        <li class="team__item">
          <img src="${extra.imagem || ""}" alt="${escaparHTML(item.nome_item)}" />
          <span class="team__nome">${formatarNome(item.nome_item)}</span>
          <button type="button" class="team__remover" data-id="${item.id}" aria-label="Remover ${escaparHTML(item.nome_item)} do time">✕</button>
        </li>
      `;
    })
    .join("");

  listaTime.querySelectorAll(".team__remover").forEach((botao) => {
    botao.addEventListener("click", () => removerDoTime(botao.dataset.id));
  });
}

// DELETE — remove um Pokémon do time
async function removerDoTime(id) {
  const { error } = await supabase.from(TABELA_TIME).delete().eq("id", id);
  if (error) {
    console.error(error);
    return;
  }
  await listarTime();
}

listarTime();

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

function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}
