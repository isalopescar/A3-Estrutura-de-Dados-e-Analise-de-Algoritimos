class ASTNode {
    toLisp() { throw new Error("Method 'toLisp()' must be implemented."); }
}

class NumberNode extends ASTNode {
    constructor(value) {
        super();
        this.value = parseFloat(value);
    }
    toLisp() { return this.value.toString(); }
}

class VariableNode extends ASTNode {
    constructor(name) {
        super();
        this.name = name;
    }
    toLisp() { return this.name; }
}

class BinaryOp extends ASTNode {
    constructor(left, op, right) {
        super();
        this.left = left;
        this.op = op;
        this.right = right;
    }
    toLisp() { return `(${this.op} ${this.left.toLisp()} ${this.right.toLisp()})`; }
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

    tokenize(expression) {
        const regex = /[a-zA-Z_][a-zA-Z0-9_]*|\d+(\.\d+)?|[+\-*/^()]|\S/g;
        return expression.match(regex) || [];
    }

    shuntingYard(tokens) {
        const outputQueue = [];
        const operatorStack = [];
        let prevToken = null;

        for (let token of tokens) {
            if (!isNaN(parseFloat(token))) {
                outputQueue.push(new NumberNode(token));
            } 
            else if (/^[a-zA-Z_]/.test(token)) {
                if (['sqrt', 'conj'].includes(token)) {
                    operatorStack.push(token);
                } else {
                    outputQueue.push(new VariableNode(token));
                }
            }
            else if (token === '(') {
                operatorStack.push(token);
            } 
            else if (token === ')') {
                while (operatorStack.length && operatorStack[operatorStack.length - 1] !== '(') {
                    this.popOpToQueue(operatorStack, outputQueue);
                }
                operatorStack.pop();
                
                if (operatorStack.length && ['sqrt', 'conj'].includes(operatorStack[operatorStack.length - 1])) {
                    this.popOpToQueue(operatorStack, outputQueue);
                }
            } 
            else if (['+', '-', '*', '/', '^'].includes(token)) {
                let currOp = token;

                if (currOp === '-' && (prevToken === null || ['+', '-', '*', '/', '^', '(', 'sqrt', 'conj'].includes(prevToken))) {
                    currOp = '~';
                }

                while (operatorStack.length > 0) {
                    const top = operatorStack[operatorStack.length - 1];
                    if (top === '(') break;

                    const currPrec = this.precedence[currOp];
                    const topPrec = this.precedence[top] || 0;
                    const rightAssoc = ['^', '~', 'sqrt', 'conj'].includes(currOp);

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

        while (operatorStack.length) {
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
        const tokens = this.tokenize(expression);
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