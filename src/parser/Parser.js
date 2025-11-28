const { Complexo } = require('./complexo');
const { tokenize, TOKEN_TYPES, FUNCTIONS } = require('./tokenizer');

class ASTNode {
    toLisp() { throw new Error("Método 'toLisp()' deve ser implementado."); }
    avaliar(env) { throw new Error("Método 'avaliar(env)' deve ser implementado.")}
}

class NumberNode extends ASTNode {
    constructor(value) {
        super();
        this.value = parseFloat(value);
    }
    toLisp() { return this.value.toString(); }
    avaliar(env) {
        return new Complexo(this.value, 0);
    }
}

class VariableNode extends ASTNode {
    constructor(name) {
        super();
        this.name = name;
    }
    toLisp() { return this.name; }
    avaliar(env) {
        if (this.name.toLowerCase() === 'i') {
            return new Complexo(0,1);
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
    toLisp() { return `(${this.op} ${this.left.toLisp()} ${this.right.toLisp()})`; }
    avaliar(env) {
        const left = this.left.avaliar(env);
        const right = this.right.avaliar(env);
        switch (this.op) {
            case "+": return left.add(right);
            case "-": return left.sub(right);
            case "*": return left.mul(right);
            case "/": return left.div(right);
            case "^": if (right.imag !== 0) {
                throw new Error("Erro de avaliação: Expoentes complexos não são suportados para potenciação.");
            }
            return left.pow(right.real);
            default: throw new Error(`Operador binário não suportado: ${this.op}`);
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
        const displayOp = this.op === '~' ? '-' : this.op;
        return `(${displayOp} ${this.operand.toLisp()})`;
    }
    avaliar(env) {
        const operand = this.operand.avaliar(env);
        switch (this.op) {
            case "~": return new Complexo(-operand.real, -operand.imag);
            case "conj": return operand.conjugado();
            case "sqrt": return operand.sqrt();
            case "abs": return operand.abs();
            case "arg": return operand.arg();
            default: throw new Error(`Operador unário não suportado: ${this.op}`);
        }
    }
}

class Parser {
    constructor() {
        this.precedence = { 
            '+': 1, '-': 1, 
            '*': 2, '/': 2, 
            '^': 4, 
            '~': 5, 'sqrt': 5, 'conj': 5 
        };
    }

    shuntingYard(tokens) {
    // Pré-processamento: Inserção do '*' implícito
    const processedTokens = [];
    const IMPLICIT_MULT_TOKENS = [TOKEN_TYPES.NUMBER, TOKEN_TYPES.VARIABLE, TOKEN_TYPES.IMAG, TOKEN_TYPES.RPAREN];
    const IMPLICIT_MULT_NEXT_TOKENS = [TOKEN_TYPES.NUMBER, TOKEN_TYPES.VARIABLE, TOKEN_TYPES.IMAG, TOKEN_TYPES.FUNCTION, TOKEN_TYPES.LPAREN];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const prevToken = i > 0 ? tokens[i - 1] : null;

        if (prevToken && IMPLICIT_MULT_TOKENS.includes(prevToken.type) && IMPLICIT_MULT_NEXT_TOKENS.includes(token.type)) {
            
            if (token.type === TOKEN_TYPES.LPAREN && prevToken.type === TOKEN_TYPES.FUNCTION) {
                
            } else {
                processedTokens.push({ type: TOKEN_TYPES.OPERATOR, value: '*' });
            }
        }
        processedTokens.push(token);
    }
    
    // Algoritmo Shunting Yard
    const outputQueue = [];
    const operatorStack = [];
    let prevToken = null;

    for (let token of processedTokens) {
        const type = token.type;
        const value = token.value;

        if (type === TOKEN_TYPES.NUMBER || type === TOKEN_TYPES.VARIABLE || type === TOKEN_TYPES.IMAG) {
            outputQueue.push(new (type === TOKEN_TYPES.NUMBER ? NumberNode : VariableNode)(value));
        } 
        
        else if (type === TOKEN_TYPES.FUNCTION) {
            operatorStack.push(value); 
        } 
        
        else if (type === TOKEN_TYPES.LPAREN) {
            operatorStack.push(value); 
        } 
        
        else if (type === TOKEN_TYPES.RPAREN) {
            while (operatorStack.length && operatorStack[operatorStack.length - 1] !== '(') {
                this.popOpToQueue(operatorStack, outputQueue);
            }
            
            if (operatorStack.length === 0) {
                throw new Error("Erro de Sintaxe: Parêntese de fechamento não correspondido.");
            }
            
            operatorStack.pop(); 
            
            if (operatorStack.length && FUNCTIONS.has(operatorStack[operatorStack.length - 1])) {
                this.popOpToQueue(operatorStack, outputQueue);
            }
        } 
        
        else if (type === TOKEN_TYPES.OPERATOR) {
            let currOp = value;

            const isUnary = currOp === '-' && (!prevToken || prevToken.type === TOKEN_TYPES.OPERATOR || prevToken.type === TOKEN_TYPES.LPAREN || prevToken.type === TOKEN_TYPES.FUNCTION);
            
            if (isUnary) {
                currOp = '~';
            }

            while (operatorStack.length > 0) {
                const top = operatorStack[operatorStack.length - 1];
                if (top === '(') break;

                const isTopFunction = FUNCTIONS.has(top); 
                
                const currPrec = this.precedence[currOp];
                const topPrec = isTopFunction ? 5 : (this.precedence[top] || 0);
                const rightAssoc = ['^', '~', ...FUNCTIONS].includes(currOp);

                if ((!rightAssoc && currPrec <= topPrec) || (rightAssoc && currPrec < topPrec)) {
                    this.popOpToQueue(operatorStack, outputQueue);
                } else {
                    break;
                }
            }
            operatorStack.push(currOp);
        }
        
        prevToken = token;
    }

    // Move os operadores restantes
    while (operatorStack.length) {
         const op = operatorStack[operatorStack.length - 1];
         if (op === '(') {
             throw new Error("Erro de Sintaxe: Parêntese de abertura não correspondido.");
         }
         this.popOpToQueue(operatorStack, outputQueue);
    }

    return outputQueue;
}

    popOpToQueue(stack, queue) {
        queue.push(stack.pop());
    }

    rpnToAST(rpnQueue) {
        const stack = [];

        for (const item of rpnQueue) {
            if (item instanceof ASTNode) {
                stack.push(item);
            } else {
                const op = item;
                
                if (['~', 'sqrt', 'conj'].includes(op)) {
                    if (stack.length < 1) throw new Error(`Syntax Error: Unary operator '${op}' missing operand.`);
                    const operand = stack.pop();
                    stack.push(new UnaryOp(op, operand));
                } 
                else {
                    if (stack.length < 2) throw new Error(`Syntax Error: Binary operator '${op}' missing operands.`);
                    const right = stack.pop();
                    const left = stack.pop();
                    stack.push(new BinaryOp(left, op, right));
                }
            }
        }

        if (stack.length !== 1) throw new Error("Invalid Expression.");
        return stack[0];
    }

    parse(expression) {
        const tokens = tokenize(expression);
        const rpn = this.shuntingYard(tokens);
        return this.rpnToAST(rpn);
    }
}

function runTests() {
    const parser = new Parser();

    const testCases = [
        { input: "1 + 2 * 3", expected: "(+ 1 (* 2 3))" },
        { input: "(1 + 2) * 3", expected: "(* (+ 1 2) 3)" },
        { input: "-5", expected: "(- 5)" },
        { input: "3 * -2", expected: "(* 3 (- 2))" },
        { input: "3 + 4 * i", expected: "(+ 3 (* 4 i))" },
        { input: "A + B", expected: "(+ A B)" },
        { input: "conj(3 + i)", expected: "(conj (+ 3 i))" },
        { input: "sqrt(16)", expected: "(sqrt 16)" },
        { input: "-conj(A) * (2 + -i)", expected: "(* (- (conj A)) (+ 2 (- i)))" }
    ];

    console.log("Expression".padEnd(25) + " | " + "LISP Output".padEnd(30) + " | Status");
    console.log("-".repeat(70));

    let passed = 0;
    for (let test of testCases) {
        try {
            const ast = parser.parse(test.input);
            const result = ast.toLisp();
            const status = result === test.expected ? "PASS" : `FAIL (Got: ${result})`;
            if (result === test.expected) passed++;
            
            console.log(test.input.padEnd(25) + " | " + result.padEnd(30) + " | " + status);
        } catch (e) {
            console.log(test.input.padEnd(25) + " | " + "ERROR".padEnd(30) + " | " + e.message);
        }
    }
}

runTests();