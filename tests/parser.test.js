const { Parser } = require("../src/parser/Parser");
const { Complexo } = require("../src/complexo/Complexo");

// Função de assertiva simples
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Teste falhou: ${message}`);
  }
}

// ESTRUTURA DE TESTE

const parser = new Parser();
const EPSILON = 1e-9;
const ENV = {
  A: new Complexo(2, 0), // Variável A = 2
  B: new Complexo(0, 5), // Variável B = 5i
  C: new Complexo(-1, -1), // Variável C = -1 - i
};

function runTests() {
  console.log("Iniciando testes para Parser.js (AST e Avaliação)");

  testSintaxePrecedencia();
  testAvaliacaoBasica();
  testFuncoesEUnarios();
  testMultiplicacaoImplicita();
  testErrosDeSintaxe();
  testErrosDeAvaliacao();

  console.log("\nTodos os testes de Parser.js concluídos com sucesso.");
}

// GRUPOS DE TESTE

function testSintaxePrecedencia() {
  console.log("\nTestando Sintaxe e Precedência (LISP)");

  // Precedência: * e / sobre + e -
  const ast1 = parser.parse("2 + 3 * 4");
  assert(ast1.toLisp() === "(+ 2 (* 3 4))", "Precedência (* sobre +)");

  // Agrupamento: Parênteses
  const ast2 = parser.parse("(2 + 3) * 4");
  assert(ast2.toLisp() === "(* (+ 2 3) 4)", "Agrupamento com parênteses");

  // Potência: Associatividade à direita
  const ast3 = parser.parse("2 ^ 3 ^ 4");
  assert(
    ast3.toLisp() === "(^ 2 (^ 3 4))",
    "Potência (^): Associatividade à direita"
  );

  // Unários e Funções
  const ast4 = parser.parse("-conj(A) * i");
  assert(ast4.toLisp() === "(* (- (conj A)) i)", "Unários e Funções");
}

function testAvaliacaoBasica() {
  console.log("\nTestando Avaliação Básica e Variáveis");

  // Aritmética Mista: 1 + 2 * i = 1 + 2i
  const res1 = parser.parse("1 + 2 * i").avaliar(ENV);
  assert(res1.equals(new Complexo(1, 2), EPSILON), "Aritmética Mista (1 + 2i)");

  // Variáveis: A + B = 2 + 5i
  const res2 = parser.parse("A + B").avaliar(ENV);
  assert(res2.equals(new Complexo(2, 5), EPSILON), "Variáveis (A + B)");

  // Subtração: B - 2i = 5i - 2i = 3i
  const res3 = parser.parse("B - 2*i").avaliar(ENV);
  assert(res3.equals(new Complexo(0, 3), EPSILON), "Subtração (B - 2i)");

  // Divisão e Múltiplicação: (5+i)/(1+i) = 3 - 2i
  const res4 = parser.parse("(5 + i) / (1 + i)").avaliar(ENV);
  assert(res4.equals(new Complexo(3, -2), EPSILON), "Divisão (3 - 2i)");
}

function testFuncoesEUnarios() {
  console.log("\nTestando Funções e Unários");

  // Negativo Unário: -C = -(-1-i) = 1 + i
  const res1 = parser.parse("-C").avaliar(ENV);
  assert(res1.equals(new Complexo(1, 1), EPSILON), "Negativo Unário (-C)");

  // Conjugado: conj(A + B) = conj(2 + 5i) = 2 - 5i
  const res2 = parser.parse("conj(A + B)").avaliar(ENV);
  assert(res2.equals(new Complexo(2, -5), EPSILON), "Conjugado (conj(A+B))");

  // Módulo e Raiz: sqrt(abs(C) * 2) = sqrt(|-1-i| * 2) = sqrt(sqrt(2) * 2) ≈ 1.681
  // |-1-i| = sqrt(2). sqrt(2*sqrt(2)) = 1.68179
  const expected3 = Math.sqrt(2 * Math.sqrt(2));
  const res3 = parser.parse("abs(C)").avaliar(ENV);
  const res3_2 = parser.parse("sqrt(res3 * 2)").avaliar({ res3: res3 }); // Avalia em partes para precisão

  // Testa o módulo:
  assert(
    Math.abs(res3.real - Math.sqrt(2)) < EPSILON && res3.imag === 0,
    "Módulo |C|"
  );
  // Testa a raiz:
  assert(
    Math.abs(res3_2.real - expected3) < EPSILON && res3_2.imag < EPSILON,
    "Raiz (sqrt(abs(C)*2))"
  );

  // Potência: i^3 = -i
  const res4 = parser.parse("i ^ 3").avaliar(ENV);
  assert(res4.equals(new Complexo(0, -1), EPSILON), "Potência (i^3)");
}

function testMultiplicacaoImplicita() {
  console.log("\nTestando Multiplicação Implícita");

  // Número e Parênteses: 2(1 + i) = 2 + 2i
  const res1 = parser.parse("2(1 + i)").avaliar(ENV);
  assert(res1.equals(new Complexo(2, 2), EPSILON), "2(1 + i)");

  // Variável e Parênteses: A(B) = 2 * 5i = 10i
  const res2 = parser.parse("A(B)").avaliar(ENV);
  assert(res2.equals(new Complexo(0, 10), EPSILON), "A(B)");

  // Número e Imaginário: 5i = 5i
  const res3 = parser.parse("5i").avaliar(ENV);
  assert(res3.equals(new Complexo(0, 5), EPSILON), "5i");

  // Parênteses e Parênteses: (A)(B) = 10i
  const res4 = parser.parse("(A)(B)").avaliar(ENV);
  assert(res4.equals(new Complexo(0, 10), EPSILON), "(A)(B)");

  // Funções e Implícita (conj(A)B) = conj(2) * 5i = 10i
  const res5 = parser.parse("conj(A)B").avaliar(ENV);
  assert(
    res5.equals(new Complexo(0, 10), EPSILON),
    "Função implícita (conj(A)B)"
  );
}

function testErrosDeSintaxe() {
  console.log("\nTestando Erros de Sintax");

  // Parênteses desbalanceados (Deixa o ')' não consumido)
  let error1 = false;
  try {
    parser.parse("(2 + 3");
  } catch (e) {
    error1 = true;
  }
  assert(error1, "Parênteses desbalanceados");

  // Operador no final (Causa erro de sintaxe na próxima chamada a parsePrimary)
  let error2 = false;
  try {
    parser.parse("A +");
  } catch (e) {
    error2 = true;
  }
  assert(error2, "Operador no final");

  //  Token não consumido (Exemplo: Falta do parêntese de fechamento)
  let error3 = false;
  try {
    parser.parse("A + 2(B");
  } catch (e) {
    error3 = true;
  }
  assert(error3, "Falta de parêntese de fechamento");
}

function testErrosDeAvaliacao() {
  console.log("\nTestando Erros de Avaliação");

  // Divisão por zero
  let error1 = false;
  try {
    parser.parse("5 / (A - 2)").avaliar(ENV);
  } catch (e) {
    error1 = true;
  }
  assert(error1, "Divisão por zero");

  // Variável não definida
  let error2 = false;
  try {
    parser.parse("X + 1").avaliar(ENV);
  } catch (e) {
    error2 = true;
  }
  assert(error2, "Variável não definida");
}

runTests();

module.exports = { runTests };
