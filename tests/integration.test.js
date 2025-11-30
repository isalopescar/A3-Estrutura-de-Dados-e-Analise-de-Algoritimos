const assert = require("assert");
const { Parser } = require("../src/parser/Parser");
const { Complexo } = require("../src/complexo/Complexo");

// Inicialização do parser para testes de avaliação
const parser = new Parser();
const EPSILON = 1e-9;

// FUNÇÕES AUXILIARES DE TESTE

/**
 * Avalia uma expressão, verifica o LISP e o resultado final.
 * @param {string} expression - Expressão de entrada.
 * @param {string} expectedLisp - LISP esperado.
 * @param {Complexo} expectedResult - Complexo esperado.
 * @param {Object} env - Ambiente de variáveis.
 * @param {string} message - Mensagem de teste.
 */
function assertEvaluation(
  expression,
  expectedLisp,
  expectedResult,
  env = {},
  message
) {
  const ast = parser.parse(expression);
  assert.strictEqual(ast.toLisp(), expectedLisp, `${message} | LISP Incorreto`);

  const result = ast.avaliar(env);
  assert(
    result.equals(expectedResult, EPSILON),
    `${message} | Resultado Incorreto: Esperado ${expectedResult.toString()}, Obtido ${result.toString()}`
  );

  console.log(`  -> Sucesso: ${message}`);
}

/**
 * Verifica se uma expressão lança um erro de avaliação.
 * @param {string} expression - Expressão de entrada.
 * @param {Object} env - Ambiente de variáveis.
 * @param {string} message - Mensagem de teste.
 */
function assertThrowsEvaluationError(expression, env, message) {
  let errorCaught = false;
  try {
    const ast = parser.parse(expression);
    ast.avaliar(env);
  } catch (e) {
    errorCaught = true;
  }
  assert(
    errorCaught,
    `${message} | Deveria ter lançado erro de avaliação, mas foi concluído.`
  );
  console.log(`  -> Sucesso: ${message} (Erro capturado)`);
}

// ESTRUTURA PRINCIPAL DE TESTE

function runTests() {
  console.log("Iniciando testes de Integração (Parser + Avaliação)");

  testELISP();
  testComVariaveis();
  testMultiplicacaoImplicita();
  testErros();

  console.log("\nTodos os testes de Integração concluídos com sucesso.");
}

// GRUPOS DE TESTE

function testELISP() {
  console.log("\n Testando LISP e Avaliação Pura");

  // Aritmética básica
  assertEvaluation(
    "3 + 4 * 2",
    "(+ 3 (* 4 2))",
    new Complexo(11, 0),
    {},
    "Básica: 3 + 4 * 2 = 11"
  );

  // Números complexos e parênteses
  assertEvaluation(
    "abs(3 + 4i) ^ 2",
    "(^ (abs (+ 3 (* 4 i))) 2)",
    new Complexo(25, 0), // |3+4i|^2 = 5^2 = 25
    {},
    "Funções: abs(3 + 4i) ^ 2 = 25"
  );
}

function testComVariaveis() {
  console.log("\nTestando Variáveis e i");

  const env1 = { A: new Complexo(1, 1), B: new Complexo(0, -1) }; // A=1+i, B=-i

  // Variáveis + i
  assertEvaluation(
    "A + B * i",
    "(+ A (* B i))",
    new Complexo(2, 1), // A + (-i * i) = (1+i) + (-(-1)) = 1+i + 1 = 2+i
    env1,
    "Variável A + B * i"
  );

  // Conjugado de variável
  assertEvaluation(
    "conj(A) * i",
    "(* (conj A) i)",
    new Complexo(1, 1), // conj(1+i) * i = (1-i) * i = i - i^2 = i + 1 = 1+i
    env1,
    "Conjugado de Variável"
  );

  const env2 = { Z: new Complexo(10, 0) };

  // Raiz com variável
  assertEvaluation(
    "sqrt(Z)",
    "(sqrt Z)",
    new Complexo(Math.sqrt(10), 0),
    env2,
    "Raiz com Variável (sqrt(10))"
  );
}

function testMultiplicacaoImplicita() {
  console.log("\nTestando Multiplicação Implícita");

  const env = { X: new Complexo(2, 0) }; // X = 2

  // Número seguido de variável (2X)
  assertEvaluation(
    "2X + i",
    "(+ (* 2 X) i)",
    new Complexo(4, 1), // 2*2 + i = 4+i
    env,
    "Implícita: Número seguido de Variável (2X)"
  );

  // Número seguido de i (3i)
  assertEvaluation(
    "3i",
    "(* 3 i)",
    new Complexo(0, 3),
    {},
    "Implícita: Número seguido de i (3i)"
  );

  // Parênteses seguidos (2+i)(3-i) = 6 + 2i - i^2 = 7 + i
  assertEvaluation(
    "(2 + i)(3 - i)",
    "(* (+ 2 i) (- 3 i))",
    new Complexo(7, 1),
    {},
    "Implícita: Parênteses seguidos"
  );
}

function testErros() {
  console.log("\nTestando Tratamento de Erros");

  // Divisão por zero
  const env1 = { V: new Complexo(0, 0) };
  assertThrowsEvaluationError("1 / V", env1, "Erro: Divisão por zero");

  // Variável não definida
  assertThrowsEvaluationError(
    "X + 1",
    {}, // X não está no ENV
    "Erro: Variável não definida"
  );

  // Potência com expoente complexo (não suportado)
  assertThrowsEvaluationError(
    "2 ^ i",
    {},
    "Erro: Potência com expoente complexo"
  );
}

runTests();

module.exports = { runTests };
