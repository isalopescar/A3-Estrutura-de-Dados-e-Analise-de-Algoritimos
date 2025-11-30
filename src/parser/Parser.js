const { Complexo } = require("../complexo/Complexo");
const { tokenize, TOKEN_TYPES, FUNCTIONS } = require("../tokenizer/Tokenizer");

// NÓS DA ÁRVORE DE SINTAXE ABSTRATA (AST)

class ASTNode {
  toLisp() {
    throw new Error("Método 'toLisp()' deve ser implementado.");
  }
  avaliar(env) {
    throw new Error("Método 'avaliar(env)' deve ser implementado.");
  }
}

class NumberNode extends ASTNode {
  constructor(value) {
    super();
    this.value = parseFloat(value);
  }
  toLisp() {
    return this.value.toString();
  }
  avaliar(env) {
    return new Complexo(this.value, 0);
  }
}

class VariableNode extends ASTNode {
  constructor(name) {
    super();
    this.name = name;
  }
  toLisp() {
    return this.name;
  }
  avaliar(env) {
    if (this.name.toLowerCase() === "i") {
      return new Complexo(0, 1);
    }
    if (!(this.name in env)) {
      throw new Error(`Variável não definida: ${this.name}`);
    }
    return env[this.name];
  }
}

class BinaryOp extends ASTNode {
  constructor(left, op, right) {
    super();
    this.left = left;
    this.op = op;
    this.right = right;
  }
  toLisp() {
    return `(${this.op} ${this.left.toLisp()} ${this.right.toLisp()})`;
  }
  avaliar(env) {
    const left = this.left.avaliar(env);
    const right = this.right.avaliar(env);
    switch (this.op) {
      case "+":
        return left.add(right);
      case "-":
        return left.sub(right);
      case "*":
        return left.mul(right);
      case "/":
        return left.div(right);
      case "^":
        if (right.imag !== 0) {
          throw new Error(
            "Erro de avaliação: Expoentes complexos não são suportados para potenciação."
          );
        }
        return left.pow(right.real);
      default:
        throw new Error(`Operador binário não suportado: ${this.op}`);
    }
  }
}

class UnaryOp extends ASTNode {
  constructor(op, operand) {
    super();
    this.op = op;
    this.operand = operand;
  }
  toLisp() {
    const displayOp = this.op === "~" ? "-" : this.op;
    return `(${displayOp} ${this.operand.toLisp()})`;
  }
  avaliar(env) {
    const operand = this.operand.avaliar(env);
    switch (this.op) {
      case "~":
        return new Complexo(-operand.real, -operand.imag);
      case "conj":
        return operand.conjugado();
      case "sqrt":
        return operand.sqrt();
      case "abs":
        return new Complexo(operand.abs(), 0);
      case "arg":
        return new Complexo(operand.arg(), 0);
      default:
        throw new Error(`Operador unário não suportado: ${this.op}`);
    }
  }
}

// PARSER E LÓGICA DE PRECEDÊNCIA

class Parser {
  constructor() {
    this.precedence = {
      "+": 1,
      "-": 1,
      "*": 2,
      "/": 2,
      "^": 3,
      "~": 4,
      sqrt: 4,
      conj: 4,
      abs: 4,
      arg: 4,
    };
    this.tokens = [];
    this.pos = 0;
  }

  // Gerenciamento de tokens
  peek() {
    return this.tokens[this.pos];
  }
  next() {
    return this.tokens[this.pos++];
  }
  consume(type) {
    const token = this.peek();
    if (!token || token.type !== type) {
      throw new Error(
        `Erro de Sintaxe: Esperado ${type}, encontrado ${
          token ? token.type : "EOF"
        }`
      );
    }
    return this.next();
  }

  // Parser recursivo de precedência
  parseExpression(precedence = 0) {
    let left = this.parsePrimary();

    while (true) {
      const token = this.peek();
      if (!token) break;

      const op = token.value;
      const currentPrecedence = this.precedence[op];

      if (!currentPrecedence || currentPrecedence < precedence) {
        break;
      }

      const rightAssoc = op === "^";
      const nextPrecedence = rightAssoc
        ? currentPrecedence
        : currentPrecedence + 1;

      this.next();

      if (FUNCTIONS.has(op)) {
        left = new UnaryOp(op, left);
        continue;
      }

      const right = this.parseExpression(nextPrecedence);
      left = new BinaryOp(left, op, right);
    }

    return left;
  }

  // Analisa a parte primária
  parsePrimary() {
    let token = this.peek();

    if (token.value === "-") {
      this.next();
      const operand = this.parsePrimary();
      return new UnaryOp("~", operand);
    }

    if (token.type === TOKEN_TYPES.FUNCTION) {
      this.next();
      this.consume(TOKEN_TYPES.LPAREN);
      const operand = this.parseExpression();
      this.consume(TOKEN_TYPES.RPAREN);
      return new UnaryOp(token.value, operand);
    }

    if (token.type === TOKEN_TYPES.LPAREN) {
      this.next();
      const node = this.parseExpression();
      this.consume(TOKEN_TYPES.RPAREN);
      return node;
    }

    if (token.type === TOKEN_TYPES.NUMBER) {
      return new NumberNode(this.next().value);
    }
    if (
      token.type === TOKEN_TYPES.VARIABLE ||
      token.type === TOKEN_TYPES.IMAG
    ) {
      return new VariableNode(this.next().value);
    }

    throw new Error(
      `Erro de Sintaxe: Inesperado ${token ? token.value : "Fim de Expressão"}`
    );
  }

  // Pré-processamento: Inserção do '*' implícito
  preprocessTokens(tokens) {
    const processedTokens = [];
    const IMPLICIT_MULT_TOKENS = [
      TOKEN_TYPES.NUMBER,
      TOKEN_TYPES.VARIABLE,
      TOKEN_TYPES.IMAG,
      TOKEN_TYPES.RPAREN,
    ];
    const IMPLICIT_MULT_NEXT_TOKENS = [
      TOKEN_TYPES.NUMBER,
      TOKEN_TYPES.VARIABLE,
      TOKEN_TYPES.IMAG,
      TOKEN_TYPES.FUNCTION,
      TOKEN_TYPES.LPAREN,
    ];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const prevToken = i > 0 ? tokens[i - 1] : null;

      if (
        prevToken &&
        IMPLICIT_MULT_TOKENS.includes(prevToken.type) &&
        IMPLICIT_MULT_NEXT_TOKENS.includes(token.type)
      ) {
        if (
          token.type === TOKEN_TYPES.LPAREN &&
          prevToken.type === TOKEN_TYPES.FUNCTION
        ) {
          // Argumento de função
        } else {
          processedTokens.push({ type: TOKEN_TYPES.OPERATOR, value: "*" });
        }
      }
      processedTokens.push(token);
    }
    return processedTokens;
  }

  // Função principal
  parse(expression) {
    const rawTokens = tokenize(expression);
    this.tokens = this.preprocessTokens(rawTokens);
    this.pos = 0;

    if (this.tokens.length === 0) {
      throw new Error("Expressão vazia.");
    }

    const ast = this.parseExpression();

    if (this.pos !== this.tokens.length) {
      throw new Error(
        `Erro de Sintaxe: Tokens não consumidos após avaliação: ${this.tokens
          .slice(this.pos)
          .map((t) => t.value)
          .join(" ")}`
      );
    }

    return ast;
  }
}

module.exports = {
  Parser,
  ASTNode,
  NumberNode,
  VariableNode,
  BinaryOp,
  UnaryOp,
};
