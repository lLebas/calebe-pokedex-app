// Funções puras (sem DOM nem fetch), usadas pelo script.js no navegador
// e pelos testes (Jest) no Node.

// "pikachu" -> "Pikachu" · "mr-mime" -> "Mr Mime"
function formatarNome(nome) {
  if (typeof nome !== "string") return "";
  return nome
    .split("-")
    .filter((parte) => parte !== "")
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ");
}

// Aceita nome (letras, números e hífens, ex: "ho-oh") ou número (ex: "25").
function validarBusca(termo) {
  if (typeof termo !== "string") return false;
  return /^[a-z0-9]+(-[a-z0-9]+)*$/i.test(termo.trim());
}

// O time tem no máximo 6 Pokémon e não aceita repetidos (comparação pelo nome).
function podeAdicionarAoTime(time, pokemon, limite = 6) {
  if (!Array.isArray(time) || !pokemon || !pokemon.nome) return false;
  if (time.length >= limite) return false;
  const nome = pokemon.nome.toLowerCase();
  return !time.some((membro) => membro && String(membro.nome).toLowerCase() === nome);
}

if (typeof module !== "undefined") {
  module.exports = { formatarNome, validarBusca, podeAdicionarAoTime };
}
