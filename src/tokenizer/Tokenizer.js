const TOKEN_TYPES = {
    NUMBER: "NUMBER",
    IMAG: "IMAG",
    VARIABLE: "VARIABLE",
    OPERATOR: "OPERATOR",
    LPAREN: "LPAREN",
    RPAREN: "RPAREN",
    FUNCTION: "FUNCTION"
};

// Operadores permitidos
const OPERATORS = new Set(["+", "-", "*", "/", "^"]);

// Funçõe unárias permitidas
const FUNCTIONS = new Set(["sqrt", "conj", "abs", "arg"])

function tokenize(input) {
    const tokens = [];
    let i = 0;

    while (i < input.length) {
        let char = input[i];

        // Ignorar espaços
        if (char === " ") {
            i++;
            continue;
        }

        // Parênteses
        if (char === "(") {
            tokens.push({ type: TOKEN_TYPES.LPAREN, value: "(" });
            i++;
            continue;
        }
        if (char === ")") {
            tokens.push({ type: TOKEN_TYPES.RPAREN, value: ")" });
            i++;
            continue;
        }

        // Operadores
        if (OPERATORS.has(char)) {
            tokens.push({ type: TOKEN_TYPES.OPERATOR, value: char });
            i++;
            continue;
        }

        // Variáveis (ex.: x, a, b, z)
        if (/[a-zA-Z]/.test(char)) {
            let start = i;
            while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) {
                i++
            }
            const indentifier = input.slice(start, i);
            if (identifier === "i") {
                tokens.push({ type: TOKEN_TYPES.IMAG, value: "i" });
            } else if (FUNCTIONS.has(identifier)) {
                tokens.push({ type: TOKEN_TYPES.FUNCTION, value: identifier })
            } else {
                tokens.push({ type: TOKEN_TYPES.VARIABLE, value: identifier });
            }
            continue;
        }

        // Números (inclui negativos e decimais)
        if (/[0-9.]/.test(char)) {
            let start = i;
            let decimalCount = (char === ".") ? 1 : 0;

            i++;
            while (i < input.length && /[0-9.]/.test(input[i])) {
                if (input[i] === ".") decimalCount++;
                if (decimalCount > 1) {
                    throw new Error(`Número com decimal inválido: ${input.slice(start, i+1)}`);
                }
                i++;
            }

            // lógica para notação científica
                let charAposNum = input[i] ? input[i].toLowerCase() : null;
                if (charAposNum === 'e') {
                    i++
                    if (input[i] === '+' || input[i] === '-') {
                        i++
                    }
                    let startExp = i;
                    while (i < input.length && /[0-9]/.test(input[i])) {
                    i++
                    }
                    if (i === startExp) {
                        throw new Error(`Erro: Exponente inválido na notção científica`);
                    }
                }
            tokens.push({
                type: TOKEN_TYPES.NUMBER,
                value: input.slice(start, i)
            });
            continue;
        }

        // Se nenhum caso acima atende → caractere inválido
        throw new Error('Caractere inválido encontrado: ${char}');
    }

    return tokens;
}

module.exports = { tokenize, TOKEN_TYPES };