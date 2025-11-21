const assert = require("assert");
const { Complexo } = require("../complexo");
const { evaluate } = require("../evaluator");

// AST montada manualmente apenas para teste
const ast = {
    type: "BinaryExpression",
    operator: "*",
    left: {
        type: "BinaryExpression",
        operator: "+",
        left: { type: "Identifier", name: "x" },
        right: { type: "NumberLiteral", value: 2 }
    },
    right: {
        type: "BinaryExpression",
        operator: "-",
        left: { type: "Identifier", name: "y" },
        right: { type: "NumberLiteral", value: 3 }
    }
};

// ambiente com valores
const env = {
    x: new Complexo(5, 0),
    y: new Complexo(4, 0)
};

const resultado = evaluate(ast, env);

assert.strictEqual(resultado.real, 7);
assert.strictEqual(resultado.imag, 0);

console.log("Teste de integração passou.");