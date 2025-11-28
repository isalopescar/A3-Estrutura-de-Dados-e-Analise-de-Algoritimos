#!/usr/bin/env node

// Interface de linha de comando para:
// - ler a expressão digitada pelo usuário
// - mostrar equivalente em notação LISP
// - identificar variáveis
// - solicitar seus valores
// - avaliar usando o evaluator

const readline = require("readline");
const path = require("path");
const { Complexo } = require("./complexo");

// carrega o parser do grupo
let parserModule;
try {
    parserModule = require(path.join(process.cwd(), "parser"));
} catch {
    console.log("Erro: parser não encontrado no diretório do projeto.");
    process.exit(1);
}

const parser = new parserModule.Parser();

// identifica variáveis presentes na expressão
function coletarVariaveis(node, conjunto = new Set()) {
    if (!node) return conjunto;

    if (node.constructor.name === "VariableNode" && node.name.toLowerCase() !== 'i') {
        conjunto.add(node.name);
    } else if (node.constructor.name === "BinaryOp") {
        coletarVariaveis(node.left, conjunto);
        coletarVariaveis(node.right, conjunto);
    } else if (node.constructor.name === "UnaryOp") {
        coletarVariaveis(node.operand, conjunto);
    }

    return conjunto;
}

// captura a expressão passada no terminal
const expressao = process.argv.slice(2).join(" ");
if (!expressao) {
    console.log('Uso: node index.js "expressão"');
    process.exit(1);
}

let ast;
try {
    ast = parser.parse(expressao);
} catch (erro) {
    console.log("Erro ao interpretar expressão:", erro.message);
    process.exit(1);
}

// mostra LISP
console.log("LISP:", ast.toLisp());

// descobre variáveis
const vars = [...coletarVariaveis(ast)];

if (vars.length === 0) {
    const resultado = ast.avaliar({});
    console.log("Resultado:", resultado.toString());
    process.exit(0);
}

// interface para perguntar valores
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const env = {};
let index = 0;

function perguntar() {
    if (index >= vars.length) {
        rl.close();
        const resposta = ast.avaliar(env);
        console.log("Resultado:", resposta.toString());
        return;
    }

    const nomeVar = vars[index];
    rl.question(`Valor para ${nomeVar}: `, valorDigitado => {
        try {
            const complexo = interpretarComplexo(valorDigitado);
            env[nomeVar] = complexo;
            index++;
            perguntar();
        } catch {
            console.log("Valor inválido. Exemplos: 3, -2, 1+2i, -i");
            perguntar();
        }
    });
}

function interpretarComplexo(txt) {
    if (txt.includes("i")) {
        const limpo = txt.replace(/\s+/g, "");

        if (limpo === "i") return new Complexo(0, 1);
        if (limpo === "-i") return new Complexo(0, -1);

        const formato = limpo.match(/^([+-]?\d+)([+-]\d+)i$/);
        if (formato) {
            return new Complexo(Number(formato[1]), Number(formato[2]));
        }
        throw new Error("Complexo inválido");
    }

    const num = Number(txt);
    if (!isNaN(num)) return new Complexo(num, 0);

    throw new Error("Número inválido");
}

perguntar();