// Avaliador de expressões baseado na AST gerada pelo parser
const { Complexo } = require("./complexo");

function evaluate(node, env = {}) { // env contém valores de variáveis fornecidas pelo usuário
    switch (node.type) {

        case "NumberLiteral": // números reais simples
            return new Complexo(node.value, 0);

        case "ComplexLiteral": // números complexos explícitos
            return new Complexo(node.real, node.imag);

        case "Identifier": // variável como 'x', 'y', etc.
            if (!(node.name in env)) {
                throw new Error(`Variável não definida: ${node.name}`);
            }
            return env[node.name];

        case "UnaryExpression": // operações unárias como "-x"
            const valorUnario = evaluate(node.argument, env);
            if (node.operator === "-") {
                return new Complexo(-valorUnario.real, -valorUnario.imag);
            }
            return valorUnario;

        case "BinaryExpression": // operações binárias como +, -, *, /
            const left = evaluate(node.left, env);
            const right = evaluate(node.right, env);

            switch (node.operator) {
                case "+": return left.add(right);
                case "-": return left.sub(right);
                case "*": return left.mul(right);
                case "/": return left.div(right);
                default: throw new Error("Operador não suportado: " + node.operator);
            }

        default:
            throw new Error("Tipo de nó não reconhecido: " + node.type);
    }
}

module.exports = { evaluate };