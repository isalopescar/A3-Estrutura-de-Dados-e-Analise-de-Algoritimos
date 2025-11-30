const { Complexo } = require("../src/complexo/Complexo");

// Função de assertiva simples para Node
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Teste falhou: ${message}`);
  }
}

// ESTRUTURA DE TESTE

function runTests() {
  console.log("Iniciando testes para Complexo.js");

  // EPSILON é a tolerância para comparação de números de ponto flutuante
  const EPSILON = 1e-9;

  testRepresentacao();
  testAritmeticaBasica(EPSILON);
  testOperacoesAvancadas(EPSILON);
  testPropriedades(EPSILON);
  testIgualdade(EPSILON);

  console.log("\nTodos os testes de Complexo.js concluídos com sucesso.");
}

// GRUPOS DE TESTE

function testRepresentacao() {
  console.log("\nTestando Representação (toString)");

  // a + bi
  assert(new Complexo(3, 4).toString() === "3 + 4i", "Representação 3 + 4i");
  // a - bi
  assert(new Complexo(3, -4).toString() === "3 - 4i", "Representação 3 - 4i");
  // a + i (b=1)
  assert(new Complexo(2, 1).toString() === "2 + i", "Representação 2 + i");
  // a - i (b=-1)
  assert(new Complexo(2, -1).toString() === "2 - i", "Representação 2 - i");
  // a puro
  assert(new Complexo(5, 0).toString() === "5", "Representação Real Puro");
  // bi puro (b!=1, b!=-1)
  assert(
    new Complexo(0, 7).toString() === "7i",
    "Representação Imaginário Puro"
  );
  // i puro
  assert(new Complexo(0, 1).toString() === "i", "Representação i Puro");
  // -i puro
  assert(new Complexo(0, -1).toString() === "-i", "Representação -i Puro");
  // Zero
  assert(new Complexo(0, 0).toString() === "0", "Representação Zero");
}

function testAritmeticaBasica(EPSILON) {
  console.log("\nTestando Aritmética Básica (+, -, *, /)");

  const Z1 = new Complexo(2, 3); // 2 + 3i
  const Z2 = new Complexo(4, -1); // 4 - i
  const Z3 = new Complexo(0, 0); // 0

  // Soma: (2+3i) + (4-i) = 6 + 2i
  const sum = Z1.add(Z2);
  assert(sum.real === 6 && sum.imag === 2, "Soma (2+3i) + (4-i)");

  // Subtração: (2+3i) - (4-i) = -2 + 4i
  const sub = Z1.sub(Z2);
  assert(sub.real === -2 && sub.imag === 4, "Subtração (2+3i) - (4-i)");

  // Multiplicação: (2+3i) * (4-i) = 11 + 10i
  const mul = Z1.mul(Z2);
  assert(mul.real === 11 && mul.imag === 10, "Multiplicação (2+3i) * (4-i)");

  // Divisão: (2+3i) / (4-i) ≈ 0.294 + 0.823i
  const div = Z1.div(Z2);
  assert(
    div.equals(new Complexo(5 / 17, 14 / 17), EPSILON),
    "Divisão (2+3i) / (4-i)"
  );

  // Divisão por zero (deve lançar erro)
  let caughtError = false;
  try {
    Z1.div(Z3);
  } catch (e) {
    caughtError = true;
  }
  assert(caughtError, "Divisão por Zero (deve lançar erro)");
}

function testOperacoesAvancadas(EPSILON) {
  console.log("\nTestando Operações Avançadas (Conjugado, Potência, Raiz)");

  const Z = new Complexo(3, 4); // 3 + 4i
  const I = new Complexo(0, 1); // i
  const Q = new Complexo(0, 4); // 4i

  // Conjugado: (3 + 4i) -> 3 - 4i
  const conj = Z.conjugado();
  assert(conj.real === 3 && conj.imag === -4, "Conjugado (3+4i)");

  // Potência: i^2 = -1 + 0i
  const pow2 = I.pow(2);
  assert(pow2.equals(new Complexo(-1, 0), EPSILON), "Potência i^2 = -1");

  // Potência: (1+i)^4 = -4
  const Z4 = new Complexo(1, 1);
  const pow4 = Z4.pow(4);
  assert(pow4.equals(new Complexo(-4, 0), EPSILON), "Potência (1+i)^4 = -4");

  // Raiz Quadrada Principal: sqrt(4i) = sqrt(2) + i*sqrt(2)
  const SQRT_2 = Math.sqrt(2);
  const sqrt4i = Q.sqrt();
  assert(
    sqrt4i.equals(new Complexo(SQRT_2, SQRT_2), EPSILON),
    "Raiz Quadrada Principal (4i)"
  );
}

function testPropriedades(EPSILON) {
  console.log("\nTestando Propriedades (abs, arg)");

  const Z = new Complexo(3, 4); // 3 + 4i
  const negReal = new Complexo(-2, 0); // -2
  const negImag = new Complexo(-1, -1); // -1 - i

  // Módulo (abs): |3 + 4i| = 5
  assert(Math.abs(Z.abs() - 5) < EPSILON, "Módulo |3 + 4i|");

  // Módulo (abs): |-2| = 2
  assert(Math.abs(negReal.abs() - 2) < EPSILON, "Módulo |-2|");

  // Argumento (arg): arg(3 + 4i) ≈ 0.927 rad
  const argZ = Math.atan2(4, 3);
  assert(Math.abs(Z.arg() - argZ) < EPSILON, "Argumento arg(3 + 4i)");

  // Argumento (arg): arg(-2) = PI
  assert(Math.abs(negReal.arg() - Math.PI) < EPSILON, "Argumento arg(-2)");

  // Argumento (arg): arg(-1 - i) = -3PI/4
  assert(
    Math.abs(negImag.arg() - (-3 * Math.PI) / 4) < EPSILON,
    "Argumento arg(-1 - i)"
  );
}

function testIgualdade(EPSILON) {
  console.log("\nTestando Igualdade (equals)");

  const Z1 = new Complexo(1, 2);
  const Z2 = new Complexo(1, 2);
  // Usa EPSILON para criar um número ligeiramente diferente, mas dentro da tolerância
  const Z3 = new Complexo(1 + EPSILON / 10, 2);
  const Z4 = new Complexo(1.1, 2); // Diferente

  // Igualdade exata
  assert(Z1.equals(Z2), "Igualdade exata");

  // Igualdade com tolerância
  assert(Z1.equals(Z3), "Igualdade com tolerância");

  // Desigualdade
  assert(!Z1.equals(Z4), "Desigualdade");

  // Diferentes tipos
  assert(!Z1.equals(1 + 2 * Math.random()), "Diferentes tipos");
}

runTests();

module.exports = { runTests };
