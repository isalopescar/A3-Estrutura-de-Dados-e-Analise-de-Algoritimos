const readline = require("readline");
const { Complexo } = require("../../src/complexo/Complexo"); // Dependência de Complexo
const { Parser } = require("../parser/Parser"); // Dependência do Parser

const parser = new Parser();

// VARIÁVEIS DE ESTADO

const environment = {};

// FUNÇÕES DE UTILIDADE

// Identifica variáveis presentes na AST
function coletarVariaveis(node, conjunto = new Set()) {
  if (!node) return conjunto;

  if (
    node.constructor.name === "VariableNode" &&
    node.name.toLowerCase() !== "i"
  ) {
    conjunto.add(node.name);
  } else if (node.constructor.name === "BinaryOp") {
    coletarVariaveis(node.left, conjunto);
    coletarVariaveis(node.right, conjunto);
  } else if (node.constructor.name === "UnaryOp") {
    coletarVariaveis(node.operand, conjunto);
  }

  return conjunto;
}

// Interpreta string para objeto Complexo (a + bi)
function interpretarComplexo(txt) {
  const limpo = txt.replace(/\s/g, "");

  // Tenta parsear como imaginário puro (ex: 3i, -1.5i, i, -i)
  if (limpo.endsWith("i")) {
    const parteImag = limpo.slice(0, -1);

    if (parteImag === "" || parteImag === "+") return new Complexo(0, 1);
    if (parteImag === "-") return new Complexo(0, -1);

    // Trata '3', '-1.5', '+2.5' como a parte imaginária
    const imagNum = Number(parteImag);
    if (!isNaN(imagNum)) return new Complexo(0, imagNum);

    // Tenta formato completo a+bi onde a parte imaginária está colada ao 'i'
    const matchFull = limpo.match(/^([+-]?\d*\.?\d+)([+-]\d*\.?\d*)i$/i);
    if (matchFull) {
      const real = Number(matchFull[1]);
      let imagPart = matchFull[2];

      if (imagPart === "+") imagPart = "1";
      if (imagPart === "-") imagPart = "-1";

      return new Complexo(real, Number(imagPart));
    }

    // Tenta o formato a+i, a-i (implícito)
    const matchImplied = limpo.match(/^([+-]?\d*\.?\d+)([+-])i$/i);
    if (matchImplied) {
      const real = Number(matchImplied[1]);
      const imag = matchImplied[2] === "+" ? 1 : -1;
      return new Complexo(real, imag);
    }
  }

  // Tenta parsear como número real puro (ex: 3, -1.5)
  const num = Number(limpo);
  if (!isNaN(num)) return new Complexo(num, 0);

  // Fallback para formatos ambíguos (ex: 2+3i, 1-i) que não foram capturados acima
  const matchSimple = limpo.match(/^([+-]?\d*\.?\d+)([+-]\d*\.?\d*i?)$/i);
  if (matchSimple) {
    // Tenta formatar as partes separadas
    const realStr = matchSimple[1];
    const imagStr = matchSimple[2];

    if (imagStr.endsWith("i")) {
      let imagVal = imagStr.slice(0, -1);
      if (imagVal === "+") imagVal = "1";
      if (imagVal === "-") imagVal = "-1";

      return new Complexo(Number(realStr), Number(imagVal));
    }
  }

  throw new Error("Número complexo inválido");
}

// FLUXO PRINCIPAL

// Captura a expressão de linha de comando
const expressao = process.argv.slice(2).join(" ");
if (!expressao) {
  console.log('Uso: node src/cli/Index.js "expressão"');
  process.exit(1);
}

let ast;
try {
  // Analisa a expressão e constrói a AST
  ast = parser.parse(expressao);
} catch (erro) {
  // Detecta erros de sintaxe
  console.log("Erro ao interpretar expressão (Sintaxe):", erro.message);
  process.exit(1);
}

// Mostra a árvore LISP
console.log("LISP:", ast.toLisp());

// Descobre variáveis (todas as variáveis não são 'i')
const vars = [...coletarVariaveis(ast)];

// Se não houver variáveis, avalia diretamente.
if (vars.length === 0) {
  try {
    // Avaliação direta
    const resultado = ast.avaliar({});
    console.log("Resultado:", resultado.toString());
    process.exit(0);
  } catch (erroAvaliacao) {
    // Captura erros de avaliação (ex: divisão por zero)
    console.log("Erro ao avaliar expressão:", erroAvaliacao.message);
    process.exit(1);
  }
}

// INTERAÇÃO COM O USUÁRIO (Para variáveis desconhecidas)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = {}; // Ambiente criado para esta execução
let index = 0;

function perguntar() {
  if (index >= vars.length) {
    rl.close();
    try {
      // Avalia com o ambiente preenchido
      const resposta = ast.avaliar(env);
      console.log("Resultado:", resposta.toString());
      return;
    } catch (erroAvaliacao) {
      // Captura erros de avaliação (ex: divisão por zero)
      console.log("Erro ao avaliar expressão:", erroAvaliacao.message);
      process.exit(1);
    }
  }

  const nomeVar = vars[index];
  rl.question(
    `Valor para ${nomeVar} (ex: 3, -1.5, 1+2i, -i): `,
    (valorDigitado) => {
      try {
        const complexo = interpretarComplexo(valorDigitado);
        env[nomeVar] = complexo;
        index++;
        perguntar();
      } catch (e) {
        console.log("Valor inválido. Por favor, tente novamente.");
        perguntar();
      }
    }
  );
}

perguntar();
