// tests/testTokenizer.js

const { tokenize, TOKEN_TYPES } = require("../src/tokenizer/Tokenizer");

// Função de assertiva simples
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Teste falhou: ${message}`);
  }
}

// Compara dois arrays de tokens
function compareTokens(actual, expected) {
  if (actual.length !== expected.length) {
    return false;
  }
  for (let i = 0; i < actual.length; i++) {
    if (
      actual[i].type !== expected[i].type ||
      actual[i].value !== expected[i].value
    ) {
      return false;
    }
  }
  return true;
}

// ESTRUTURA DE TESTE

function runTests() {
  console.log("Iniciando testes para Tokenizer.js");

  testNumerosEVariaveis();
  testOperadoresBinarios();
  testOperadoresUnariosNegativos();
  testFuncoesEAgrupamento();
  testErros();

  console.log("\nTodos os testes de Tokenizer.js concluídos com sucesso.");
}

// GRUPOS DE TESTE

function testNumerosEVariaveis() {
  console.log("\nTestando Números e Variáveis");

  // Números Reais
  const tokens1 = tokenize("123 + 45.67");
  const expected1 = [
    { type: TOKEN_TYPES.NUMBER, value: "123" },
    { type: TOKEN_TYPES.OPERATOR, value: "+" },
    { type: TOKEN_TYPES.NUMBER, value: "45.67" },
  ];
  assert(compareTokens(tokens1, expected1), "Números inteiros e decimais");

  // Variáveis
  const tokens2 = tokenize("A * B - i");
  const expected2 = [
    { type: TOKEN_TYPES.VARIABLE, value: "A" },
    { type: TOKEN_TYPES.OPERATOR, value: "*" },
    { type: TOKEN_TYPES.VARIABLE, value: "B" },
    { type: TOKEN_TYPES.OPERATOR, value: "-" },
    { type: TOKEN_TYPES.IMAG, value: "i" },
  ];
  assert(compareTokens(tokens2, expected2), "Variáveis A, B e i");

  // Notação Científica
  const tokens3 = tokenize("1.2e-3 + 5e2");
  const expected3 = [
    { type: TOKEN_TYPES.NUMBER, value: "1.2e-3" },
    { type: TOKEN_TYPES.OPERATOR, value: "+" },
    { type: TOKEN_TYPES.NUMBER, value: "5e2" },
  ];
  assert(compareTokens(tokens3, expected3), "Notação científica");
}

function testOperadoresBinarios() {
  console.log("\nTestando Operadores Binários ");

  const input = "1 + 2 * 3 / 4 ^ 5";
  const tokens = tokenize(input);
  const expected = [
    { type: TOKEN_TYPES.NUMBER, value: "1" },
    { type: TOKEN_TYPES.OPERATOR, value: "+" },
    { type: TOKEN_TYPES.NUMBER, value: "2" },
    { type: TOKEN_TYPES.OPERATOR, value: "*" },
    { type: TOKEN_TYPES.NUMBER, value: "3" },
    { type: TOKEN_TYPES.OPERATOR, value: "/" },
    { type: TOKEN_TYPES.NUMBER, value: "4" },
    { type: TOKEN_TYPES.OPERATOR, value: "^" },
    { type: TOKEN_TYPES.NUMBER, value: "5" },
  ];
  assert(compareTokens(tokens, expected), "Sequência de operadores binários");
}

function testOperadoresUnariosNegativos() {
  console.log("\nTestando Operador Unário Negativo (-)");

  // Sinal unário no início
  const tokens1 = tokenize("-5");
  const expected1 = [{ type: TOKEN_TYPES.NUMBER, value: "-5" }];
  assert(compareTokens(tokens1, expected1), "Unário no início (-5)");

  // Sinal unário depois de operador
  const tokens2 = tokenize("3 * -2");
  const expected2 = [
    { type: TOKEN_TYPES.NUMBER, value: "3" },
    { type: TOKEN_TYPES.OPERATOR, value: "*" },
    { type: TOKEN_TYPES.NUMBER, value: "-2" },
  ];
  assert(
    compareTokens(tokens2, expected2),
    "Unário depois de operador (3 * -2)"
  );

  // Sinal unário depois de parêntese
  const tokens3 = tokenize("(-3 + 4)");
  const expected3 = [
    { type: TOKEN_TYPES.LPAREN, value: "(" },
    { type: TOKEN_TYPES.NUMBER, value: "-3" },
    { type: TOKEN_TYPES.OPERATOR, value: "+" },
    { type: TOKEN_TYPES.NUMBER, value: "4" },
    { type: TOKEN_TYPES.RPAREN, value: ")" },
  ];
  assert(
    compareTokens(tokens3, expected3),
    "Unário depois de parêntese ((-3 + 4))"
  );

  // Caso especial: -i
  const tokens4 = tokenize("5 + -i");
  const expected4 = [
    { type: TOKEN_TYPES.NUMBER, value: "5" },
    { type: TOKEN_TYPES.OPERATOR, value: "+" },
    { type: TOKEN_TYPES.IMAG, value: "-i" },
  ];
  assert(compareTokens(tokens4, expected4), "Unário para -i (5 + -i)");

  // Notação científica negativa
  const tokens5 = tokenize("-1e-3");
  const expected5 = [{ type: TOKEN_TYPES.NUMBER, value: "-1e-3" }];
  assert(
    compareTokens(tokens5, expected5),
    "Unário com notação científica (-1e-3)"
  );
}

function testFuncoesEAgrupamento() {
  console.log("\nTestando Funções e Agrupamento");

  const input = "conj(A + 2) / sqrt(-i)";
  const tokens = tokenize(input);
  const expected = [
    { type: TOKEN_TYPES.FUNCTION, value: "conj" },
    { type: TOKEN_TYPES.LPAREN, value: "(" },
    { type: TOKEN_TYPES.VARIABLE, value: "A" },
    { type: TOKEN_TYPES.OPERATOR, value: "+" },
    { type: TOKEN_TYPES.NUMBER, value: "2" },
    { type: TOKEN_TYPES.RPAREN, value: ")" },
    { type: TOKEN_TYPES.OPERATOR, value: "/" },
    { type: TOKEN_TYPES.FUNCTION, value: "sqrt" },
    { type: TOKEN_TYPES.LPAREN, value: "(" },
    { type: TOKEN_TYPES.IMAG, value: "-i" },
    { type: TOKEN_TYPES.RPAREN, value: ")" },
  ];
  assert(compareTokens(tokens, expected), "Funções, variáveis e -i");
}

function testErros() {
  console.log("\nTestando Detecção de Erros");

  // Caractere inválido
  let caughtError1 = false;
  try {
    tokenize("1 $ 2");
  } catch (e) {
    caughtError1 = true;
  }
  assert(caughtError1, "Deve falhar com caractere inválido ($)");

  // Número decimal inválido (dois pontos)
  let caughtError2 = false;
  try {
    tokenize("1.2.3");
  } catch (e) {
    caughtError2 = true;
  }
  assert(caughtError2, "Deve falhar com número decimal inválido (1.2.3)");

  // Notação científica sem expoente
  let caughtError3 = false;
  try {
    tokenize("1e+");
  } catch (e) {
    caughtError3 = true;
  }
  assert(caughtError3, "Deve falhar com notação científica sem expoente");
}

runTests();

module.exports = { runTests };
