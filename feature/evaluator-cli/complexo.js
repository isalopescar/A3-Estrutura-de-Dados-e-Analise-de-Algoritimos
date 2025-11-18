// Classe responsável pela representação e operações com números complexos
class Complexo {
    constructor(real = 0, imag = 0) { // inicializa com partes real e imaginária
        this.real = Number(real);
        this.imag = Number(imag);
    }

    toString() { // formatação amigável para exibição
        if (this.imag === 0) return String(this.real);
        if (this.real === 0) {
            if (this.imag === 1) return 'i';
            if (this.imag === -1) return '-i';
            return `${this.imag}i`;
        }
        const sinal = this.imag >= 0 ? '+' : '-';
        const absImag = Math.abs(this.imag);
        const imagFormat = absImag === 1 ? 'i' : `${absImag}i`;
        return `${this.real} ${sinal} ${imagFormat}`;
    }

    add(outro) { // soma de complexos
        const realSoma = this.real + outro.real;
        const imagSoma = this.imag + outro.imag;
        return new Complexo(realSoma, imagSoma);
    }

    sub(outro) { // subtração de complexos
        const realSub = this.real - outro.real;
        const imagSub = this.imag - outro.imag;
        return new Complexo(realSub, imagSub);
    }

    mul(outro) { // multiplicação de complexos
        const realResultado = this.real * outro.real - this.imag * outro.imag;
        const imagResultado = this.real * outro.imag + this.imag * outro.real;
        return new Complexo(realResultado, imagResultado);
    }

    div(outro) { // divisão de complexos usando fórmula padrão
        const a = this.real;
        const b = this.imag;
        const c = outro.real;
        const d = outro.imag;

        const denom = c * c + d * d;
        if (denom === 0) {
            throw new Error("Divisão por zero");
        }

        const realResultado = (a * c + b * d) / denom;
        const imagResultado = (b * c - a * d) / denom;
        return new Complexo(realResultado, imagResultado);
    }
}

module.exports = { Complexo };