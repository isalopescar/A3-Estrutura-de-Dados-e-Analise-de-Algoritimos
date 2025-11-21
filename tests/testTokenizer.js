const { tokenize } = require("./tokenizer/tokenizer.js");

function test(input) {
    try {
        console.log(input, "=>", tokenize(input));
    } catch (err) {
        console.log(input, "ERRO:", err.message);
    }
}

console.log("=== TESTES DE TOKENIZAÇÃO ===");

// Conforme seu pedido
test("3+2i");
test("-i");
test("x*(a+b)");
test("  5  - 3  ");
test("3.5+4.2i");

// Casos adicionais
test("..5");     // erro esperado
test("3a5");     // erro esperado
test("i*i");