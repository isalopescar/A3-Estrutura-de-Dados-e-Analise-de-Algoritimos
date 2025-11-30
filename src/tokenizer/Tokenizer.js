const TOKEN_TYPES = {
  NUMBER: "NUMBER",
  IMAG: "IMAG",
  VARIABLE: "VARIABLE",
  OPERATOR: "OPERATOR",
  LPAREN: "LPAREN",
  RPAREN: "RPAREN",
  FUNCTION: "FUNCTION",
};

// Operadores permitidos
const OPERATORS = new Set(["+", "-", "*", "/", "^"]);

// Funções unárias permitidas
const FUNCTIONS = new Set(["sqrt", "conj", "abs", "arg"]);

// Função principal
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

    // NÚMEROS POSITIVOS (E RECONHECIMENTO GERAL)

    if (/[0-9]/.test(char)) {
      let start = i;
      i++; // Consome o primeiro dígito

      // parte numérica, incluindo ponto decimal
      let decimalCount = 0;
      while (i < input.length && /[0-9.]/.test(input[i])) {
        if (input[i] === ".") {
          decimalCount++;
          if (decimalCount > 1) {
            throw new Error(
              `Número decimal inválido: ${input.slice(start, i + 1)}`
            );
          }
        }
        i++;
      }

      // notação científica: "1e-3"
      if (input[i]?.toLowerCase() === "e") {
        i++; // consome o "e"

        // sinal opcional após o "e"
        if (input[i] === "+" || input[i] === "-") {
          i++;
        }

        let startExp = i;
        while (i < input.length && /[0-9]/.test(input[i])) {
          i++;
        }

        if (i === startExp) {
          throw new Error(
            `Expoente inválido em notação científica: ${input.slice(start, i)}`
          );
        }
      }

      tokens.push({
        type: TOKEN_TYPES.NUMBER,
        value: input.slice(start, i),
      });
      continue;
    }

    // Variáveis e Imaginários (inclui as funções)
    if (/[a-zA-Z]/.test(char)) {
      let start = i;
      while (i < input.length && /[a-zA-Z0-9]/.test(input[i])) {
        i++;
      }

      const value = input.slice(start, i);

      if (value.toLowerCase() === "i" && value.length === 1) {
        tokens.push({ type: TOKEN_TYPES.IMAG, value: "i" });
      } else if (FUNCTIONS.has(value)) {
        tokens.push({ type: TOKEN_TYPES.FUNCTION, value: value });
      } else {
        // Assume que é uma variável se não for 'i' ou função
        tokens.push({ type: TOKEN_TYPES.VARIABLE, value: value });
      }
      continue;
    }

    // Operadores (incluindo tratamento de número negativo)
    if (OPERATORS.has(char)) {
      const prevToken = tokens[tokens.length - 1];

      // Detecta se o "-" representa um número negativo (unário)
      const isUnaryMinus =
        char === "-" &&
        (tokens.length === 0 || // início da expressão
          prevToken.type === TOKEN_TYPES.OPERATOR || // depois de outro operador
          prevToken.type === TOKEN_TYPES.LPAREN || // depois de "("
          prevToken.type === TOKEN_TYPES.FUNCTION); // depois de uma função

      // Caso "-i", vira IMAG com valor "-i" (corrigido: deve ser "-i", não "-1")
      const nextChar = input[i + 1];
      if (isUnaryMinus && nextChar === "i") {
        tokens.push({
          type: TOKEN_TYPES.IMAG,
          value: "-i",
        });
        i += 2;
        continue;
      }

      // Caso número negativo (incluindo notação científica)
      if (isUnaryMinus) {
        let start = i;
        i++; // Consome o sinal '-'

        // Se o próximo não for um dígito (ex: --5 ou -*), trata como operador unário (o Parser lidará com isso)
        if (i >= input.length || !/[0-9]/.test(input[i])) {
          // Trata o '-' como operador unário (que o parser usará para criar UnaryOp)
          tokens.push({ type: TOKEN_TYPES.OPERATOR, value: char });
          continue;
        }

        // Lógica de leitura de número negativo (copiada e validada)
        let decimalCount = 0;
        while (i < input.length && /[0-9.]/.test(input[i])) {
          if (input[i] === ".") {
            decimalCount++;
            if (decimalCount > 1) {
              throw new Error(
                `Número decimal inválido: ${input.slice(start, i + 1)}`
              );
            }
          }
          i++;
        }

        // notação científica
        if (input[i]?.toLowerCase() === "e") {
          i++;
          if (input[i] === "+" || input[i] === "-") {
            i++;
          }
          let startExp = i;
          while (i < input.length && /[0-9]/.test(input[i])) {
            i++;
          }
          if (i === startExp) {
            throw new Error(`Expoente inválido: ${input.slice(start, i)}`);
          }
        }

        tokens.push({
          type: TOKEN_TYPES.NUMBER,
          value: input.slice(start, i),
        });
        continue;
      }

      // Caso operador comum
      tokens.push({ type: TOKEN_TYPES.OPERATOR, value: char });
      i++;
      continue;
    }

    // Se nenhum caso acima atende, caractere inválido
    throw new Error(`Caractere não reconhecido: ${char}`);
  }

  return tokens;
}

module.exports = {
  tokenize,
  TOKEN_TYPES,
  OPERATORS,
  FUNCTIONS,
};
