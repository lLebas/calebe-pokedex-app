const { formatarNome, validarBusca, podeAdicionarAoTime } = require("./utils");

describe("formatarNome", () => {
  test("capitaliza um nome simples", () => {
    expect(formatarNome("pikachu")).toBe("Pikachu");
  });

  test("troca hífens por espaço e capitaliza cada parte", () => {
    expect(formatarNome("mr-mime")).toBe("Mr Mime");
    expect(formatarNome("ho-oh")).toBe("Ho Oh");
  });

  test("retorna string vazia para entrada inválida", () => {
    expect(formatarNome("")).toBe("");
    expect(formatarNome(undefined)).toBe("");
    expect(formatarNome(null)).toBe("");
  });
});

describe("validarBusca", () => {
  test("aceita nome válido", () => {
    expect(validarBusca("pikachu")).toBe(true);
    expect(validarBusca("Mr-Mime")).toBe(true);
    expect(validarBusca("  bulbasaur  ")).toBe(true);
  });

  test("aceita número válido", () => {
    expect(validarBusca("25")).toBe(true);
    expect(validarBusca("1025")).toBe(true);
  });

  test("rejeita vazio ou só espaços", () => {
    expect(validarBusca("")).toBe(false);
    expect(validarBusca("   ")).toBe(false);
  });

  test("rejeita caracteres inválidos", () => {
    expect(validarBusca("pika@chu")).toBe(false);
    expect(validarBusca("<script>")).toBe(false);
    expect(validarBusca("mr mime")).toBe(false);
    expect(validarBusca("-")).toBe(false);
    expect(validarBusca(25)).toBe(false);
  });
});

describe("podeAdicionarAoTime", () => {
  const pikachu = { nome: "Pikachu", numero: "0025" };

  test("permite adicionar em time vazio", () => {
    expect(podeAdicionarAoTime([], pikachu)).toBe(true);
  });

  test("permite adicionar Pokémon novo em time com vaga", () => {
    const time = [{ nome: "Bulbasaur" }, { nome: "Charmander" }];
    expect(podeAdicionarAoTime(time, pikachu)).toBe(true);
  });

  test("bloqueia quando o time já tem 6", () => {
    const time = ["A", "B", "C", "D", "E", "F"].map((nome) => ({ nome }));
    expect(podeAdicionarAoTime(time, pikachu)).toBe(false);
  });

  test("bloqueia Pokémon repetido (sem diferenciar maiúsculas)", () => {
    expect(podeAdicionarAoTime([{ nome: "Pikachu" }], pikachu)).toBe(false);
    expect(podeAdicionarAoTime([{ nome: "pikachu" }], pikachu)).toBe(false);
  });

  test("rejeita entradas inválidas", () => {
    expect(podeAdicionarAoTime(null, pikachu)).toBe(false);
    expect(podeAdicionarAoTime([], null)).toBe(false);
  });
});
